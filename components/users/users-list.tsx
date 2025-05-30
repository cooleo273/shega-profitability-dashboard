"use client"

import { useState, useEffect } from "react"
import { Loader2, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface User {
  id: string
  name: string
  email: string
  role: string
  hourlyRate?: number
}

interface UsersListProps {
  role: "all" | "team_member" | "project_manager" | "financial_manager"
}

export function UsersList({ role }: UsersListProps) {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users')
        if (response.ok) {
          const data = await response.json()
          setUsers(role === 'all' ? data : data.filter((user: User) => user.role === role))
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [role])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          {(role === 'all' || role === 'team_member') && (
            <TableHead>Hourly Rate</TableHead>
          )}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell className="capitalize">{user.role.replace('_', ' ')}</TableCell>
            {(role === 'all' || role === 'team_member') && (
              <TableCell>${user.hourlyRate || 0}/hr</TableCell>
            )}
            <TableCell className="text-right">
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}