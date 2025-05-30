"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateUserForm } from "@/components/users/create-user-form"
import { UsersList } from "@/components/users/users-list"

export default function UsersPage() {
  const [isCreating, setIsCreating] = useState(false)

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="managers">Project Managers</TabsTrigger>
          <TabsTrigger value="finance">Financial Managers</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <UsersList role="all" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <UsersList role="team_member" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="managers">
          <Card>
            <CardHeader>
              <CardTitle>Project Managers</CardTitle>
            </CardHeader>
            <CardContent>
              <UsersList role="project_manager" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance">
          <Card>
            <CardHeader>
              <CardTitle>Financial Managers</CardTitle>
            </CardHeader>
            <CardContent>
              <UsersList role="financial_manager" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isCreating && (
        <CreateUserForm onClose={() => setIsCreating(false)} />
      )}
    </div>
  )
}