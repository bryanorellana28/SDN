import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { Box, Button, FormControl, FormLabel, Input, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react'
import SidebarLayout from '../../components/SidebarLayout'
import { prisma } from '../../lib/prisma'

interface GoldenImage {
  id: number
  modelo: string
  version: string
}

export default function Golden({ models, images }: { models: string[]; images: GoldenImage[] }) {
  const router = useRouter()
  const [form, setForm] = useState({ modelo: '', version: '', config: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setForm(f => ({ ...f, config: ev.target?.result as string || '' }))
    }
    reader.readAsText(file)
  }

  async function handleAdd() {
    await fetch('/api/golden-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setForm({ modelo: '', version: '', config: '' })
    router.reload()
  }

  return (
    <SidebarLayout>
      <Box mb={4} display='flex' justifyContent='space-between' alignItems='center'>
        <Button onClick={() => router.push('/software/cumplimiento')} mr={2}>Volver</Button>
        <Box as='h1' fontSize='xl' fontWeight='bold'>Golden Images</Box>
      </Box>
      <Box maxW='md' mb={4} bg='white' p={4} borderRadius='md'>
        <FormControl mb={2}>
          <FormLabel>Modelo</FormLabel>
          <select name='modelo' value={form.modelo} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px' }}>
            <option value=''>Seleccione...</option>
            {models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Versión</FormLabel>
          <Input name='version' value={form.version} onChange={handleChange} />
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Archivo de configuración</FormLabel>
          <Input type='file' onChange={handleFile} />
        </FormControl>
        <Button colorScheme='blue' onClick={handleAdd}>Guardar</Button>
      </Box>
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th>Modelo</Th>
            <Th>Versión</Th>
          </Tr>
        </Thead>
        <Tbody>
          {images.map(i => (
            <Tr key={i.id}>
              <Td>{i.modelo}</Td>
              <Td>{i.version}</Td>
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
  const modelsRes = await prisma.device.findMany({ where: { boardName: { not: null } }, distinct: ['boardName'], select: { boardName: true } })
  const models = modelsRes.map(m => m.boardName!).filter(Boolean)
  const images = await prisma.goldenImage.findMany()
  return { props: { models, images } }
}
