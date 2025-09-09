import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const storeId = decoded.storeId

    const totalCustomers = await prisma.customer.count({ where: { storeId } })
    const totalOrders = await prisma.order.count({ where: { storeId } })
    const revenueAgg = await prisma.order.aggregate({
      where: { storeId },
      _sum: { totalPrice: true }
    })
    const revenue = revenueAgg._sum.totalPrice || 0

    const topCustomers = await prisma.customer.findMany({
      where: { storeId },
      orderBy: { totalSpent: 'desc' },
      take: 5
    })

    return Response.json({
      totalCustomers,
      totalOrders,
      revenue,
      topCustomers
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
