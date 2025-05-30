"use client"

import { useEffect, useState } from "react"
import { format, subDays, startOfWeek, endOfWeek } from "date-fns"
import { CheckCircle2, Loader2, RefreshCw, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

export function Wei360Integration() {
  const { toast } = useToast()
  const [isConnected, setIsConnected] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncDate, setLastSyncDate] = useState(new Date())
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentDate] = useState(new Date())

  // Calculate week range (Monday to Sunday)
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })

  // Fetch logs for the current week only on mount or sync
  const fetchLogs = () => {
    setLoading(true)
    setError(null)
    fetch(`/api/time-logs?start=${weekStart.toISOString()}&end=${weekEnd.toISOString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch time logs')
        return res.json()
      })
      .then((data) => setLogs(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Split logs by source if available
  const wei360Logs = logs.filter((log) => log.source && log.source.includes('Wei360'))
  const manualLogs = logs.filter((log) => !log.source || log.source === 'Manual')

  // Handle manual sync
  const handleSync = () => {
    setIsSyncing(true)

    // Simulate API call
    setTimeout(() => {
      setIsSyncing(false)
      setLastSyncDate(new Date())
      fetchLogs()
      toast({
        title: "Sync Completed",
        description: "Successfully synced time logs from Wei360.",
        variant: "default",
      })
    }, 2000)
  }

  // Handle connection toggle
  const toggleConnection = () => {
    setIsConnected(!isConnected)

    toast({
      title: isConnected ? "Wei360 Disconnected" : "Wei360 Connected",
      description: isConnected
        ? "Your Wei360 integration has been disconnected."
        : "Your Wei360 integration has been successfully connected.",
      variant: isConnected ? "destructive" : "success",
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className={isConnected ? "border-green-500" : "border-red-500"}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              {isConnected ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Wei360 Connected
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  Wei360 Disconnected
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isConnected
                ? `Last synced: ${format(lastSyncDate, "MMM d, yyyy h:mm a")}`
                : "Connect to sync your time logs automatically"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isConnected ? (
              <p className="text-sm text-muted-foreground">
                Your Wei360 time tracking is automatically synced with this system.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Connect Wei360 to automatically import your tracked time.</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant={isConnected ? "destructive" : "default"} onClick={toggleConnection}>
              {isConnected ? "Disconnect" : "Connect"}
            </Button>
            {isConnected && (
              <Button variant="outline" onClick={handleSync} disabled={isSyncing} className="flex items-center gap-2">
                {isSyncing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Manual Sync
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Wei360 Statistics</CardTitle>
            <CardDescription>Time tracking statistics from Wei360</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-md border p-4">
                <div className="text-sm font-medium text-muted-foreground">Total Tracked</div>
                <div className="mt-1 text-2xl font-bold">{isConnected ? "21.5 hours" : "—"}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {isConnected ? "Last 7 days" : "Connect Wei360 to view stats"}
                </div>
              </div>
              <div className="rounded-md border p-4">
                <div className="text-sm font-medium text-muted-foreground">Productivity Score</div>
                <div className="mt-1 text-2xl font-bold">{isConnected ? "87%" : "—"}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {isConnected ? "Based on app usage" : "Connect Wei360 to view stats"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Time Logs</CardTitle>
          <CardDescription>View and compare your time logs</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="wei360">
            <TabsList className="mb-4">
              <TabsTrigger value="wei360">Wei360 Logs</TabsTrigger>
              <TabsTrigger value="manual">Manual Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="wei360">
              {!isConnected ? (
                <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Connect Wei360 to view your automatic time logs</p>
                    <Button className="mt-4 bg-[#009A6A] hover:bg-[#008A5A]" onClick={toggleConnection}>
                      Connect Wei360
                    </Button>
                  </div>
                </div>
              ) : wei360Logs.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">No Wei360 logs found</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={handleSync}>
                      <RefreshCw className="mr-2 h-4 w-4" /> Sync Now
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
                        <TableHead>Time Range</TableHead>
                        <TableHead className="text-right">Hours</TableHead>
                        <TableHead>Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wei360Logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{format(new Date(log.date), "MMM d")}</TableCell>
                          <TableCell>{log.project}</TableCell>
                          <TableCell>{log.task}</TableCell>
                          <TableCell>
                            {log.startTime} - {log.endTime}
                          </TableCell>
                          <TableCell className="text-right">{log.hours.toFixed(1)}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              {log.source}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="manual">
              {manualLogs.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">No manual logs found</p>
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
                      {manualLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{format(new Date(log.date), "MMM d")}</TableCell>
                          <TableCell>{log.project}</TableCell>
                          <TableCell>{log.task}</TableCell>
                          <TableCell className="text-right">{log.hours.toFixed(1)}</TableCell>
                          <TableCell>
                            {log.billable ? (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
