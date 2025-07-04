import { getSession, signOut } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import {
  Box,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '@chakra-ui/react'
import SidebarLayout from '../components/SidebarLayout'
import { prisma } from '../lib/prisma'

interface Stats {
  deviceCount: number
  brandCount: number
  siteCount: number
  devicesBySite: { sitio: string | null; _count: { _all: number } }[]
  devicesByBrand: { marca: string | null; _count: { _all: number } }[]
}

export default function Dashboard({ stats }: { stats: Stats }) {
  return (
    <SidebarLayout>
      <Box>
        <Box as='h1' fontSize='xl' fontWeight='bold' mb={4}>Dashboard</Box>

        <SimpleGrid columns={[1, 3]} spacing={4} mb={8}>
          <Stat bg='white' p={4} borderRadius='md'>
            <StatLabel>Equipos</StatLabel>
            <StatNumber>{stats.deviceCount}</StatNumber>
          </Stat>
          <Stat bg='white' p={4} borderRadius='md'>
            <StatLabel>Marcas</StatLabel>
            <StatNumber>{stats.brandCount}</StatNumber>
          </Stat>
          <Stat bg='white' p={4} borderRadius='md'>
            <StatLabel>Sitios</StatLabel>
            <StatNumber>{stats.siteCount}</StatNumber>
          </Stat>
        </SimpleGrid>

        <Box mb={8}>
          <Box as='h2' fontSize='lg' fontWeight='bold' mb={2}>Equipos por Sitio</Box>
          <Table variant='simple' size='sm'>
            <Thead>
              <Tr>
                <Th>Sitio</Th>
                <Th isNumeric>Cantidad</Th>
              </Tr>
            </Thead>
            <Tbody>
              {stats.devicesBySite.map((s) => (
                <Tr key={s.sitio ?? 'null'}>
                  <Td>{s.sitio || 'N/A'}</Td>
                  <Td isNumeric>{s._count._all}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Box mb={8}>
          <Box as='h2' fontSize='lg' fontWeight='bold' mb={2}>Equipos por Marca</Box>
          <Table variant='simple' size='sm'>
            <Thead>
              <Tr>
                <Th>Marca</Th>
                <Th isNumeric>Cantidad</Th>
              </Tr>
            </Thead>
            <Tbody>
              {stats.devicesByBrand.map((b) => (
                <Tr key={b.marca ?? 'null'}>
                  <Td>{b.marca || 'N/A'}</Td>
                  <Td isNumeric>{b._count._all}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Button mt={4} onClick={() => signOut()}>
          Cerrar sesión
        </Button>
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

  const deviceCount = await prisma.device.count()
  const brandCount = await prisma.brand.count()
  const siteCount = await prisma.site.count()

  const devicesBySite = await prisma.device.groupBy({
    by: ['sitio'],
    _count: { _all: true }
  })

  const devicesByBrand = await prisma.device.groupBy({
    by: ['marca'],
    _count: { _all: true }
  })

  return {
    props: {
      stats: {
        deviceCount,
        brandCount,
        siteCount,
        devicesBySite,
        devicesByBrand
      }
    }
  }
}
