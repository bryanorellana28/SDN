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
import SidebarLayout from '../../components/SidebarLayout'
import { prisma } from '../../lib/prisma'

interface Site {
  id: number
  name: string
  ubicacion?: string | null
  descripcion?: string | null
}

export default function Sites({ sites }: { sites: Site[] }) {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', ubicacion: '', descripcion: '' })
  const [isOpen, setIsOpen] = useState(false)
  const onClose = () => setIsOpen(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleAdd() {
    await fetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setForm({ name: '', ubicacion: '', descripcion: '' })
    onClose()
    router.reload()
  }

  async function handleDelete(id: number) {
    await fetch(`/api/sites/${id}`, { method: 'DELETE' })
    router.reload()
  }

  return (
    <SidebarLayout>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
        <Box as='h1' fontSize='xl' fontWeight='bold'>Sitios</Box>
        <Button colorScheme='blue' onClick={() => setIsOpen(true)}>Agregar</Button>
      </Box>

      <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='md'>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Agregar Sitio</DrawerHeader>
          <DrawerBody>
            <FormControl mb={2}>
              <FormLabel>Nombre</FormLabel>
              <Input name='name' value={form.name} onChange={handleChange} />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Ubicación</FormLabel>
              <Input name='ubicacion' value={form.ubicacion} onChange={handleChange} />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Descripción</FormLabel>
              <Input name='descripcion' value={form.descripcion} onChange={handleChange} />
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
            <Th>Ubicación</Th>
            <Th>Descripción</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sites.map((s) => (
            <Tr key={s.id}>
              <Td>{s.name}</Td>
              <Td>{s.ubicacion}</Td>
              <Td>{s.descripcion}</Td>
              <Td>
                <Button size='sm' mr={2} onClick={() => router.push(`/sites/${s.id}`)}>Editar</Button>
                <Button size='sm' colorScheme='red' onClick={() => handleDelete(s.id)}>Eliminar</Button>
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

  const sites = await prisma.site.findMany()
  const serializedSites = sites.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() }))
  return { props: { sites: serializedSites } }
}
