import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id)

  if (req.method === 'GET') {
    const credential = await prisma.credential.findUnique({ where: { id } })
    return res.status(200).json(credential)
  }

  if (req.method === 'PUT') {
    const data = req.body
    const credential = await prisma.credential.update({ where: { id }, data })
    return res.status(200).json(credential)
  }

  if (req.method === 'DELETE') {
    await prisma.credential.delete({ where: { id } })
    return res.status(204).end()
  }

  res.status(405).json({ message: 'Method not allowed' })
}
