"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Loader2, Plus, Trash2, ArrowLeft, ArrowRight, Info, DollarSign, Users, CheckCircle2, Receipt } from 'lucide-react'
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

const projectFormSchema = z.object({
  name: z.string().min(3, { message: "Project name must be at least 3 characters" }),
  client: z.string({ required_error: "Please select a client" }),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  status: z.string({ required_error: "Please select a status" }),
  budget: z.coerce.number().min(0, { message: "Budget must be 0 or greater" }),
  hourlyRate: z.coerce.number().min(0, { message: "Hourly rate must be 0 or greater" }),
  estimatedHours: z.coerce.number().min(0, { message: "Estimated hours must be 0 or greater" }),
  profitMargin: z.coerce.number().min(0, { message: "Profit margin must be 0 or greater" }),
  description: z.string().optional(),
})

const statusOptions = [
  { value: "Planning", label: "Planning" },
  { value: "In Progress", label: "In Progress" },
  { value: "On Hold", label: "On Hold" },
  { value: "Completed", label: "Completed" },
]

type TeamMember = {
  id: string
  userId: string
  role: string
  hours: number
}

type Deliverable = {
  id: string
  name: string
  dueDate: Date
  hours: number
  status: string
}

interface ProjectData {
  name: string;
  description: string | null;
  status: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  hourlyRate: number;
  estimatedHours: number;
  profitMargin: number;
  clientId: string;
  notes: string | null;
  teamMembers: {
    userId: string;
    role: string;
    hours: number;
  }[];
  deliverables: {
    name: string;
    dueDate: Date;
    hours: number;
    status: string;
  }[];
  expenses: {
    name: string;
    amount: number;
    type: string;
    description?: string;
    date: Date;
  }[];
}

const tabs = ["details", "deliverables", "team", "budget"] as const;

export function CreateProjectForm({ projectId }: { projectId?: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("details")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([])
  const [users, setUsers] = useState<Array<{ id: string; name: string; role: string; hourlyRate: number }>>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [expenses, setExpenses] = useState<Array<{
    name: string;
    amount: number;
    type: string;
    description?: string;
    date: Date;
  }>>([])

  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      client: "",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      status: "Planning",
      budget: 0,
      hourlyRate: 150,
      estimatedHours: 0,
      profitMargin: 20,
      description: "",
    },
  })

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true)
      try {
        // Fetch clients
        const clientsResponse = await fetch('/api/clients')
        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json()
          setClients(clientsData)
        }

        // Fetch users
        const usersResponse = await fetch('/api/users')
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setUsers(usersData)
        }

        // If editing, fetch project data
        if (projectId) {
          const projectResponse = await fetch(`/api/projects/${projectId}`)
          if (projectResponse.ok) {
            const projectData = await projectResponse.json()
            form.reset({
              name: projectData.name,
              client: projectData.clientId,
              startDate: new Date(projectData.startDate),
              endDate: new Date(projectData.endDate),
              status: projectData.status,
              budget: projectData.budget,
              hourlyRate: projectData.hourlyRate,
              estimatedHours: projectData.estimatedHours,
              profitMargin: projectData.profitMargin,
              description: projectData.description,
            })
            
            // Initialize team members and deliverables with proper data
            if (projectData.teamMembers) {
              setTeamMembers(projectData.teamMembers.map((member: any) => ({
                id: member.id,
                userId: member.userId,
                role: member.role,
                hours: member.hours
              })))
            }
            
            if (projectData.deliverables) {
              setDeliverables(projectData.deliverables.map((deliverable: any) => ({
                id: deliverable.id,
                name: deliverable.name,
                dueDate: new Date(deliverable.dueDate),
                hours: deliverable.hours,
                status: deliverable.status
              })))
            }

            if (projectData.expenses) {
              setExpenses(projectData.expenses.map((expense: any) => ({
                name: expense.name,
                amount: expense.amount,
                type: expense.type,
                description: expense.description,
                date: new Date(expense.date)
              })))
            }
          }
        }
      } catch (error) {
        console.error('Error fetching initial data:', error)
        toast({
          title: "Error",
          description: "Failed to load initial data. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, [projectId, form, toast])

  // --- Helper for field-level validation ---
  function validateTeamMembers(members: TeamMember[]) {
    return members.every(
      (m) => m.userId && m.role.trim() && m.hours > 0
    )
  }
  function validateDeliverables(items: Deliverable[]) {
    return items.every(
      (d) => d.name.trim() && d.dueDate && d.hours > 0 && d.status
    )
  }

  // Add new function to calculate total costs
  const calculateTotalCosts = () => {
    const laborCost = teamMembers.reduce((total, member) => {
      const user = users.find(u => u.id === member.userId);
      const hourlyRate = user?.hourlyRate || form.getValues("hourlyRate");
      return total + (hourlyRate * member.hours);
    }, 0);

    const expensesCost = expenses.reduce((total, expense) => total + (expense.amount || 0), 0);

    return Number((laborCost + expensesCost).toFixed(2));
  };

  // Add new function to calculate budget with profit margin
  const calculateBudget = () => {
    const totalCosts = calculateTotalCosts();
    const profitMargin = form.getValues("profitMargin") || 0;
    const profitAmount = Number((totalCosts * (profitMargin / 100)).toFixed(2));
    const totalBudget = Number((totalCosts + profitAmount).toFixed(2));
    return totalBudget;
  };

  // Update form watch to recalculate budget
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "profitMargin" || name === "hourlyRate") {
        const newBudget = calculateBudget();
        form.setValue("budget", newBudget, { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, teamMembers, expenses]);

  // Add new effect to update budget when team members or expenses change
  useEffect(() => {
    const newBudget = calculateBudget();
    form.setValue("budget", newBudget, { shouldValidate: true });
  }, [teamMembers, expenses, form.getValues("profitMargin"), form.getValues("hourlyRate")]);

  // Update team member change handler
  function updateTeamMember(id: string, field: keyof TeamMember, value: string | number) {
    setTeamMembers(teamMembers.map((member) => 
      member.id === id ? { ...member, [field]: value } : member
    ));
    // Recalculate budget when team members change
    const newBudget = calculateBudget();
    form.setValue("budget", newBudget, { shouldValidate: true });
  }

  // Update expenses change handler
  const updateExpense = (index: number, field: keyof typeof expenses[0], value: any) => {
    const newExpenses = [...expenses];
    newExpenses[index] = { ...newExpenses[index], [field]: value };
    setExpenses(newExpenses);
    // Recalculate budget when expenses change
    const newBudget = calculateBudget();
    form.setValue("budget", newBudget, { shouldValidate: true });
  };

  // Add expense handler
  const addExpense = () => {
    const newExpense = {
      name: "",
      amount: 0,
      type: "Other",
      date: new Date(),
    };
    setExpenses([...expenses, newExpense]);
    // Recalculate budget when adding new expense
    const newBudget = calculateBudget();
    form.setValue("budget", newBudget, { shouldValidate: true });
  };

  // Remove expense handler
  const removeExpense = (index: number) => {
    const newExpenses = [...expenses];
    newExpenses.splice(index, 1);
    setExpenses(newExpenses);
    // Recalculate budget when removing expense
    const newBudget = calculateBudget();
    form.setValue("budget", newBudget, { shouldValidate: true });
  };

  const onSubmit = async (values: z.infer<typeof projectFormSchema>) => {
    // Validate Team and Deliverables tabs before allowing submission
    if (teamMembers.length === 0) {
      setActiveTab("team")
      toast({
        title: "Team Required",
        description: "Please add at least one team member before creating the project.",
        variant: "destructive"
      })
      setIsSubmitting(false)
      return
    }

    if (deliverables.length === 0) {
      setActiveTab("deliverables")
      toast({
        title: "Deliverable Required",
        description: "Please add at least one deliverable before creating the project.",
        variant: "destructive"
      })
      setIsSubmitting(false)
      return
    }

    try {
      setIsSubmitting(true)
      
      // Format the data for API submission
      const projectData = {
        name: values.name,
        description: values.description || null,
        status: values.status,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        budget: values.budget,
        hourlyRate: values.hourlyRate,
        estimatedHours: values.estimatedHours,
        profitMargin: values.profitMargin,
        clientId: values.client,
        teamMembers: teamMembers.map(member => ({
          userId: member.userId,
          role: member.role,
          hours: member.hours
        })),
        deliverables: deliverables.map(deliverable => ({
          name: deliverable.name,
          dueDate: deliverable.dueDate.toISOString(),
          hours: deliverable.hours,
          status: deliverable.status
        })),
        expenses: expenses.length > 0 ? expenses.map(expense => ({
          name: expense.name,
          amount: expense.amount,
          type: expense.type,
          description: expense.description || null,
          date: expense.date.toISOString()
        })) : []
      }

      console.log('Submitting project data:', projectData)

      // Validate required fields before submission
      if (!projectData.name || !projectData.clientId) {
        throw new Error("Project name and client are required")
      }

      // Validate team members
      if (!projectData.teamMembers.every(member => member.userId && member.role && member.hours > 0)) {
        throw new Error("All team members must have a user, role, and hours assigned")
      }

      // Validate deliverables
      if (!projectData.deliverables.every(deliverable => 
        deliverable.name && deliverable.dueDate && deliverable.hours > 0 && deliverable.status
      )) {
        throw new Error("All deliverables must have a name, due date, hours, and status")
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create project')
      }

      const project = await response.json()
      router.push(`/projects/${project.id}`)
    } catch (error: any) {
      console.error('Error creating project:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function addTeamMember() {
    setTeamMembers([
      ...teamMembers,
      {
        id: crypto.randomUUID(),
        userId: "",
        role: "",
        hours: 0,
      },
    ])
  }

  function removeTeamMember(id: string) {
    setTeamMembers(teamMembers.filter((member) => member.id !== id))
  }

  function addDeliverable() {
    setDeliverables([
      ...deliverables,
      {
        id: crypto.randomUUID(),
        name: "",
        dueDate: new Date(),
        hours: 0,
        status: "Not Started",
      },
    ])
  }

  function removeDeliverable(id: string) {
    setDeliverables(deliverables.filter((deliverable) => deliverable.id !== id))
  }

  function updateDeliverable(id: string, field: keyof Deliverable, value: string | number | Date) {
    setDeliverables(
      deliverables.map((deliverable) => 
        deliverable.id === id ? { ...deliverable, [field]: value } : deliverable
      )
    )
  }

  const getNextTab = (currentTab: string) => {
    const currentIndex = tabs.indexOf(currentTab as typeof tabs[number]);
    return tabs[currentIndex + 1] || currentTab;
  };

  const getPreviousTab = (currentTab: string) => {
    const currentIndex = tabs.indexOf(currentTab as typeof tabs[number]);
    return tabs[currentIndex - 1] || currentTab;
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{projectId ? "Edit Project" : "Create New Project"}</h1>
          <p className="text-muted-foreground mt-1">
            {projectId ? "Update your project details" : "Start a new project and manage it efficiently"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/projects')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-12">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="deliverables" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Deliverables
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team
              </TabsTrigger>
              <TabsTrigger value="budget" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Budget
              </TabsTrigger>
          </TabsList>

          <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  field.value.toLocaleDateString()
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
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
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  field.value.toLocaleDateString()
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < form.getValues("startDate")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter project description"
                            className="min-h-[120px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

                <TabsContent value="deliverables" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Project Deliverables</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addDeliverable}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Deliverable
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {deliverables.length === 0 ? (
                      <div className="rounded-md border border-dashed p-6 text-center">
                        <p className="text-sm text-muted-foreground">
                          No deliverables added yet
                        </p>
                      </div>
                    ) : (
                      deliverables.map((deliverable) => (
                        <div key={deliverable.id} className="grid grid-cols-12 gap-4 rounded-md border p-4">
                          <div className="col-span-4">
                            <Input
                              placeholder="Deliverable name"
                              value={deliverable.name}
                              onChange={(e) => updateDeliverable(deliverable.id, "name", e.target.value)}
                            />
                          </div>
                          <div className="col-span-3">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                  {deliverable.dueDate.toLocaleDateString()}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={deliverable.dueDate}
                                  onSelect={(date) => date && updateDeliverable(deliverable.id, "dueDate", date)}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                    </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              min="0"
                              placeholder="Hours"
                              value={deliverable.hours}
                              onChange={(e) => updateDeliverable(deliverable.id, "hours", Number(e.target.value))}
                            />
                  </div>
                          <div className="col-span-2">
                            <Select
                              value={deliverable.status}
                              onValueChange={(value) => updateDeliverable(deliverable.id, "status", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Not Started">Not Started</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeDeliverable(deliverable.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                </div>
              </TabsContent>

                <TabsContent value="team" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Project Team</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTeamMember}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Member
                  </Button>
                </div>

                <div className="space-y-4">
                  {teamMembers.length === 0 ? (
                    <div className="rounded-md border border-dashed p-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        No team members added yet
                      </p>
                    </div>
                  ) : (
                    teamMembers.map((member) => (
                      <div key={member.id} className="grid grid-cols-12 gap-4 rounded-md border p-4">
                        <div className="col-span-5">
                          <Select
                            value={member.userId}
                            onValueChange={(value) => updateTeamMember(member.id, "userId", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select member" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name} (${user.hourlyRate}/hr)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-4">
                          <Input
                            placeholder="Role"
                            value={member.role}
                            onChange={(e) => updateTeamMember(member.id, "role", e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            min="0"
                            placeholder="Hours"
                            value={member.hours}
                            onChange={(e) => updateTeamMember(member.id, "hours", Number(e.target.value))}
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTeamMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

                <TabsContent value="budget" className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Budget ($)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hourlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Hourly Rate ($)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="estimatedHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Hours</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profitMargin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profit Margin (%)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="rounded-md border p-4">
                    <div className="text-sm font-medium mb-4">Budget Breakdown</div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-muted-foreground">Labor Costs:</div>
                      <div className="font-medium">
                        ${teamMembers.reduce((total, member) => {
                          const user = users.find(u => u.id === member.userId);
                          const hourlyRate = user?.hourlyRate || form.getValues("hourlyRate");
                          return total + (hourlyRate * member.hours);
                        }, 0).toLocaleString()}
                      </div>
                      <div className="text-muted-foreground">Expenses:</div>
                      <div className="font-medium">
                        ${expenses.reduce((total, expense) => total + (expense.amount || 0), 0).toLocaleString()}
                      </div>
                      <div className="text-muted-foreground">Total Costs:</div>
                      <div className="font-medium">
                        ${calculateTotalCosts().toLocaleString()}
                      </div>
                      <div className="text-muted-foreground">Profit Margin:</div>
                      <div className="font-medium">
                        {form.getValues("profitMargin")}%
                      </div>
                      <div className="text-muted-foreground">Profit Amount:</div>
                      <div className="font-medium">
                        ${(calculateTotalCosts() * (form.getValues("profitMargin") / 100)).toLocaleString()}
                      </div>
                      <div className="text-muted-foreground font-semibold">Total Budget:</div>
                      <div className="font-semibold">
                        ${calculateBudget().toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Project Expenses (Optional)</h3>
                        <p className="text-sm text-muted-foreground">Add any additional expenses for the project</p>
                      </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                        onClick={addExpense}
                  >
                        <Plus className="mr-2 h-4 w-4" /> Add Expense
                  </Button>
                </div>

                <div className="space-y-4">
                      {expenses.map((expense, index) => (
                        <div key={index} className="grid grid-cols-12 gap-4 rounded-md border p-4">
                        <div className="col-span-4">
                          <Input
                              placeholder="Expense name"
                              value={expense.name}
                              onChange={(e) => updateExpense(index, "name", e.target.value)}
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            type="number"
                              placeholder="Amount"
                              value={expense.amount}
                              onChange={(e) => updateExpense(index, "amount", parseFloat(e.target.value) || 0)}
                          />
                        </div>
                          <div className="col-span-3">
                          <Select
                              value={expense.type}
                              onValueChange={(value) => updateExpense(index, "type", value)}
                          >
                            <SelectTrigger>
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Software">Software</SelectItem>
                                <SelectItem value="Hardware">Hardware</SelectItem>
                                <SelectItem value="Travel">Travel</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                              onClick={() => removeExpense(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      ))}
                    </div>
                </div>
              </TabsContent>

                <div className="flex justify-between space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                    onClick={() => setActiveTab(getPreviousTab(activeTab))}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                </Button>
                  {activeTab === "budget" ? (
                    <Button type="submit" disabled={isSubmitting} className="gap-2">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {projectId ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>
                          {projectId ? "Update Project" : "Create Project"}
                          <CheckCircle2 className="h-4 w-4" />
                        </>
                      )}
                </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setActiveTab(getNextTab(activeTab))}
                      className="gap-2"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
    </div>
  )
}