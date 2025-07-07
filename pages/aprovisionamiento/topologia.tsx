import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useState } from 'react'
import { Box, Heading, Select, Button, Flex } from '@chakra-ui/react'
import SidebarLayout from '../../components/SidebarLayout'
import { prisma } from '../../lib/prisma'

type Interface = { id: number; name: string; description?: string | null }
type Device = { id: number; ipGestion: string; hostname?: string | null; interfaces: Interface[] }

export default function Topologia({ devices }: { devices: Device[] }) {
  const [srcId, setSrcId] = useState('')
  const [srcIf, setSrcIf] = useState('')
  const [dstId, setDstId] = useState('')
  const [dstIf, setDstIf] = useState('')
  const [connections, setConnections] = useState<{ srcId: number; srcIf: string; dstId: number; dstIf: string }[]>([])

  const positions = devices.map((_, idx) => ({ x: 100 + idx * 150, y: 100 }))

  function handleAdd() {
    if (!srcId || !srcIf || !dstId || !dstIf) return
    setConnections([...connections, { srcId: Number(srcId), srcIf, dstId: Number(dstId), dstIf }])
  }

  return (
    <SidebarLayout>
      <Box>
        <Heading size='md' mb={4}>Topolog\u00eda</Heading>
        <svg width='100%' height='300' style={{ border: '1px solid #ccc' }}>
          {devices.map((d, i) => (
            <g key={d.id} transform={`translate(${positions[i].x}, ${positions[i].y})`}>
              <circle r='20' fill='#90cdf4' />
              <text x='-15' y='35' fontSize='10'>{d.hostname || d.ipGestion}</text>
            </g>
          ))}
          {connections.map((c, idx) => {
            const si = devices.findIndex(d => d.id === c.srcId)
            const di = devices.findIndex(d => d.id === c.dstId)
            if (si === -1 || di === -1) return null
            const s = positions[si]
            const t = positions[di]
            return <line key={idx} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke='black' />
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
          <Button onClick={handleAdd}>Conectar</Button>
        </Flex>
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

  return { props: { devices: serialized } }
}
