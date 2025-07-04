import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Box, Button, FormControl, FormLabel, Heading, Input } from '@chakra-ui/react'
import SidebarLayout from '../../components/SidebarLayout'
import { prisma } from '../../lib/prisma'

interface Credential {
  id: number
  usuario: string
  contrasena: string
}

export default function EditPassword({ credential }: { credential: Credential }) {
  const router = useRouter()
  const [form, setForm] = useState({ ...credential })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSave() {
    await fetch(`/api/credentials/${credential.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    router.push('/passwords')
  }

  return (
    <SidebarLayout>
      <Box maxW='md' mx='auto'>
        <Heading size='md' mb={4}>Editar Contraseña</Heading>
        <FormControl mb={2}>
          <FormLabel>Usuario</FormLabel>
          <Input name='usuario' value={form.usuario} onChange={handleChange} />
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Contraseña</FormLabel>
          <Input type='password' name='contrasena' value={form.contrasena} onChange={handleChange} />
        </FormControl>
        <Button onClick={handleSave} colorScheme='blue'>Guardar</Button>
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
  const credential = await prisma.credential.findUnique({ where: { id } })
  if (!credential) {
    return { notFound: true }
  }
  const serialized = { ...credential, createdAt: credential.createdAt.toISOString() }
  return { props: { credential: serialized } }
}
