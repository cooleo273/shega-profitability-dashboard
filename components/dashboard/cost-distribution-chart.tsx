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
  Cell, // For individual bar segment styling if needed later
} from "recharts"
import type { TooltipProps } from "recharts"
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

// Define a more modern and harmonious color palette
const COLORS = {
  labor: "#009A6A",     // Your primary green
  software: "#3B82F6",   // A nice blue (Tailwind's blue-500)
  hardware: "#8B5CF6",   // A vibrant purple (Tailwind's violet-500)
  marketing: "#F59E0B",  // A warm amber (Tailwind's amber-500)
  other: "#6B7280",      // A neutral gray (Tailwind's gray-500)
}

// Mock data (same as yours)
const data = [
  { name: "Q1", labor: 120000, software: 35000, hardware: 15000, marketing: 25000, other: 10000 },
  { name: "Q2", labor: 135000, software: 28000, hardware: 12000, marketing: 30000, other: 8000 },
  { name: "Q3", labor: 145000, software: 32000, hardware: 18000, marketing: 35000, other: 12000 },
  { name: "Q4", labor: 160000, software: 38000, hardware: 20000, marketing: 40000, other: 15000 },
]

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Custom Tooltip with enhanced styling
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum, entry) => sum + (entry.value as number || 0), 0);

    return (
      <div className="rounded-lg border border-border bg-card p-4 shadow-xl dark:bg-gray-800 dark:border-gray-700">
        <p className="mb-2 text-base font-semibold text-card-foreground dark:text-gray-100">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between space-x-4 mb-1">
            <div className="flex items-center">
              <span
                className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color || entry.payload.fill }}
              />
              <p className="text-sm text-muted-foreground dark:text-gray-300">{entry.name}:</p>
            </div>
            <p className="text-sm font-medium text-card-foreground dark:text-gray-100">
              {formatCurrency(entry.value as number)}
            </p>
          </div>
        ))}
        <div className="mt-3 pt-2 border-t border-border dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm font-semibold text-muted-foreground dark:text-gray-300">Total:</p>
            <p className="text-sm font-bold text-card-foreground dark:text-gray-100">{formatCurrency(total)}</p>
        </div>
      </div>
    )
  }
  return null
}

// Custom Legend with better styling
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
          <span className="text-muted-foreground dark:text-gray-400">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function CostDistributionChart() {
  return (
    <ResponsiveContainer height={250}> 
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: -10, bottom: 5 }} // Adjusted margins
        barCategoryGap="20%" // Adds space between bar groups (quarters)
      >
        <CartesianGrid
          strokeDasharray="3 3"
          strokeOpacity={0.3} // More subtle grid lines
          vertical={false} // Only horizontal lines for cleaner look
          className="stroke-border dark:stroke-gray-700"
        />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} // Using Shadcn variables
          className="text-muted-foreground dark:text-gray-400"
        />
        <YAxis
          tickFormatter={(value) => `$${value / 1000}k`}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          width={80} // Give more space for Y-axis labels
          className="text-muted-foreground dark:text-gray-400"
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "hsl(var(--accent))", fillOpacity: 0.1 }} // Subtle hover effect on bar area
        />
        <Legend
          content={renderLegend}
          verticalAlign="bottom" // Position legend at the bottom
          wrapperStyle={{ paddingTop: '20px' }} // Add some space above the legend
        />
        <Bar dataKey="labor" name="Labor" stackId="a" fill={COLORS.labor} radius={[6, 6, 0, 0]} animationDuration={700} />
        <Bar dataKey="software" name="Software" stackId="a" fill={COLORS.software} radius={[6, 6, 0, 0]} animationDuration={700} />
        <Bar dataKey="hardware" name="Hardware" stackId="a" fill={COLORS.hardware} radius={[6, 6, 0, 0]} animationDuration={700} />
        <Bar dataKey="marketing" name="Marketing" stackId="a" fill={COLORS.marketing} radius={[6, 6, 0, 0]} animationDuration={700} />
        <Bar dataKey="other" name="Other" stackId="a" fill={COLORS.other} radius={[6, 6, 0, 0]} animationDuration={700} />
      </BarChart>
    </ResponsiveContainer>
  )
}