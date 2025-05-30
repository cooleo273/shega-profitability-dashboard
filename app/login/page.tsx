"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { useAuth, useSwitchUser } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()
  const { switchToUser, sampleUsers } = useSwitchUser()

  const handleDemoLogin = (role: string) => {
    const demoUser = sampleUsers.find(user => user.role === role)
    if (demoUser) {
      login(demoUser)
      router.push("/dashboard")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Find the matching user from sample users
      const matchedUser = sampleUsers.find(
        (user) => user.email === email
      )

      if (matchedUser) {
        // For demo purposes, we're not checking the password
        login(matchedUser)
        router.push("/dashboard")
      } else {
        console.error("Login failed: Invalid credentials")
        alert("Invalid credentials. Please try again.")
      }
    } catch (error) {
      console.error("Login failed:", error)
      alert("An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm rounded-xl shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">ProfitTrack</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleDemoLogin("system_admin")}
                className="w-full"
              >
                Admin Demo
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleDemoLogin("finance_manager")}
                className="w-full"
              >
                Finance Demo
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleDemoLogin("project_manager")}
                className="w-full"
              >
                PM Demo
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleDemoLogin("project_member")}
                className="w-full"
              >
                Member Demo
              </Button>
            </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-50 px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button variant="link" size="sm" className="h-auto p-0 text-sm text-[#009A6A]">
                    Forgot password?
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-10 w-10 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label htmlFor="remember" className="text-sm">
                  Remember me
                </Label>
              </div>
              <Button type="submit" className="w-full bg-[#009A6A] hover:bg-[#007d57]" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-500">
          <p className="w-full">Sample logins: admin@example.com, finance@example.com, pm@example.com</p>
        </CardFooter>
      </Card>
    </div>
  )
}
