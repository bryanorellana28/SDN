import { ReactNode, useState } from 'react'
import NextLink from 'next/link'
import { Box, Flex, Button, VStack, Text, Collapse } from '@chakra-ui/react'

export default function SidebarLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [openBackups, setOpenBackups] = useState(false)
  return (
    <Flex minH='100vh'>
      <Box w='220px' bg='gray.800' color='white' p={4}>
        <Text fontSize='lg' fontWeight='bold' mb={4}>
          Menu
        </Text>
        <VStack align='stretch' spacing={2}>
          <Button
            as={NextLink}
            href='/dashboard'
            bg='white'
            color='gray.800'
            _hover={{ bg: 'gray.200' }}
            w='100%'
          >
            Dashboard
          </Button>
          <Button
            bg='white'
            color='gray.800'
            _hover={{ bg: 'gray.200' }}
            w='100%'
            onClick={() => setOpen(!open)}
          >
            Dispositivos
          </Button>
          <Collapse in={open} animateOpacity>
            <VStack align='stretch' spacing={1} mt={1} pl={2}>
              <Button
                as={NextLink}
                href='/inventory'
                bg='white'
                color='gray.800'
                _hover={{ bg: 'gray.200' }}
                w='100%'
                size='sm'
              >
                Inventario
              </Button>
              <Button
                as={NextLink}
                href='/sites'
                bg='white'
                color='gray.800'
                _hover={{ bg: 'gray.200' }}
                w='100%'
                size='sm'
              >
                Sitios
              </Button>
              <Button
                as={NextLink}
                href='/brands'
                bg='white'
                color='gray.800'
                _hover={{ bg: 'gray.200' }}
                w='100%'
                size='sm'
              >
                Marcas
              </Button>
              <Button
                as={NextLink}
                href='/passwords'
                bg='white'
                color='gray.800'
                _hover={{ bg: 'gray.200' }}
                w='100%'
                size='sm'
              >
                Contraseñas
              </Button>
            </VStack>
          </Collapse>
          <Button
            bg='white'
            color='gray.800'
            _hover={{ bg: 'gray.200' }}
            w='100%'
            onClick={() => setOpenBackups(!openBackups)}
          >
            Backups
          </Button>
          <Collapse in={openBackups} animateOpacity>
            <VStack align='stretch' spacing={1} mt={1} pl={2}>
              <Button
                as={NextLink}
                href='/backups/programacion'
                bg='white'
                color='gray.800'
                _hover={{ bg: 'gray.200' }}
                w='100%'
                size='sm'
              >
                Programacion
              </Button>
              <Button
                as={NextLink}
                href='/backups/bodega'
                bg='white'
                color='gray.800'
                _hover={{ bg: 'gray.200' }}
                w='100%'
                size='sm'
              >
                Bodega
              </Button>
            </VStack>
          </Collapse>
        </VStack>
      </Box>
      <Box flex='1' p={4} bg='gray.50'>
        {children}
      </Box>
    </Flex>
  )
}
