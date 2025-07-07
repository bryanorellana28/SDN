import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const connections = await prisma.connection.findMany()
    return res.status(200).json(connections)
  }

  if (req.method === 'POST') {
    const { srcDeviceId, srcInterface, dstDeviceId, dstInterface } = req.body
    const conn = await prisma.connection.create({
      data: {
        srcDeviceId: Number(srcDeviceId),
        srcInterface,
        dstDeviceId: Number(dstDeviceId),
        dstInterface
      }
    })
    return res.status(201).json(conn)
  }

  res.status(405).json({ message: 'Method not allowed' })
}
