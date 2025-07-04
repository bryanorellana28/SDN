import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id)
  if (req.method === 'GET') {
    const backups = await prisma.backup.findMany({ where: { deviceId: id } })
    return res.status(200).json(backups)
  }
  res.status(405).json({ message: 'Method not allowed' })
}
