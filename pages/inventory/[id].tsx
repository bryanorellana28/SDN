import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { Box, Heading, Text, List, ListItem } from '@chakra-ui/react'
import SidebarLayout from '../../components/SidebarLayout'
import { prisma } from '../../lib/prisma'

type Interface = { id: number; name: string; description?: string | null }
interface Device {
  id: number
  ipGestion: string
  sitio: string
  rack: string
  tipoEquipo: string
  marca: string
  hostname?: string | null
  versionSoftware?: string | null
  cpu?: string | null
  boardName?: string | null
  interfaces: Interface[]
}

export default function ViewDevice({ device }: { device: Device }) {
  return (
    <SidebarLayout>
      <Box maxW='md' mx='auto'>
        <Heading size='md' mb={4}>Información del Dispositivo</Heading>
        <Text><b>IP:</b> {device.ipGestion}</Text>
        <Text><b>Sitio:</b> {device.sitio}</Text>
        <Text><b>Rack:</b> {device.rack}</Text>
        <Text><b>Tipo:</b> {device.tipoEquipo}</Text>
        <Text><b>Marca:</b> {device.marca}</Text>
        {device.hostname && <Text><b>Hostname:</b> {device.hostname}</Text>}
        {device.versionSoftware && <Text><b>Versión:</b> {device.versionSoftware}</Text>}
        {device.cpu && <Text><b>CPU:</b> {device.cpu}</Text>}
        {device.boardName && <Text><b>Board:</b> {device.boardName}</Text>}
        {device.interfaces.length > 0 && (
          <Box mt={4}>
            <Heading size='sm'>Interfaces</Heading>
            <List spacing={1} mt={2}>
              {device.interfaces.map((i) => (
                <ListItem key={i.id}>{i.name}{i.description ? ` - ${i.description}` : ''}</ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
    </SidebarLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params, ...context }) => {
  const session = await getSession(context)
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    }
  }
  const id = Number(params?.id)
  const device = await prisma.device.findUnique({ where: { id }, include: { interfaces: true } })
  if (!device) {
    return { notFound: true }
  }
  const serialized = {
    ...device,
    createdAt: device.createdAt.toISOString(),
    interfaces: device.interfaces.map(i => ({ ...i, createdAt: i.createdAt.toISOString() }))
  }
  return { props: { device: serialized } }
}
