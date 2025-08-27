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
import type { TooltipProps } from "recharts"
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

interface FinancialData {
  month: string
  revenue: number
  expenses: number
}

interface FinancialOverviewChartProps {
  data: FinancialData[]
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-xl">
        <p className="mb-2 text-base font-semibold text-card-foreground">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between space-x-4 mb-1">
            <div className="flex items-center">
              <span
                className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <p className="text-sm text-muted-foreground">{entry.name}:</p>
            </div>
            <p className="text-sm font-medium text-card-foreground">
              {formatCurrency(entry.value as number)}
            </p>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function FinancialOverviewChart({ data }: FinancialOverviewChartProps) {
  // Format the data for the chart
  const chartData = data.map(item => ({
    month: new Date(item.month).toLocaleString('default', { month: 'short' }),
    revenue: item.revenue,
    expenses: item.expenses
  }))

  return (
    <div className="relative h-[300px] w-full bg-card rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="month" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36}
            formatter={(value: string) => (
              <span className="text-xs text-muted-foreground">{value}</span>
            )}
          />
          <Bar 
            dataKey="revenue" 
            fill="#4CAF50" 
            name="Revenue"
            radius={[4, 4, 0, 0]}
            animationDuration={800}
            animationEasing="ease-out"
          />
          <Bar 
            dataKey="expenses" 
            fill="#F44336" 
            name="Expenses"
            radius={[4, 4, 0, 0]}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}