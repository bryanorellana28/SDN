import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import {
  Box,
  Heading,
  Text,
  List,
  ListItem,
  Stack,
  Flex
} from '@chakra-ui/react'
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
        <Box bg='white' p={4} borderRadius='md' boxShadow='md'>
          <Stack spacing={3}>
            <Flex>
              <Text fontWeight='bold' w='40%'>IP:</Text>
              <Text w='60%'>{device.ipGestion}</Text>
            </Flex>
            <Flex>
              <Text fontWeight='bold' w='40%'>Sitio:</Text>
              <Text w='60%'>{device.sitio}</Text>
            </Flex>
            <Flex>
              <Text fontWeight='bold' w='40%'>Rack:</Text>
              <Text w='60%'>{device.rack}</Text>
            </Flex>
            <Flex>
              <Text fontWeight='bold' w='40%'>Tipo:</Text>
              <Text w='60%'>{device.tipoEquipo}</Text>
            </Flex>
            <Flex>
              <Text fontWeight='bold' w='40%'>Marca:</Text>
              <Text w='60%'>{device.marca}</Text>
            </Flex>
            {device.hostname && (
              <Flex>
                <Text fontWeight='bold' w='40%'>Hostname:</Text>
                <Text w='60%'>{device.hostname}</Text>
              </Flex>
            )}
            {device.versionSoftware && (
              <Flex>
                <Text fontWeight='bold' w='40%'>Versión:</Text>
                <Text w='60%'>{device.versionSoftware}</Text>
              </Flex>
            )}
            {device.cpu && (
              <Flex>
                <Text fontWeight='bold' w='40%'>CPU:</Text>
                <Text w='60%'>{device.cpu}</Text>
              </Flex>
            )}
            {device.boardName && (
              <Flex>
                <Text fontWeight='bold' w='40%'>Board:</Text>
                <Text w='60%'>{device.boardName}</Text>
              </Flex>
            )}
          </Stack>
          {device.interfaces.length > 0 && (
            <Box mt={4}>
              <Heading size='sm' mb={2}>Interfaces</Heading>
              <Text mb={2} fontWeight='bold'>Cantidad: {device.interfaces.length}</Text>
              <List spacing={1}>
                {device.interfaces.map((i) => (
                  <ListItem key={i.id}>
                    {i.name}
                    {i.description ? ` - ${i.description}` : ''}
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
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
