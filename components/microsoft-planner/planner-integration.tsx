"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarDays, Check, Clock, RefreshCw, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// Mock data structure matching Microsoft Planner tasks
interface PlannerTask {
  taskId: string
  title: string
  dueDate: string | null
  status: "notStarted" | "inProgress" | "completed"
  assignedTo: {
    id: string
    name: string
    email: string
  } | null
  projectId: string
  projectName: string
  priority: "low" | "medium" | "high"
  percentComplete: number
}

// Mock data for Planner tasks
const mockPlannerTasks: PlannerTask[] = [
  {
    taskId: "task-1",
    title: "Complete project requirements document",
    dueDate: "2023-06-15",
    status: "completed",
    assignedTo: {
      id: "user-1",
      name: "John Doe",
      email: "john.doe@example.com",
    },
    projectId: "project-1",
    projectName: "Website Redesign",
    priority: "high",
    percentComplete: 100,
  },
  {
    taskId: "task-2",
    title: "Design homepage mockups",
    dueDate: "2023-06-20",
    status: "inProgress",
    assignedTo: {
      id: "user-2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
    },
    projectId: "project-1",
    projectName: "Website Redesign",
    priority: "medium",
    percentComplete: 60,
  },
  {
    taskId: "task-3",
    title: "Develop API endpoints",
    dueDate: "2023-06-25",
    status: "notStarted",
    assignedTo: {
      id: "user-3",
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
    },
    projectId: "project-2",
    projectName: "Mobile App Development",
    priority: "medium",
    percentComplete: 0,
  },
  {
    taskId: "task-4",
    title: "QA Testing for v1.0",
    dueDate: "2023-07-05",
    status: "notStarted",
    assignedTo: null,
    projectId: "project-2",
    projectName: "Mobile App Development",
    priority: "low",
    percentComplete: 0,
  },
  {
    taskId: "task-5",
    title: "Prepare client presentation",
    dueDate: null,
    status: "inProgress",
    assignedTo: {
      id: "user-1",
      name: "John Doe",
      email: "john.doe@example.com",
    },
    projectId: "project-3",
    projectName: "Brand Identity",
    priority: "high",
    percentComplete: 30,
  },
]

export function PlannerIntegration() {
  const [tasks, setTasks] = useState<PlannerTask[]>(mockPlannerTasks)
  const [isLoading, setIsLoading] = useState(false)

  // Function to simulate syncing with Microsoft Planner
  const syncWithPlanner = () => {
    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false)
      // In a real implementation, this would fetch data from Microsoft Graph API
    }, 1500)
  }

  // Get status badge color
  const getStatusBadge = (status: PlannerTask["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <Check className="mr-1 h-3 w-3" /> Completed
          </Badge>
        )
      case "inProgress":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Clock className="mr-1 h-3 w-3" /> In Progress
          </Badge>
        )
      case "notStarted":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Not Started</Badge>
    }
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No due date"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Microsoft Planner Tasks</h2>
        <Button
          onClick={syncWithPlanner}
          disabled={isLoading}
          className="bg-[#009A6A] hover:bg-[#007d57] transition-colors"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Syncing..." : "Sync with Planner"}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-sm">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <Card key={task.taskId} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  {getStatusBadge(task.status)}
                </div>
                <CardDescription>{task.projectName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{task.assignedTo?.name || "Unassigned"}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-[#009A6A] h-2.5 rounded-full"
                      style={{ width: `${task.percentComplete}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/projects/tasks/${task.taskId}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
