import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { Box, Table, Thead, Tbody, Tr, Th, Td, Button } from '@chakra-ui/react'
import SidebarLayout from '../../../components/SidebarLayout'
import { prisma } from '../../../lib/prisma'

interface Backup { id: number; content: string; createdAt: string }
interface Device { id: number; nombre: string }

export default function Backups({ backups, device }: { backups: Backup[]; device: Device }) {
  const router = useRouter()
  return (
    <SidebarLayout>
      <Box display='flex' alignItems='center' mb={4}>
        <Button mr={2} onClick={() => router.push('/backups/bodega')}>Volver</Button>
        <Box as='h1' fontSize='xl' fontWeight='bold'>Backups de {device.nombre}</Box>
      </Box>
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th>Fecha</Th>
            <Th>Contenido</Th>
          </Tr>
        </Thead>
        <Tbody>
          {backups.map(b => (
            <Tr key={b.id}>
              <Td>{new Date(b.createdAt).toLocaleString()}</Td>
              <Td>{b.content}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </SidebarLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params, ...context }) => {
  const session = await getSession(context)
  if (!session) {
    return { redirect: { destination: '/login', permanent: false } }
  }
  const id = Number(params?.id)
  const device = await prisma.device.findUnique({ where: { id }, select: { id: true, nombre: true } })
  if (!device) return { notFound: true }
  const backups = await prisma.backup.findMany({ where: { deviceId: id } })
  const serialized = backups.map(b => ({ ...b, createdAt: b.createdAt.toISOString() }))
  return { props: { backups: serialized, device } }
}
