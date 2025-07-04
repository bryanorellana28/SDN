import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Box, Button, Input } from '@chakra-ui/react'
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
      <Box>
        <Input mb={2} placeholder='IP de gestión' name='ipGestion' value={form.ipGestion} onChange={handleChange} />
        <Input mb={2} placeholder='Nombre' name='nombre' value={form.nombre} onChange={handleChange} />
        <Input mb={2} placeholder='Sitio' name='sitio' value={form.sitio} onChange={handleChange} />
        <Input mb={2} placeholder='Rack' name='rack' value={form.rack} onChange={handleChange} />
        <Input mb={2} placeholder='Tipo de equipo' name='tipoEquipo' value={form.tipoEquipo} onChange={handleChange} />
        <Input mb={2} placeholder='Marca' name='marca' value={form.marca} onChange={handleChange} />
        <Input mb={2} placeholder='Modelo' name='modelo' value={form.modelo} onChange={handleChange} />
        <Input mb={2} placeholder='Versión de software' name='versionSoftware' value={form.versionSoftware} onChange={handleChange} />
        <Input mb={2} placeholder='Serial' name='serial' value={form.serial ?? ''} onChange={handleChange} />
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
