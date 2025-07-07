import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { Client } from 'ssh2'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const devices = await prisma.device.findMany({ include: { interfaces: true } })
    return res.status(200).json(devices)
  }

  if (req.method === 'POST') {
    const { ipGestion, sitio, rack, tipoEquipo, marca } = req.body

    let data: any = { ipGestion, sitio, rack, tipoEquipo, marca }
    const interfaces: { name: string; description?: string }[] = []

    async function runCmd(cmd: string): Promise<string> {
      return new Promise((resolve, reject) => {
        const conn = new Client()
        let output = ''
        conn
          .on('ready', () => {
            conn.exec(cmd, (err, stream) => {
              if (err) { conn.end(); return reject(err) }
              stream
                .on('close', () => { conn.end(); resolve(output) })
                .on('data', (d: Buffer) => { output += d.toString() })
                .stderr.on('data', (d: Buffer) => { output += d.toString() })
            })
          })
          .on('error', reject)
          .connect({
            host: ipGestion,
            username: process.env.MIKROTIK_USER || 'admin',
            password: process.env.MIKROTIK_PASS || '',
            readyTimeout: 5000
          })
      })
    }

    if (marca && marca.toLowerCase().includes('mikrotik')) {
      try {
        const resOut = await runCmd('system resource print')
        const idOut = await runCmd('system identity print')
        const ifOut = await runCmd('interface ethernet print')
        const ver = /version:\s*([^\r\n]+)/.exec(resOut)
        const cpu = /cpu:\s*([^\r\n]+)/.exec(resOut)
        const board = /board-name:\s*([^\r\n]+)/.exec(resOut)
        const host = /name:\s*([^\r\n]+)/.exec(idOut)
        if (ver) data.versionSoftware = ver[1].trim()
        if (cpu) data.cpu = cpu[1].trim()
        if (board) data.boardName = board[1].trim()
        if (host) data.hostname = host[1].trim()
        ifOut.split('\n').forEach((l) => {
          if (!/^\s*\d+\s/.test(l)) return
          const cols = l.trim().split(/\s+/)
          if (cols.length >= 3) {
            const full = cols[2]
            let name = full
            let desc = ''
            const parts = full.split('-')
            if (parts[0] === 'sfp') {
              name = parts.slice(0, 2).join('-')
              desc = parts.slice(2).join('-')
            } else {
              name = parts[0]
              desc = parts.slice(1).join('-')
            }
            interfaces.push({ name, description: desc || undefined })
          }
        })
      } catch (e) {
        console.error(e)
      }
    }

    const device = await prisma.device.create({ data })
    if (interfaces.length) {
      await prisma.interface.createMany({ data: interfaces.map(i => ({ ...i, deviceId: device.id })) })
    }
    return res.status(201).json(device)
  }

  res.status(405).json({ message: 'Method not allowed' })
}
