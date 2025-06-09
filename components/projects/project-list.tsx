"use client"

import React, { useState, useEffect, useMemo } from "react" // Removed unused useCallback
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowUpDown, Filter, Loader2, MoreHorizontal, Plus, LayoutGrid, List,
  Edit, Trash2, Eye, Search, XCircle
} from "lucide-react"
import { format, parseISO } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  // DropdownMenuCheckboxItem, // Not used, can be removed if not planned
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

// --- Helper: Status Badge ---
interface StatusBadgeProps { status: string }
export function StatusBadge({ status }: StatusBadgeProps) {
  let variant: "default" | "destructive" | "outline" | "secondary" = "default";
  switch (status?.toLowerCase()) {
    case "completed": variant = "default"; break;
    case "in progress": variant = "secondary"; break;
    case "planning": variant = "outline"; break;
    case "on hold": variant = "destructive"; break;
    case "cancelled": variant = "destructive"; break;
    default: variant = "outline";
  }
  const colorClasses = {
    "Completed": "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700",
    "In Progress": "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700",
    "Planning": "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700",
    "On Hold": "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700",
    "Cancelled": "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700"
  }
  return (
    <Badge variant={variant} className={cn("capitalize", colorClasses[status as keyof typeof colorClasses] || "bg-gray-100 text-gray-700 border-gray-300")}>
      {status}
    </Badge>
  )
}

// --- Data Interface ---
interface ProjectTeamMember {
  id: string;
  name: string;
  role?: string;
  hourlyRate?: number;
  hours?: number;
}
interface ProjectClient {
  id: string;
  name: string;
}
interface Project {
  id: string;
  name: string;
  client: ProjectClient;
  status: string;
  startDate: string; // ISO String
  endDate?: string; // ISO String
  budget: number;
  actualCost?: number; // Can be provided by API or calculated
  projectManager?: ProjectTeamMember;
  description?: string;
  team?: ProjectTeamMember[];
  hourlyRate?: number; // Project-level default hourly rate (optional)
  estimatedHours?: number; // Project-level estimated hours (optional)
  createdAt?: string; // ISO String
  updatedAt?: string; // ISO String
  timeLogs?: {
    hours: number;
    billable: boolean;
    user?: {
      id: string; // Assuming user has an ID
      name: string; // And a name
      hourlyRate: number; // User-specific hourly rate for this log
    };
  }[];
  expenses?: {
    id: string;
    name: string;
    amount: number;
    type: string;
    date: string;
  }[];
}

// --- Utility Functions ---
const calculateProjectCost = (project: Project): number => {
  // 1. Calculate labor costs from team members
  const laborCost = (project.team || []).reduce((total, member) => {
    const hourlyRate = member.hourlyRate ?? project.hourlyRate ?? 0;
    return total + (hourlyRate * (member.hours || 0));
  }, 0);

  // 2. Calculate expenses from project expenses
  const expensesCost = (project.expenses || []).reduce((total, expense) => {
    return total + (expense.amount || 0);
  }, 0);

  // 3. Calculate time log costs if available
  const timeLogCost = (project.timeLogs || []).reduce((total, log) => {
      if (log.billable) {
        const rate = log.user?.hourlyRate ?? project.hourlyRate ?? 0;
          return total + (log.hours * rate);
      }
      return total;
    }, 0);

  // Return the total of all costs
  return laborCost + expensesCost + timeLogCost;
};

const calculateProfitMargin = (budget: number, cost: number): number => {
  if (budget === 0) {
    if (cost === 0) return 0; // Both budget and cost are 0
    return -100; // Cost exists but no budget
  }
  if (cost === 0) return 100; // No cost but has budget
  return ((budget - cost) / budget) * 100;
};

type SortKey = keyof Pick<Project, "name" | "status" | "budget"> | "clientName" | "cost" | "margin";
type SortDirection = "asc" | "dsc";

// --- Main Component ---
export function ProjectList() {
  const router = useRouter();
  const { toast } = useToast();
  const [view, setView] = useState<"table" | "cards">("table");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [managerFilter, setManagerFilter] = useState<string>("all");

  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        // Updated API call to include related data as intended
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error("Failed to fetch projects");
        const data: Project[] = await response.json();
        
        const processedData = data.map(p => ({
          ...p,
          actualCost: calculateProjectCost(p),
          projectManager: p.projectManager || p.team?.[0] || {id: 'N/A', name: 'N/A'},
        }));
        setProjects(processedData);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({ title: "Error", description: "Could not load projects.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [toast]); // toast is a stable dependency from useToast

  // --- Memoized Derived Data for Filters ---
  const uniqueStatuses = useMemo(() => Array.from(new Set(projects.map(p => p.status))).sort(), [projects]);
  const uniqueManagers = useMemo(() => {
    const managers = new Set<string>();
    projects.forEach(p => {
      if (p.projectManager && p.projectManager.name !== 'N/A') {
        managers.add(p.projectManager.name);
      }
    });
    return Array.from(managers).sort();
  }, [projects]);

  // --- Filtering & Sorting Logic ---
  const filteredAndSortedProjects = useMemo(() => {
    let Fprojects = projects.filter(project => {
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      const matchesManager = managerFilter === "all" || project.projectManager?.name === managerFilter;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        project.name.toLowerCase().includes(searchLower) ||
        project.client.name.toLowerCase().includes(searchLower) ||
        (project.projectManager?.name && project.projectManager.name.toLowerCase().includes(searchLower));
      return matchesStatus && matchesManager && matchesSearch;
    });

    if (sortConfig !== null) {
      Fprojects.sort((a, b) => {
        let valA: string | number | undefined;
        let valB: string | number | undefined;

        switch (sortConfig.key) {
          case "clientName":
            valA = a.client.name;
            valB = b.client.name;
            break;
          case "cost":
            valA = a.actualCost ?? 0; // actualCost is calculated and stored on the project object
            valB = b.actualCost ?? 0;
            break;
          case "margin":
            valA = calculateProfitMargin(a.budget, a.actualCost ?? 0);
            valB = calculateProfitMargin(b.budget, b.actualCost ?? 0);
            break;
          // Default case handles 'name', 'status', 'budget' which are direct keys of Project
          default:
            valA = a[sortConfig.key as keyof Pick<Project, "name" | "status" | "budget">];
            valB = b[sortConfig.key as keyof Pick<Project, "name" | "status" | "budget">];
            break;
        }
    
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          if (isNaN(valA) && isNaN(valB)) return 0;
          if (isNaN(valA)) return sortConfig.direction === 'asc' ? 1 : -1; // Put NaNs last
          if (isNaN(valB)) return sortConfig.direction === 'asc' ? -1 : 1; // Put NaNs last
          return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }
        // Handle mixed types or undefined (treat undefined as "lesser" or "greater" consistently)
        if (valA === undefined || valA === null) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valB === undefined || valB === null) return sortConfig.direction === 'asc' ? 1 : -1;
        
        return 0; // Fallback for unhandled cases
      });
    }
    return Fprojects;
  }, [projects, searchQuery, statusFilter, managerFilter, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'dsc';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'dsc') {
      setSortConfig(null);
      return;
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground/70" />;
    }
    // Using rotate-0 for asc is fine, effectively "no rotation"
    return sortConfig.direction === 'asc' ?
      <ArrowUpDown className="ml-2 h-3 w-3" /> : 
      <ArrowUpDown className="ml-2 h-3 w-3 transform rotate-180" />;
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!window.confirm(`Are you sure you want to delete project "${projectName}"? This action cannot be undone.`)) {
      return;
    }

      try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Failed to delete project" }));
        throw new Error(errorData.message || `Failed to delete project: ${response.status} ${response.statusText}`);
        }

      // Only update the UI if the deletion was successful
        setProjects(prev => prev.filter(p => p.id !== projectId));
      toast({
        title: "Success",
        description: `Project "${projectName}" has been deleted.`,
        variant: "default",
      });
      } catch (error) {
        console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Loading Projects...</p>
        <p className="text-sm">Please wait a moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      <Card className="shadow-md">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Projects</CardTitle>
              <CardDescription>Manage and track all your ongoing and completed projects.</CardDescription>
            </div>
            <Button onClick={() => router.push("/projects/new")} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-auto sm:min-w-[250px] md:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, client, manager..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
                {searchQuery && (
                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchQuery('')}>
                        <XCircle className="h-4 w-4 text-muted-foreground"/>
                    </Button>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Filter className="mr-2 h-4 w-4" /> Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[280px]">
                  <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-2 space-y-3">
                    <SelectGroup>
                      <SelectLabel className="text-xs">Status</SelectLabel>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          {uniqueStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </SelectGroup>
                    {uniqueManagers.length > 0 && (
                        <SelectGroup>
                        <SelectLabel className="text-xs">Project Manager</SelectLabel>
                        <Select value={managerFilter} onValueChange={setManagerFilter}>
                            <SelectTrigger><SelectValue placeholder="All Managers" /></SelectTrigger>
                            <SelectContent>
                            <SelectItem value="all">All Managers</SelectItem>
                            {uniqueManagers.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        </SelectGroup>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Tabs value={view} onValueChange={(v) => setView(v as "table" | "cards")} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-2 max-w-[200px] sm:w-auto">
                <TabsTrigger value="table"><List className="mr-2 h-4 w-4"/>Table</TabsTrigger>
                <TabsTrigger value="cards"><LayoutGrid className="mr-2 h-4 w-4"/>Cards</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {filteredAndSortedProjects.length === 0 && !isLoading ? (
             <div className="flex flex-col items-center justify-center min-h-[200px] text-center py-10 border-2 border-dashed rounded-lg">
                <Filter className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-semibold text-muted-foreground">No Projects Found</p>
                <p className="text-sm text-muted-foreground/80">
                    Try adjusting your search or filter criteria, or create a new project.
                </p>
             </div>
          ) : view === "table" ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {[
                      { key: 'name', label: 'Project Name' },
                      { key: 'clientName', label: 'Client' },
                      { key: 'status', label: 'Status' },
                      { key: 'budget', label: 'Budget' },
                      { key: 'cost', label: 'Actual Cost' },
                      { key: 'margin', label: 'Margin (%)' }
                    ].map(header => (
                      <TableHead key={header.key} onClick={() => requestSort(header.key as SortKey)} className="cursor-pointer hover:bg-muted/50 whitespace-nowrap">
                        <div className="flex items-center">
                          {header.label} {getSortIcon(header.key as SortKey)}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedProjects.map((project) => {
                    const cost = project.actualCost ?? 0; // Use the pre-calculated actualCost
                    const margin = calculateProfitMargin(project.budget, cost);
                    return (
                      <TableRow key={project.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">
                          <Link href={`/projects/${project.id}`} className="hover:underline text-primary">{project.name}</Link>
                        </TableCell>
                        <TableCell>{project.client.name}</TableCell>
                        <TableCell><StatusBadge status={project.status} /></TableCell>
                        <TableCell>${project.budget.toLocaleString()}</TableCell>
                        <TableCell>${cost.toLocaleString()}</TableCell>
                        <TableCell className={cn(margin < 0 ? "text-destructive" : margin < 20 ? "text-amber-600" : "text-green-600", isNaN(margin) || !isFinite(margin) ? "text-muted-foreground" : "")}>
                          {isNaN(margin) || !isFinite(margin) ? "N/A" : `${margin.toFixed(1)}%`}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Project actions">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)}><Eye className="mr-2 h-4 w-4"/>View Details</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}/edit`)}><Edit className="mr-2 h-4 w-4"/>Edit Project</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteProject(project.id, project.name)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4"/>Delete Project
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAndSortedProjects.map((project) => {
                 const cost = project.actualCost ?? 0; // Use the pre-calculated actualCost
                 const margin = calculateProfitMargin(project.budget, cost);
                 return (
                  <Card key={project.id} className="flex flex-col overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base font-semibold leading-tight">
                          <Link href={`/projects/${project.id}`} className="hover:underline text-primary">{project.name}</Link>
                        </CardTitle>
                        <StatusBadge status={project.status} />
                      </div>
                      <CardDescription className="text-xs">{project.client.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs flex-grow">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Manager:</span>
                            <span className="font-medium">{project.projectManager?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Dates:</span>
                            <span className="font-medium">
                                {format(parseISO(project.startDate), "MMM d, yyyy")} - {project.endDate ? format(parseISO(project.endDate), "MMM d, yyyy") : 'Ongoing'}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t mt-3">
                            <div className="text-center">
                                <div className="text-muted-foreground text-[0.65rem] uppercase tracking-wider">Budget</div>
                                <div className="font-semibold text-sm">${project.budget.toLocaleString()}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-muted-foreground text-[0.65rem] uppercase tracking-wider">Cost</div>
                                <div className="font-semibold text-sm">${cost.toLocaleString()}</div>
                            </div>
                             <div className="text-center">
                                <div className="text-muted-foreground text-[0.65rem] uppercase tracking-wider">Margin</div>
                                <div className={cn("font-semibold text-sm", margin < 0 ? "text-destructive" : margin < 20 ? "text-amber-600" : "text-green-600", isNaN(margin) || !isFinite(margin) ? "text-muted-foreground" : "")}>
                                    {isNaN(margin) || !isFinite(margin) ? "N/A" : `${margin.toFixed(1)}%`}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 p-3 bg-muted/30 border-t">
                        <TooltipProvider delayDuration={0}><Tooltip><TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/projects/${project.id}`)}>
                                <Eye className="h-4 w-4" /><span className="sr-only">View</span>
                            </Button>
                        </TooltipTrigger><TooltipContent><p>View Details</p></TooltipContent></Tooltip></TooltipProvider>
                        <TooltipProvider delayDuration={0}><Tooltip><TooltipTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/projects/${project.id}/edit`)}>
                                <Edit className="h-4 w-4" /><span className="sr-only">Edit</span>
                            </Button>
                        </TooltipTrigger><TooltipContent><p>Edit Project</p></TooltipContent></Tooltip></TooltipProvider>
                    </CardFooter>
                  </Card>
                 );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}