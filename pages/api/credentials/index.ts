import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const credentials = await prisma.credential.findMany()
    return res.status(200).json(credentials)
  }

  if (req.method === 'POST') {
    const { usuario, contrasena } = req.body
    const credential = await prisma.credential.create({ data: { usuario, contrasena } })
    return res.status(201).json(credential)
  }

  res.status(405).json({ message: 'Method not allowed' })
}
