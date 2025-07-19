import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button, Input } from '@chakra-ui/react'
import SidebarLayout from '../../../components/SidebarLayout'
import { prisma } from '../../../lib/prisma'

interface Device { id: number; nombre: string }

export default function Bodega({ devices }: { devices: Device[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const filtered = devices.filter(d =>
    d.nombre.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <SidebarLayout>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
        <Box as='h1' fontSize='xl' fontWeight='bold'>Bodega Backups</Box>
        <Input
          placeholder='Buscar...'
          value={search}
          onChange={e => setSearch(e.target.value)}
          w='200px'
          bg='white'
          color='black'
        />
      </Box>
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th>Equipo</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filtered.map(d => (
            <Tr key={d.id}>
              <Td>{d.nombre}</Td>
              <Td>
                <Button size='sm' onClick={() => router.push(`/backups/bodega/${d.id}`)}>Ver</Button>
              </Td>
            </Tr>
          ))}
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
  const devices = await prisma.device.findMany({ select: { id: true, nombre: true } })
  return { props: { devices } }
}
