import { Box, Button, Heading } from '@chakra-ui/react'

export default function Home() {
  return (
    <Box
      display='flex'
      flexDirection='column'
      justifyContent='center'
      alignItems='center'
      minH='100vh'
      bgGradient='linear(to-r, #020024, #090979, #00d4ff)'
      color='white'
      textAlign='center'
    >
      <Heading mb={4}>Bienvenido</Heading>
      <Button as='a' href='/login' bg='white' color='gray.800'>
        Iniciar sesión
      </Button>
    </Box>
  )
}
