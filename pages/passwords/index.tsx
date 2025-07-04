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

interface Credential {
  id: number
  usuario: string
  contrasena: string
}

export default function Passwords({ credentials }: { credentials: Credential[] }) {
  const router = useRouter()
  const [form, setForm] = useState({ usuario: '', contrasena: '' })
  const [isOpen, setIsOpen] = useState(false)
  const onClose = () => setIsOpen(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleAdd() {
    await fetch('/api/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setForm({ usuario: '', contrasena: '' })
    onClose()
    router.reload()
  }

  async function handleDelete(id: number) {
    await fetch(`/api/credentials/${id}`, { method: 'DELETE' })
    router.reload()
  }

  return (
    <SidebarLayout>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
        <Box as='h1' fontSize='xl' fontWeight='bold'>Contraseñas</Box>
        <Button colorScheme='blue' onClick={() => setIsOpen(true)}>Agregar</Button>
      </Box>

      <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='md'>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Agregar Contraseña</DrawerHeader>
          <DrawerBody>
            <FormControl mb={2}>
              <FormLabel>Usuario</FormLabel>
              <Input name='usuario' value={form.usuario} onChange={handleChange} />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Contraseña</FormLabel>
              <Input type='password' name='contrasena' value={form.contrasena} onChange={handleChange} />
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
            <Th>Usuario</Th>
            <Th>Contraseña</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {credentials.map((c) => (
            <Tr key={c.id}>
              <Td>{c.usuario}</Td>
              <Td>******</Td>
              <Td>
                <Button size='sm' mr={2} onClick={() => router.push(`/passwords/${c.id}`)}>Editar</Button>
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
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    }
  }

  const credentials = await prisma.credential.findMany()
  const serialized = credentials.map(c => ({ ...c, createdAt: c.createdAt.toISOString() }))
  return { props: { credentials: serialized } }
}
