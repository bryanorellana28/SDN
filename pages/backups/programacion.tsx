import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import {
  Box, Button, Drawer, DrawerBody, DrawerContent, DrawerFooter,
  DrawerHeader, DrawerOverlay, FormControl, FormLabel, Input, Table,
  Thead, Tbody, Tr, Th, Td, Select
} from '@chakra-ui/react'
import SidebarLayout from '../../components/SidebarLayout'
import { prisma } from '../../lib/prisma'

interface Device { id: number; nombre: string }
interface Credential { id: number; usuario: string }
interface Schedule { id: number; device: Device; credential: Credential; period: string; nextRun: string }

export default function Programacion({ devices, creds, schedules }: { devices: Device[]; creds: Credential[]; schedules: Schedule[] }) {
  const router = useRouter()
  const [form, setForm] = useState({ deviceId: '', credentialId: '', period: 'DAILY' })
  const [isOpen, setIsOpen] = useState(false)
  const onClose = () => setIsOpen(false)

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleAdd() {
    await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, deviceId: Number(form.deviceId), credentialId: Number(form.credentialId) })
    })
    onClose()
    router.reload()
  }

  return (
    <SidebarLayout>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
        <Box as='h1' fontSize='xl' fontWeight='bold'>Programación de Backups</Box>
        <Button colorScheme='blue' onClick={() => setIsOpen(true)}>Agregar</Button>
      </Box>

      <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='md'>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Nueva Programación</DrawerHeader>
          <DrawerBody>
            <FormControl mb={2}>
              <FormLabel>Equipo</FormLabel>
              <Select name='deviceId' value={form.deviceId} onChange={handleChange}>
                <option value=''>Seleccione...</option>
                {devices.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </Select>
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Credencial</FormLabel>
              <Select name='credentialId' value={form.credentialId} onChange={handleChange}>
                <option value=''>Seleccione...</option>
                {creds.map(c => <option key={c.id} value={c.id}>{c.usuario}</option>)}
              </Select>
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Periodo</FormLabel>
              <Select name='period' value={form.period} onChange={handleChange}>
                <option value='DAILY'>1 Día</option>
                <option value='WEEKLY'>1 Semana</option>
                <option value='MONTHLY'>1 Mes</option>
              </Select>
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
            <Th>Equipo</Th>
            <Th>Usuario</Th>
            <Th>Periodo</Th>
            <Th>Próxima Ejecución</Th>
          </Tr>
        </Thead>
        <Tbody>
          {schedules.map(s => (
            <Tr key={s.id}>
              <Td>{s.device.nombre}</Td>
              <Td>{s.credential.usuario}</Td>
              <Td>{s.period}</Td>
              <Td>{new Date(s.nextRun).toLocaleString()}</Td>
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
  const devices = await prisma.device.findMany({ select: { id: true, nombre: true } })
  const creds = await prisma.credential.findMany({ select: { id: true, usuario: true } })
  const schedules = await prisma.schedule.findMany({ include: { device: true, credential: true } })
  const serialized = schedules.map(s => ({ ...s, nextRun: s.nextRun.toISOString(), createdAt: s.createdAt.toISOString() }))
  return { props: { devices, creds, schedules: serialized } }
}
