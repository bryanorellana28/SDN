import { Box, Flex, Text } from '@chakra-ui/react'

interface DataItem {
  label: string
  value: number
}

interface BarChartProps {
  data: DataItem[]
  maxHeight?: number | string
}

export default function BarChart({ data, maxHeight = 200 }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 0)
  return (
    <Flex align="flex-end" gap={2} h={maxHeight}>
      {data.map((d) => (
        <Flex key={d.label} direction="column" align="center" flex="1">
          <Box
            w="100%"
            bg="blue.500"
            borderRadius="md"
            h={maxValue ? `${(d.value / maxValue) * 100}%` : '0%'}
          />
          <Text mt={1} fontSize="sm" noOfLines={1}>
            {d.label}
          </Text>
          <Text fontSize="sm" fontWeight="bold">
            {d.value}
          </Text>
        </Flex>
      ))}
    </Flex>
  )
}
