"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { ManualTimeEntry } from "@/components/time-logs/manual-time-entry"
import { WeeklyTimeLogs } from "@/components/time-logs/weekly-time-logs"
import { Wei360Integration } from "@/components/time-logs/wei360-integration"
import { AccessDenied } from "@/components/access-denied"

export default function TimeLogsPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Check if user is a project member
  const isProjectMember = user?.role === "project_member"

  // Redirect non-project members
  useEffect(() => {
    if (user && !isProjectMember) {
      router.push("/dashboard")
    }
  }, [user, isProjectMember, router])

  if (!user) {
    return <div>Loading...</div>
  }

  if (!isProjectMember) {
    return <AccessDenied message="Only project members can access the time logging system." />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Time Logging</h1>
        <p className="text-muted-foreground">Track and manage your time spent on projects.</p>
      </div>

      <Tabs defaultValue="manual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="weekly">My Weekly Logs</TabsTrigger>
          <TabsTrigger value="wei360">Wei360 Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4">
          <ManualTimeEntry />
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <WeeklyTimeLogs />
        </TabsContent>

        <TabsContent value="wei360" className="space-y-4">
          <Wei360Integration />
        </TabsContent>
      </Tabs>
    </div>
  )
}
