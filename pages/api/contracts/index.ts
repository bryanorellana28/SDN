import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const contracts = await prisma.contract.findMany({ include: { client: true } })
    return res.status(200).json(contracts)
  }

  if (req.method === 'POST') {
    const { numero, clientId, descripcion, inicio, fin } = req.body
    const data: any = { numero, clientId: Number(clientId), descripcion }
    if (inicio) data.inicio = new Date(inicio)
    if (fin) data.fin = new Date(fin)
    const contract = await prisma.contract.create({ data })
    return res.status(201).json(contract)
  }

  res.status(405).json({ message: 'Method not allowed' })
}
