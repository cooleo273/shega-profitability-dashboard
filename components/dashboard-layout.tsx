"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar" // Adjust path as needed
import { Topbar } from "@/components/topbar"   // Adjust path as needed

// A simple hook to check if we're on the client-side (for localStorage)
function useIsClient() {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  return isClient
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isClient = useIsClient()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()

  // Load sidebar state from localStorage on component mount (client-side only)
  useEffect(() => {
    if (!isClient) return;
    const savedState = localStorage.getItem("sidebarCollapsed")
    if (savedState !== null) {
      setSidebarCollapsed(savedState === "true")
    }
  }, [isClient])

  // Save sidebar state to localStorage when it changes (client-side only)
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem("sidebarCollapsed", String(sidebarCollapsed))
  }, [sidebarCollapsed, isClient])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev)
  }, [])

  // Determine if sidebar and topbar should be shown
  const showLayoutElements = pathname !== "/login" && !pathname.startsWith("/auth"); // Add other auth paths if needed

  if (!showLayoutElements) {
    return <>{children}</>; // Render children directly for login/auth pages
  }

  return (
    <div className="flex min-h-screen bg-muted/40 dark:bg-muted/20">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "md:ml-16" : "md:ml-64" // Apply margin only on md and up
        } ml-0`} // No margin on mobile, sidebar will overlay or be hidden
      >
        <Topbar
          onToggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Max width container for the content */}
          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}