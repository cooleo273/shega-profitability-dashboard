"use client"

import React, { useEffect, useState } from "react"
import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { TooltipProps } from "recharts"
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"
import { Loader2 } from "lucide-react"

interface Project {
  id: string
  name: string
  startDate: string
  endDate: string
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

interface MonthlyData {
  month: string
  revenue: number
  expenses: number
  profit: number
}

// Define a color palette (consistent with previous charts)
const LINE_COLORS = {
  revenue: "#009A6A",  // Your primary green
  expenses: "#F97316", // Orange - for costs
  profit: "#3B82F6",   // Blue - for profit
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value)
}

// Consistent Custom Tooltip
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border bg-popover p-3.5 shadow-xl">
        <p className="mb-2 text-sm font-semibold text-popover-foreground">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between space-x-4 mb-1 last:mb-0">
            <div className="flex items-center">
              <span
                className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.stroke }}
              />
              <p className="text-xs text-muted-foreground">{entry.name}:</p>
            </div>
            <p className="text-xs font-medium text-popover-foreground">
              {formatCurrency(entry.value as number)}
            </p>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// Custom Legend
const renderLegend = (props: any) => {
  const { payload } = props;
  return (
    <div className="mt-3 flex flex-wrap justify-center items-center gap-x-5 gap-y-1">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-item-${index}`} className="flex items-center text-xs cursor-pointer group">
          <span
            className="mr-1.5 inline-block h-3 w-3 rounded-full transition-transform duration-200 ease-out group-hover:scale-110"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground group-hover:text-foreground transition-colors">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function FinancialOverviewChart() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<MonthlyData[]>([])

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch('/api/projects?include=team')
        if (!response.ok) {
          throw new Error('Failed to fetch project data')
        }
        const projects: Project[] = await response.json()

        // Initialize monthly data
        const monthlyData = new Map<string, {
          revenue: number
          expenses: number
          profit: number
        }>()

        // Initialize all months
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        months.forEach(month => {
          monthlyData.set(month, { revenue: 0, expenses: 0, profit: 0 })
        })

        // Process each project
        projects.forEach(project => {
          const startDate = new Date(project.startDate)
          const month = months[startDate.getMonth()]
          
          // Calculate costs
          const laborCost = project.teamMembers.reduce((sum, member) => 
            sum + (member.hours * member.user.hourlyRate), 0)
          const totalCost = project.actualCost || laborCost

          // Get current month's data
          const currentMonth = monthlyData.get(month)!
          
          // Update monthly totals
          monthlyData.set(month, {
            revenue: currentMonth.revenue + project.budget,
            expenses: currentMonth.expenses + totalCost,
            profit: currentMonth.profit + (project.budget - totalCost)
          })
        })

        // Convert to array and sort by month
        const data = Array.from(monthlyData.entries())
          .map(([month, data]) => ({
            month,
            ...data
          }))
          .sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month))

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
      <div className="w-full bg-card rounded-xl shadow-lg p-4 md:p-6 flex items-center justify-center" style={{ height: "400px" }}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading financial data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full bg-card rounded-xl shadow-lg p-4 md:p-6 flex items-center justify-center" style={{ height: "400px" }}>
        <p className="text-destructive">Error: {error}</p>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="w-full bg-card rounded-xl shadow-lg p-4 md:p-6 flex items-center justify-center" style={{ height: "400px" }}>
        <p className="text-muted-foreground">No financial data available</p>
      </div>
    )
  }

  return (
    <div
      className="w-full bg-card rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-shadow duration-300"
      style={{ height: "400px" }}
    >
      <h3 className="text-lg font-semibold text-card-foreground mb-1">
        Financial Overview
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Monthly revenue, expenses, and profit trends.
      </p>
      <div style={{ height: "300px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              className="text-muted-foreground"
              padding={{ left: 10, right: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(value) => `$${value / 1000}k`}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              width={65}
              className="text-muted-foreground"
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "hsl(var(--accent))", strokeWidth: 1.5, strokeDasharray: "3 3" }}
              wrapperStyle={{ outline: "none" }}
            />
            <Legend
              content={renderLegend}
              verticalAlign="top"
              wrapperStyle={{ paddingBottom: '15px', paddingTop: '5px' }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke={LINE_COLORS.revenue}
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 1.5, fill: "hsl(var(--card))", stroke: LINE_COLORS.revenue }}
              activeDot={{
                r: 7,
                strokeWidth: 2,
                stroke: LINE_COLORS.revenue,
                fill: "hsl(var(--card))",
                style: { filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.1))" }
              }}
              animationDuration={700}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke={LINE_COLORS.expenses}
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 1.5, fill: "hsl(var(--card))", stroke: LINE_COLORS.expenses }}
              activeDot={{
                r: 7,
                strokeWidth: 2,
                stroke: LINE_COLORS.expenses,
                fill: "hsl(var(--card))",
                style: { filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.1))" }
              }}
              animationDuration={700}
            />
            <Line
              type="monotone"
              dataKey="profit"
              name="Profit"
              stroke={LINE_COLORS.profit}
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 1.5, fill: "hsl(var(--card))", stroke: LINE_COLORS.profit }}
              activeDot={{
                r: 7,
                strokeWidth: 2,
                stroke: LINE_COLORS.profit,
                fill: "hsl(var(--card))",
                style: { filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.1))" }
              }}
              animationDuration={700}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}