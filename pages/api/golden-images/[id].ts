import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id)

  if (req.method === 'GET') {
    const image = await prisma.goldenImage.findUnique({ where: { id } })
    return res.status(200).json(image)
  }

  if (req.method === 'PUT') {
    const data = req.body
    const image = await prisma.goldenImage.update({ where: { id }, data })
    return res.status(200).json(image)
  }

  if (req.method === 'DELETE') {
    await prisma.goldenImage.delete({ where: { id } })
    return res.status(204).end()
  }

  res.status(405).json({ message: 'Method not allowed' })
}
