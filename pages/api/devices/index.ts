import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const devices = await prisma.device.findMany()
    return res.status(200).json(devices)
  }

  if (req.method === 'POST') {
    const {
      ipGestion,
      nombre,
      sitio,
      rack,
      tipoEquipo,
      marca,
      modelo,
      versionSoftware,
      credentialId,
      serial,
      assetTag,
      descripcion
    } = req.body

    const device = await prisma.device.create({
      data: {
        ipGestion,
        nombre,
        sitio,
        rack,
        tipoEquipo,
        marca,
        modelo,
        versionSoftware,
        credentialId,
        serial,
        assetTag,
        descripcion
      }
    })
    return res.status(201).json(device)
  }

  res.status(405).json({ message: 'Method not allowed' })
}
