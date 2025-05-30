"use client"

import Link from "next/link"
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  LifeBuoy,
  LogOut,
  Menu,
  Settings,
  User,
  Users, // For switch user icon
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth, useSwitchUser } from "@/components/auth-provider" // Adjust path as needed
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip" // For Bell icon

interface TopbarProps {
  onToggleSidebar?: () => void // For desktop sidebar
  onToggleMobileSidebar?: () => void // Specifically for mobile overlay sidebar
  sidebarCollapsed?: boolean
}

export function Topbar({
  onToggleSidebar,
  onToggleMobileSidebar, // Use this for the Menu button
  sidebarCollapsed,
}: TopbarProps) {
  const { user, logout } = useAuth()
  const { switchToUser, sampleUsers } = useSwitchUser()

  // Determine the correct toggle function for the mobile menu
  const handleMobileMenuToggle = onToggleMobileSidebar || onToggleSidebar;

  const getInitials = (name?: string) => {
    if (!name) return ""
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        {/* Mobile Menu Toggle (for overlay/drawer sidebar) */}
        {handleMobileMenuToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMobileMenuToggle}
            className="md:hidden" // Show only on mobile
            aria-label="Toggle mobile menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Desktop Sidebar Toggle (for inline sidebar) */}
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hidden md:inline-flex" // Show only on desktop
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        )}

        {/* Placeholder for Breadcrumbs or Page Title */}
        {/* <div className="hidden md:block">
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div> */}
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {/* Optional: Add a badge for notification count */}
                {/* <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">3</span> */}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={user?.avatar || `https://avatar.vercel.sh/${user?.email || 'user'}.png`} // Vercel Avatars as a fallback
                  alt={user?.name || "User Avatar"}
                />
                <AvatarFallback>{getInitials(user?.name) || getInitials(user?.email)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name || "User Name"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                  {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                  {/* <DropdownMenuShortcut>⌘S</DropdownMenuShortcut> */}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            {/* Switch User Demo Section - Conditionally render if sampleUsers exist */}
            {sampleUsers && sampleUsers.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Switch User (Demo)</DropdownMenuLabel>
                {sampleUsers.map((sampleUser) => (
                  <DropdownMenuItem
                    key={sampleUser.id}
                    onClick={() => switchToUser(sampleUser.role)} // Ensure this matches useSwitchUser
                    className="cursor-pointer"
                  >
                    <Avatar className="mr-2 h-5 w-5 border text-xs">
                       <AvatarImage src={`https://avatar.vercel.sh/${sampleUser.email || sampleUser.name}.png`} />
                      <AvatarFallback>{getInitials(sampleUser.name)}</AvatarFallback>
                    </Avatar>
                    <span>{sampleUser.name} <span className="text-xs text-muted-foreground">({sampleUser.role.replace("_", " ")})</span></span>
                  </DropdownMenuItem>
                ))}
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
              {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}