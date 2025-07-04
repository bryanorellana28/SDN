import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
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
  credentialId?: number | null
  credential?: { id: number; usuario: string } | null
  serial?: string | null
  assetTag?: string | null
  descripcion?: string | null
}

interface Option { id: number; name: string }
interface CredentialOption { id: number; usuario: string }

export default function EditDevice({ device }: { device: Device }) {
  const router = useRouter()
  const [form, setForm] = useState({ ...device })
  const [sites, setSites] = useState<Option[]>([])
  const [brands, setBrands] = useState<Option[]>([])
  const [creds, setCreds] = useState<CredentialOption[]>([])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  useEffect(() => {
    fetch('/api/sites').then(res => res.json()).then(setSites)
    fetch('/api/brands').then(res => res.json()).then(setBrands)
    fetch('/api/credentials').then(res => res.json()).then(setCreds)
  }, [])

  async function handleSave() {
    const payload = { ...form, credentialId: form.credentialId ? Number(form.credentialId) : null }
    await fetch(`/api/devices/${device.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
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
          <Input name='tipoEquipo' value={form.tipoEquipo} onChange={handleChange} />
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Marca</FormLabel>
          <select name='marca' value={form.marca} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px' }}>
            <option value=''>Seleccione...</option>
            {brands.map((b) => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
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
          <FormLabel>Usuario</FormLabel>
          <select name='credentialId' value={form.credentialId ?? ''} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px' }}>
            <option value=''>Seleccione...</option>
            {creds.map((c) => (
              <option key={c.id} value={c.id}>{c.usuario}</option>
            ))}
          </select>
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Serial</FormLabel>
          <Input name='serial' value={form.serial ?? ''} onChange={handleChange} />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Asset Tag</FormLabel>
          <Input name='assetTag' value={form.assetTag ?? ''} onChange={handleChange} />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Descripción</FormLabel>
          <Input name='descripcion' value={form.descripcion ?? ''} onChange={handleChange} />
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
  const device = await prisma.device.findUnique({ where: { id }, include: { credential: true } })
  if (!device) {
    return { notFound: true }
  }
  const serializedDevice = {
    ...device,
    createdAt: device.createdAt.toISOString(),
    credential: device.credential
  }
  return {
    props: { device: serializedDevice }
  }
}
