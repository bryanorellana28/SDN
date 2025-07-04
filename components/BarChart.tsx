import { Box } from '@chakra-ui/react'
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface DataItem {
  label: string
  value: number
}

interface BarChartProps {
  data: DataItem[]
  maxHeight?: number | string
}

export default function BarChart({ data, maxHeight = 200 }: BarChartProps) {
  const chartData = data.map((d) => ({ label: d.label, value: Number(d.value) }))
  return (
    <Box w='100%' h={maxHeight}>
      <ResponsiveContainer width='100%' height='100%'>
        <ReBarChart data={chartData}>
          <XAxis dataKey='label' interval={0} tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey='value' fill='#3182ce' />
        </ReBarChart>
      </ResponsiveContainer>
    </Box>
  )
}
