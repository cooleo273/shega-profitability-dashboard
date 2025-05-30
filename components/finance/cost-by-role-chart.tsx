"use client"

import React, { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, LabelList } from "recharts"
import type { TooltipProps } from "recharts"
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"
import { Loader2 } from "lucide-react"

interface TeamMember {
  id: string
  userId: string
  role: string
  hours: number
  user: {
    id: string
    name: string
    hourlyRate: number
  }
}

interface CostByRoleData {
  name: string
  value: number
  color: string
  id: string
}

const ROLE_COLORS: Record<string, string> = {
  "Project Manager": "#009A6A",
  "Designer": "#3B82F6",
  "Developer": "#F59E0B",
  "QA Engineer": "#EF4444",
  "Business Analyst": "#8B5CF6",
  "Product Manager": "#EC4899",
  "DevOps Engineer": "#10B981",
  "UX Researcher": "#6366F1",
  "Content Writer": "#F43F5E",
  "Marketing Specialist": "#8B5CF6",
  "default": "#94A3B8"
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
    const dataItem = payload[0]
    return (
      <div className="rounded-xl border border-border bg-popover p-3.5 shadow-xl">
        <div className="flex items-center mb-2">
          <span 
            className="mr-2.5 inline-block h-3 w-3 rounded-full" 
            style={{ backgroundColor: dataItem.payload.color }}
          />
          <p className="text-sm font-semibold text-popover-foreground">{label}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Cost: <span className="font-medium text-popover-foreground">{formatCurrency(dataItem.value as number)}</span>
        </p>
      </div>
    )
  }
  return null
}

export function CostByRoleChart() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [costData, setCostData] = useState<CostByRoleData[]>([])

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch('/api/projects?include=team')
        if (!response.ok) {
          throw new Error('Failed to fetch project data')
        }
        const projects = await response.json()

        // Calculate costs by role across all projects
        const roleCosts = new Map<string, number>()
        
        projects.forEach((project: any) => {
          project.teamMembers?.forEach((member: TeamMember) => {
            const role = member.role || 'Unassigned'
            const cost = member.hours * member.user.hourlyRate
            roleCosts.set(role, (roleCosts.get(role) || 0) + cost)
          })
        })

        // Convert to array and sort by cost
        const data = Array.from(roleCosts.entries())
          .map(([role, cost]) => ({
            name: role,
            value: cost,
            color: ROLE_COLORS[role] || ROLE_COLORS.default,
            id: role.toLowerCase().replace(/\s+/g, '-')
          }))
          .sort((a, b) => b.value - a.value)

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

  if (isLoading) {
    return (
      <div className="w-full bg-card rounded-xl shadow-lg p-4 md:p-6 flex items-center justify-center" style={{ height: "380px" }}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading cost data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full bg-card rounded-xl shadow-lg p-4 md:p-6 flex items-center justify-center" style={{ height: "380px" }}>
        <p className="text-destructive">Error: {error}</p>
      </div>
    )
  }

  if (costData.length === 0) {
    return (
      <div className="w-full bg-card rounded-xl shadow-lg p-4 md:p-6 flex items-center justify-center" style={{ height: "380px" }}>
        <p className="text-muted-foreground">No cost data available</p>
      </div>
    )
  }

  return (
    <div
      className="w-full bg-card rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-shadow duration-300"
      style={{ height: "380px" }}
    >
      <h3 className="text-lg font-semibold text-card-foreground mb-1">
        Cost by Role
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Distribution of costs across different project roles.
      </p>
      <ResponsiveContainer>
        <BarChart
          data={costData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          barCategoryGap="25%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            strokeOpacity={0.2}
            horizontal={false}
            className="stroke-border"
          />
          <XAxis
            type="number"
            tickFormatter={formatCurrency}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            className="text-muted-foreground"
          />
          <YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))", width: 120 }}
            className="text-muted-foreground"
            width={130}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "hsl(var(--accent))", fillOpacity: 0.1 }}
            wrapperStyle={{ outline: "none" }}
          />
          <Bar dataKey="value" name="Cost" barSize={20} radius={[0, 6, 6, 0]}>
            {costData.map((entry) => (
              <Cell
                key={`cell-${entry.id}`}
                fill={entry.color}
                style={{
                  transition: "opacity 0.2s ease-in-out",
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (e.target instanceof SVGElement) {
                    e.target.style.opacity = "0.8"
                  }
                }}
                onMouseLeave={(e) => {
                  if (e.target instanceof SVGElement) {
                    e.target.style.opacity = "1"
                  }
                }}
              />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={formatCurrency}
              style={{ fontSize: '11px', fill: 'hsl(var(--muted-foreground))' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}