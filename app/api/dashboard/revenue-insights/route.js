import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// Helper function to convert BigInts in an object to Numbers
function convertBigIntsToNumbers(obj) {
    for (const key in obj) {
        if (typeof obj[key] === 'bigint') {
            obj[key] = Number(obj[key]);
        }
    }
    return obj;
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { storeId } = decoded

    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') || new Date(0).toISOString()
    const to = searchParams.get('to') || new Date().toISOString()
    const groupBy = searchParams.get('groupBy') || 'day'

    const dateTrunc = {
      day: "DAY",
      week: "WEEK",
      month: "MONTH"
    }[groupBy];

    // Use raw SQL for powerful date truncation
    const revenueData = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC(${dateTrunc}, "orderDate") as date, 
        SUM("totalPrice") as revenue,
        COUNT(id) as orders
      FROM "Order"
      WHERE "storeId" = ${storeId} AND "orderDate" >= ${new Date(from)}::timestamp AND "orderDate" <= ${new Date(to)}::timestamp
      GROUP BY date
      ORDER BY date ASC;
    `
    const processedRevenueData = revenueData.map(convertBigIntsToNumbers);

    // --- THIS IS THE CORRECTED LOGIC ---
    // Find top products by calculating revenue as SUM(price * quantity)
    const topProductsData = await prisma.$queryRaw`
        SELECT
            li.title,
            CAST(SUM(li.quantity) AS INTEGER) AS "unitsSold",
            SUM(li.quantity * li.price) AS "totalRevenue"
        FROM "LineItem" AS li
        INNER JOIN "Order" AS o ON li."orderId" = o.id
        WHERE o."storeId" = ${storeId}
          AND o."orderDate" >= ${new Date(from)}::timestamp
          AND o."orderDate" <= ${new Date(to)}::timestamp
        GROUP BY li.title
        ORDER BY "totalRevenue" DESC
        LIMIT 5;
    `

    // Calculate overall KPIs
    const kpis = await prisma.order.aggregate({
        where: { storeId, orderDate: { gte: new Date(from), lte: new Date(to) } },
        _sum: { totalPrice: true },
        _count: { id: true },
    });
    
    const totalRevenue = Number(kpis._sum.totalPrice || 0);
    const totalOrders = kpis._count.id || 0;

    return Response.json({
        kpis: {
            totalRevenue: totalRevenue,
            totalOrders: totalOrders,
            averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        },
        chartData: processedRevenueData,
        topProducts: topProductsData.map(p => ({
            title: p.title,
            revenue: Number(p.totalRevenue || 0),
            unitsSold: p.unitsSold || 0
        }))
    })

  } catch (error) {
    console.error('Error fetching revenue insights:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

