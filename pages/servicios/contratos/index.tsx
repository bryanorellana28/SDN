import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
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
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react'
import SidebarLayout from '../../../components/SidebarLayout'
import { prisma } from '../../../lib/prisma'

interface Client { id: number; nombre: string }
interface Contract {
  id: number
  numero: string
  descripcion?: string | null
  inicio?: string | null
  fin?: string | null
  client: Client
}

export default function Contracts({ contracts, clients }: { contracts: Contract[]; clients: Client[] }) {
  const router = useRouter()
  const [form, setForm] = useState({ numero: '', descripcion: '', inicio: '', fin: '', clientId: '' })
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const onClose = () => setIsOpen(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleAdd() {
    await fetch('/api/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, clientId: Number(form.clientId) })
    })
    setForm({ numero: '', descripcion: '', inicio: '', fin: '', clientId: '' })
    onClose()
    router.reload()
  }

  async function handleDelete(id: number) {
    await fetch(`/api/contracts/${id}`, { method: 'DELETE' })
    router.reload()
  }

  const filtered = contracts.filter(c =>
    c.numero.toLowerCase().includes(search.toLowerCase()) ||
    c.client.nombre.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <SidebarLayout>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
        <Box as='h1' fontSize='xl' fontWeight='bold'>Contratos</Box>
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
          <DrawerHeader>Agregar Contrato</DrawerHeader>
          <DrawerBody>
            <FormControl mb={2}>
              <FormLabel>Número</FormLabel>
              <Input name='numero' value={form.numero} onChange={handleChange} />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Cliente</FormLabel>
              <Select name='clientId' value={form.clientId} onChange={handleChange}>
                <option value=''>Seleccione...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </Select>
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Descripción</FormLabel>
              <Input name='descripcion' value={form.descripcion} onChange={handleChange} />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Inicio</FormLabel>
              <Input type='date' name='inicio' value={form.inicio} onChange={handleChange} />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Fin</FormLabel>
              <Input type='date' name='fin' value={form.fin} onChange={handleChange} />
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
            <Th>Número</Th>
            <Th>Cliente</Th>
            <Th>Inicio</Th>
            <Th>Fin</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filtered.map(c => (
            <Tr key={c.id}>
              <Td>{c.numero}</Td>
              <Td>{c.client.nombre}</Td>
              <Td>{c.inicio ? new Date(c.inicio).toLocaleDateString() : ''}</Td>
              <Td>{c.fin ? new Date(c.fin).toLocaleDateString() : ''}</Td>
              <Td>
                <Button size='sm' mr={2} onClick={() => router.push(`/servicios/contratos/${c.id}`)}>Editar</Button>
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
  const contracts = await prisma.contract.findMany({ include: { client: true } })
  const clients = await prisma.client.findMany({ select: { id: true, nombre: true } })
  const serialized = contracts.map(c => ({ ...c, inicio: c.inicio ? c.inicio.toISOString() : null, fin: c.fin ? c.fin.toISOString() : null, createdAt: c.createdAt.toISOString() }))
  return { props: { contracts: serialized, clients } }
}
