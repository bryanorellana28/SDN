import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input
} from '@chakra-ui/react'
import SidebarLayout from '../../components/SidebarLayout'
import { prisma } from '../../lib/prisma'

interface Device {
  id: number
  ipGestion: string
  nombre: string
  sitio: string
  rack: string
  tipoEquipo: string
  marca: string
  modelo: string
  versionSoftware: string
  serial?: string | null
}

export default function EditDevice({ device }: { device: Device }) {
  const router = useRouter()
  const [form, setForm] = useState({ ...device })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSave() {
    await fetch(`/api/devices/${device.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    router.push('/inventory')
  }

  return (
    <SidebarLayout>
      <Box maxW='md' mx='auto'>
        <Heading size='md' mb={4}>Editar Dispositivo</Heading>
        <FormControl mb={2}>
          <FormLabel>IP de gestión</FormLabel>
          <Input name='ipGestion' value={form.ipGestion} onChange={handleChange} />
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Nombre</FormLabel>
          <Input name='nombre' value={form.nombre} onChange={handleChange} />
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Sitio</FormLabel>
          <Input name='sitio' value={form.sitio} onChange={handleChange} />
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Rack</FormLabel>
          <Input name='rack' value={form.rack} onChange={handleChange} />
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Tipo de equipo</FormLabel>
          <Input name='tipoEquipo' value={form.tipoEquipo} onChange={handleChange} />
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Marca</FormLabel>
          <Input name='marca' value={form.marca} onChange={handleChange} />
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Modelo</FormLabel>
          <Input name='modelo' value={form.modelo} onChange={handleChange} />
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Versión de software</FormLabel>
          <Input name='versionSoftware' value={form.versionSoftware} onChange={handleChange} />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Serial</FormLabel>
          <Input name='serial' value={form.serial ?? ''} onChange={handleChange} />
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
  const device = await prisma.device.findUnique({ where: { id } })
  return {
    props: { device }
  }
}
