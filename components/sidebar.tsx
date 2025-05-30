"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Cog,
  DollarSign,
  FolderKanban,
  Home,
  LayoutDashboard,
  LogOut,
  PieChart,
  Settings,
  Timer,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth, type UserRole } from "@/components/auth-provider" // Adjust path as needed
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip" // For collapsed item titles
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" // For user avatar

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  roles: UserRole[]
  children?: NavItem[] // Children can also have children, but keep it simple for now
  exactMatch?: boolean // Optional: for routes where parent shouldn't be active if child is
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["system_admin", "finance_manager", "project_manager", "executive", "project_member"],
    exactMatch: true,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderKanban,
    roles: ["system_admin", "project_manager", "executive"],
  },
  {
    title: "Users",
    href: "/users",
    icon: Users, 
    roles:["system_admin"]
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users, 
    roles:["system_admin"]
  },
  {
    title: "My Projects", // Specific to project_member
    href: "/my-projects", // Assuming a different route for "My Projects"
    icon: FolderKanban,
    roles: ["project_member"],
  },
  {
    title: "Time Logs",
    href: "/time-logs",
    icon: Timer,
    roles: ["project_member", "project_manager"], // PMs might also view/manage time logs
  },
  {
    title: "Finance",
    href: "/finance",
    icon: PieChart,
    roles: ["system_admin", "finance_manager", "executive"],
    children: [
      {
        title: "Overview",
        href: "/finance",
        icon: PieChart, // Can be same or different
        roles: ["system_admin", "finance_manager", "executive"],
        exactMatch: true,
      },
      {
        title: "Rates",
        href: "/finance/rates",
        icon: DollarSign,
        roles: ["system_admin", "finance_manager"],
      },
    ],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["system_admin", "finance_manager", "project_manager", "executive"],
  },
  {
    title: "Admin",
    href: "/admin",
    icon: Settings, // Changed from Cog for variety, Cog is also fine
    roles: ["system_admin"],
    children: [
      {
        title: "User Management",
        href: "/admin/users",
        icon: Users,
        roles: ["system_admin"],
      },
      {
        title: "System Settings",
        href: "/admin/settings", // Example: if different from /admin
        icon: Cog,
        roles: ["system_admin"],
      },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth() // Assuming logout is available from useAuth
  const pathname = usePathname()

  const filteredNavItems = user
    ? navItems.filter((item) => item.roles.includes(user.role))
    : []

  const renderNavItem = (item: NavItem, isChild: boolean = false) => {
    const isParentActive = item.children?.some(child => pathname.startsWith(child.href)) ?? false
    const isActive = item.exactMatch ? pathname === item.href : pathname.startsWith(item.href) || isParentActive

    const linkContent = (
      <>
        <item.icon
          className={cn(
            "h-5 w-5 flex-shrink-0",
            collapsed && !isChild ? "mx-auto" : "mr-3"
          )}
        />
        {!collapsed && <span className="truncate">{item.title}</span>}
      </>
    )

    const linkClasses = cn(
      "flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150 group",
      isChild ? "py-2 pl-[2.875rem]" : "px-3", // Indent child items, adjust pl if icon margin changes
      collapsed && !isChild ? "justify-center" : "justify-start",
      isActive
        ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary hover:bg-primary/15 dark:hover:bg-primary/25"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-muted/30"
    )

    const linkElement = (
       <Link href={item.href} className={linkClasses}>
         {linkContent}
       </Link>
    )

    return (
      <div key={item.title + item.href}>
        {collapsed && !isChild ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>{linkElement}</TooltipTrigger>
              <TooltipContent side="right" className="ml-2">
                {item.title}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          linkElement
        )}

        {!collapsed && item.children && (isActive || isParentActive) && (
          <div className="mt-1 space-y-1">
            {item.children
              .filter((child) => user && child.roles.includes(user.role))
              .map((child) => renderNavItem(child, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden h-full flex-col border-r bg-card shadow-lg transition-all duration-300 ease-in-out md:flex",
        // On mobile (screens smaller than `md`), this sidebar will be hidden by default.
        // You'd need a separate mobile-specific toggle in Topbar to show it as an overlay.
        // For now, focusing on desktop collapse/expand.
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 shrink-0 items-center border-b px-3.5">
        <Link href="/dashboard" className="flex items-center gap-2.5 group w-full">
          <div className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform duration-300 ease-out group-hover:scale-110",
            !collapsed && "group-hover:rotate-[12deg]"
            )}>
            <Home className="h-5 w-5" /> {/* Replace with your actual logo icon */}
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-foreground truncate">
              ProfitTrack
            </span>
          )}
        </Link>
        {/* This button is part of the sidebar itself for collapsing on desktop */}
        <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn("h-9 w-9 shrink-0", collapsed ? "ml-auto" : "ml-1")} // Adjust margin for better positioning
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
        </Button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
        <div className="space-y-1 px-2">
          {filteredNavItems.map((item) => renderNavItem(item))}
        </div>
      </nav>

      {/* Sidebar Footer - User Info & Logout */}
      {user && (
        <div className="mt-auto border-t p-3">
          {collapsed ? (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-full h-10" onClick={logout}>
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">Logout</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">Logout</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatar} alt={user.name || user.email} />
                  <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{user.name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.role.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}