import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, CheckCircle2, Clock, FileText, MessageSquare } from "lucide-react"

// Mock task data - in a real app, this would come from your database or API
const tasks = [
  {
    id: "task-1",
    title: "Update client requirements document",
    description:
      "Review and update the requirements document based on the latest client feedback from the meeting on Monday.",
    status: "In Progress",
    priority: "High",
    dueDate: "2025-05-25",
    assignedTo: {
      name: "Alex Johnson",
      email: "alex@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    projectId: "proj-1",
    projectName: "Website Redesign",
    comments: [
      {
        id: "comment-1",
        author: "Sarah Miller",
        text: "I've added the new wireframes to the shared folder.",
        timestamp: "2025-05-18T14:30:00Z",
      },
      {
        id: "comment-2",
        author: "Alex Johnson",
        text: "Thanks, I'll incorporate them into the document.",
        timestamp: "2025-05-18T15:45:00Z",
      },
    ],
    attachments: [
      { name: "requirements-draft.docx", size: "2.4 MB", type: "document" },
      { name: "client-feedback.pdf", size: "1.8 MB", type: "document" },
    ],
    timeTracking: {
      estimated: 8,
      logged: 5.5,
    },
    subtasks: [
      { id: "subtask-1", title: "Update user flow diagrams", completed: true },
      { id: "subtask-2", title: "Revise technical specifications", completed: false },
      { id: "subtask-3", title: "Get approval from stakeholders", completed: false },
    ],
  },
  {
    id: "task-2",
    title: "Prepare financial forecast",
    description: "Create Q3 financial forecast based on current project timelines and resource allocation.",
    status: "Not Started",
    priority: "Medium",
    dueDate: "2025-05-30",
    assignedTo: {
      name: "Morgan Lee",
      email: "morgan@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    projectId: "proj-2",
    projectName: "Financial Planning",
    comments: [],
    attachments: [{ name: "forecast-template.xlsx", size: "1.2 MB", type: "spreadsheet" }],
    timeTracking: {
      estimated: 6,
      logged: 0,
    },
    subtasks: [
      { id: "subtask-4", title: "Gather resource allocation data", completed: false },
      { id: "subtask-5", title: "Review previous quarter actuals", completed: false },
    ],
  },
]

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const task = tasks.find((t) => t.id === params.id)

  if (!task) {
    return notFound()
  }

  // Calculate progress percentage for time tracking
  const progressPercentage = (task.timeTracking.logged / task.timeTracking.estimated) * 100
  const completedSubtasks = task.subtasks.filter((st) => st.completed).length
  const totalSubtasks = task.subtasks.length
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{task.title}</h1>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge variant={task.status === "In Progress" ? "default" : "outline"} className="bg-[#009A6A]">
            {task.status}
          </Badge>
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            {task.priority} Priority
          </Badge>
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">Comments ({task.comments.length})</TabsTrigger>
              <TabsTrigger value="attachments">Attachments ({task.attachments.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Task Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{task.description}</p>

                  <div className="mt-6">
                    <h3 className="font-medium mb-2">
                      Subtasks ({completedSubtasks}/{totalSubtasks})
                    </h3>
                    <div className="space-y-2">
                      {task.subtasks.map((subtask) => (
                        <div key={subtask.id} className="flex items-center gap-2">
                          <div
                            className={`h-5 w-5 rounded-full flex items-center justify-center ${subtask.completed ? "bg-[#009A6A]/10 text-[#009A6A]" : "bg-gray-100 text-gray-400"}`}
                          >
                            {subtask.completed && <CheckCircle2 className="h-4 w-4" />}
                          </div>
                          <span className={subtask.completed ? "line-through text-gray-500" : ""}>{subtask.title}</span>
                        </div>
                      ))}
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-[#009A6A] h-2 rounded-full" style={{ width: `${subtaskProgress}%` }}></div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Time Tracking</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        {task.timeTracking.logged}h logged of {task.timeTracking.estimated}h estimated
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-[#009A6A] h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments">
              <Card>
                <CardHeader>
                  <CardTitle>Comments</CardTitle>
                  <CardDescription>Task discussion and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  {task.comments.length > 0 ? (
                    <div className="space-y-4">
                      {task.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 pb-4 border-b border-gray-100">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{comment.author[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{comment.author}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="mt-1 text-gray-700">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>No comments yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attachments">
              <Card>
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                  <CardDescription>Files related to this task</CardDescription>
                </CardHeader>
                <CardContent>
                  {task.attachments.length > 0 ? (
                    <div className="space-y-2">
                      {task.attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-xs text-gray-500">{file.size}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>No attachments</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Assigned To</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assignedTo.avatar || "/placeholder.svg"} alt={task.assignedTo.name} />
                    <AvatarFallback>{task.assignedTo.name[0]}</AvatarFallback>
                  </Avatar>
                  <span>{task.assignedTo.name}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Project</h3>
                <p className="mt-1">{task.projectName}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Created</h3>
                <p className="mt-1 text-gray-700">May 15, 2025</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                <p className="mt-1 text-gray-700">May 18, 2025</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
