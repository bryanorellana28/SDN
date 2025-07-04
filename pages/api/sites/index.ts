import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const sites = await prisma.site.findMany()
    return res.status(200).json(sites)
  }

  if (req.method === 'POST') {
    const { name, ubicacion, descripcion } = req.body
    const site = await prisma.site.create({ data: { name, ubicacion, descripcion } })
    return res.status(201).json(site)
  }

  res.status(405).json({ message: 'Method not allowed' })
}
