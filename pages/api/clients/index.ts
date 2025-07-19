import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const clients = await prisma.client.findMany()
    return res.status(200).json(clients)
  }

  if (req.method === 'POST') {
    const { nombre, identificacion, razonSocial, nit } = req.body
    const client = await prisma.client.create({ data: { nombre, identificacion, razonSocial, nit } })
    return res.status(201).json(client)
  }

  res.status(405).json({ message: 'Method not allowed' })
}
