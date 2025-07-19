import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id)

  if (req.method === 'GET') {
    const client = await prisma.client.findUnique({ where: { id } })
    return res.status(200).json(client)
  }

  if (req.method === 'PUT') {
    const data = req.body
    const client = await prisma.client.update({ where: { id }, data })
    return res.status(200).json(client)
  }

  if (req.method === 'DELETE') {
    await prisma.client.delete({ where: { id } })
    return res.status(204).end()
  }

  res.status(405).json({ message: 'Method not allowed' })
}
