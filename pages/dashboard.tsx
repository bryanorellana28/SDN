import { getSession, signOut } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import { Box, Button, Flex } from '@chakra-ui/react'

export default function Dashboard() {
  return (
    <Flex minH='100vh'>
      <Box w='200px' bg='#333' color='white' p={4}>
        <h2>Sidebar</h2>
        <ul>
          <li>Enlace 1</li>
          <li>Enlace 2</li>
        </ul>
      </Box>
      <Box flex='1' p={4}>
        <h1>Dashboard</h1>
        <p>Contenido privado</p>
        <Button mt={4} onClick={() => signOut()}>
          Cerrar sesión
        </Button>
      </Box>
    </Flex>
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
  return {
    props: {}
  }
}
