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
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth, type UserRole } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCallback, useState } from "react"

interface NavItem {
  title: string
  href?: string
  icon: React.ElementType
  roles: UserRole[]
  children?: NavItem[]
  exactMatch?: boolean
  soon?: boolean
}

const navItems: NavItem[] = [
  {
    title: "Dashboards",
    icon: LayoutDashboard,
    roles: ["system_admin", "finance_manager", "project_manager", "executive", "project_member"],
    children: [
      {
        title: "Default",
        href: "/dashboard",
        icon: Home,
        roles: ["system_admin", "finance_manager", "project_manager", "executive", "project_member"],
        exactMatch: true,
      },
    ],
  },
  {
    title: "Applications",
    icon: FolderKanban,
    roles: ["system_admin", "project_manager", "executive", "project_member"],
    children: [
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
        title: "My Projects",
        href: "/my-projects",
        icon: FolderKanban,
        roles: ["project_member"],
      },
      {
        title: "Time Logs",
        href: "/time-logs",
        icon: Timer,
        roles: ["project_member", "project_manager"],
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
            icon: PieChart,
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
        icon: Settings,
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
            href: "/admin/settings",
            icon: Cog,
            roles: ["system_admin"],
          },
        ],
      },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const filterNavItems = useCallback((items: NavItem[]): NavItem[] => {
    return items.reduce((acc: NavItem[], item) => {
      const userHasRole = user && item.roles.includes(user.role);
      let filteredChildren: NavItem[] = [];
      if (item.children) {
        filteredChildren = filterNavItems(item.children);
      }

      if (item.soon || userHasRole || filteredChildren.length > 0) {
        acc.push({
          ...item,
          children: filteredChildren.length > 0 ? filteredChildren : undefined,
        });
      }
      return acc;
    }, []);
  }, [user]);

  const filteredNavItems = filterNavItems(navItems);

  const renderNavItem = (item: NavItem, isChild: boolean = false, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isParentActive = hasChildren ? item.children?.some(child => {
      const checkChildActive = (c: NavItem): boolean => {
        if (c.href && (c.exactMatch ? pathname === c.href : pathname.startsWith(c.href))) {
          return true;
        }
        if (c.children) {
          return c.children.some(grandchild => checkChildActive(grandchild));
        }
        return false;
      };
      return checkChildActive(child);
    }) : false;
    const isActive = item.exactMatch ? pathname === item.href : 
      (item.href && pathname.startsWith(item.href)) || isParentActive;

    const linkContent = (
      <>
        <item.icon
          className={cn(
            "h-5 w-5 flex-shrink-0",
            collapsed && !isChild ? "mx-auto" : "mr-3"
          )}
        />
        {!collapsed && <span className="truncate">{item.title}</span>}
        {item.soon && !collapsed && (
          <span className="ml-auto rounded-full bg-muted-foreground/10 px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            Soon
          </span>
        )}
        {!collapsed && hasChildren && (
          <ChevronRight className={cn(
            "ml-auto h-4 w-4 shrink-0 transition-transform duration-200",
            (isActive || isParentActive) && "rotate-90"
          )} />
        )}
      </>
    );

    const linkElement = (
      <Link
        href={item.href || "#"}
        className={cn(
          "flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150 group",
          isChild ? `py-2 pl-[calc(1.5rem+${level * 0.75}rem)]` : "px-3",
          collapsed && !isChild ? "justify-center" : "justify-start",
          isActive && !item.soon
            ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary hover:bg-primary/15 dark:hover:bg-primary/25"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-muted/30",
          item.soon && "opacity-60 cursor-not-allowed"
        )}
        onClick={(e) => {
          if (item.soon) {
            e.preventDefault();
          } else if (hasChildren) {
            e.preventDefault();
            setOpenItems(prev => ({
              ...prev,
              [item.title]: !prev[item.title]
            }));
          }
        }}
      >
        {linkContent}
      </Link>
    );

    return (
      <div key={item.title + (item.href || '')}>
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

        {!collapsed && hasChildren && (isActive || isParentActive || openItems[item.title]) && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => renderNavItem(child, true, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden h-full flex-col border-r bg-card shadow-lg transition-all duration-300 ease-in-out md:flex",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 shrink-0 items-center border-b px-3.5">
        <Link href="/dashboard" className="flex items-center gap-2.5 group w-full">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg text-primary transition-transform duration-300 ease-out group-hover:scale-110">
            <Home className="h-6 w-6" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-foreground truncate">
              Studio Admin
            </span>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
        <div className="space-y-1 px-2">
          {!collapsed && (
            <div className="mb-4 text-xs font-semibold uppercase text-muted-foreground px-3">
              Dashboards
            </div>
          )}
          {filteredNavItems.filter(item => item.title === "Dashboards").map((item) => renderNavItem(item))}

          {!collapsed && (
            <div className="my-4 text-xs font-semibold uppercase text-muted-foreground px-3">
              Applications
            </div>
          )}
          {filteredNavItems.filter(item => item.title === "Applications").map((item) => renderNavItem(item))}

        </div>
      </nav>

      {user && (
        <div className="mt-auto border-t p-3">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/avatars/01.png" alt="@username" />
                <AvatarFallback>{user.name ? user.name.charAt(0) : 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name || "Arham Khan"}</span>
                <span className="text-xs text-muted-foreground">{user.email || "hello@arhamkhnz.com"}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={logout} className="ml-auto h-9 w-9">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          ) : (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-full h-10" onClick={logout}>
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">Logout</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  Logout
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
    </aside>
  )
}