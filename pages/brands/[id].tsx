import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Box, Button, FormControl, FormLabel, Heading, Input } from '@chakra-ui/react'
import SidebarLayout from '../../components/SidebarLayout'
import { prisma } from '../../lib/prisma'

interface Brand {
  id: number
  name: string
  descripcion?: string | null
}

export default function EditBrand({ brand }: { brand: Brand }) {
  const router = useRouter()
  const [form, setForm] = useState({ ...brand })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSave() {
    await fetch(`/api/brands/${brand.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    router.push('/brands')
  }

  return (
    <SidebarLayout>
      <Box maxW='md' mx='auto'>
        <Heading size='md' mb={4}>Editar Marca</Heading>
        <FormControl mb={2}>
          <FormLabel>Nombre</FormLabel>
          <Input name='name' value={form.name} onChange={handleChange} />
        </FormControl>
        <FormControl mb={2}>
          <FormLabel>Descripción</FormLabel>
          <Input name='descripcion' value={form.descripcion ?? ''} onChange={handleChange} />
        </FormControl>
        <Button onClick={handleSave} colorScheme='blue'>Guardar</Button>
      </Box>
    </SidebarLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params, ...context }) => {
  const session = await getSession(context)
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    }
  }

  const id = Number(params?.id)
  const brand = await prisma.brand.findUnique({ where: { id } })
  if (!brand) {
    return { notFound: true }
  }
  const serializedBrand = { ...brand, createdAt: brand.createdAt.toISOString() }
  return { props: { brand: serializedBrand } }
}
