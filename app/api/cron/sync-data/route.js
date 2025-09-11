import prisma from '@/lib/prisma'
import { importShopifyData } from '@/lib/shopify'

export async function POST(request) {
  try {
    console.log('Starting scheduled sync for all stores...')
    
    // Get all stores from database
    const stores = await prisma.store.findMany()
    
    if (stores.length === 0) {
      return Response.json({ message: 'No stores found to sync' })
    }
    
    console.log(`Found ${stores.length} stores to sync`)
    
    let successCount = 0
    let errorCount = 0
    
    // Sync each store
    for (const store of stores) {
      try {
        console.log(`Syncing store: ${store.name} (${store.domain})`)
        
        await importShopifyData(store.id, store.domain, store.accessToken)
        
        console.log(`Successfully synced: ${store.name}`)
        successCount++
        
        // Small delay between stores to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error(`Failed to sync store ${store.name}:`, error.message)
        errorCount++
      }
    }
    
    console.log(`Sync completed. Success: ${successCount}, Errors: ${errorCount}`)
    
    return Response.json({
      message: 'Sync completed',
      totalStores: stores.length,
      successful: successCount,
      failed: errorCount
    })
    
  } catch (error) {
    console.error('Scheduled sync error:', error)
    return Response.json({ error: 'Sync failed' }, { status: 500 })
  }
}