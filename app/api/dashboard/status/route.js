import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET(request) {
  try {
    // Get user's store from token
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return Response.json({ error: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Get store info
    const store = await prisma.store.findUnique({
      where: { id: decoded.storeId },
      include: {
        customers: { select: { id: true } },
        products: { select: { id: true } },
        orders: { select: { id: true, createdAt: true } }
      }
    })
    
    if (!store) {
      return Response.json({ error: 'Store not found' }, { status: 404 })
    }
    
    // Get latest sync info
    const latestOrder = store.orders.length > 0 
      ? store.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
      : null
    
  return Response.json({
  storeName: store.name,
  totalCustomers: store.customers.length,
  totalProducts: store.products.length,
  totalOrders: store.orders.length,
  lastSyncedAt: store.lastSyncedAt,   // ✅ new reliable field
  storeCreated: store.createdAt
})

    
  } catch (error) {
    console.error('Sync status error:', error)
    return Response.json({ error: 'Failed to get sync status' }, { status: 500 })
  }
}