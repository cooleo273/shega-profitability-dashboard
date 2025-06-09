"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Loader2, ArrowLeft, Edit, Trash2, Users, DollarSign, CalendarDays,
  Briefcase, UserCircle, Info, TrendingUp, TrendingDown, AlertCircle, CheckCircle2,
  Maximize2, Mail, Phone, MapPin, ExternalLink, ListChecks
} from "lucide-react"
import { format, parseISO, differenceInDays, isValid as isValidDate, formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge" // Assuming you have a generic Badge
import { cn } from "@/lib/utils"

// --- StatusBadge (Re-using your provided component) ---
interface StatusBadgeProps { status: string; className?: string }
function StatusBadge({ status, className }: StatusBadgeProps) {
  let colorClasses = "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700";
  if (!status) status = "unknown";
  switch (status.toLowerCase()) {
    case "completed": colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"; break;
    case "in progress": colorClasses = "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800"; break;
    case "planning": colorClasses = "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800"; break;
    case "on hold": colorClasses = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"; break;
    case "cancelled": colorClasses = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800"; break;
    default: break;
  }
  return (
    <span className={cn(`px-3 py-1 text-xs font-medium rounded-full border ${colorClasses} capitalize whitespace-nowrap shadow-sm`, className)}>
      {status}
    </span>
  );
}

// --- Data Interfaces (Ensure these match your API structure) ---
interface ProjectTeamMember {
  id: string;
  user: {
  id: string;
  name: string;
    hourlyRate: number;
  avatarUrl?: string;
  };
  role: string;
  hours: number;
}

interface ProjectClient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string; // Added for completeness
}

interface Deliverable {
  id: string;
  name: string;
  dueDate: string; // ISO String
  hours: number;   // Estimated hours for the deliverable
  status: string;  // e.g., "Not Started", "In Progress", "Completed"
  description?: string;
}

interface ProjectExpense {
  id: string;
  name: string;
  amount: number;
  type: string;
  description?: string;
  date: string; // ISO String
}

interface Project {
  id: string;
  name: string;
  description?: string;
  client: ProjectClient;
  status: string;
  startDate: string; // ISO String
  endDate?: string;   // ISO String
  budget: number;
  hourlyRate: number; // Default project hourly rate
  estimatedHours: number; // Total estimated hours for project
  profitMargin: number; // Target profit margin %
  notes?: string;
  teamMembers: ProjectTeamMember[];
  deliverables: Deliverable[];
  expenses: ProjectExpense[];
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

interface ProjectDetailProps {
  id: string
}

// --- Helper Components ---
interface DetailItemProps {
  icon?: React.ElementType;
  label: string;
  value: React.ReactNode;
  className?: string;
  valueClassName?: string;
  tooltip?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon: Icon, label, value, className, valueClassName, tooltip }) => {
  const content = (
  <div className={cn("flex flex-col", className)}>
      <dt className="text-sm font-medium text-muted-foreground/80 flex items-center">
        {Icon && <Icon className="h-4 w-4 mr-2 flex-shrink-0 text-primary/70" />}
      {label}
    </dt>
      <dd className={cn("mt-1 text-sm text-foreground/90 break-words", valueClassName)}>{value || "N/A"}</dd>
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent><p>{tooltip}</p></TooltipContent>
      </Tooltip>
    );
  }
  return content;
};

const SectionHeader: React.FC<{ 
  title: string; 
  icon?: React.ElementType; 
  actions?: React.ReactNode; 
  className?: string;
}> = ({ title, icon: Icon, actions, className }) => (
  <div className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6", className)}>
    <h2 className="text-lg font-medium text-foreground flex items-center">
      {Icon && <Icon className="h-5 w-5 mr-2.5 text-primary/70 flex-shrink-0" />}
      {title}
    </h2>
    {actions && <div className="mt-2 sm:mt-0">{actions}</div>}
  </div>
);


// --- Main Component ---
export function ProjectDetail({ id }: ProjectDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Ensure your API can include these relations, adjust query params as needed
        const response = await fetch(`/api/projects/${id}?include=client,teamMembers.user,deliverables,expenses`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Failed to fetch project details. Server returned an error." }));
          throw new Error(errorData.message || "Failed to fetch project details.");
        }
        const data = await response.json();
        setProject(data);
      } catch (err) {
        console.error('Error fetching project:', err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while fetching project data.";
        setError(errorMessage);
        toast({ title: "Error Loading Project", description: errorMessage, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchProject();
  }, [id, toast]);

  const handleDelete = async () => {
    if (!project || !window.confirm(`Are you sure you want to delete the project "${project.name}"? This action cannot be undone.`)) return;
    try {
      const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to delete project." }));
        throw new Error(errorData.message || "Failed to delete project.");
      }
      toast({ title: "Success", description: `Project "${project.name}" deleted successfully.` });
      router.push('/projects');
      router.refresh(); // To ensure list updates if redirected to projects list
    } catch (err) {
      console.error('Error deleting project:', err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      toast({ title: "Error Deleting Project", description: errorMessage, variant: "destructive" });
    }
  };

  const projectFinancials = useMemo(() => {
    if (!project) return null;
    
    const totalLaborCost = (project.teamMembers || []).reduce((sum, member) => {
      const hourlyRate = member.user?.hourlyRate ?? project.hourlyRate ?? 0;
      return sum + (hourlyRate * member.hours);
    }, 0);

    const totalOtherExpenses = (project.expenses || []).reduce((sum, expense) => sum + expense.amount, 0);
    const totalActualCosts = totalLaborCost + totalOtherExpenses;
    
    // This 'profitAmount' is the target profit based on current costs and target margin
    const targetProfitAmount = totalActualCosts * (project.profitMargin / 100);
    // This 'revenueTarget' is what you'd need to charge to meet costs + target profit
    const revenueTarget = totalActualCosts + targetProfitAmount;

    const budgetUtilizationPercent = project.budget > 0
      ? Math.min((totalActualCosts / project.budget) * 100, 100)
      : totalActualCosts > 0 ? 100 : 0; // If budget is 0 but costs exist, consider it 100% utilized or over

    const budgetVariance = project.budget - totalActualCosts; // Positive if under budget, negative if over
    
    return {
      totalLaborCost,
      totalOtherExpenses,
      totalActualCosts,
      targetProfitAmount, // Expected profit based on current costs and target margin
      revenueTarget,    // Projected revenue needed for target profit
      budgetUtilizationPercent,
      budgetVariance,
      isOverBudget: totalActualCosts > project.budget,
      targetProfitMargin: project.profitMargin, // The project's target profit margin
      statusIndicator: { // For progress bar coloring
        isHealthy: budgetUtilizationPercent <= 80,
        isWarning: budgetUtilizationPercent > 80 && budgetUtilizationPercent <= 100 && project.budget > 0,
        isDanger: budgetUtilizationPercent > 100 || (project.budget === 0 && totalActualCosts > 0),
      }
    };
  }, [project]);

  const projectTimeline = useMemo(() => {
    if (!project) return null;
    const startDate = project.startDate ? parseISO(project.startDate) : null;
    const endDate = project.endDate ? parseISO(project.endDate) : null;
    let durationString = "N/A";
    let daysCompleted = 0;
    let totalDurationDays = 0;
    let timelineProgress = 0;

    if (startDate && isValidDate(startDate)) {
      if (endDate && isValidDate(endDate)) {
        totalDurationDays = differenceInDays(endDate, startDate);
        durationString = `${totalDurationDays} day${totalDurationDays === 1 ? "" : "s"}`;
        daysCompleted = differenceInDays(new Date() > endDate ? endDate : new Date(), startDate);
        if (totalDurationDays > 0) {
          timelineProgress = Math.min(Math.max((daysCompleted / totalDurationDays) * 100, 0), 100);
        } else if (new Date() >= startDate && new Date() <= endDate) { // Same day project
            timelineProgress = new Date() >= endDate ? 100 : 50;
        }

      } else { // Ongoing project
        daysCompleted = differenceInDays(new Date(), startDate);
        durationString = `${daysCompleted} day${daysCompleted === 1 ? "" : "s"} (Ongoing)`;
        // No defined end, so progress is harder to define unless tied to estimatedHours vs loggedHours
      }
    }

    return {
      startDateString: startDate && isValidDate(startDate) ? format(startDate, 'MMM d, yyyy') : "Not set",
      endDateString: endDate && isValidDate(endDate) ? format(endDate, 'MMM d, yyyy') : "Ongoing",
      durationString,
      timelineProgress, // Percentage of time elapsed if end date is set
      daysCompleted
    };
  }, [project]);

  const deliverablesSummary = useMemo(() => {
    if (!project || !project.deliverables) return { completedCount: 0, totalCount: 0, progress: 0 };
    const totalCount = project.deliverables.length;
    const completedCount = project.deliverables.filter(d => d.status.toLowerCase() === 'completed').length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    return { completedCount, totalCount, progress };
  }, [project]);


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading Project Details...</p>
      </div>
    );
  }

  if (error && !project) { // Critical error, cannot display project
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto my-10">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Project</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={() => router.push('/projects')} variant="link" className="mt-4 block text-destructive hover:text-destructive/80">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
          </Button>
      </Alert>
    );
  }
  
  if (!project) { // Project specifically not found by ID after successful fetch attempt
    return (
      <div className="text-center py-10">
        <Info className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-xl font-semibold text-muted-foreground mb-2">Project Not Found</p>
        <p className="text-sm text-muted-foreground mb-6">The project with ID "{id}" could not be located.</p>
        <Button onClick={() => router.push('/projects')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Projects
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-8 p-1 md:p-4 lg:p-6">
        {/* Page Header & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <Button variant="outline" onClick={() => router.back()} className="gap-2 self-start sm:self-center hover:bg-muted/50">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => router.push(`/projects/${id}/edit`)} className="gap-2 hover:bg-muted/50">
              <Edit className="h-4 w-4" /> Edit Project
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="gap-2">
              <Trash2 className="h-4 w-4" /> Delete Project
            </Button>
          </div>
        </div>

        {/* Main Project Info Card */}
        <Card className="overflow-hidden shadow-sm border-muted/50 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-card-foreground/5 to-card-foreground/10 dark:from-card-foreground/10 dark:to-card-foreground/20 p-6 border-b">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl font-medium tracking-tight mb-2">{project.name}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Briefcase className="h-4 w-4" />
                  <span>Client: {project.client.name}</span>
                </div>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {project.description || "No description provided."}
                </CardDescription>
                {project.description && project.description.length > 150 && (
                   <Dialog>
                    <DialogTrigger asChild>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <Button variant="link" size="sm" className="text-primary hover:underline p-0 h-auto text-xs">
                             Read full description
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>View complete project description</p></TooltipContent>
                      </Tooltip>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Project Description: {project.name}</DialogTitle>
                        </DialogHeader>
                        <div className="prose prose-sm dark:prose-invert max-w-none overflow-y-auto py-4 flex-grow">
                            <p>{project.description}</p>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Close</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                   </Dialog>
                )}
              </div>
              <div className="mt-2 sm:mt-0 flex-shrink-0">
                <StatusBadge status={project.status} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-x-8 gap-y-10">
              {/* Left Column: Overview, Financials, Deliverables */}
              <div className="md:col-span-2 space-y-10">
                <section>
                  <SectionHeader title="Project Overview" icon={Info} />
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                    <DetailItem icon={UserCircle} label="Primary Contact / PM" value={project.teamMembers.find(m=>m.role?.toLowerCase().includes('manager'))?.user.name || project.teamMembers[0]?.user.name || "Not assigned"} tooltip="Lead contact for the project"/>
                    <DetailItem icon={Briefcase} label="Client Name" value={project.client.name} />
                    {project.client.email && <DetailItem icon={Mail} label="Client Email" value={<a href={`mailto:${project.client.email}`} className="text-primary hover:underline">{project.client.email}</a>} />}
                    {project.client.phone && <DetailItem icon={Phone} label="Client Phone" value={<a href={`tel:${project.client.phone}`} className="text-primary hover:underline">{project.client.phone}</a>} />}
                    <DetailItem icon={CalendarDays} label="Start Date" value={projectTimeline?.startDateString} />
                    <DetailItem icon={CalendarDays} label="Target End Date" value={projectTimeline?.endDateString} />
                    <DetailItem icon={Maximize2} label="Planned Duration" value={projectTimeline?.durationString} tooltip={projectTimeline?.timelineProgress ? `Progress: ${projectTimeline.timelineProgress.toFixed(0)}% of time elapsed` : undefined} />
                    {projectTimeline && projectTimeline.timelineProgress > 0 && project.status.toLowerCase() !== 'completed' && (
                        <div className="sm:col-span-2">
                             <label htmlFor="timeline-progress" className="text-sm font-medium text-muted-foreground mb-1 block">Timeline Progress</label>
                             <Progress id="timeline-progress" value={projectTimeline.timelineProgress} className="h-2" indicatorClassName={projectTimeline.timelineProgress >= 90 ? "bg-orange-500" : "bg-blue-500"} />
                             <p className="text-xs text-muted-foreground mt-1">{projectTimeline.daysCompleted} days passed</p>
                        </div>
                    )}
                  </dl>
                </section>

                <Separator />

                <section>
                  <SectionHeader title="Financial Snapshot" icon={DollarSign} />
                  {projectFinancials && (
                    <div className="space-y-6">
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                        <DetailItem icon={DollarSign} label="Planned Budget" value={`$${project.budget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} valueClassName="text-lg font-semibold" />
                        <DetailItem icon={TrendingDown} label="Total Actual Costs" value={`$${projectFinancials.totalActualCosts.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} valueClassName={cn("text-lg font-semibold", projectFinancials.isOverBudget ? "text-destructive" : "text-foreground")} />
                        <DetailItem icon={projectFinancials.budgetVariance >= 0 ? TrendingUp : TrendingDown} label="Budget Variance" value={`$${projectFinancials.budgetVariance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} valueClassName={cn("text-lg font-semibold", projectFinancials.budgetVariance >= 0 ? "text-green-600 dark:text-green-500" : "text-destructive")} tooltip={projectFinancials.budgetVariance >=0 ? "Under budget" : "Over budget"} />
                        <DetailItem icon={TrendingUp} label="Target Profit Margin" value={`${projectFinancials.targetProfitMargin.toFixed(1)}%`} valueClassName={cn("text-lg font-semibold", projectFinancials.statusIndicator.isDanger ? "text-destructive" : projectFinancials.statusIndicator.isWarning ? "text-yellow-600 dark:text-yellow-500" : "text-green-600 dark:text-green-500")} tooltip="Project's target profit margin %"/>
                      </dl>
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-1">
                          <label htmlFor="budget-utilization" className="text-sm font-medium text-muted-foreground">Budget Utilization</label>
                          <span className="text-sm font-semibold">
                            {projectFinancials.budgetUtilizationPercent.toFixed(0)}%
                          </span>
                        </div>
                        <Progress id="budget-utilization" value={projectFinancials.budgetUtilizationPercent} className="h-2.5" indicatorClassName={cn(projectFinancials.statusIndicator.isDanger ? "bg-red-500" : projectFinancials.statusIndicator.isWarning ? "bg-yellow-500" : "bg-green-500")} />
                      </div>
                    </div>
                  )}
                </section>

                <Separator />

                <section>
                    <SectionHeader
                        title="Project Deliverables"
                        icon={ListChecks}
                        actions={
                            <Button variant="outline" size="sm" onClick={() => router.push(`/projects/${id}/deliverables`)} className="gap-1">
                                <ExternalLink className="h-3.5 w-3.5"/> Manage
                            </Button>
                        }
                    />
                    {project.deliverables && project.deliverables.length > 0 ? (
                        <div className="space-y-3">
                             <div className="mb-3">
                                <div className="flex justify-between items-center mb-1">
                                <label htmlFor="deliverables-progress" className="text-sm font-medium text-muted-foreground">Overall Completion</label>
                                <span className="text-sm font-semibold">
                                    {deliverablesSummary.completedCount} / {deliverablesSummary.totalCount} done
                                </span>
                                </div>
                                <Progress id="deliverables-progress" value={deliverablesSummary.progress} className="h-2" />
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Deliverable</TableHead>
                                        <TableHead className="hidden sm:table-cell">Due Date</TableHead>
                                        <TableHead className="hidden md:table-cell text-right">Hours</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {project.deliverables.map(d => (
                                        <TableRow key={d.id}>
                                            <TableCell className="font-medium">{d.name}</TableCell>
                                            <TableCell className="hidden sm:table-cell text-muted-foreground">
                                                {isValidDate(parseISO(d.dueDate)) ? format(parseISO(d.dueDate), 'MMM d, yyyy') : 'N/A'}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-right text-muted-foreground">{d.hours} hrs</TableCell>
                                            <TableCell className="text-right"><StatusBadge status={d.status} /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <Card className="p-6 text-center border-dashed">
                            <ListChecks className="h-10 w-10 mx-auto text-muted-foreground/70 mb-3" />
                            <p className="text-sm text-muted-foreground">No deliverables defined for this project yet.</p>
                            <Button variant="secondary" size="sm" className="mt-4 gap-1" onClick={() => router.push(`/projects/${id}/edit?tab=deliverables`)}>
                                Add Deliverables
                            </Button>
                        </Card>
                    )}
                    </section>
              </div>

              {/* Right Column: Team */}
              <div className="md:col-span-1 space-y-8">
                <section>
                  <SectionHeader
                    title="Team Members"
                    icon={Users}
                    actions={
                      <Button variant="outline" size="sm" onClick={() => router.push(`/projects/${id}/team`)} className="gap-1 hover:bg-muted/50">
                        <ExternalLink className="h-3.5 w-3.5"/> Manage
                      </Button>
                    }
                  />
                  {project.teamMembers && project.teamMembers.length > 0 ? (
                    <div className="space-y-3">
                      {project.teamMembers.map((member) => (
                        <Card key={member.id} className="p-3 shadow-sm hover:shadow-md transition-all duration-200 border-muted/50 hover:border-primary/20">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 ring-2 ring-muted">
                              <AvatarImage src={member.user.avatarUrl} alt={member.user.name} />
                            <AvatarFallback>
                                {member.user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-foreground">{member.user.name}</p>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="text-xs text-muted-foreground">${member.user.hourlyRate ?? project.hourlyRate}/hr</span>
                                    </TooltipTrigger>
                                    <TooltipContent>Hourly rate</TooltipContent>
                                </Tooltip>
                              </div>
                              <p className="text-xs text-muted-foreground capitalize">{member.role || "Team Member"}</p>
                              <div className="mt-1.5 flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{member.hours} hrs assigned</span>
                                <span className="text-foreground/90">
                                  Cost: ${((member.user.hourlyRate ?? project.hourlyRate) * member.hours).toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0})}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                      <Card className="p-3 bg-gradient-to-r from-muted/30 to-muted/10 dark:from-muted/10 dark:to-muted/5 mt-4 border-muted/50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground/90">Total Estimated Labor Cost</span>
                          <span className="text-sm font-medium text-foreground">
                            ${projectFinancials?.totalLaborCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </span>
                        </div>
                      </Card>
                    </div>
                  ) : (
                    <Card className="p-6 text-center border-dashed border-muted/50 hover:border-primary/20 transition-colors duration-200">
                      <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No team members assigned to this project.</p>
                       <Button variant="secondary" size="sm" className="mt-4 hover:bg-muted/50" onClick={() => router.push(`/projects/${id}/edit?tab=team`)}>
                         Assign Team
                       </Button>
                    </Card>
                  )}
                </section>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 md:p-6 border-t bg-gradient-to-r from-card-foreground/5 to-card-foreground/10 dark:from-card-foreground/10 dark:to-card-foreground/20 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between items-center gap-2">
            <p>Created: {project.createdAt ? format(parseISO(project.createdAt), 'MMM d, yyyy, HH:mm') : 'N/A'}</p>
            <p>Last Updated: {project.updatedAt ? formatDistanceToNow(parseISO(project.updatedAt), { addSuffix: true }) : 'N/A'}</p>
          </CardFooter>
        </Card>

        {/* Budget Breakdown Card */}
        <Card className="shadow-sm border-muted/50 hover:shadow-md transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-card-foreground/5 to-card-foreground/10 dark:from-card-foreground/10 dark:to-card-foreground/20">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary/70" /> Detailed Financial Breakdown
            </CardTitle>
            <CardDescription>
              Itemized view of labor costs and other project expenses.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <h3 className="text-base font-medium mb-4">Labor Costs Breakdown</h3>
                {project.teamMembers && project.teamMembers.length > 0 ? (
                  <div className="space-y-2">
                    {(project.teamMembers).map((member) => (
                      <div key={member.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted/30 transition-colors duration-200">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 ring-1 ring-muted">
                                <AvatarImage src={member.user.avatarUrl} alt={member.user.name} />
                                <AvatarFallback className="text-xs">{member.user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}</AvatarFallback>
                            </Avatar>
                            <span className="text-foreground/90">{member.user.name} <span className="text-xs text-muted-foreground">({member.role})</span></span>
                        </div>
                        <span className="text-foreground/90">${((member.user.hourlyRate ?? project.hourlyRate) * member.hours).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    ))}
                     <Separator className="my-4"/>
                     <div className="flex justify-between items-center text-sm p-2 bg-muted/20 rounded-md">
                        <span className="text-foreground/90">Total Labor Cost</span>
                        <span className="font-medium">${projectFinancials?.totalLaborCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                     </div>
                  </div>
                ) : <p className="text-sm text-muted-foreground">No team members to calculate labor costs.</p>}
              </div>
              <div>
                <h3 className="text-base font-medium mb-4">Other Expenses Breakdown</h3>
                {project.expenses && project.expenses.length > 0 ? (
                  <div className="space-y-2">
                    {(project.expenses).map((expense) => (
                      <div key={expense.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted/30 transition-colors duration-200">
                        <div>
                            <span className="text-foreground/90">{expense.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">({expense.type})</span>
                        </div>
                        <span className="text-foreground/90">${expense.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    ))}
                    <Separator className="my-4"/>
                    <div className="flex justify-between items-center text-sm p-2 bg-muted/20 rounded-md">
                        <span className="text-foreground/90">Total Other Expenses</span>
                        <span className="font-medium">${projectFinancials?.totalOtherExpenses.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                     </div>
                  </div>
                ) : <p className="text-sm text-muted-foreground">No additional expenses recorded.</p>}
              </div>
            </div>
            <Separator className="my-6" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center sm:text-left">
                <DetailItem label="Total Actual Costs" value={`$${projectFinancials?.totalActualCosts.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} valueClassName="text-base font-medium" />
                <DetailItem label="Planned Budget" value={`$${project.budget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} valueClassName="text-base font-medium" />
                <DetailItem label="Budget Variance" value={`$${projectFinancials?.budgetVariance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} valueClassName={cn("text-base font-medium", projectFinancials && projectFinancials.budgetVariance >=0 ? "text-emerald-600 dark:text-emerald-500" : "text-rose-600 dark:text-rose-500")} />
                <DetailItem label="Target Profit Margin" value={`${project.profitMargin}%`} valueClassName="text-base font-medium" />
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

// Helper component for DialogClose if not directly available or to customize
const DialogClose = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ ...props }, ref) => (
  <Button ref={ref} {...props} />
));
DialogClose.displayName = "DialogClose";