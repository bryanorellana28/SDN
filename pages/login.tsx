import { getCsrfToken, signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  Link
} from '@chakra-ui/react'

export default function Login({ csrfToken }: { csrfToken: string }) {
  const router = useRouter()
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const res = await signIn('credentials', {
      redirect: false,
      email: form.get('email'),
      password: form.get('password'),
      callbackUrl: '/dashboard'
    })

    if (res?.ok) {
      router.push('/dashboard')
    } else {
      setError('Credenciales inválidas')
    }
  }

  return (
    <Box
      minH='100vh'
      display='flex'
      justifyContent='center'
      alignItems='center'
      bgGradient='linear(to-r, #020024, #090979, #00d4ff)'
    >
      <Box
        as='form'
        onSubmit={handleSubmit}
        bg='white'
        p={8}
        borderRadius='md'
        boxShadow='md'
        w='100%'
        maxW='400px'
      >
        <input name='csrfToken' type='hidden' defaultValue={csrfToken} />
        <Text as='h1' mb={4} textAlign='center' fontSize='xl'>
          Iniciar Sesión
        </Text>
        {error && (
          <Text color='red.500' mb={2}>
            {error}
          </Text>
        )}
        <FormControl mb={4}>
          <FormLabel>Correo</FormLabel>
          <Input type='email' name='email' required />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Contraseña</FormLabel>
          <Input type='password' name='password' required />
        </FormControl>
        <Button type='submit' colorScheme='blue' w='100%'>
          Entrar
        </Button>
        <Text mt={2} textAlign='center'>
          ¿No tienes cuenta?{' '}
          <Link as={NextLink} href='/register' color='blue.500'>
            Regístrate
          </Link>
        </Text>
      </Box>
    </Box>
  )
}

Login.getInitialProps = async (context: any) => {
  return {
    csrfToken: await getCsrfToken(context)
  }
}
