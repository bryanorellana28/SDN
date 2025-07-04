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

interface Brand {
  id: number
  name: string
}

export default function Brands({ brands }: { brands: Brand[] }) {
  const router = useRouter()
  const [form, setForm] = useState({ name: '' })
  const [isOpen, setIsOpen] = useState(false)
  const onClose = () => setIsOpen(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleAdd() {
    await fetch('/api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setForm({ name: '' })
    onClose()
    router.reload()
  }

  async function handleDelete(id: number) {
    await fetch(`/api/brands/${id}`, { method: 'DELETE' })
    router.reload()
  }

  return (
    <SidebarLayout>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
        <Box as='h1' fontSize='xl' fontWeight='bold'>Marcas</Box>
        <Button colorScheme='blue' onClick={() => setIsOpen(true)}>Agregar</Button>
      </Box>

      <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='md'>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Agregar Marca</DrawerHeader>
          <DrawerBody>
            <FormControl mb={2}>
              <FormLabel>Nombre</FormLabel>
              <Input name='name' value={form.name} onChange={handleChange} />
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
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {brands.map((b) => (
            <Tr key={b.id}>
              <Td>{b.name}</Td>
              <Td>
                <Button size='sm' mr={2} onClick={() => router.push(`/brands/${b.id}`)}>Editar</Button>
                <Button size='sm' colorScheme='red' onClick={() => handleDelete(b.id)}>Eliminar</Button>
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

  const brands = await prisma.brand.findMany()
  const serializedBrands = brands.map((b) => ({ ...b, createdAt: b.createdAt.toISOString() }))
  return { props: { brands: serializedBrands } }
}
