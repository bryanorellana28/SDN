import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  FormControl,
  FormLabel,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '@chakra-ui/react'
import SidebarLayout from '../../components/SidebarLayout'
import { prisma } from '../../lib/prisma'

interface Device {
  id: number
  ipGestion: string
  sitio: string
  rack: string
  tipoEquipo: string
  marca: string
  hostname?: string | null
  versionSoftware?: string | null
  cpu?: string | null
  boardName?: string | null
  interfaces?: { id: number; name: string; description?: string | null }[]
}

interface Option { id: number; name: string }

export default function Inventory({ devices }: { devices: Device[] }) {
  const router = useRouter()
  const [form, setForm] = useState({
    ipGestion: '',
    sitio: '',
    rack: '',
    tipoEquipo: '',
    marca: ''
  })
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [sites, setSites] = useState<Option[]>([])
  const brandOptions = [
    { id: 1, name: 'Cisco' },
    { id: 2, name: 'Mikrotik' }
  ]
  const [error, setError] = useState('')
  const onClose = () => setIsOpen(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  useEffect(() => {
    fetch('/api/sites').then(res => res.json()).then(setSites)
  }, [])

  async function handleAdd() {
    setError('')
    const required = ['ipGestion','sitio','rack','tipoEquipo','marca']
    const fieldsFilled = required.every((key) => (form as any)[key] !== '')
    if (!fieldsFilled) {
      setError('Todos los campos son obligatorios')
      return
    }

    const payload = { ...form }
    await fetch('/api/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    setForm({
      ipGestion: '',
      sitio: '',
      rack: '',
      tipoEquipo: '',
      marca: ''
    })
    onClose()
    alert('Dispositivo agregado exitosamente')
    router.reload()
  }

  async function handleDelete(id: number) {
    await fetch(`/api/devices/${id}`, { method: 'DELETE' })
    router.reload()
  }

  const filteredDevices = devices.filter((d) =>
    Object.values(d).some((v) =>
      v && v.toString().toLowerCase().includes(search.toLowerCase())
    )
  )

  return (
    <SidebarLayout>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
        <Box as='h1' fontSize='xl' fontWeight='bold'>Inventario</Box>
        <Box ml='auto' display='flex' alignItems='center'>
          <Input
            placeholder='Buscar...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            mr={2}
            bg='white'
            color='black'
          />
          <Button colorScheme='blue' onClick={() => setIsOpen(true)}>Agregar</Button>
        </Box>
      </Box>

      <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='md'>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Agregar Dispositivo</DrawerHeader>
          <DrawerBody>
            {error && (
              <Box color='red.500' mb={2}>
                {error}
              </Box>
            )}
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

          </DrawerBody>
          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={onClose}>Cancelar</Button>
            <Button colorScheme='blue' onClick={handleAdd}>Guardar</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th>IP</Th>
            <Th>Sitio</Th>
            <Th>Rack</Th>
            <Th>Tipo</Th>
            <Th>Marca</Th>
            <Th>Hostname</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredDevices.map((d) => (
            <Tr key={d.id}>
              <Td>{d.ipGestion}</Td>
              <Td>{d.sitio}</Td>
              <Td>{d.rack}</Td>
              <Td>{d.tipoEquipo}</Td>
              <Td>{d.marca}</Td>
              <Td>{d.hostname}</Td>
              <Td>
                <Button size='sm' mr={2} onClick={() => router.push(`/inventory/${d.id}`)}>Ver</Button>
                <Button size='sm' colorScheme='red' onClick={() => handleDelete(d.id)}>Eliminar</Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </SidebarLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    }
  }

  const devicesWithCred = await prisma.device.findMany({ include: { interfaces: true } })
  const serializedDevices = devicesWithCred.map((d) => ({
    ...d,
    createdAt: d.createdAt.toISOString(),
    interfaces: d.interfaces.map(i => ({ ...i, createdAt: i.createdAt.toISOString() }))
  }))
  return {
    props: { devices: serializedDevices }
  }
}
