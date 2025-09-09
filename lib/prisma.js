import { PrismaClient } from '@prisma/client'

// Simple prisma client
let prisma

if (!global.prisma) {
  global.prisma = new PrismaClient()
}
prisma = global.prisma

export default prisma