import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { Box, Button, FormControl, FormLabel, Heading, Input } from '@chakra-ui/react'
import SidebarLayout from '../../../components/SidebarLayout'
import { prisma } from '../../../lib/prisma'

interface Device {
  id: number
  ipGestion: string
  sitio: string
  rack: string
  tipoEquipo: string
  marca: string
}

interface Option { id: number; name: string }

export default function EditDevice({ device }: { device: Device }) {
  const router = useRouter()
  const [form, setForm] = useState({ ...device })
  const [sites, setSites] = useState<Option[]>([])
  const brandOptions = [
    { id: 1, name: 'Cisco' },
    { id: 2, name: 'Mikrotik' }
  ]

  useEffect(() => {
    fetch('/api/sites').then(res => res.json()).then(setSites)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
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
          <FormLabel>Sitio</FormLabel>
          <select name='sitio' value={form.sitio} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px' }}>
            <option value=''>Seleccione...</option>
            {sites.map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Rack</FormLabel>
          <Input name='rack' value={form.rack} onChange={handleChange} />
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Tipo de equipo</FormLabel>
          <select name='tipoEquipo' value={form.tipoEquipo} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px' }}>
            <option value=''>Seleccione...</option>
            <option value='router-nodo'>router-nodo</option>
            <option value='router-cliente'>router-cliente</option>
            <option value='switch-nodo'>switch-nodo</option>
            <option value='switch-cliente'>switch-cliente</option>
          </select>
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Marca</FormLabel>
          <select name='marca' value={form.marca} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px' }}>
            <option value=''>Seleccione...</option>
            {brandOptions.map((b) => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
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
  if (!device) {
    return { notFound: true }
  }
  const serialized = { ...device, createdAt: device.createdAt.toISOString() }
  return { props: { device: serialized } }
}
