"use client"

import { useState, useEffect } from "react"
import { AlertCircle, ArrowRight, Loader2, TrendingDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface ProjectAlert {
  id: string
  projectId: string
  projectName: string
  type: 'budget' | 'deadline' | 'resource' | 'quality'
  severity: 'low' | 'medium' | 'high'
  message: string
  createdAt: string
}

export function AlertsSection() {
  const [alerts, setAlerts] = useState<ProjectAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAlerts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/reports/alerts')
        if (!response.ok) {
          throw new Error('Failed to fetch project alerts')
        }
        const data = await response.json()
        // Defensive: ensure all required fields exist, fallback if missing
        const safeAlerts = (Array.isArray(data) ? data : []).map((alert) => ({
          id: alert.id ?? '',
          projectId: alert.projectId ?? '',
          projectName: alert.projectName ?? 'Unknown Project',
          type: alert.type ?? 'budget',
          severity: alert.severity ?? 'low',
          message: alert.message ?? alert.description ?? '',
          createdAt: alert.createdAt ?? alert.date ?? '',
        }))
        setAlerts(safeAlerts)
      } catch (err) {
        console.error('Error fetching alerts:', err)
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAlerts()
  }, [])

  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  // Get alert type badge
  const getAlertTypeBadge = (type: string) => {
    switch (type) {
      case 'budget':
        return { label: 'Budget', variant: 'outline' as const }
      case 'deadline':
        return { label: 'Deadline', variant: 'outline' as const }
      case 'resource':
        return { label: 'Resource', variant: 'outline' as const }
      case 'quality':
        return { label: 'Quality', variant: 'outline' as const }
      default:
        return { label: type, variant: 'outline' as const }
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Alerts</CardTitle>
          <CardDescription>Issues requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Alerts</CardTitle>
          <CardDescription>Issues requiring attention</CardDescription>
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

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Alerts</CardTitle>
          <CardDescription>Issues requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6 text-muted-foreground">
            No alerts found. All projects are running smoothly.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md border-t-4 border-t-destructive">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Project Alerts</CardTitle>
            <CardDescription>Issues requiring immediate attention</CardDescription>
          </div>
          <Badge variant="destructive" className="px-3 py-1">
            {alerts.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => {
            const alertType = getAlertTypeBadge(alert.type)
            // Defensive: ensure severity is a string
            const severity = typeof alert.severity === 'string' ? alert.severity : 'low'
            return (
              <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{alert.projectName}</h4>
                    <Badge variant={getSeverityColor(severity)}>
                      {typeof severity === 'string' ? severity.charAt(0).toUpperCase() + severity.slice(1) : 'Low'}
                    </Badge>
                    <Badge variant={alertType.variant}>
                      {alertType.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" size="sm">
          View All Alerts <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
