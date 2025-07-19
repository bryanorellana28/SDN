import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Box, Button, FormControl, FormLabel, Heading, Input, Select } from '@chakra-ui/react'
import SidebarLayout from '../../../components/SidebarLayout'
import { prisma } from '../../../lib/prisma'

interface Client { id: number; nombre: string }
interface Contract {
  id: number
  numero: string
  descripcion?: string | null
  inicio?: string | null
  fin?: string | null
  clientId: number
}

export default function EditContract({ contract, clients }: { contract: Contract; clients: Client[] }) {
  const router = useRouter()
  const [form, setForm] = useState({ ...contract, inicio: contract.inicio || '', fin: contract.fin || '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSave() {
    await fetch(`/api/contracts/${contract.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, clientId: Number(form.clientId) })
    })
    router.push('/servicios/contratos')
  }

  return (
    <SidebarLayout>
      <Box maxW='md' mx='auto'>
        <Heading size='md' mb={4}>Editar Contrato</Heading>
        <FormControl mb={2}>
          <FormLabel>Número</FormLabel>
          <Input name='numero' value={form.numero} onChange={handleChange} />
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Cliente</FormLabel>
          <Select name='clientId' value={form.clientId} onChange={handleChange}>
            {clients.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </Select>
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Descripción</FormLabel>
          <Input name='descripcion' value={form.descripcion || ''} onChange={handleChange} />
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Inicio</FormLabel>
          <Input type='date' name='inicio' value={form.inicio as string} onChange={handleChange} />
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Fin</FormLabel>
          <Input type='date' name='fin' value={form.fin as string} onChange={handleChange} />
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
  const contract = await prisma.contract.findUnique({ where: { id } })
  if (!contract) return { notFound: true }
  const clients = await prisma.client.findMany({ select: { id: true, nombre: true } })
  const serialized = { ...contract, inicio: contract.inicio ? contract.inicio.toISOString().substring(0,10) : '', fin: contract.fin ? contract.fin.toISOString().substring(0,10) : '', createdAt: contract.createdAt.toISOString() }
  return { props: { contract: serialized, clients } }
}
