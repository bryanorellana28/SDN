import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id)

  if (req.method === 'GET') {
    const brand = await prisma.brand.findUnique({ where: { id } })
    return res.status(200).json(brand)
  }

  if (req.method === 'PUT') {
    const data = req.body
    const brand = await prisma.brand.update({ where: { id }, data })
    return res.status(200).json(brand)
  }

  if (req.method === 'DELETE') {
    await prisma.brand.delete({ where: { id } })
    return res.status(204).end()
  }

  res.status(405).json({ message: 'Method not allowed' })
}
