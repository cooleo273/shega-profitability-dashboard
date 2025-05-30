"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Clock, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { WeeklySummary } from "@/components/time-logs/weekly-summary"

// Form schema (all fields required, no optional billable)
const timeLogSchema = z.object({
  date: z.date({ required_error: "Date is required" }),
  project: z.string({ required_error: "Project is required" }),
  task: z.string({ required_error: "Task is required" }),
  startTime: z.string({ required_error: "Start time is required" }),
  endTime: z.string({ required_error: "End time is required" }),
  notes: z.string().optional(),
  billable: z.boolean(),
})

export function ManualTimeEntry() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([])
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([])
  const [tasks, setTasks] = useState<Array<{ id: string; name: string }>>([])
  const [selectedUser, setSelectedUser] = useState<string>("")

  // Fetch projects and users on mount
  useEffect(() => {
    fetch("/api/projects")
      .then(res => res.json())
      .then(data => setProjects(data))
    fetch("/api/users")
      .then(res => res.json())
      .then(data => setUsers(data))
  }, [])

  // Fetch tasks when project changes
  useEffect(() => {
    if (selectedProject) {
      fetch(`/api/projects/${selectedProject}/tasks`)
        .then(res => res.json())
        .then(data => setTasks(data))
    } else {
      setTasks([])
    }
  }, [selectedProject])

  // Initialize form
  const form = useForm<z.infer<typeof timeLogSchema>>({
    resolver: zodResolver(timeLogSchema),
    defaultValues: {
      date: new Date(),
      project: "",
      task: "",
      startTime: "",
      endTime: "",
      notes: "",
      billable: true,
    },
  })

  // Handle project selection to filter tasks
  const handleProjectChange = (value: string) => {
    setSelectedProject(value)
    form.setValue("task", "")
  }

  // Handle form submission
  function onSubmit(values: z.infer<typeof timeLogSchema>) {
    setIsSubmitting(true)

    // Calculate hours between start and end time
    const startParts = values.startTime.split(":")
    const endParts = values.endTime.split(":")
    const startMinutes = Number.parseInt(startParts[0]) * 60 + Number.parseInt(startParts[1])
    const endMinutes = Number.parseInt(endParts[0]) * 60 + Number.parseInt(endParts[1])
    const durationMinutes = endMinutes - startMinutes
    const hours = Math.max(0, durationMinutes / 60)

    // Post to API
    fetch('/api/time-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: values.date,
        projectId: values.project,
        taskId: values.task,
        startTime: values.startTime,
        endTime: values.endTime,
        hours,
        description: values.notes,
        billable: values.billable,
        userId: values.user, // Now using selected user from dropdown
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to submit time log')
        return res.json()
      })
      .then(() => {
        setIsSubmitting(false)
        toast({
          title: "Time Log Submitted",
          description: `Successfully logged ${hours.toFixed(2)} hours for ${projects.find((p) => p.id === values.project)?.name}.`,
          variant: "default",
        })
        form.reset({
          date: new Date(),
          project: "",
          task: "",
          user: "",
          startTime: "",
          endTime: "",
          notes: "",
          billable: true,
        })
        setSelectedProject(null)
        // Optionally: trigger a refresh in parent/other components
      })
      .catch((err) => {
        setIsSubmitting(false)
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        })
      })
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Log Time</CardTitle>
          <CardDescription>Record time spent on project tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? field.value.toLocaleDateString() : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="project"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          setSelectedProject(value)
                          form.setValue("task", "")
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="task"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a task" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tasks.length > 0 ? (
                          tasks.map((task) => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            Select a project first
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <Input type="time" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <Input type="time" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe what you worked on..." className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Billable</FormLabel>
                      <FormDescription>Mark this time as billable to the client</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-[#009A6A] hover:bg-[#008A5A]" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Time Log
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <WeeklySummary />
      </div>
    </div>
  )
}
