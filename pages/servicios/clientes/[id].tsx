import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Box, Button, FormControl, FormLabel, Heading, Input } from '@chakra-ui/react'
import SidebarLayout from '../../../components/SidebarLayout'
import { prisma } from '../../../lib/prisma'

interface Client {
  id: number
  nombre: string
  identificacion: string
  razonSocial: string
  nit: string
}

export default function EditClient({ client }: { client: Client }) {
  const router = useRouter()
  const [form, setForm] = useState({ ...client })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSave() {
    await fetch(`/api/clients/${client.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    router.push('/servicios/clientes')
  }

  return (
    <SidebarLayout>
      <Box maxW='md' mx='auto'>
        <Heading size='md' mb={4}>Editar Cliente</Heading>
        <FormControl mb={2}>
          <FormLabel>Nombre</FormLabel>
          <Input name='nombre' value={form.nombre} onChange={handleChange} />
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Identificación</FormLabel>
          <Input name='identificacion' value={form.identificacion} onChange={handleChange} />
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Razón Social</FormLabel>
          <Input name='razonSocial' value={form.razonSocial} onChange={handleChange} />
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>NIT</FormLabel>
          <Input name='nit' value={form.nit} onChange={handleChange} />
        </FormControl>
        <Button onClick={handleSave} colorScheme='blue'>Guardar</Button>
      </Box>
    </SidebarLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params, ...context }) => {
  const session = await getSession(context)
  if (!session) {
    return { redirect: { destination: '/login', permanent: false } }
  }
  const id = Number(params?.id)
  const client = await prisma.client.findUnique({ where: { id } })
  if (!client) return { notFound: true }
  const serialized = { ...client, createdAt: client.createdAt.toISOString() }
  return { props: { client: serialized } }
}
