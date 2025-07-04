import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const brands = await prisma.brand.findMany()
    return res.status(200).json(brands)
  }

  if (req.method === 'POST') {
    const { name } = req.body
    const brand = await prisma.brand.create({ data: { name } })
    return res.status(201).json(brand)
  }

  res.status(405).json({ message: 'Method not allowed' })
}
