"use client"
import { Chart, ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"

// Mock data for cost over time
const data = [
  {
    name: "Jan",
    cost: 0,
    budget: 75000,
  },
  {
    name: "Feb",
    cost: 10000,
    budget: 75000,
  },
  {
    name: "Mar",
    cost: 25000,
    budget: 75000,
  },
  {
    name: "Apr",
    cost: 35000,
    budget: 75000,
  },
  {
    name: "May",
    cost: 45000,
    budget: 75000,
  },
  {
    name: "Jun",
    cost: 0,
    budget: 75000,
  },
]

export function ProjectCostChart() {
  return (
    <ChartContainer>
      <Chart>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            animationDuration={500}
          >
            <defs>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#009A6A" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#009A6A" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="name" tick={{ fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} />
            <YAxis
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              tick={{ fill: "#6b7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <ChartTooltip content={<ChartTooltipContent formatter={(value) => `$${value.toLocaleString()}`} />} />
            <Area
              type="monotone"
              dataKey="cost"
              stroke="#009A6A"
              fill="url(#colorCost)"
              fillOpacity={1}
              name="Cost"
              strokeWidth={3}
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="budget"
              stroke="#3b82f6"
              fill="url(#colorBudget)"
              fillOpacity={0.1}
              name="Budget"
              strokeWidth={3}
              strokeDasharray="5 5"
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Chart>
      <ChartLegend />
    </ChartContainer>
  )
}
