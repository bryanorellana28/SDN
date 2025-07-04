import { getSession, signOut } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import { Box, Button } from '@chakra-ui/react'
import SidebarLayout from '../components/SidebarLayout'

export default function Dashboard() {
  return (
    <SidebarLayout>
      <Box>
        <h1>Dashboard</h1>
        <p>Contenido privado</p>
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
  return {
    props: {}
  }
}
