import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/prisma'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { store: true } // fetch store also
    })

    if (!user) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const token = jwt.sign(
      { userId: user.id, storeId: user.storeId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return Response.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        storeName: user.store.name
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
