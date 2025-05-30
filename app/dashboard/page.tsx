import { BarChart3, DollarSign, TrendingUp, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectPerformanceChart } from "@/components/dashboard/project-performance-chart"
import { RevenueBreakdownChart } from "@/components/dashboard/revenue-breakdown-chart"
import { CostDistributionChart } from "@/components/dashboard/cost-distribution-chart"
import { FinancialOverviewChart } from "@/components/dashboard/financial-overview-chart"

export default function DashboardPage() {
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
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">+3 from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1.2M</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Profitability</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32%</div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
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
              <ProjectPerformanceChart />
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
              <FinancialOverviewChart />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown & Cost Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Revenue by project category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <RevenueBreakdownChart />
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
              <CostDistributionChart />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
