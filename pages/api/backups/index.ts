import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const backups = await prisma.backup.findMany()
    return res.status(200).json(backups)
  }
  res.status(405).json({ message: 'Method not allowed' })
}
