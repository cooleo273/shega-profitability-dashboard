"use client"
import { Chart, ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"

// Mock data for budget vs actual
const data = [
  {
    name: "Design",
    budget: 20000,
    actual: 18000,
  },
  {
    name: "Development",
    budget: 40000,
    actual: 25000,
  },
  {
    name: "Testing",
    budget: 10000,
    actual: 2000,
  },
  {
    name: "Project Management",
    budget: 5000,
    actual: 0,
  },
]

export function ProjectBudgetChart() {
  return (
    <ChartContainer>
      <Chart>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            animationDuration={500}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="name" tick={{ fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} />
            <YAxis
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              tick={{ fill: "#6b7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <ChartTooltip content={<ChartTooltipContent formatter={(value) => `$${value.toLocaleString()}`} />} />
            <Bar dataKey="budget" fill="#009A6A" name="Budget" radius={[6, 6, 0, 0]} animationDuration={500} />
            <Bar dataKey="actual" fill="#3b82f6" name="Actual" radius={[6, 6, 0, 0]} animationDuration={500} />
          </BarChart>
        </ResponsiveContainer>
      </Chart>
      <ChartLegend />
    </ChartContainer>
  )
}
