import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { storeId } = decoded

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [products, totalProducts] = await prisma.$transaction([
      prisma.product.findMany({
        where: { storeId },
        skip: skip,
        take: limit,
      }),
      prisma.product.count({ where: { storeId } })
    ])

    const productIds = products.map(p => p.id)

    // Get all sales data for the products on this page
    const lineItems = await prisma.lineItem.findMany({
      where: {
        productId: { in: productIds }
      }
    })

    // Calculate sales stats for each product
    const productsWithSales = products.map(product => {
      const relevantItems = lineItems.filter(li => li.productId === product.id)
      const unitsSold = relevantItems.reduce((acc, item) => acc + item.quantity, 0)
      const totalRevenue = relevantItems.reduce((acc, item) => acc + (item.quantity * item.price), 0)
      return { ...product, unitsSold, totalRevenue }
    }).sort((a, b) => b.totalRevenue - a.totalRevenue); // Sort by revenue

    return Response.json({
      products: productsWithSales,
      pagination: {
        total: totalProducts,
        page,
        limit,
        totalPages: Math.ceil(totalProducts / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching products list:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
