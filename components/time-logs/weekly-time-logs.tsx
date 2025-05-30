"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Download, Filter } from 'lucide-react'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/ui/table"
import { TimeLogChart } from "@/components/time-logs/time-log-chart"

// Define the TimeLog type
interface TimeLog {
  id: string;
  date: string;
  project: string;
  task: string;
  hours: number;
  billable: boolean;
  notes: string;
}

export function WeeklyTimeLogs() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate week range
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }) // Start on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }) // End on Sunday

  // Fetch time logs from API for the current week
  useEffect(() => {
    let ignore = false;
    setLoading(true)
    setError(null)
    fetch(`/api/time-logs?start=${weekStart.toISOString()}&end=${weekEnd.toISOString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch time logs")
        return res.json()
      })
      .then((data: TimeLog[]) => { if (!ignore) setTimeLogs(data) })
      .catch((err: Error) => { if (!ignore) setError(err.message) })
      .finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart.getTime(), weekEnd.getTime()])

  // Filter logs for current week (API should already filter, but fallback)
  const currentWeekLogs = timeLogs.filter((log) => {
    const logDate = new Date(log.date)
    return logDate >= weekStart && logDate <= weekEnd
  })

  // Calculate total hours and billable percentage
  const totalHours = currentWeekLogs.reduce((sum, log) => sum + log.hours, 0)
  const billableHours = currentWeekLogs.filter((log) => log.billable).reduce((sum, log) => sum + log.hours, 0)
  const billablePercentage = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0

  // Navigate to previous/next week
  const previousWeek = () => setCurrentDate(subWeeks(currentDate, 1))
  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1))
  const currentWeek = () => setCurrentDate(new Date())

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={previousWeek}>
            Previous
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Button variant="ghost" size="sm" onClick={currentWeek} className="w-full justify-start">
                Current Week
              </Button>
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={nextWeek} disabled={weekEnd >= new Date()}>
            Next
          </Button>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2 transition-colors hover:border-[#009A6A]/50">
          <Download className="h-4 w-4" /> Export Logs
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Weekly Time Logs</CardTitle>
              <CardDescription>
                {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Loading time logs...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
                <div className="text-center">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            ) : currentWeekLogs.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">No time logs for this week</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Log Time
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                      <TableHead>Billable</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentWeekLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{format(new Date(log.date), "MMM d")}</TableCell>
                        <TableCell>{log.project}</TableCell>
                        <TableCell>{log.task}</TableCell>
                        <TableCell className="text-right">{log.hours.toFixed(1)}</TableCell>
                        <TableCell>
                          {log.billable ? (
                            <span className="inline-flex items-center rounded-full bg-[#009A6A]/20 px-2.5 py-0.5 text-xs font-medium text-[#009A6A] transition-colors">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 transition-colors">
                              No
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{log.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <CardDescription>This week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Target: 40 hours ({Math.round((totalHours / 40) * 100)}% complete)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
              <CardDescription>This week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{billableHours.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">{billablePercentage}% of total hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Hours by Day</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeLogChart logs={currentWeekLogs} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
