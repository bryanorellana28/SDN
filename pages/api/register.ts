import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'
import { hash } from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return res.status(400).json({ message: 'User already exists' })
  }

  const hashed = await hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, password: hashed }
  })

  return res.status(200).json({ id: user.id, email: user.email })
}
