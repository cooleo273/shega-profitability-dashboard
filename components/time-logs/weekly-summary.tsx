import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { startOfWeek, endOfWeek } from "date-fns"

// ...existing code...
export function WeeklySummary() {
  const [summary, setSummary] = useState({
    totalHours: 0,
    billableHours: 0,
    billablePercentage: 0,
    dailyBreakdown: [
      { day: "Mon", hours: 0, billable: 0 },
      { day: "Tue", hours: 0, billable: 0 },
      { day: "Wed", hours: 0, billable: 0 },
      { day: "Thu", hours: 0, billable: 0 },
      { day: "Fri", hours: 0, billable: 0 },
    ],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentDate = new Date()
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/time-logs?start=${weekStart.toISOString()}&end=${weekEnd.toISOString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch time logs")
        return res.json()
      })
      .then((logs) => {
        // Calculate summary
        let totalHours = 0
        let billableHours = 0
        const daily: Record<string, { hours: number; billable: number }> = {
          Mon: { hours: 0, billable: 0 },
          Tue: { hours: 0, billable: 0 },
          Wed: { hours: 0, billable: 0 },
          Thu: { hours: 0, billable: 0 },
          Fri: { hours: 0, billable: 0 },
        }
        logs.forEach((log: any) => {
          const date = new Date(log.date)
          const day = date.toLocaleDateString("en-US", { weekday: "short" })
          if (daily[day]) {
            daily[day].hours += log.hours
            if (log.billable) daily[day].billable += log.hours
          }
          totalHours += log.hours
          if (log.billable) billableHours += log.hours
        })
        const billablePercentage = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0
        setSummary({
          totalHours,
          billableHours,
          billablePercentage,
          dailyBreakdown: [
            { day: "Mon", ...daily.Mon },
            { day: "Tue", ...daily.Tue },
            { day: "Wed", ...daily.Wed },
            { day: "Thu", ...daily.Thu },
            { day: "Fri", ...daily.Fri },
          ],
        })
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [weekStart.getTime(), weekEnd.getTime()])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const weekRange = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Weekly Summary</CardTitle>
          <CardDescription>{weekRange}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading summary...</div>
          ) : error ? (
            <div className="text-sm text-destructive">{error}</div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Total Hours</div>
                  <div className="text-sm font-medium">{summary.totalHours}</div>
                </div>
                <Progress value={100} className="h-2 mt-1" />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Billable Hours</div>
                  <div className="text-sm font-medium">
                    {summary.billableHours} ({summary.billablePercentage}%)
                  </div>
                </div>
                <Progress value={summary.billablePercentage} className="h-2 mt-1" />
              </div>

              <div className="pt-2">
                <div className="text-sm font-medium mb-2">Daily Breakdown</div>
                <div className="space-y-2">
                  {summary.dailyBreakdown.map((day) => (
                    <div key={day.day} className="grid grid-cols-6 gap-2 items-center">
                      <div className="text-xs">{day.day}</div>
                      <div className="col-span-4 h-2 bg-muted rounded-full overflow-hidden">
                        {day.hours > 0 && (
                          <div className="h-full bg-[#009A6A]" style={{ width: `${(day.billable / 8) * 100}%` }} />
                        )}
                      </div>
                      <div className="text-xs text-right">{day.hours}h</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Target Hours</CardTitle>
          <CardDescription>Weekly goal: 40 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Progress</div>
              <div className="text-sm font-medium">{summary.totalHours}/40 hours</div>
            </div>
            <Progress value={(summary.totalHours / 40) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">{40 - summary.totalHours} hours remaining this week</p>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
