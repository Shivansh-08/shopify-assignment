import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const storeId = decoded.storeId

    // Parse query params
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const orders = await prisma.order.groupBy({
      by: ['orderDate'],
      where: {
        storeId,
        ...(from && to
          ? { orderDate: { gte: new Date(from), lte: new Date(to) } }
          : {})
      },
      _sum: { totalPrice: true },
      _count: { _all: true },
      orderBy: { orderDate: 'asc' }
    })

    return Response.json(orders)
  } catch (error) {
    console.error('Orders by date error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
