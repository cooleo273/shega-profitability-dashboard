"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, Download, Filter, Loader2 } from "lucide-react"
import { format } from "date-fns"

import { useAuth } from "@/components/auth-provider"
import { AccessDenied } from "@/components/access-denied"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

import { AlertsSection } from "@/components/reports/alerts-section"
import { BillableHoursReport } from "@/components/reports/billable-hours-report"
import { CostBreakdownReport } from "@/components/reports/cost-breakdown-report"
import { ProfitabilityReport } from "@/components/reports/profitability-report"
import { VarianceReport } from "@/components/reports/variance-report"

// Available metrics
const metrics = [
  { id: "revenue", name: "Revenue" },
  { id: "cost", name: "Cost" },
  { id: "profit", name: "Profit" },
  { id: "hours", name: "Hours" },
]

// Project interface
interface Project {
  id: string;
  name: string;
}

export default function ReportsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profitability")
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Report filters
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: new Date(new Date().getFullYear(), 0, 1), // Jan 1 of current year
    to: new Date(),
  })
  const [selectedProject, setSelectedProject] = useState("all")
  const [selectedMetric, setSelectedMetric] = useState("profit")

  // Check if user has access to reports
  const authorizedRoles = ["system_admin", "finance_manager", "project_manager", "executive"]
  const hasAccess = user && authorizedRoles.includes(user.role)

  // Fetch projects data
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        
        // Add "All Projects" option at the beginning
        setProjects([{ id: "all", name: "All Projects" }, ...data]);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setIsLoading(false);
      }
    };

    if (hasAccess) {
      fetchProjects();
    }
  }, [hasAccess]);

  // Redirect unauthorized users
  useEffect(() => {
    if (user && !hasAccess) {
      router.push("/dashboard")
    }
  }, [user, hasAccess, router])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    return <AccessDenied message="You don't have permission to access the Reports section." />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports & Alerts</h1>
        <p className="text-muted-foreground">View and analyze project performance, profitability, and cost metrics.</p>
      </div>

      <Card className="p-4 shadow-md border-t-4 border-t-primary">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal sm:w-[300px]",
                    !dateRange && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium">Project</label>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : error ? (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Failed to load projects</AlertDescription>
              </Alert>
            ) : (
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium">Primary Metric</label>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger>
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                {metrics.map((metric) => (
                  <SelectItem key={metric.id} value={metric.id}>
                    {metric.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Additional filters</span>
            </Button>
          </div>
        </div>
      </Card>

      <AlertsSection />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 rounded-lg bg-muted/50 p-1">
          <TabsTrigger value="profitability" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Profitability</TabsTrigger>
          <TabsTrigger value="variance" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Variance</TabsTrigger>
          <TabsTrigger value="billable-hours" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Billable Hours</TabsTrigger>
          <TabsTrigger value="cost-breakdown" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Cost Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="profitability" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Export to Excel
            </Button>
          </div>
          <ProfitabilityReport dateRange={dateRange} projectId={selectedProject} metric={selectedMetric} />
        </TabsContent>

        <TabsContent value="variance" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Export to Excel
            </Button>
          </div>
          <VarianceReport dateRange={dateRange} projectId={selectedProject} metric={selectedMetric} />
        </TabsContent>

        <TabsContent value="billable-hours" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Export to Excel
            </Button>
          </div>
          <BillableHoursReport dateRange={dateRange} projectId={selectedProject} />
        </TabsContent>

        <TabsContent value="cost-breakdown" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Export to Excel
            </Button>
          </div>
          <CostBreakdownReport dateRange={dateRange} projectId={selectedProject} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
