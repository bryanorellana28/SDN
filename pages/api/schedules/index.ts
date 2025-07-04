import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { startScheduler } from '../../../lib/scheduler'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  startScheduler()
  if (req.method === 'GET') {
    const schedules = await prisma.schedule.findMany({ include: { device: true, credential: true } })
    return res.status(200).json(schedules)
  }

  if (req.method === 'POST') {
    const { deviceId, credentialId, period } = req.body
    const nextRun = new Date()
    const sched = await prisma.schedule.create({ data: { deviceId: Number(deviceId), credentialId: Number(credentialId), period, nextRun } })
    return res.status(201).json(sched)
  }

  res.status(405).json({ message: 'Method not allowed' })
}
