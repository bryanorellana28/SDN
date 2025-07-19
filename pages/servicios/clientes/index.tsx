import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react'
import SidebarLayout from '../../../components/SidebarLayout'
import { prisma } from '../../../lib/prisma'

interface Client {
  id: number
  nombre: string
  identificacion: string
  razonSocial: string
  nit: string
}

export default function Clients({ clients }: { clients: Client[] }) {
  const router = useRouter()
  const [form, setForm] = useState({ nombre: '', identificacion: '', razonSocial: '', nit: '' })
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const onClose = () => setIsOpen(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleAdd() {
    await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setForm({ nombre: '', identificacion: '', razonSocial: '', nit: '' })
    onClose()
    router.reload()
  }

  async function handleDelete(id: number) {
    await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    router.reload()
  }

  const filtered = clients.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.identificacion.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <SidebarLayout>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
        <Box as='h1' fontSize='xl' fontWeight='bold'>Clientes</Box>
        <Box ml='auto' display='flex' alignItems='center'>
          <Input
            placeholder='Buscar...'
            value={search}
            onChange={e => setSearch(e.target.value)}
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
          <DrawerHeader>Agregar Cliente</DrawerHeader>
          <DrawerBody>
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
            <Th>Nombre</Th>
            <Th>Identificación</Th>
            <Th>Razón Social</Th>
            <Th>NIT</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filtered.map(c => (
            <Tr key={c.id}>
              <Td>{c.nombre}</Td>
              <Td>{c.identificacion}</Td>
              <Td>{c.razonSocial}</Td>
              <Td>{c.nit}</Td>
              <Td>
                <Button size='sm' mr={2} onClick={() => router.push(`/servicios/clientes/${c.id}`)}>Editar</Button>
                <Button size='sm' colorScheme='red' onClick={() => handleDelete(c.id)}>Eliminar</Button>
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
    return { redirect: { destination: '/login', permanent: false } }
  }
  const clients = await prisma.client.findMany()
  const serialized = clients.map(c => ({ ...c, createdAt: c.createdAt.toISOString() }))
  return { props: { clients: serialized } }
}
