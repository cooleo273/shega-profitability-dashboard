"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TooltipProps } from "recharts"
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

// Color palette (your choices are great, ensuring consistency)
const COLORS = {
  completed: {
    name: "Completed",
    stroke: "#10B981", // Tailwind Emerald 500
    // Gradient fill: from a more opaque version of stroke to a very transparent one
    fill: ["rgba(16, 185, 129, 0.6)", "rgba(16, 185, 129, 0.05)"],
    id: "colorCompleted",
  },
  inProgress: {
    name: "In Progress",
    stroke: "#3B82F6", // Tailwind Blue 500 (changed from #6366F1 for better distinction if lines overlap)
    fill: ["rgba(59, 130, 246, 0.6)", "rgba(59, 130, 246, 0.05)"],
    id: "colorInProgress",
  },
  planned: {
    name: "Planned",
    stroke: "#A855F7", // Tailwind Purple 500 (changed from #8B5CF6 for better distinction)
    fill: ["rgba(168, 85, 247, 0.6)", "rgba(168, 85, 247, 0.05)"],
    id: "colorPlanned",
  },
}

interface ProjectPerformanceData {
  status: string
  _count: number
}

interface ProjectPerformanceChartProps {
  data: ProjectPerformanceData[]
}

// Custom Tooltip (aligned with previous charts)
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
                style={{ backgroundColor: entry.stroke || entry.payload.stroke }} // Use entry.stroke for area charts
              />
              <p className="text-sm text-muted-foreground">{entry.name}:</p>
            </div>
            <p className="text-sm font-medium text-card-foreground">
              {entry.value} Projects
            </p>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// Custom Legend (aligned with previous charts)
const renderLegend = (props: any) => {
  const { payload } = props;
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center text-xs">
          <span
            className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.payload.stroke || entry.color }} // Access stroke from payload for Area
          />
          <span className="text-muted-foreground">{entry.value}</span> {/* entry.value is the "name" here */}
        </div>
      ))}
    </div>
  );
};

export function ProjectPerformanceChart({ data }: ProjectPerformanceChartProps) {
  // Transform data for the chart
  const chartData = data.map(item => ({
    name: item.status,
    value: item._count
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
        <AreaChart
        data={chartData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
            <Area
              type="monotone"
          dataKey="value"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.3}
        />
        </AreaChart>
      </ResponsiveContainer>
  )
}