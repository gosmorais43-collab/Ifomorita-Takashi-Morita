import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Agora pode usar normalmente!
async function main() {
  const users = await prisma.user.findMany()
  console.log(users)
}