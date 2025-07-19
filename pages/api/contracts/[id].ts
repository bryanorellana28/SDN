import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id)

  if (req.method === 'GET') {
    const contract = await prisma.contract.findUnique({ where: { id }, include: { client: true } })
    return res.status(200).json(contract)
  }

  if (req.method === 'PUT') {
    const data = req.body
    if (data.inicio) data.inicio = new Date(data.inicio)
    if (data.fin) data.fin = new Date(data.fin)
    const contract = await prisma.contract.update({ where: { id }, data })
    return res.status(200).json(contract)
  }

  if (req.method === 'DELETE') {
    await prisma.contract.delete({ where: { id } })
    return res.status(204).end()
  }

  res.status(405).json({ message: 'Method not allowed' })
}
