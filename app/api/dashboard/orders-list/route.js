import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET(request) {
  try {
    // 1. Authenticate the request
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { storeId } = decoded

    // 2. Parse query parameters for pagination and filtering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') // e.g., 'paid', 'unfulfilled'

    const skip = (page - 1) * limit

    // 3. Build the Prisma query
    const whereClause = { storeId }
    // Note: In a real app, you'd add financial_status/fulfillment_status to your Prisma schema
    // For now, we'll just filter by a generic status if needed.

    // 4. Fetch orders and total count for pagination
    const [orders, totalOrders] = await prisma.$transaction([
      prisma.order.findMany({
        where: whereClause,
        include: {
          customer: { // Include customer name for the table
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: {
          orderDate: 'desc'
        },
        skip: skip,
        take: limit,
      }),
      prisma.order.count({ where: whereClause })
    ])

    // 5. Return the response
    return Response.json({
      orders,
      pagination: {
        total: totalOrders,
        page,
        limit,
        totalPages: Math.ceil(totalOrders / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching orders list:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}