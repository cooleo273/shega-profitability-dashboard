"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface FinancialData {
  month: string
  revenue: number
  expenses: number
}

interface FinancialOverviewChartProps {
  data: FinancialData[]
}

export function FinancialOverviewChart({ data }: FinancialOverviewChartProps) {
  // Format the data for the chart
  const chartData = data.map(item => ({
    month: new Date(item.month).toLocaleString('default', { month: 'short' }),
    revenue: item.revenue,
    expenses: item.expenses
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
        >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="revenue" fill="#4CAF50" name="Revenue" />
        <Bar dataKey="expenses" fill="#F44336" name="Expenses" />
      </BarChart>
      </ResponsiveContainer>
  )
}