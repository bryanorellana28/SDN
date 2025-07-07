import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id)

  if (req.method === 'GET') {
    const device = await prisma.device.findUnique({ where: { id }, include: { interfaces: true } })
    return res.status(200).json(device)
  }

  if (req.method === 'PUT') {
    const data = req.body
    const device = await prisma.device.update({ where: { id }, data })
    return res.status(200).json(device)
  }

  if (req.method === 'DELETE') {
    await prisma.device.delete({ where: { id } })
    return res.status(204).end()
  }

  res.status(405).json({ message: 'Method not allowed' })
}
