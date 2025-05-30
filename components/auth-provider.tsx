"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"

// Define user roles
export type UserRole = "system_admin" | "finance_manager" | "project_manager" | "executive" | "project_member"

// Define user type
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

// Define auth context type
interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Sample users for demonstration
const sampleUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "system_admin",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "2",
    name: "Finance Manager",
    email: "finance@example.com",
    role: "finance_manager",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "3",
    name: "Project Manager",
    email: "pm@example.com",
    role: "project_manager",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "4",
    name: "Executive",
    email: "exec@example.com",
    role: "executive",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "5",
    name: "Team Member",
    email: "member@example.com",
    role: "project_member",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

// Default user for demonstration
const defaultUser = sampleUsers[0]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Check localStorage for saved user on initial load
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    return savedUser ? JSON.parse(savedUser) : defaultUser
  })

  const login = (user: User) => {
    setUser(user)
    // Save user to localStorage
    localStorage.setItem('user', JSON.stringify(user))
  }

  const logout = () => {
    setUser(null)
    // Remove user from localStorage
    localStorage.removeItem('user')
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Helper function to switch between sample users (for demo purposes)
export function useSwitchUser() {
  const { login } = useAuth()

  const switchToUser = (role: UserRole) => {
    const user = sampleUsers.find((u) => u.role === role) || sampleUsers[0]
    login(user)
  }

  return { switchToUser, sampleUsers }
}
