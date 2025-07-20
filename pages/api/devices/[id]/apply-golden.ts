import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'
import { Client } from 'ssh2'
import { exec } from 'child_process'
import fs from 'fs/promises'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id)
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' })
    return
  }
  const device = await prisma.device.findUnique({ where: { id }, include: { credential: true } })
  if (!device || !device.boardName) {
    res.status(404).json({ message: 'Device not found' })
    return
  }
  const golden = await prisma.goldenImage.findFirst({ where: { modelo: device.boardName } })
  if (!golden) {
    res.status(404).json({ message: 'Golden image not found' })
    return
  }
  const tmp = `/tmp/${Date.now()}-golden.rsc`
  await fs.writeFile(tmp, golden.config)
  try {
    await new Promise<void>((resolve, reject) => {
      const conn = new Client()
      conn.on('ready', () => {
        conn.exec('ip service set ftp disabled=no', (err, stream) => {
          if (err) { conn.end(); return reject(err) }
          stream.on('close', () => { conn.end(); resolve() })
        })
      }).on('error', reject).connect({
        host: device.ipGestion,
        username: device.credential?.usuario || process.env.MIKROTIK_USER || 'admin',
        password: device.credential?.contrasena || process.env.MIKROTIK_PASS || '',
        readyTimeout: 5000
      })
    })
    await new Promise<void>((resolve) => {
      exec(`curl -T ${tmp} ftp://admin:R3d3s2025%21%21%2B%2B@${device.ipGestion}/`, () => resolve())
    })
  } finally {
    await fs.unlink(tmp).catch(() => {})
  }
  res.status(200).json({ ok: true })
}
