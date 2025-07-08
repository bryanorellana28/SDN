import type { NextApiRequest, NextApiResponse } from 'next'
import { runBackup } from '../../../../lib/scheduler'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id)
  if (req.method === 'POST') {
    await runBackup(id)
    return res.status(200).json({ ok: true })
  }
  res.status(405).json({ message: 'Method not allowed' })
}
