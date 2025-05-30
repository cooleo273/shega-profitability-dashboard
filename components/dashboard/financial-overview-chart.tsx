"use client"

import {
  Line,
  LineChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TooltipProps } from "recharts"
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"


// Mock data (same as yours)
const data = [
  { month: "Jan", revenue: 45000, expenses: 32000, profit: 13000 },
  { month: "Feb", revenue: 52000, expenses: 35000, profit: 17000 },
  { month: "Mar", revenue: 61000, expenses: 42000, profit: 19000 },
  { month: "Apr", revenue: 58000, expenses: 39000, profit: 19000 },
  { month: "May", revenue: 68000, expenses: 44000, profit: 24000 },
  { month: "Jun", revenue: 72000, expenses: 46000, profit: 26000 },
  // Add more months for a better visual
  { month: "Jul", revenue: 75000, expenses: 48000, profit: 27000 },
  { month: "Aug", revenue: 70000, expenses: 45000, profit: 25000 },
];

// Format currency (same as yours)
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Custom Tooltip (reusing the enhanced style)
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-xl dark:bg-gray-800 dark:border-gray-700">
        <p className="mb-2 text-base font-semibold text-card-foreground dark:text-gray-100">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between space-x-4 mb-1">
            <div className="flex items-center">
              <span
                className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color || entry.stroke }}
              />
              <p className="text-sm text-muted-foreground dark:text-gray-300">{entry.name}:</p>
            </div>
            <p className="text-sm font-medium text-card-foreground dark:text-gray-100">
              {formatCurrency(entry.value as number)}
            </p>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// Custom Legend (reusing the enhanced style)
const renderLegend = (props: any) => {
  const { payload } = props;
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center text-xs">
          <span
            className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground dark:text-gray-400">{entry.value}</span> {/* entry.value is the "name" here */}
        </div>
      ))}
    </div>
  );
};

// Enhanced color palette with gradient definitions
const COLORS = {
  revenue: {
    stroke: "#10B981",
    gradient: ["rgba(16, 185, 129, 0.2)", "rgba(16, 185, 129, 0)"]
  },
  expenses: {
    stroke: "#EF4444",
    gradient: ["rgba(239, 68, 68, 0.2)", "rgba(239, 68, 68, 0)"]
  },
  profit: {
    stroke: "#6366F1",
    gradient: ["rgba(99, 102, 241, 0.2)", "rgba(99, 102, 241, 0)"]
  }
}

export function FinancialOverviewChart() {
  return (
    <div className="relative rounded-xl border p-4 shadow-sm transition-all hover:shadow-lg">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart 
          data={data} 
          margin={{ top: 30, right: 30, left: 0, bottom: 10 }}
        >
          <defs>
            {/* Gradient definitions for each line */}
            <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.revenue.gradient[0]} />
              <stop offset="100%" stopColor={COLORS.revenue.gradient[1]} />
            </linearGradient>
            <linearGradient id="expenses-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.expenses.gradient[0]} />
              <stop offset="100%" stopColor={COLORS.expenses.gradient[1]} />
            </linearGradient>
            <linearGradient id="profit-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.profit.gradient[0]} />
              <stop offset="100%" stopColor={COLORS.profit.gradient[1]} />
            </linearGradient>
          </defs>
          
          <CartesianGrid
            strokeDasharray="3 3"
            strokeOpacity={0.1}
            vertical={false}
            className="stroke-border dark:stroke-gray-700"
          />
          
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ 
              fontSize: 13,
              fontWeight: 500,
              fill: "hsl(var(--muted-foreground))"
            }}
            dy={10}
            padding={{ left: 20, right: 20 }}
          />
          
          <YAxis
            tickFormatter={(value) => `$${value / 1000}k`}
            tickLine={false}
            axisLine={false}
            tick={{ 
              fontSize: 13,
              fontWeight: 500,
              fill: "hsl(var(--muted-foreground))"
            }}
            dx={-10}
            width={80}
          />
          
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ 
              stroke: "hsl(var(--accent))",
              strokeWidth: 1,
              strokeDasharray: "4 4",
              opacity: 0.3
            }}
            wrapperStyle={{
              outline: 'none'
            }}
          />
          
          <Legend
            content={renderLegend}
            verticalAlign="top"
            wrapperStyle={{ 
              paddingBottom: '20px'
            }}
          />
          
          {/* Revenue Line with gradient fill */}
          <Line
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke={COLORS.revenue.stroke}
            strokeWidth={3}
            fill="url(#revenue-gradient)"
            dot={{ 
              r: 4,
              strokeWidth: 2,
              fill: "white",
              stroke: COLORS.revenue.stroke
            }}
            activeDot={{
              r: 8,
              strokeWidth: 2,
              stroke: COLORS.revenue.stroke,
              fill: "white",
              className: "drop-shadow-lg"
            }}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
          
          {/* Expenses Line with gradient fill */}
          <Line
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke={COLORS.expenses.stroke}
            strokeWidth={3}
            fill="url(#expenses-gradient)"
            dot={{ 
              r: 4,
              strokeWidth: 2,
              fill: "white",
              stroke: COLORS.expenses.stroke
            }}
            activeDot={{
              r: 8,
              strokeWidth: 2,
              stroke: COLORS.expenses.stroke,
              fill: "white",
              className: "drop-shadow-lg"
            }}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
          
          {/* Profit Line with gradient fill */}
          <Line
            type="monotone"
            dataKey="profit"
            name="Profit"
            stroke={COLORS.profit.stroke}
            strokeWidth={3}
            fill="url(#profit-gradient)"
            dot={{ 
              r: 4,
              strokeWidth: 2,
              fill: "white",
              stroke: COLORS.profit.stroke
            }}
            activeDot={{
              r: 8,
              strokeWidth: 2,
              stroke: COLORS.profit.stroke,
              fill: "white",
              className: "drop-shadow-lg"
            }}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}