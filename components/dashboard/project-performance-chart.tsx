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

// Mock data (same as yours)
const data = [
  { month: "Jan", completed: 5, inProgress: 8, planned: 3 },
  { month: "Feb", completed: 7, inProgress: 10, planned: 5 },
  { month: "Mar", completed: 10, inProgress: 12, planned: 6 },
  { month: "Apr", completed: 12, inProgress: 9, planned: 4 },
  { month: "May", completed: 15, inProgress: 7, planned: 3 },
  { month: "Jun", completed: 18, inProgress: 5, planned: 2 },
  // Add more data for a fuller chart
  { month: "Jul", completed: 20, inProgress: 6, planned: 4 },
  { month: "Aug", completed: 22, inProgress: 4, planned: 3 },
]

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


export function ProjectPerformanceChart() {
  return (
    // This div acts as the card container for the chart
    <div className="rounded-xl border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-md">
      <ResponsiveContainer height={250}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 15, left: -15, bottom: 5 }} // Fine-tuned margins
        >
          <defs>
            {Object.values(COLORS).map((color) => (
              <linearGradient key={color.id} id={color.id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color.fill[0]} /> {/* Opacity is handled by rgba */}
                <stop offset="95%" stopColor={color.fill[1]} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid
            strokeDasharray="4 4"
            strokeOpacity={0.2}
            vertical={false}
            className="stroke-border"
          />

          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            dy={10} // Pushes tick labels down a bit
            padding={{ left: 10, right: 10 }}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            dx={-5} // Pushes tick labels left a bit
            // allowDecimals={false} // Ensures whole numbers for project counts
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "hsl(var(--accent))", strokeWidth: 1.5, strokeDasharray: "3 3" }}
          />
          <Legend
            content={renderLegend}
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: '20px' }}
          />

          {Object.entries(COLORS).map(([key, colorDetails]) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key} // 'completed', 'inProgress', 'planned'
              name={colorDetails.name}
              stroke={colorDetails.stroke}
              strokeWidth={2.5} // Slightly thinner line for area charts
              fill={`url(#${colorDetails.id})`}
              fillOpacity={1} // Gradient handles opacity
              activeDot={{
                r: 7, // Slightly smaller active dot
                strokeWidth: 2,
                stroke: colorDetails.stroke,
                fill: "hsl(var(--card))", // Use card background for fill to pop
                style: { filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }, // Refined shadow
              }}
              animationDuration={700}
              // animationEasing="ease-out" // Default is 'ease'
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}