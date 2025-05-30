"use client"

import React, { useState, useEffect } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from "recharts"
import type { TooltipProps } from "recharts"
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"
import { Loader2 } from "lucide-react"

interface Project {
  id: string
  name: string
  budget: number
}

interface RevenueData {
  name: string
  value: number
  color: string
  id: string
}

// Generate a color based on the project name
const generateColor = (name: string): string => {
  const colors = [
    "#10B981", // Green
    "#3B82F6", // Blue
    "#8B5CF6", // Purple
    "#F59E0B", // Orange
    "#6B7280", // Gray
    "#EC4899", // Pink
    "#14B8A6", // Teal
    "#F43F5E", // Rose
    "#6366F1", // Indigo
    "#84CC16", // Lime
  ]
  
  // Use the project name to generate a consistent color
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  
  return colors[Math.abs(hash) % colors.length]
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value)
}

const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const entry = payload[0].payload
    const totalRevenue = payload.reduce((sum: number, item: any) => sum + item.payload.value, 0)
    const percentage = ((entry.value / totalRevenue) * 100).toFixed(1)
    return (
      <div className="rounded-xl border border-border bg-popover p-3.5 shadow-xl transform transition-all duration-150 ease-out scale-105">
        <div className="flex items-center mb-2">
          <span className="mr-2.5 inline-block h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }}/>
          <p className="text-sm font-semibold text-popover-foreground">{entry.name}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Revenue: <span className="font-medium text-popover-foreground">{formatCurrency(entry.value)}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Share: <span className="font-medium text-popover-foreground">{percentage}%</span>
          </p>
        </div>
      </div>
    )
  }
  return null
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g className="transition-all duration-300 ease-out focus:outline-none" tabIndex={-1}>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="hsl(var(--background))"
        strokeWidth={3}
        style={{
          filter: `drop-shadow(0 6px 12px ${fill}50)`,
          transform: 'translateY(-2px) scale(1.02)',
        }}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 3}
        outerRadius={innerRadius - 1}
        fill={fill}
        opacity={0.5}
      />
    </g>
  );
};

const ChartDetailsPanel = ({ 
  activeIndex, 
  setActiveIndex, 
  revenueData 
}: { 
  activeIndex: number | undefined, 
  setActiveIndex: (index: number | undefined) => void,
  revenueData: RevenueData[]
}) => {
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="flex flex-col justify-center items-start md:p-6 space-y-5 h-full">
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Total Revenue</p>
        <p className="text-xl text-foreground">{formatCurrency(totalRevenue)}</p>
      </div>
      <div className="space-y-1 w-full">
        {revenueData.map((entry, index) => (
          <button
            key={`legend-${entry.id}`}
            className={`flex items-center group w-full text-left py-1 px-2.5 rounded-lg transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:ring-[${entry.color}]`}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(undefined)}
            onClick={() => setActiveIndex(index === activeIndex ? undefined : index)}
            style={{
              backgroundColor: activeIndex === index ? `${entry.color}20` : 'transparent',
            }}
          >
            <span
              className="mr-3 inline-block h-4 w-4 flex-shrink-0 rounded-full transition-all duration-200 ease-out group-hover:scale-110"
              style={{
                backgroundColor: entry.color,
                boxShadow: `0 0 0 2px hsl(var(--card)), 0 0 0 3px ${entry.color}${activeIndex === index ? '90' : '50'}`,
              }}
            />
            <div className="flex-grow flex justify-between items-center min-w-0">
              <span className={`text-sm font-medium truncate transition-colors ${activeIndex === index ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                {entry.name}
              </span>
              <span className={`text-sm font-semibold transition-colors ${activeIndex === index ? `text-[${entry.color}]` : 'text-foreground group-hover:text-foreground'}`}>
                {((entry.value / totalRevenue) * 100).toFixed(0)}%
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export function RevenueBreakdownChart() {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch('/api/projects')
        if (!response.ok) {
          throw new Error('Failed to fetch project data')
        }
        const projects: Project[] = await response.json()

        // Convert projects to revenue data
        const data = projects
          .map(project => ({
            name: project.name,
            value: project.budget,
            color: generateColor(project.name),
            id: project.id
          }))
          .sort((a, b) => b.value - a.value) // Sort by revenue (highest to lowest)

        setRevenueData(data)
      } catch (err) {
        console.error('Error fetching project data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load project data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjectData()
  }, [])

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    // Don't clear activeIndex on pie leave if legend is controlling it
  };

  if (isLoading) {
    return (
      <div className="relative h-[400px] w-full bg-card rounded-xl shadow-lg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading revenue data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative h-[400px] w-full bg-card rounded-xl shadow-lg flex items-center justify-center">
        <p className="text-destructive">Error: {error}</p>
      </div>
    )
  }

  if (revenueData.length === 0) {
    return (
      <div className="relative h-[400px] w-full bg-card rounded-xl shadow-lg flex items-center justify-center">
        <p className="text-muted-foreground">No revenue data available</p>
      </div>
    )
  }

  return (
    <div className="relative h-[400px] w-full bg-card rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row overflow-hidden">
      <div className="w-full md:w-3/5 h-1/2 md:h-full p-2 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={revenueData}
              cx="50%"
              cy="50%"
              labelLine={false}
              innerRadius="60%"
              outerRadius="85%"
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              paddingAngle={2}
              stroke="hsl(var(--background))"
              strokeWidth={4}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {revenueData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.id}`}
                  fill={entry.color}
                  style={{
                    filter: activeIndex === index ? undefined : `drop-shadow(0 1px 2px ${entry.color}20)`,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    opacity: activeIndex === undefined || activeIndex === index ? 1 : 0.55,
                    transform: activeIndex === index ? 'scale(1.0)' : 'scale(0.98)',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'transparent' }}
              wrapperStyle={{ outline: 'none' }}
              position={{ y: 0 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full md:w-2/5 h-1/2 md:h-full border-t md:border-t-0 md:border-l border-border overflow-y-auto">
        <ChartDetailsPanel 
          activeIndex={activeIndex} 
          setActiveIndex={setActiveIndex} 
          revenueData={revenueData}
        />
      </div>
    </div>
  )
}