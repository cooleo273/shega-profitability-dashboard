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
  startDate: string
  endDate: string
  budget: number
  teamMembers: {
    id: string
    hours: number
    user: {
      hourlyRate: number
    }
  }[]
  deliverables: {
    id: string
    hours: number
    status: string
  }[]
}

interface CostData {
  name: string
  labor: number
  software: number
  hardware: number
  marketing: number
  other: number
}

const colors = {
  labor: "#009A6A",
  software: "#3b82f6",
  hardware: "#8b5cf6",
  marketing: "#f59e0b",
  other: "#6b7280",
}

export function CostDistributionChart() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [costData, setCostData] = useState<CostData[]>([])

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch('/api/projects?include=team,deliverables')
        if (!response.ok) {
          throw new Error('Failed to fetch project data')
        }
        const projects: Project[] = await response.json()

        // Group projects by quarter
        const quarterlyData = new Map<string, {
          labor: number
          software: number
          hardware: number
          marketing: number
          other: number
        }>()

        projects.forEach(project => {
          const startDate = new Date(project.startDate)
          const quarter = `Q${Math.floor(startDate.getMonth() / 3) + 1}`
          
          // Calculate labor costs
          const laborCost = project.teamMembers.reduce((sum, member) => 
            sum + (member.hours * member.user.hourlyRate), 0)

          // Estimate other costs based on project budget
          // These are example ratios - adjust based on your actual data
          const totalBudget = project.budget
          const softwareCost = totalBudget * 0.15 // 15% of budget
          const hardwareCost = totalBudget * 0.10 // 10% of budget
          const marketingCost = totalBudget * 0.05 // 5% of budget
          const otherCost = totalBudget * 0.05 // 5% of budget

          const currentQuarter = quarterlyData.get(quarter) || {
            labor: 0,
            software: 0,
            hardware: 0,
            marketing: 0,
            other: 0
          }

          quarterlyData.set(quarter, {
            labor: currentQuarter.labor + laborCost,
            software: currentQuarter.software + softwareCost,
            hardware: currentQuarter.hardware + hardwareCost,
            marketing: currentQuarter.marketing + marketingCost,
            other: currentQuarter.other + otherCost
          })
        })

        // Convert to array and sort by quarter
        const data = Array.from(quarterlyData.entries())
          .map(([quarter, costs]) => ({
            name: quarter,
            ...costs
          }))
          .sort((a, b) => a.name.localeCompare(b.name))

        setCostData(data)
      } catch (err) {
        console.error('Error fetching project data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load cost data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjectData()
  }, [])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)

  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0)
      return (
        <div className="rounded-xl border border-border bg-popover p-3.5 shadow-xl">
          <p className="font-semibold text-popover-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium text-popover-foreground">{entry.name}:</span>
              <span className="text-popover-foreground">
                {formatCurrency(entry.value)} ({((entry.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t text-sm font-medium text-popover-foreground">
            Total: {formatCurrency(total)}
          </div>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="w-full h-[420px] p-4 md:p-6 rounded-2xl bg-card shadow flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading cost data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-[420px] p-4 md:p-6 rounded-2xl bg-card shadow flex items-center justify-center">
        <p className="text-destructive">Error: {error}</p>
      </div>
    )
  }

  if (costData.length === 0) {
    return (
      <div className="w-full h-[420px] p-4 md:p-6 rounded-2xl bg-card shadow flex items-center justify-center">
        <p className="text-muted-foreground">No cost data available</p>
      </div>
    )
  }

  return (
    <div className="w-full h-[420px] p-4 md:p-6 rounded-2xl bg-card shadow">
      <h2 className="text-lg md:text-xl font-semibold mb-4 text-card-foreground">
        Quarterly Cost Distribution
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={costData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <defs>
            {Object.entries(colors).map(([key, color]) => (
              <linearGradient
                key={key}
                id={`color${key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={color} stopOpacity={0.85} />
                <stop offset="100%" stopColor={color} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(value) => `$${value / 1000}k`}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            wrapperStyle={{ paddingTop: 8 }}
            formatter={(value) => (
              <span className="text-sm text-muted-foreground capitalize">{value}</span>
            )}
          />
          <Bar dataKey="labor" name="Labor" stackId="a" fill="url(#colorlabor)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="software" name="Software" stackId="a" fill="url(#colorsoftware)" />
          <Bar dataKey="hardware" name="Hardware" stackId="a" fill="url(#colorhardware)" />
          <Bar dataKey="marketing" name="Marketing" stackId="a" fill="url(#colormarketing)" />
          <Bar dataKey="other" name="Other" stackId="a" fill="url(#colorother)" radius={[0, 0, 6, 6]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
