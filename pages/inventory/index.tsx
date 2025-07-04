import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
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
  nombre: string
  sitio: string
  rack: string
  tipoEquipo: string
  marca: string
  modelo: string
  versionSoftware: string
  serial?: string | null
}

export default function Inventory({ devices }: { devices: Device[] }) {
  const router = useRouter()
  const [form, setForm] = useState({
    ipGestion: '',
    nombre: '',
    sitio: '',
    rack: '',
    tipoEquipo: '',
    marca: '',
    modelo: '',
    versionSoftware: '',
    serial: ''
  })
  const [isOpen, setIsOpen] = useState(false)
  const onClose = () => setIsOpen(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleAdd() {
    await fetch('/api/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setForm({
      ipGestion: '',
      nombre: '',
      sitio: '',
      rack: '',
      tipoEquipo: '',
      marca: '',
      modelo: '',
      versionSoftware: '',
      serial: ''
    })
    onClose()
    router.reload()
  }

  async function handleDelete(id: number) {
    await fetch(`/api/devices/${id}`, { method: 'DELETE' })
    router.reload()
  }

  return (
    <SidebarLayout>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
        <Box as='h1' fontSize='xl' fontWeight='bold'>Inventario</Box>
        <Button colorScheme='blue' onClick={() => setIsOpen(true)}>Agregar</Button>
      </Box>

      <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='md'>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Agregar Dispositivo</DrawerHeader>
          <DrawerBody>
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
            <FormControl mb={2}>
              <FormLabel>Serial</FormLabel>
              <Input name='serial' value={form.serial} onChange={handleChange} />
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
            <Th>Nombre</Th>
            <Th>Sitio</Th>
            <Th>Rack</Th>
            <Th>Tipo</Th>
            <Th>Marca</Th>
            <Th>Modelo</Th>
            <Th>Versión</Th>
            <Th>Serial</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {devices.map((d) => (
            <Tr key={d.id}>
              <Td>{d.ipGestion}</Td>
              <Td>{d.nombre}</Td>
              <Td>{d.sitio}</Td>
              <Td>{d.rack}</Td>
              <Td>{d.tipoEquipo}</Td>
              <Td>{d.marca}</Td>
              <Td>{d.modelo}</Td>
              <Td>{d.versionSoftware}</Td>
              <Td>{d.serial}</Td>
              <Td>
                <Button size='sm' mr={2} onClick={() => router.push(`/inventory/${d.id}`)}>Editar</Button>
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

  const devices = await prisma.device.findMany()
  const serializedDevices = devices.map((d) => ({
    ...d,
    createdAt: d.createdAt.toISOString()
  }))
  return {
    props: { devices: serializedDevices }
  }
}
