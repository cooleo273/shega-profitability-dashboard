"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"

interface ProfitabilityReportProps {
  dateRange: { from: Date; to: Date }
  projectId: string
  metric: string
}

interface ProjectData {
  id: string
  name: string
  budget: number
  actualCost: number
  profit: number
  margin: number
}

export function ProfitabilityReport({ dateRange, projectId, metric }: ProfitabilityReportProps) {
  const [data, setData] = useState<ProjectData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Format dates for API
        const fromDate = dateRange.from.toISOString().split('T')[0]
        const toDate = dateRange.to.toISOString().split('T')[0]
        
        // Build query params
        const params = new URLSearchParams({
          from: fromDate,
          to: toDate,
          metric: metric
        })
        
        if (projectId !== 'all') {
          params.append('projectId', projectId)
        }
        
        const response = await fetch(`/api/reports/profitability?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch profitability data')
        }
        
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Error fetching profitability data:', err)
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [dateRange, projectId, metric])

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  // Get formatter based on metric
  const getFormatter = (metricType: string) => {
    switch (metricType) {
      case 'revenue':
      case 'cost':
      case 'profit':
        return formatCurrency
      case 'margin':
        return formatPercentage
      default:
        return (value: number) => value.toString()
    }
  }

  // Get chart data based on metric
  const getChartData = () => {
    return data.map(project => ({
      name: project.name,
      value: metric === 'revenue' ? project.budget :
             metric === 'cost' ? project.actualCost :
             metric === 'profit' ? project.profit :
             project.margin
    }))
  }

  // Get bar colors based on metric and value
  const getBarColor = (value: number) => {
    if (metric === 'profit' || metric === 'margin') {
      return value >= 0 ? '#10b981' : '#ef4444'
    }
    return '#3b82f6'
  }

  // Get chart title
  const getChartTitle = () => {
    const metricName = metrics.find(m => m.id === metric)?.name || 'Profit'
    return `Project ${metricName} Comparison`
  }

  // Available metrics for reference
  const metrics = [
    { id: 'revenue', name: 'Revenue' },
    { id: 'cost', name: 'Cost' },
    { id: 'profit', name: 'Profit' },
    { id: 'margin', name: 'Margin' },
  ]

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profitability Analysis</CardTitle>
          <CardDescription>Loading project profitability data...</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profitability Analysis</CardTitle>
          <CardDescription>There was an error loading the data</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profitability Analysis</CardTitle>
          <CardDescription>No data available for the selected filters</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          No profitability data found for the selected time period and project.
        </CardContent>
      </Card>
    )
  }

  const chartData = getChartData()
  const formatter = getFormatter(metric)

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle>{getChartTitle()}</CardTitle>
        <CardDescription>
          {projectId === 'all' 
            ? 'Comparing all projects' 
            : `Detailed view for ${data.find(p => p.id === projectId)?.name || 'selected project'}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 70,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={70} 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={formatter}
                width={80}
              />
              <Tooltip 
                formatter={(value: number) => [formatter(value), metric.charAt(0).toUpperCase() + metric.slice(1)]}
                labelFormatter={(label) => `Project: ${label}`}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: '1px solid rgba(229, 231, 235, 1)'
                }}
              />
              <Legend />
              <Bar 
                dataKey="value" 
                name={metric.charAt(0).toUpperCase() + metric.slice(1)}
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
