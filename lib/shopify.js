import prisma from '@/lib/prisma'

// Main import function that orchestrates the import of all data
export async function importShopifyData(storeId, domain, accessToken) {
  try {
    console.log('Starting full Shopify data import...')
    
    // Import all data types in order
    await importCustomers(storeId, domain, accessToken)
    await importProducts(storeId, domain, accessToken)
    await importOrders(storeId, domain, accessToken) // This function is now updated to include line items
    
    // Update the sync timestamp after all imports are complete
    await prisma.store.update({
      where: { id: storeId },
      data: { lastSyncedAt: new Date() }
    })

    console.log('Full data import completed successfully!')
  } catch (error) {
    console.error('Import error:', error)
  }
}

// Imports customer data
async function importCustomers(storeId, domain, accessToken) {
  try {
    console.log('Importing customers...')
    const response = await fetch(
      `https://${domain}/admin/api/2024-01/customers.json?limit=250`,
      { headers: { 'X-Shopify-Access-Token': accessToken } }
    )
    if (response.ok) {
      const data = await response.json()
      for (const customer of data.customers) {
        await prisma.customer.upsert({
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
      console.log(`Imported ${data.customers.length} customers`)
    }
  } catch (error) {
    console.error('Customer import error:', error)
  }
}

// Imports product data
async function importProducts(storeId, domain, accessToken) {
  try {
    console.log('Importing products...')
    const response = await fetch(
      `https://${domain}/admin/api/2024-01/products.json?limit=250`,
      { headers: { 'X-Shopify-Access-Token': accessToken } }
    )
    if (response.ok) {
      const data = await response.json()
      for (const product of data.products) {
        await prisma.product.upsert({
          where: { shopifyId_storeId: { shopifyId: product.id.toString(), storeId } },
          update: {
            title: product.title,
            price: parseFloat(product.variants[0]?.price || 0)
          },
          create: {
            shopifyId: product.id.toString(), storeId, title: product.title,
            price: parseFloat(product.variants[0]?.price || 0)
          }
        })
      }
      console.log(`Imported ${data.products.length} products`)
    }
  } catch (error) {
    console.error('Product import error:', error)
  }
}

// Imports orders AND their line items
async function importOrders(storeId, domain, accessToken) {
  try {
    console.log('Importing orders and line items...')
    const response = await fetch(
      `https://${domain}/admin/api/2024-01/orders.json?limit=250&status=any`,
      { headers: { 'X-Shopify-Access-Token': accessToken } }
    )
    
    if (!response.ok) {
        console.error("Failed to fetch orders from Shopify");
        return;
    }
    
    const data = await response.json()
    console.log(`Shopify returned ${data.orders.length} orders`)

    for (const order of data.orders) {
      try {
        let customerId = null
        if (order.customer) {
          const existingCustomer = await prisma.customer.findFirst({
            where: { shopifyId: order.customer.id.toString(), storeId }
          })
          customerId = existingCustomer?.id
        }

        const createdOrder = await prisma.order.upsert({
          where: { shopifyId_storeId: { shopifyId: order.id.toString(), storeId } },
          update: {
            customerId, totalPrice: parseFloat(order.total_price),
            orderDate: new Date(order.created_at),
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

        // --- THIS IS THE UPDATED LOGIC ---
        // Loop through each item in the order and save it to the LineItem table.
        for (const item of order.line_items) {
          // Find the corresponding product in our own database to create a link
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
                  productId: existingProduct?.id, // Link to our product
                  quantity: item.quantity,
                  price: parseFloat(item.price),
                  title: item.title,
              }
          });
        }
      } catch (error) {
        console.log(`Failed to save order #${order.order_number}:`, error.message)
      }
    }
    console.log(`Successfully processed ${data.orders.length} orders.`)
  } catch (error) {
    console.error('Order import error:', error)
  }
}

// Tests the Shopify API connection
export async function testShopifyConnection(domain, accessToken) {
  try {
    const response = await fetch(
      `https://${domain}/admin/api/2024-01/shop.json`,
      { headers: { 'X-Shopify-Access-Token': accessToken, 'Content-Type': 'application/json' } }
    )
    return response.ok
  } catch (error) {
    return false
  }
}

// Add this function to your existing lib/shopify.js file

export async function registerWebhooks(domain, accessToken, webhookUrl) {
  const webhooks = [
    'orders/create',
    'orders/updated', 
    'orders/paid',
    'orders/cancelled',
    'customers/create',
    'customers/update',
    'products/create',
    'products/update'
  ]
  
  console.log('Registering webhooks for:', domain)
  
  let successCount = 0
  let errorCount = 0
  
  for (const topic of webhooks) {
    try {
      const response = await fetch(`https://${domain}/admin/api/2024-01/webhooks.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          webhook: {
            topic: topic,
            address: `${webhookUrl}/api/shopify/webhook`,
            format: 'json'
          }
        })
      })
      
      if (response.ok) {
        console.log(`✅ Registered webhook: ${topic}`)
        successCount++
      } else {
        const errorData = await response.json()
        console.log(`❌ Failed to register webhook ${topic}:`, errorData.errors)
        errorCount++
      }
    } catch (error) {
      console.error(`❌ Webhook registration error for ${topic}:`, error.message)
      errorCount++
    }
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log(`Webhook registration completed: ${successCount} success, ${errorCount} failed`)
  return { successCount, errorCount }
}