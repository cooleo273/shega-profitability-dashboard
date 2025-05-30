"use client"

import { useEffect, useState } from "react"
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
import { Loader2 } from "lucide-react"

interface Project {
  id: string
  name: string
  budget: number
  actualCost: number
  teamMembers: {
    id: string
    hours: number
    user: {
      hourlyRate: number
    }
  }[]
}

interface CostVsRevenueData {
  name: string
  cost: number
  revenue: number
  profit: number
}

// Colors
const COLORS = {
  cost: "#ef4444", // red
  revenue: "#009A6A", // green
  profit: "#3b82f6", // blue
}

// Currency formatter
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const cost = payload.find((p: any) => p.name === "Cost")?.value as number || 0
    const revenue = payload.find((p: any) => p.name === "Revenue")?.value as number || 0
    const margin = revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0

    return (
      <div className="rounded-xl border border-border bg-popover p-4 shadow-lg">
        <p className="font-semibold text-popover-foreground mb-2.5">{label}</p>
        {payload.map((entry: any, idx: number) => (
          <div key={idx} className="flex items-center gap-2.5 text-sm mb-1.5">
            <span
              className="w-3.5 h-3.5 rounded-full flex-shrink-0"
              style={{ 
                backgroundColor: entry.color,
                boxShadow: `0 0 0 2px rgba(255,255,255,0.8), 0 0 0 4px ${entry.color}30`
              }}
            ></span>
            <span className="font-medium text-muted-foreground">{entry.name}:</span>
            <span className="text-popover-foreground">{formatCurrency(entry.value as number)}</span>
          </div>
        ))}
        <div className="mt-3 border-t pt-2.5">
          <p className="text-sm font-medium flex items-center">
            <span className="text-muted-foreground mr-2">Margin:</span>
            <span 
              className={`font-semibold ${margin > 20 ? 'text-green-600' : margin > 0 ? 'text-amber-600' : 'text-red-600'}`}
            >
              {margin.toFixed(1)}%
            </span>
          </p>
        </div>
      </div>
    )
  }
  return null
}

// Chart Component
export function CostVsRevenueChart() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<CostVsRevenueData[]>([])

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch('/api/projects?include=team')
        if (!response.ok) {
          throw new Error('Failed to fetch project data')
        }
        const projects: Project[] = await response.json()

        // Calculate costs, revenue, and profit for each project
        const data = projects.map(project => {
          // Calculate total cost from team members
          const laborCost = project.teamMembers.reduce((sum, member) => 
            sum + (member.hours * member.user.hourlyRate), 0)
          
          // Use actual cost if available, otherwise use labor cost
          const totalCost = project.actualCost || laborCost
          
          // Revenue is the project budget
          const revenue = project.budget
          
          // Profit is revenue minus cost
          const profit = revenue - totalCost

          return {
            name: project.name,
            cost: totalCost,
            revenue: revenue,
            profit: profit
          }
        }).sort((a, b) => b.revenue - a.revenue) // Sort by revenue descending

        setChartData(data)
      } catch (err) {
        console.error('Error fetching project data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load project data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjectData()
  }, [])

  if (isLoading) {
    return (
      <div className="w-full h-full rounded-xl bg-card p-4 shadow-md flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading project data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full rounded-xl bg-card p-4 shadow-md flex items-center justify-center">
        <p className="text-destructive">Error: {error}</p>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="w-full h-full rounded-xl bg-card p-4 shadow-md flex items-center justify-center">
        <p className="text-muted-foreground">No project data available</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full rounded-xl bg-card p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          barGap={8}
          barSize={24}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={{ stroke: "hsl(var(--border))" }}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis
            tickFormatter={(value) => `$${value / 1000}k`}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={{ stroke: "hsl(var(--border))" }}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.1 }}
            wrapperStyle={{ outline: 'none' }}
          />
          <Legend
            wrapperStyle={{ paddingTop: 15 }}
            iconType="circle"
            iconSize={10}
            formatter={(value) => (
              <span className="text-sm font-medium text-muted-foreground capitalize">{value}</span>
            )}
          />
          <Bar
            dataKey="cost"
            name="Cost"
            fill={COLORS.cost}
            radius={[6, 6, 0, 0]}
            animationDuration={700}
            style={{ filter: `drop-shadow(0 1px 2px ${COLORS.cost}40)` }}
          />
          <Bar
            dataKey="revenue"
            name="Revenue"
            fill={COLORS.revenue}
            radius={[6, 6, 0, 0]}
            animationDuration={900}
            style={{ filter: `drop-shadow(0 1px 2px ${COLORS.revenue}40)` }}
          />
          <Bar
            dataKey="profit"
            name="Profit"
            fill={COLORS.profit}
            radius={[6, 6, 0, 0]}
            animationDuration={1100}
            style={{ filter: `drop-shadow(0 1px 2px ${COLORS.profit}40)` }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
