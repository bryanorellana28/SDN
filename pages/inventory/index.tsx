import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import {
  Box,
  Button,
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleAdd() {
    await fetch('/api/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    router.reload()
  }

  async function handleDelete(id: number) {
    await fetch(`/api/devices/${id}`, { method: 'DELETE' })
    router.reload()
  }

  return (
    <SidebarLayout>
      <Box mb={4}>
        <Input
          placeholder='IP de gestión'
          name='ipGestion'
          value={form.ipGestion}
          onChange={handleChange}
          mb={2}
        />
        <Input placeholder='Nombre' name='nombre' value={form.nombre} onChange={handleChange} mb={2} />
        <Input placeholder='Sitio' name='sitio' value={form.sitio} onChange={handleChange} mb={2} />
        <Input placeholder='Rack' name='rack' value={form.rack} onChange={handleChange} mb={2} />
        <Input placeholder='Tipo de equipo' name='tipoEquipo' value={form.tipoEquipo} onChange={handleChange} mb={2} />
        <Input placeholder='Marca' name='marca' value={form.marca} onChange={handleChange} mb={2} />
        <Input placeholder='Modelo' name='modelo' value={form.modelo} onChange={handleChange} mb={2} />
        <Input
          placeholder='Versión de software'
          name='versionSoftware'
          value={form.versionSoftware}
          onChange={handleChange}
          mb={2}
        />
        <Input placeholder='Serial' name='serial' value={form.serial} onChange={handleChange} mb={2} />
        <Button onClick={handleAdd} colorScheme='blue'>Agregar</Button>
      </Box>
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
  return {
    props: { devices }
  }
}
