"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Filter, MoreHorizontal, Search, UserPlus } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { AccessDenied } from "@/components/access-denied"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

export default function UsersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [usersData, setUsersData] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])

  // User roles
  const roles = [
    { id: "system_admin", name: "System Admin" },
    { id: "finance_manager", name: "Finance Manager" },
    { id: "project_manager", name: "Project Manager" },
    { id: "executive", name: "Executive" },
    { id: "project_member", name: "Project Member" },
  ]

  // Fetch users and projects from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, projectsRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/projects"),
        ])
        const users = usersRes.ok ? await usersRes.json() : []
        const projects = projectsRes.ok ? await projectsRes.json() : []
        // Map user-project assignments (team membership)
        const usersWithProjects = users.map((u: any) => {
          // Find all projects where user is in the team
          const assignedProjects = projects.filter((p: any) => p.team.some((member: any) => member.id === u.id))
          return {
            ...u,
            projects: assignedProjects.map((p: any) => p.name),
            status: "active", // TODO: Replace with real status if available
            avatar: "/placeholder.svg?height=32&width=32",
          }
        })
        setUsersData(usersWithProjects)
        setProjects(projects.map((p: any) => ({ id: p.id, name: p.name })))
      } catch (err) {
        toast({ title: "Error", description: "Failed to load users or projects.", variant: "destructive" })
      }
    }
    fetchData()
  }, [toast])

  // Check if user has access to admin users
  const hasAccess = user && user.role === "system_admin"

  // Redirect unauthorized users
  useEffect(() => {
    if (user && !hasAccess) {
      router.push("/dashboard")
    }
  }, [user, hasAccess, router])

  // Filter users based on search query and filters
  const filteredUsers = usersData.filter((userData) => {
    const matchesSearch =
      userData.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userData.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === "all" || userData.role === roleFilter
    const matchesStatus = statusFilter === "all" || userData.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  // Handle role change
  const handleRoleChange = (userId: string, newRole: string) => {
    setUsersData(usersData.map((userData) => (userData.id === userId ? { ...userData, role: newRole } : userData)))

    toast({
      title: "Role Updated",
      description: `User role has been updated to ${roles.find((r) => r.id === newRole)?.name}.`,
    })
  }

  // Handle status change
  const handleStatusChange = (userId: string, newStatus: string) => {
    setUsersData(usersData.map((userData) => (userData.id === userId ? { ...userData, status: newStatus } : userData)))

    toast({
      title: "Status Updated",
      description: `User status has been set to ${newStatus}.`,
    })
  }

  // Open assign project dialog
  const openAssignDialog = (userData: any) => {
    setSelectedUser(userData)
    setSelectedProjects([...userData.projects])
    setShowAssignDialog(true)
  }

  // Toggle project selection
  const toggleProject = (projectName: string) => {
    if (selectedProjects.includes(projectName)) {
      setSelectedProjects(selectedProjects.filter((p) => p !== projectName))
    } else {
      setSelectedProjects([...selectedProjects, projectName])
    }
  }

  // Save project assignments
  const saveProjectAssignments = () => {
    if (!selectedUser) return

    setUsersData(
      usersData.map((userData) =>
        userData.id === selectedUser.id ? { ...userData, projects: selectedProjects } : userData,
      ),
    )

    setShowAssignDialog(false)

    toast({
      title: "Projects Assigned",
      description: `Projects have been assigned to ${selectedUser.name}.`,
    })
  }

  if (!user) {
    return <div>Loading...</div>
  }

  if (!hasAccess) {
    return <AccessDenied message="You don't have permission to access the User Management section." />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage users, roles, and project assignments.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </div>
          <Button className="bg-[#009A6A] hover:bg-[#008A5A]">
            <UserPlus className="mr-2 h-4 w-4" /> Add New User
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search users..."
                    className="pl-8 sm:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((userData) => (
                      <TableRow key={userData.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={userData.avatar || "/placeholder.svg"} alt={userData.name} />
                              <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{userData.name}</div>
                              <div className="text-sm text-muted-foreground">{userData.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select value={userData.role} onValueChange={(value) => handleRoleChange(userData.id, value)}>
                            <SelectTrigger className="h-8 w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {userData.projects.length > 0 ? (
                              userData.projects.map((project: any) => (
                                <Badge key={project} variant="outline">
                                  {project}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">No projects</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={userData.status}
                            onValueChange={(value) => handleStatusChange(userData.id, value)}
                          >
                            <SelectTrigger className="h-8 w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openAssignDialog(userData)}>
                                Assign to Projects
                              </DropdownMenuItem>
                              <DropdownMenuItem>Edit User</DropdownMenuItem>
                              <DropdownMenuItem>Reset Password</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Delete User</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Projects</DialogTitle>
            <DialogDescription>{selectedUser && `Assign ${selectedUser.name} to projects.`}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center space-x-2">
                  <Button
                    variant={selectedProjects.includes(project.name) ? "default" : "outline"}
                    size="sm"
                    className={`w-full justify-start ${
                      selectedProjects.includes(project.name) ? "bg-[#009A6A] hover:bg-[#008A5A]" : ""
                    }`}
                    onClick={() => toggleProject(project.name)}
                  >
                    {selectedProjects.includes(project.name) && <Check className="mr-2 h-4 w-4" />}
                    {project.name}
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveProjectAssignments} className="bg-[#009A6A] hover:bg-[#008A5A]">
              Save Assignments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
