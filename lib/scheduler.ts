import { prisma } from './prisma'
import { exec } from 'child_process'

let started = false

function runBackup(scheduleId: number) {
  prisma.schedule.findUnique({ where: { id: scheduleId }, include: { device: true, credential: true } })
    .then(async sched => {
      if (!sched) return
      const command = sched.device.marca.toLowerCase().includes('mikrotik') ? 'export' : 'show run'
      const sshCmd = `ssh ${sched.credential.usuario}@${sched.device.ipGestion} "${command}"`
      exec(sshCmd, async (err, stdout, stderr) => {
        const content = err ? stderr : stdout
        await prisma.backup.create({
          data: {
            deviceId: sched.deviceId,
            content
          }
        })
        const next = getNextRun(sched.period)
        await prisma.schedule.update({ where: { id: sched.id }, data: { nextRun: next } })
      })
    })
}

function getNextRun(period: string) {
  const now = new Date()
  if (period === 'DAILY') now.setDate(now.getDate() + 1)
  else if (period === 'WEEKLY') now.setDate(now.getDate() + 7)
  else if (period === 'MONTHLY') now.setMonth(now.getMonth() + 1)
  return now
}

export function startScheduler() {
  if (started) return
  started = true
  setInterval(async () => {
    const due = await prisma.schedule.findMany({ where: { nextRun: { lte: new Date() } } })
    due.forEach(s => runBackup(s.id))
  }, 60000)
}
