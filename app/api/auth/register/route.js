import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/prisma'
import { importShopifyData, testShopifyConnection,registerWebhooks } from '@/lib/shopify'

export async function POST(request) {
  try {
    const { storeName, domain, accessToken, email, password } = await request.json()

    // Basic validation
    if (!storeName || !domain || !accessToken || !email || !password) {
      return Response.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return Response.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Test Shopify connection
    console.log('Testing Shopify connection...')
    const connectionValid = await testShopifyConnection(domain, accessToken)

    if (!connectionValid) {
      return Response.json({ error: 'Invalid Shopify credentials' }, { status: 400 })
    }

    console.log('Shopify connection successful!')

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create store and user
    const store = await prisma.store.create({
      data: {
        name: storeName,
        domain: domain,
        accessToken: accessToken
      }
    })

    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: storeName,
        storeId: store.id
      }
    })

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, storeId: store.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    console.log('Registering webhooks...')
    if (process.env.NEXT_PUBLIC_APP_URL) {
  await registerWebhooks(domain, accessToken, process.env.NEXT_PUBLIC_APP_URL)
}
    // Start importing all data
    console.log('Starting full data import...')
    await importShopifyData(store.id, domain, accessToken)

    return Response.json({
      message: 'Store connected successfully!',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        storeName: store.name
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}