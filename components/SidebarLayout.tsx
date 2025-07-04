import { ReactNode } from 'react'
import NextLink from 'next/link'
import { Box, Flex, Link } from '@chakra-ui/react'

export default function SidebarLayout({ children }: { children: ReactNode }) {
  return (
    <Flex minH='100vh'>
      <Box w='200px' bg='#333' color='white' p={4}>
        <h2>Menu</h2>
        <ul>
          <li>
            <Link as={NextLink} href='/dashboard'>Dashboard</Link>
          </li>
          <li>
            <Link as={NextLink} href='/inventory'>Inventario</Link>
          </li>
        </ul>
      </Box>
      <Box flex='1' p={4}>{children}</Box>
    </Flex>
  )
}
