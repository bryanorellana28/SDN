import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useState } from 'react'
import { Box, Heading, Select, Button, Flex, Text } from '@chakra-ui/react'
import SidebarLayout from '../../components/SidebarLayout'
import { prisma } from '../../lib/prisma'

type Interface = { id: number; name: string; description?: string | null }
type Device = { id: number; ipGestion: string; hostname?: string | null; interfaces: Interface[] }
type Connection = { id: number; srcDeviceId: number; srcInterface: string; dstDeviceId: number; dstInterface: string }
export default function Topologia({ devices, initialConnections }: { devices: Device[]; initialConnections: Connection[] }) {
  const [srcId, setSrcId] = useState('')
  const [srcIf, setSrcIf] = useState('')
  const [dstId, setDstId] = useState('')
  const [dstIf, setDstIf] = useState('')
  const [connections, setConnections] = useState<Connection[]>(initialConnections)
  const [editId, setEditId] = useState<number | null>(null)

  const positions = devices.map((_, idx) => ({ x: 120 + idx * 180, y: 120 }))

  async function handleAdd() {
    if (!srcId || !srcIf || !dstId || !dstIf) return
    const payload = { srcDeviceId: Number(srcId), srcInterface: srcIf, dstDeviceId: Number(dstId), dstInterface: dstIf }
    const res = await fetch('/api/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    setConnections([...connections, data])
    setSrcId('')
    setSrcIf('')
    setDstId('')
    setDstIf('')
  }

  async function handleUpdate(id: number) {
    const payload = { srcDeviceId: Number(srcId), srcInterface: srcIf, dstDeviceId: Number(dstId), dstInterface: dstIf }
    const res = await fetch(`/api/connections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    setConnections(connections.map(c => c.id === id ? data : c))
    setEditId(null)
    setSrcId('')
    setSrcIf('')
    setDstId('')
    setDstIf('')
  }

  async function handleDelete(id: number) {
    await fetch(`/api/connections/${id}`, { method: 'DELETE' })
    setConnections(connections.filter(c => c.id !== id))
  }

  function startEdit(c: Connection) {
    setEditId(c.id)
    setSrcId(String(c.srcDeviceId))
    setSrcIf(c.srcInterface)
    setDstId(String(c.dstDeviceId))
    setDstIf(c.dstInterface)
  }

  return (
    <SidebarLayout>
      <Box>
        <Heading size='md' mb={4}>Topolog\u00eda</Heading>
        <svg width='100%' height='350' style={{ border: '1px solid #ccc' }}>
          <defs>
            <marker id='arrow' markerWidth='10' markerHeight='10' refX='8' refY='5' orient='auto-start-reverse'>
              <path d='M0,0 L10,5 L0,10 z' fill='#4A5568' />
            </marker>
          </defs>
          {devices.map((d, i) => (
            <g key={d.id} transform={`translate(${positions[i].x}, ${positions[i].y})`}>
              <circle r='25' fill='#4299e1' />
              <text x='-20' y='35' fontSize='12' fill='white'>{d.hostname || d.ipGestion}</text>
            </g>
          ))}
          {connections.map((c) => {
            const si = devices.findIndex(d => d.id === c.srcDeviceId)
            const di = devices.findIndex(d => d.id === c.dstDeviceId)
            if (si === -1 || di === -1) return null
            const s = positions[si]
            const t = positions[di]
            return <line key={c.id} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke='#4A5568' strokeWidth={2} markerEnd='url(#arrow)' />
          })}
        </svg>
        <Flex mt={4} gap={2} flexWrap='wrap'>
          <Select placeholder='Origen' value={srcId} onChange={e => { setSrcId(e.target.value); setSrcIf('') }}>
            {devices.map(d => (
              <option key={d.id} value={d.id}>{d.hostname || d.ipGestion}</option>
            ))}
          </Select>
          <Select placeholder='Interfaz Origen' value={srcIf} onChange={e => setSrcIf(e.target.value)}>
            {devices.find(d => d.id === Number(srcId))?.interfaces.map(i => (
              <option key={i.id} value={i.name}>{i.name}</option>
            ))}
          </Select>
          <Select placeholder='Destino' value={dstId} onChange={e => { setDstId(e.target.value); setDstIf('') }}>
            {devices.map(d => (
              <option key={d.id} value={d.id}>{d.hostname || d.ipGestion}</option>
            ))}
          </Select>
          <Select placeholder='Interfaz Destino' value={dstIf} onChange={e => setDstIf(e.target.value)}>
            {devices.find(d => d.id === Number(dstId))?.interfaces.map(i => (
              <option key={i.id} value={i.name}>{i.name}</option>
            ))}
          </Select>
          {editId ? (
            <>
              <Button colorScheme='green' onClick={() => handleUpdate(editId!)}>Guardar</Button>
              <Button onClick={() => { setEditId(null); setSrcId(''); setSrcIf(''); setDstId(''); setDstIf('') }}>Cancelar</Button>
            </>
          ) : (
            <Button onClick={handleAdd}>Conectar</Button>
          )}
        </Flex>
        <Box mt={6}>
          <Heading size='sm' mb={2}>Conexiones</Heading>
          {connections.length === 0 && <Text>No hay conexiones</Text>}
          {connections.map(c => (
            <Flex key={c.id} align='center' mb={1}>
              <Box flex='1'>
                {devices.find(d => d.id === c.srcDeviceId)?.hostname || devices.find(d => d.id === c.srcDeviceId)?.ipGestion}:{' '}
                {c.srcInterface} → {devices.find(d => d.id === c.dstDeviceId)?.hostname || devices.find(d => d.id === c.dstDeviceId)?.ipGestion}:{' '}
                {c.dstInterface}
              </Box>
              <Button size='sm' mr={2} onClick={() => startEdit(c)}>Editar</Button>
              <Button size='sm' colorScheme='red' onClick={() => handleDelete(c.id)}>Eliminar</Button>
            </Flex>
          ))}
        </Box>
      </Box>
    </SidebarLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    }
  }

  const devices = await prisma.device.findMany({
    where: { tipoEquipo: 'router-nodo' },
    include: { interfaces: true }
  })

  const serialized = devices.map(d => ({
    ...d,
    createdAt: d.createdAt.toISOString(),
    interfaces: d.interfaces.map(i => ({ ...i, createdAt: i.createdAt.toISOString() }))
  }))

  const connections = await prisma.connection.findMany()
  const serializedConns = connections.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString()
  }))

  return { props: { devices: serialized, initialConnections: serializedConns } }
}
