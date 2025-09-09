import prisma from '@/lib/prisma'

export async function POST(request) {
  try {
    const body = await request.text()
    const data = JSON.parse(body)
    
    // Get webhook topic from headers
    const topic = request.headers.get('x-shopify-topic')
    const shopDomain = request.headers.get('x-shopify-shop-domain')
    
    console.log(`Received webhook: ${topic} from ${shopDomain}`)
    
    // Find the store in our database
    const store = await prisma.store.findFirst({
      where: { domain: shopDomain }
    })
    
    if (!store) {
      console.log(`Store not found: ${shopDomain}`)
      return new Response('Store not found', { status: 404 })
    }
    
    // Handle different webhook events
    switch (topic) {
      case 'orders/create':
      case 'orders/updated':
        await handleOrderWebhook(data, store.id, topic)
        break
        
      case 'customers/create':
      case 'customers/update':
        await handleCustomerWebhook(data, store.id, topic)
        break
        
      case 'products/create':
      case 'products/update':
        await handleProductWebhook(data, store.id, topic)
        break
        
      default:
        console.log(`Unhandled webhook topic: ${topic}`)
    }
    
    return new Response('OK', { status: 200 })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Error', { status: 500 })
  }
}

// Handle order webhooks
async function handleOrderWebhook(order, storeId, topic) {
  try {
    console.log(`Processing ${topic} for order #${order.order_number}`)
    
    // Find customer in our database
    let customerId = null
    if (order.customer) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          shopifyId: order.customer.id.toString(),
          storeId
        }
      })
      customerId = existingCustomer?.id
    }
    
    await prisma.order.upsert({
      where: {
        shopifyId_storeId: {
          shopifyId: order.id.toString(),
          storeId
        }
      },
      update: {
        customerId,
        orderNumber: order.order_number.toString(),
        totalPrice: parseFloat(order.total_price),
        orderDate: new Date(order.created_at)
      },
      create: {
        shopifyId: order.id.toString(),
        storeId,
        customerId,
        orderNumber: order.order_number.toString(),
        totalPrice: parseFloat(order.total_price),
        orderDate: new Date(order.created_at)
      }
    })
    
    console.log(`Successfully processed order #${order.order_number}`)
    
  } catch (error) {
    console.error('Order webhook error:', error)
  }
}

// Handle customer webhooks
async function handleCustomerWebhook(customer, storeId, topic) {
  try {
    console.log(`Processing ${topic} for customer ${customer.email}`)
    
    await prisma.customer.upsert({
      where: {
        shopifyId_storeId: {
          shopifyId: customer.id.toString(),
          storeId
        }
      },
      update: {
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        totalSpent: parseFloat(customer.total_spent || 0)
      },
      create: {
        shopifyId: customer.id.toString(),
        storeId,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        totalSpent: parseFloat(customer.total_spent || 0)
      }
    })
    
    console.log(`Successfully processed customer ${customer.email}`)
    
  } catch (error) {
    console.error('Customer webhook error:', error)
  }
}

// Handle product webhooks
async function handleProductWebhook(product, storeId, topic) {
  try {
    console.log(`Processing ${topic} for product ${product.title}`)
    
    await prisma.product.upsert({
      where: {
        shopifyId_storeId: {
          shopifyId: product.id.toString(),
          storeId
        }
      },
      update: {
        title: product.title,
        price: parseFloat(product.variants[0]?.price || 0)
      },
      create: {
        shopifyId: product.id.toString(),
        storeId,
        title: product.title,
        price: parseFloat(product.variants[0]?.price || 0)
      }
    })
    
    console.log(`Successfully processed product ${product.title}`)
    
  } catch (error) {
    console.error('Product webhook error:', error)
  }
}