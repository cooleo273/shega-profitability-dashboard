import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { DashboardLayout } from "@/components/dashboard-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Project Profitability Dashboard",
  description: "Track and manage project profitability",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white text-neutral-900`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <DashboardLayout>{children}</DashboardLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
