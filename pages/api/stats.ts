import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const deviceCount = await prisma.device.count()
  const brandCount = await prisma.brand.count()
  const siteCount = await prisma.site.count()

  const devicesBySite = await prisma.device.groupBy({
    by: ['sitio'],
    _count: { _all: true }
  })

  const devicesByBrand = await prisma.device.groupBy({
    by: ['marca'],
    _count: { _all: true }
  })

  res.status(200).json({
    deviceCount,
    brandCount,
    siteCount,
    devicesBySite,
    devicesByBrand
  })
}
