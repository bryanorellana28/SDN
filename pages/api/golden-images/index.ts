import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const images = await prisma.goldenImage.findMany()
    return res.status(200).json(images)
  }

  if (req.method === 'POST') {
    const { modelo, version, config } = req.body
    const image = await prisma.goldenImage.create({ data: { modelo, version, config } })
    return res.status(201).json(image)
  }

  res.status(405).json({ message: 'Method not allowed' })
}
