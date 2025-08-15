const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@admin.com'
  const exists = await prisma.user.findUnique({ where: { email } })

  if (!exists) {
    const password = await hash('admin', 10)
    await prisma.user.create({
      data: {
        name: 'admin',
        email,
        password
      }
    })
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
