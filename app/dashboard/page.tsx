"use client"

import { useEffect, useState } from "react"
import { BarChart3, DollarSign, Loader2, TrendingUp, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectPerformanceChart } from "@/components/dashboard/project-performance-chart"
import { RevenueBreakdownChart } from "@/components/dashboard/revenue-breakdown-chart"
import { CostDistributionChart } from "@/components/dashboard/cost-distribution-chart"
import { FinancialOverviewChart } from "@/components/dashboard/financial-overview-chart"

interface DashboardData {
  metrics: {
    totalProjects: number
    activeProjects: number
    totalRevenue: number
    averageProfitability: number
  }
  projectPerformance: any[]
  financialData: any[]
  revenueBreakdown: any[]
  costDistribution: any[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch("/api/dashboard")
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data")
        }
        const dashboardData = await response.json()
        setData(dashboardData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading dashboard data...</p>
      </div>
    )
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!data) {
    return <div>No data available</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Project Profitability Dashboard. View your key metrics and performance indicators.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.totalProjects}</div>
            <p className="text-xs text-muted-foreground">Active projects: {data.metrics.activeProjects}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              {((data.metrics.activeProjects / data.metrics.totalProjects) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(data.metrics.totalRevenue / 1000).toFixed(1)}k
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Profitability</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.averageProfitability.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Project Performance</CardTitle>
            <CardDescription>Monthly performance metrics for all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ProjectPerformanceChart data={data.projectPerformance} />
            </div>
          </CardContent>
        </Card>

        {/* Financial Overview Chart */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>Revenue vs expenses over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <FinancialOverviewChart data={data.financialData} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown & Cost Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Revenue by project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <RevenueBreakdownChart data={data.revenueBreakdown} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Cost Distribution</CardTitle>
            <CardDescription>Costs by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <CostDistributionChart data={data.costDistribution} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
