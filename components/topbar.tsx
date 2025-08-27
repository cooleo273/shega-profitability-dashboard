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
  Users,
  Search,
  Command,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth, useSwitchUser } from "@/components/auth-provider"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useState, useEffect } from "react"

interface TopbarProps {
  onToggleSidebar?: () => void
  onToggleMobileSidebar?: () => void
  sidebarCollapsed?: boolean
}

export function Topbar({
  onToggleSidebar,
  onToggleMobileSidebar,
  sidebarCollapsed,
}: TopbarProps) {
  const { user, logout } = useAuth()
  const { switchToUser, sampleUsers } = useSwitchUser()
  const [open, setOpen] = useState(false)

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

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {/* Mobile Menu Toggle */}
          {handleMobileMenuToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMobileMenuToggle}
              className="md:hidden"
              aria-label="Toggle mobile menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Desktop Sidebar Toggle */}
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="hidden md:inline-flex"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Search Button */}
          <Button
            variant="outline"
            className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
            onClick={() => setOpen(true)}
          >
            <Search className="h-4 w-4 xl:mr-2" />
            <span className="hidden xl:inline-flex">Search...</span>
            <span className="sr-only">Search</span>
            <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
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
                    src={user?.avatar || `https://avatar.vercel.sh/${user?.email || 'user'}.png`}
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
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              {sampleUsers && sampleUsers.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Switch User (Demo)</DropdownMenuLabel>
                  {sampleUsers.map((sampleUser) => (
                    <DropdownMenuItem
                      key={sampleUser.id}
                      onClick={() => switchToUser(sampleUser.role)}
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
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <Search className="mr-2 h-4 w-4" />
              <span>Search Projects</span>
            </CommandItem>
            <CommandItem>
              <Users className="mr-2 h-4 w-4" />
              <span>Search Users</span>
            </CommandItem>
            <CommandItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Search Settings</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Recent">
            <CommandItem>
              <span>Project Alpha</span>
            </CommandItem>
            <CommandItem>
              <span>Project Beta</span>
            </CommandItem>
            <CommandItem>
              <span>Project Gamma</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}