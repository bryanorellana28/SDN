import type { NextApiRequest, NextApiResponse } from 'next'
import { Client } from 'ssh2'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' })
    return
  }

  const { host, username, password, brand } = req.body
  if (!host || !username || !password) {
    res.status(400).json({ message: 'Missing parameters' })
    return
  }

  const conn = new Client()
  conn.on('ready', () => {
    if (brand === 'Mikrotik') {
      conn.exec('system routerboard print', (err, stream) => {
        if (err) {
          conn.end()
          res.status(200).json({ success: false, error: err.message })
          return
        }
        let output = ''
        stream.on('close', () => {
          conn.end()
          res.status(200).json({ success: true, output })
        }).on('data', (data: Buffer) => {
          output += data.toString()
        }).stderr.on('data', (data: Buffer) => {
          output += data.toString()
        })
      })
    } else {
      conn.end()
      res.status(200).json({ success: true })
    }
  }).on('error', (err) => {
    res.status(200).json({ success: false, error: err.message })
  }).connect({
    host,
    username,
    password,
    readyTimeout: 5000
  })
}
