"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ChevronsUpDown, Edit, Save, X } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

interface StaffMember {
  id: string
  name: string
  role: string
  project: string
  costRate: number
  billRate: number
}

interface Project {
  id: string
  name: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  project?: {
    name: string
  }
  hourlyRate: number
  billRate?: number
}

type SortableColumn = keyof StaffMember

export function StaffRatesTable() {
  const { toast } = useToast()
  const [staffData, setStaffData] = useState<StaffMember[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [roles, setRoles] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({
    role: "",
    project: "",
    costRate: 0,
    billRate: 0,
  })
  const [sortColumn, setSortColumn] = useState<SortableColumn | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch staff data and projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch projects
        const projectsResponse = await fetch('/api/projects')
        if (!projectsResponse.ok) throw new Error('Failed to fetch projects')
        const projectsData = await projectsResponse.json()
        setProjects(projectsData)

        // Fetch team members with their rates
        const teamResponse = await fetch('/api/team')
        if (!teamResponse.ok) throw new Error('Failed to fetch team data')
        const teamData: TeamMember[] = await teamResponse.json()

        // Process team data
        const processedStaffData = teamData.map((member) => ({
          id: member.id,
          name: member.name,
          role: member.role,
          project: member.project?.name || 'Unassigned',
          costRate: member.hourlyRate || 0,
          billRate: member.billRate || member.hourlyRate * 1.5 || 0, // Default bill rate is 1.5x cost rate
        }))

        setStaffData(processedStaffData)

        // Extract unique roles
        const uniqueRoles = Array.from(new Set(teamData.map((member) => member.role)))
        setRoles(uniqueRoles)

      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Start editing a row
  const startEditing = (staff: StaffMember) => {
    setEditingId(staff.id)
    setEditValues({
      role: staff.role,
      project: staff.project,
      costRate: staff.costRate,
      billRate: staff.billRate,
    })
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null)
  }

  // Save edited values
  const saveEditing = async (id: string) => {
    try {
      const response = await fetch(`/api/team/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: editValues.role,
          projectId: projects.find(p => p.name === editValues.project)?.id,
          hourlyRate: editValues.costRate,
          billRate: editValues.billRate,
        }),
      })

      if (!response.ok) throw new Error('Failed to update staff rates')

      // Update local state
      setStaffData(
        staffData.map((staff) =>
          staff.id === id
            ? {
                ...staff,
                role: editValues.role,
                project: editValues.project,
                costRate: editValues.costRate,
                billRate: editValues.billRate,
              }
            : staff,
        ),
      )
      setEditingId(null)
      toast({
        title: "Rates Updated",
        description: "Staff rates have been successfully updated.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update staff rates. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditValues({
      ...editValues,
      [name]: name === "costRate" || name === "billRate" ? Number.parseFloat(value) : value,
    })
  }

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setEditValues({
      ...editValues,
      [name]: value,
    })
  }

  // Handle sorting
  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Sort data
  const sortedData = [...staffData].sort((a, b) => {
    if (!sortColumn) return 0

    const aValue = a[sortColumn]
    const bValue = b[sortColumn]

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    return 0
  })

  if (isLoading) {
    return (
      <div className="rounded-md border p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Loading staff data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border p-4 flex items-center justify-center">
        <p className="text-destructive">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">
              <div className="flex cursor-pointer items-center" onClick={() => handleSort("name")}>
                Name
                {sortColumn === "name" && <ChevronsUpDown className="ml-2 h-4 w-4" />}
              </div>
            </TableHead>
            <TableHead>
              <div className="flex cursor-pointer items-center" onClick={() => handleSort("role")}>
                Role
                {sortColumn === "role" && <ChevronsUpDown className="ml-2 h-4 w-4" />}
              </div>
            </TableHead>
            <TableHead>
              <div className="flex cursor-pointer items-center" onClick={() => handleSort("project")}>
                Project
                {sortColumn === "project" && <ChevronsUpDown className="ml-2 h-4 w-4" />}
              </div>
            </TableHead>
            <TableHead className="text-right">
              <div className="flex cursor-pointer items-center justify-end" onClick={() => handleSort("costRate")}>
                Cost Rate ($/hr)
                {sortColumn === "costRate" && <ChevronsUpDown className="ml-2 h-4 w-4" />}
              </div>
            </TableHead>
            <TableHead className="text-right">
              <div className="flex cursor-pointer items-center justify-end" onClick={() => handleSort("billRate")}>
                Bill Rate ($/hr)
                {sortColumn === "billRate" && <ChevronsUpDown className="ml-2 h-4 w-4" />}
              </div>
            </TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((staff) => (
            <TableRow key={staff.id} className="transition-colors hover:bg-[#009A6A]/5">
              <TableCell className="font-medium">{staff.name}</TableCell>
              <TableCell>
                {editingId === staff.id ? (
                  <Select value={editValues.role} onValueChange={(value) => handleSelectChange("role", value)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  staff.role
                )}
              </TableCell>
              <TableCell>
                {editingId === staff.id ? (
                  <Select value={editValues.project} onValueChange={(value) => handleSelectChange("project", value)}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.name}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  staff.project
                )}
              </TableCell>
              <TableCell className="text-right">
                {editingId === staff.id ? (
                  <Input
                    type="number"
                    name="costRate"
                    value={editValues.costRate}
                    onChange={handleInputChange}
                    className="h-8 w-20 text-right"
                  />
                ) : (
                  `$${staff.costRate}`
                )}
              </TableCell>
              <TableCell className="text-right">
                {editingId === staff.id ? (
                  <Input
                    type="number"
                    name="billRate"
                    value={editValues.billRate}
                    onChange={handleInputChange}
                    className="h-8 w-20 text-right"
                  />
                ) : (
                  `$${staff.billRate}`
                )}
              </TableCell>
              <TableCell className="text-right">
                {editingId === staff.id ? (
                  <div className="flex justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => saveEditing(staff.id)}
                      className="h-8 w-8 text-[#009A6A] transition-colors hover:bg-[#009A6A]/10"
                    >
                      <Save className="h-4 w-4" />
                      <span className="sr-only">Save</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={cancelEditing} className="h-8 w-8 text-red-600">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Cancel</span>
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="icon" onClick={() => startEditing(staff)} className="h-8 w-8 transition-colors hover:bg-[#009A6A]/10">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
