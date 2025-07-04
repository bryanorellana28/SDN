import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Box, Button, FormControl, FormLabel, Heading, Input } from '@chakra-ui/react'
import SidebarLayout from '../../components/SidebarLayout'
import { prisma } from '../../lib/prisma'

interface Site {
  id: number
  name: string
}

export default function EditSite({ site }: { site: Site }) {
  const router = useRouter()
  const [form, setForm] = useState({ ...site })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSave() {
    await fetch(`/api/sites/${site.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    router.push('/sites')
  }

  return (
    <SidebarLayout>
      <Box maxW='md' mx='auto'>
        <Heading size='md' mb={4}>Editar Sitio</Heading>
        <FormControl mb={2}>
          <FormLabel>Nombre</FormLabel>
          <Input name='name' value={form.name} onChange={handleChange} />
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
  const site = await prisma.site.findUnique({ where: { id } })
  if (!site) {
    return { notFound: true }
  }
  const serializedSite = { ...site, createdAt: site.createdAt.toISOString() }
  return { props: { site: serializedSite } }
}
