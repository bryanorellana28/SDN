import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id)

  if (req.method === 'GET') {
    const conn = await prisma.connection.findUnique({ where: { id } })
    return res.status(200).json(conn)
  }

  if (req.method === 'PUT') {
    const { srcDeviceId, srcInterface, dstDeviceId, dstInterface } = req.body
    const conn = await prisma.connection.update({
      where: { id },
      data: {
        srcDeviceId: Number(srcDeviceId),
        srcInterface,
        dstDeviceId: Number(dstDeviceId),
        dstInterface
      }
    })
    return res.status(200).json(conn)
  }

  if (req.method === 'DELETE') {
    await prisma.connection.delete({ where: { id } })
    return res.status(204).end()
  }

  res.status(405).json({ message: 'Method not allowed' })
}
