import prisma from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-shopify-hmac-sha256')
    const topic = request.headers.get('x-shopify-topic')
    const shopDomain = request.headers.get('x-shopify-shop-domain')
    
    console.log(`Webhook Received: ${topic} from ${shopDomain}`)
    
    const store = await prisma.store.findFirst({
      where: { domain: shopDomain }
    })
    
    if (!store) {
      console.warn(`Webhook for unregistered store received: ${shopDomain}`)
      return new Response('Store not found', { status: 404 })
    }
    
    // --- THIS BLOCK IS NOW ENABLED ---
    // Verifies that the webhook request is genuinely from Shopify
    if (signature && process.env.SHOPIFY_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
        .update(body, 'utf8')
        .digest('base64')
      
      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature')
        return new Response('Unauthorized', { status: 401 })
      }
      console.log('Webhook signature verified successfully.')
    }
    
    const data = JSON.parse(body)

    // Route event to the correct handler
    switch (topic) {
      case 'orders/create':
      case 'orders/updated':
        await handleOrderUpsert(data, store.id)
        break
      case 'orders/paid':
      case 'orders/cancelled':
        await handleOrderStatusUpdate(data, store.id)
        break
      case 'customers/create':
      case 'customers/update':
        await handleCustomerUpsert(data, store.id)
        break
      case 'products/create':
      case 'products/update':
        await handleProductUpsert(data, store.id)
        break
      default:
        console.log(`Unhandled webhook topic: ${topic}`)
    }
    
    return new Response('OK', { status: 200 })
    
  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response('Error processing webhook', { status: 500 })
  }
}

// --- Handler Functions ---

// Handles both creating and updating orders and their line items
async function handleOrderUpsert(order, storeId) {
  try {
    console.log(`Processing order upsert #${order.order_number}`)
    
    let customerId = null
    if (order.customer) {
      const customer = await handleCustomerUpsert(order.customer, storeId)
      customerId = customer.id
    }
    
    const createdOrder = await prisma.order.upsert({
      where: { shopifyId_storeId: { shopifyId: order.id.toString(), storeId } },
      update: {
        customerId,
        totalPrice: parseFloat(order.total_price),
        financialStatus: order.financial_status,
        fulfillmentStatus: order.fulfillment_status,
      },
      create: {
        shopifyId: order.id.toString(), storeId, customerId,
        orderNumber: order.order_number.toString(), totalPrice: parseFloat(order.total_price),
        orderDate: new Date(order.created_at),
        financialStatus: order.financial_status,
        fulfillmentStatus: order.fulfillment_status,
      }
    })

    for (const item of order.line_items) {
      const existingProduct = await prisma.product.findFirst({
          where: { shopifyId: item.product_id?.toString(), storeId }
      });

      await prisma.lineItem.upsert({
          where: { shopifyId_orderId: { shopifyId: item.id.toString(), orderId: createdOrder.id } },
          update: {
              quantity: item.quantity,
              price: parseFloat(item.price),
          },
          create: {
              shopifyId: item.id.toString(),
              orderId: createdOrder.id,
              productId: existingProduct?.id,
              quantity: item.quantity,
              price: parseFloat(item.price),
              title: item.title,
          }
      });
    }
    console.log(`Successfully processed order #${order.order_number}`)
  } catch (error) {
    console.error(`Error handling order upsert for order #${order.order_number}:`, error)
  }
}

// Handles simple status updates like 'paid' or 'cancelled'
async function handleOrderStatusUpdate(order, storeId) {
    try {
        console.log(`Updating status for order #${order.order_number}`)
        await prisma.order.updateMany({
            where: { shopifyId: order.id.toString(), storeId },
            data: {
                financialStatus: order.financial_status,
                fulfillmentStatus: order.fulfillment_status
            }
        });
        console.log(`Successfully updated status for order #${order.order_number}`)
    } catch (error) {
        console.error(`Error handling order status update for #${order.order_number}:`, error);
    }
}


// Handles creating/updating customers
async function handleCustomerUpsert(customer, storeId) {
  return await prisma.customer.upsert({
    where: { shopifyId_storeId: { shopifyId: customer.id.toString(), storeId } },
    update: {
      email: customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
      totalSpent: parseFloat(customer.total_spent || 0)
    },
    create: {
      shopifyId: customer.id.toString(), storeId, email: customer.email,
      firstName: customer.first_name, lastName: customer.last_name,
      totalSpent: parseFloat(customer.total_spent || 0)
    }
  })
}

// Handles creating/updating products safely
async function handleProductUpsert(product, storeId) {
  try {
    console.log(`Processing product upsert: ${product.title}`);
    
    // Safely get the price from the first available variant
    const price = product.variants && product.variants.length > 0
      ? parseFloat(product.variants[0].price || 0)
      : 0;

    await prisma.product.upsert({
      where: { shopifyId_storeId: { shopifyId: product.id.toString(), storeId } },
      update: {
        title: product.title,
        price: price
      },
      create: {
        shopifyId: product.id.toString(),
        storeId,
        title: product.title,
        price: price
      }
    });
    console.log(`Successfully processed product: ${product.title}`);
  } catch (error) {
    console.error(`Error handling product upsert for product "${product.title}":`, error);
  }
}

