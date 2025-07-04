import { ReactNode } from 'react'
import NextLink from 'next/link'
import { Box, Flex, Button, VStack, Text } from '@chakra-ui/react'

export default function SidebarLayout({ children }: { children: ReactNode }) {
  return (
    <Flex minH='100vh'>
      <Box
        w='200px'
        bgGradient='linear(to-b, #020024, #090979, #00d4ff)'
        color='white'
        p={4}
      >
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
            as={NextLink}
            href='/inventory'
            bg='white'
            color='gray.800'
            _hover={{ bg: 'gray.200' }}
            w='100%'
          >
            Inventario
          </Button>
        </VStack>
      </Box>
      <Box flex='1' p={4} bg='gray.50'>
        {children}
      </Box>
    </Flex>
  )
}
