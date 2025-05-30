"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Upload, Users } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { AccessDenied } from "@/components/access-denied"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

import { StaffRatesTable } from "@/components/finance/staff-rates-table"
import { CostByRoleChart } from "@/components/finance/cost-by-role-chart"
import { CostVsRevenueChart } from "@/components/finance/cost-vs-revenue-chart"

export default function RatesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [globalRate, setGlobalRate] = useState("150")
  const [isUploading, setIsUploading] = useState(false)

  // Check if user has access to finance rates
  const authorizedRoles = ["system_admin", "finance_manager"]
  const hasAccess = user && authorizedRoles.includes(user.role)

  // Redirect unauthorized users
  useEffect(() => {
    if (user && !hasAccess) {
      router.push("/dashboard")
    }
  }, [user, hasAccess, router])

  // Handle global rate change
  const handleGlobalRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalRate(e.target.value)
  }

  // Handle global rate save
  const handleGlobalRateSave = () => {
    toast({
      title: "Global Rate Updated",
      description: `The global hourly rate has been updated to $${globalRate}.`,
    })
  }

  // Handle CSV upload
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)

      // Simulate file upload
      setTimeout(() => {
        setIsUploading(false)
        toast({
          title: "CSV Uploaded Successfully",
          description: "Staff rates have been updated from the CSV file.",
        })
        e.target.value = ""
      }, 1500)
    }
  }

  // Handle CSV download
  const handleCsvDownload = () => {
    toast({
      title: "CSV Template Downloaded",
      description: "Use this template to update staff rates in bulk.",
    })
  }

  if (!user) {
    return <div>Loading...</div>
  }

  if (!hasAccess) {
    return <AccessDenied message="You don't have permission to access the Finance Rates section." />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cost & Billing Rates</h1>
        <p className="text-muted-foreground">Manage cost rates and billing rates for staff members.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Global Hourly Rate</CardTitle>
            <CardDescription>Set the default hourly rate for all staff members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="globalRate">Default Hourly Rate ($)</Label>
                <Input
                  id="globalRate"
                  type="number"
                  value={globalRate}
                  onChange={handleGlobalRateChange}
                  className="w-full"
                />
              </div>
              <Button onClick={handleGlobalRateSave} className="bg-[#009A6A] hover:bg-[#008A5A]">
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Update</CardTitle>
            <CardDescription>Upload a CSV file to update rates in bulk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleCsvDownload} className="flex items-center gap-2">
                  <Download className="h-4 w-4" /> Download Template
                </Button>
                <div className="relative">
                  <Input id="csvUpload" type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
                  <Button
                    onClick={() => document.getElementById("csvUpload")?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 bg-[#009A6A] hover:bg-[#008A5A]"
                  >
                    {isUploading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" /> Upload CSV
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">CSV format: Name, Role, Project, Cost Rate, Bill Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Staff Rates</CardTitle>
            <CardDescription>View and edit cost and billing rates for staff members</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> View All Staff
          </Button>
        </CardHeader>
        <CardContent>
          <StaffRatesTable />
        </CardContent>
      </Card>

      <Tabs defaultValue="cost-by-role" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cost-by-role">Cost by Role</TabsTrigger>
          <TabsTrigger value="cost-vs-revenue">Cost vs Revenue</TabsTrigger>
        </TabsList>
        <TabsContent value="cost-by-role" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Distribution by Role</CardTitle>
              <CardDescription>Breakdown of cost rates by staff role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <CostByRoleChart />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cost-vs-revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost vs Billable Revenue by User</CardTitle>
              <CardDescription>Comparison of cost rates and billable revenue by staff member</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <CostVsRevenueChart />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
