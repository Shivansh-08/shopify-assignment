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

    // 2. Parse query parameters for pagination, search, and sorting
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const searchTerm = searchParams.get('searchTerm') || ''
    const sortBy = searchParams.get('sortBy') || 'highSpending' // 'highSpending', 'mostOrders'

    const skip = (page - 1) * limit

    // 3. Build dynamic clauses for Prisma query to handle search and sort
    const whereClause = {
      storeId,
      // If a search term exists, filter by first name, last name, or email
      OR: searchTerm
        ? [
            { firstName: { contains: searchTerm, mode: 'insensitive' } },
            { lastName: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
          ]
        : undefined,
    }

    const orderByClause = sortBy === 'mostOrders'
      ? { orders: { _count: 'desc' } } // Sort by number of orders
      : { totalSpent: 'desc' }      // Default sort by total spent

    // 4. Fetch customers and total count using the dynamic clauses
    const [customers, totalCustomers] = await prisma.$transaction([
      prisma.customer.findMany({
        where: whereClause,
        include: {
          _count: {
            select: { orders: true },
          },
        },
        orderBy: orderByClause,
        skip: skip,
        take: limit,
      }),
      prisma.customer.count({ where: whereClause }),
    ])
    
    // 5. Return the response
    return Response.json({
      customers,
      pagination: {
        total: totalCustomers,
        page,
        limit,
        totalPages: Math.ceil(totalCustomers / limit),
      },
    })

  } catch (error) {
    console.error('Error fetching customers list:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

