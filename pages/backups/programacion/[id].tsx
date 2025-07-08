import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button, Input, Flex, Textarea } from '@chakra-ui/react'
import SidebarLayout from '../../../components/SidebarLayout'
import { prisma } from '../../../lib/prisma'

interface Backup { id: number; content: string; createdAt: string }
interface Schedule { id: number; device: { id: number; nombre: string } }

export default function ScheduleDetail({ backups, schedule }: { backups: Backup[]; schedule: Schedule }) {
  const router = useRouter()
  const [filter, setFilter] = useState('')
  const [sel, setSel] = useState<number[]>([])
  const filtered = filter ? backups.filter(b => b.createdAt.startsWith(filter)) : backups
  const compare = sel.length === 2 ?
    filtered.find(b => b.id === sel[0])?.content.split('\n').map((l,i)=>({i,l}))
      .map(({i,l})=> l === filtered.find(b=>b.id===sel[1])?.content.split('\n')[i] ? null : `${i+1}: ${l}`)
      .filter(Boolean).join('\n') : ''

  async function runNow() {
    await fetch(`/api/schedules/${schedule.id}/run`, { method: 'POST' })
    router.reload()
  }

  return (
    <SidebarLayout>
      <Flex mb={4} align='center'>
        <Button mr={2} onClick={() => router.push('/backups/programacion')}>Volver</Button>
        <Box as='h1' fontSize='xl' fontWeight='bold'>Programación de {schedule.device.nombre}</Box>
      </Flex>
      <Button colorScheme='blue' mb={4} onClick={runNow}>Sacar backup ahora</Button>
      <Input type='date' mb={2} value={filter} onChange={e=>setFilter(e.target.value)} />
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th></Th>
            <Th>Fecha</Th>
            <Th>Contenido</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filtered.map(b => (
            <Tr key={b.id}>
              <Td><input type='checkbox' onChange={e=>{
                if(e.target.checked) setSel([...sel,b.id])
                else setSel(sel.filter(id=>id!==b.id))
              }} /></Td>
              <Td>{new Date(b.createdAt).toLocaleString()}</Td>
              <Td>{b.content}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {compare && (
        <Box mt={4}>
          <Textarea value={compare} readOnly rows={10} />
        </Box>
      )}
    </SidebarLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params, ...context }) => {
  const session = await getSession(context)
  if (!session) {
    return { redirect: { destination: '/login', permanent: false } }
  }
  const id = Number(params?.id)
  const schedule = await prisma.schedule.findUnique({ where: { id }, include: { device: true } })
  if (!schedule) return { notFound: true }
  const backups = await prisma.backup.findMany({ where: { deviceId: schedule.deviceId }, orderBy: { createdAt: 'desc' } })
  const serialized = backups.map(b => ({ ...b, createdAt: b.createdAt.toISOString() }))
  return { props: { backups: serialized, schedule: { id: schedule.id, device: { id: schedule.device.id, nombre: schedule.device.nombre } } } }
}
