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

export default function Register() {
  const router = useRouter()
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password')
      })
    })
    if (res.ok) {
      router.push('/login')
    } else {
      const data = await res.json()
      setError(data.message || 'Error')
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
        <Text as='h1' mb={4} textAlign='center' fontSize='xl'>
          Registro
        </Text>
        {error && (
          <Text color='red.500' mb={2}>
            {error}
          </Text>
        )}
        <FormControl mb={4}>
          <FormLabel>Nombre</FormLabel>
          <Input type='text' name='name' required />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Correo</FormLabel>
          <Input type='email' name='email' required />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Contraseña</FormLabel>
          <Input type='password' name='password' required />
        </FormControl>
        <Button type='submit' colorScheme='blue' w='100%'>
          Registrar
        </Button>
        <Text mt={2} textAlign='center'>
          ¿Ya tienes cuenta?{' '}
          <Link as={NextLink} href='/login' color='blue.500'>
            Inicia sesión
          </Link>
        </Text>
      </Box>
    </Box>
  )
}
