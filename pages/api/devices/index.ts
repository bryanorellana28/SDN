import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { Client } from 'ssh2'
import { parseInterfaceLine } from '../../../lib/mikrotik'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const devices = await prisma.device.findMany({ include: { interfaces: true } })
    return res.status(200).json(devices)
  }

  if (req.method === 'POST') {
    const { ipGestion, sitio, rack, tipoEquipo, marca, credentialId } = req.body

    let data: any = { ipGestion, sitio, rack, tipoEquipo, marca }
    if (credentialId) data.credentialId = Number(credentialId)
    const interfaces: { name: string; description?: string }[] = []

    let cred: { usuario: string; contrasena: string } | null = null
    if (credentialId) {
      cred = await prisma.credential.findUnique({ where: { id: Number(credentialId) } })
    }

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
            username: cred?.usuario || process.env.MIKROTIK_USER || 'admin',
            password: cred?.contrasena || process.env.MIKROTIK_PASS || '',
            readyTimeout: 5000
          })
      })
    }

    if (marca && marca.toLowerCase().includes('mikrotik')) {
      try {
        const resOut = await runCmd('system resource print')
        const idOut = await runCmd('system identity print')
        const ifOut = await runCmd('interface ethernet export')
        const ver = /version:\s*([^\r\n]+)/.exec(resOut)
        const cpu = /cpu:\s*([^\r\n]+)/.exec(resOut)
        const board = /board-name:\s*([^\r\n]+)/.exec(resOut)
        const host = /name:\s*([^\r\n]+)/.exec(idOut)
        if (ver) data.versionSoftware = ver[1].trim()
        if (cpu) data.cpu = cpu[1].trim()
        if (board) data.boardName = board[1].trim()
        if (host) data.hostname = host[1].trim()
        ifOut.split('\n').forEach((l) => {
          const parsed = parseInterfaceLine(l)
          if (!parsed) return
          const { defaultName, name } = parsed
          let val = name
          const prefix = `${defaultName}-`
          if (val.startsWith(prefix)) val = val.slice(prefix.length)
          const desc = val.trim() || undefined
          interfaces.push({ name: defaultName, description: desc })
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
