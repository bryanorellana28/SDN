import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Box, Button, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react'
import SidebarLayout from '../../components/SidebarLayout'
import { prisma } from '../../lib/prisma'

interface Device {
  id: number
  ipGestion: string
  marca: string
  boardName?: string | null
  versionSoftware?: string | null
}

interface GoldenImage {
  id: number
  modelo: string
  version: string
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0)
    if (diff !== 0) return diff
  }
  return 0
}

export default function Cumplimiento({ devices, images }: { devices: Device[]; images: GoldenImage[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<number | null>(null)

  async function handleUpdate(id: number) {
    setLoading(id)
    await fetch(`/api/devices/${id}/apply-golden`, { method: 'POST' })
    setLoading(null)
    router.reload()
  }

  return (
    <SidebarLayout>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
        <Box as='h1' fontSize='xl' fontWeight='bold'>Cumplimiento de Software</Box>
        <Button colorScheme='blue' onClick={() => router.push('/software/golden')}>Golden Images</Button>
      </Box>
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th>IP</Th>
            <Th>Marca</Th>
            <Th>Modelo</Th>
            <Th>Versión</Th>
            <Th>Golden</Th>
            <Th>Estado</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {devices.map(d => {
            const img = images.find(g => g.modelo === d.boardName)
            const status = img && d.versionSoftware ? (compareVersions(d.versionSoftware, img.version) >= 0 ? 'Cumple' : 'Sin cumplimiento') : 'Sin golden'
            return (
              <Tr key={d.id}>
                <Td>{d.ipGestion}</Td>
                <Td>{d.marca}</Td>
                <Td>{d.boardName}</Td>
                <Td>{d.versionSoftware}</Td>
                <Td>{img?.version || '-'}</Td>
                <Td>{status}</Td>
                <Td>
                  {status === 'Sin cumplimiento' && (
                    <Button size='sm' onClick={() => handleUpdate(d.id)} isLoading={loading === d.id}>Actualizar</Button>
                  )}
                </Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
    </SidebarLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  if (!session) {
    return { redirect: { destination: '/login', permanent: false } }
  }
  const devices = await prisma.device.findMany({ select: { id: true, ipGestion: true, marca: true, boardName: true, versionSoftware: true } })
  const images = await prisma.goldenImage.findMany()
  const serializedDevices = devices.map(d => ({ ...d }))
  const serializedImages = images.map(i => ({
    ...i,
    createdAt: i.createdAt.toISOString(),
  }))
  return { props: { devices: serializedDevices, images: serializedImages } }
}
