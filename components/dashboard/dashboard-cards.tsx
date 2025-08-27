"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease";
  description: string;
}

function DashboardCard({ title, value, change, changeType, description }: DashboardCardProps) {
  const ChangeIcon = changeType === "increase" ? ArrowUpRight : ArrowDown;
  const changeColorClass = changeType === "increase" ? "text-emerald-500" : "text-red-500";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <ChangeIcon className={cn("h-4 w-4", changeColorClass)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={cn("text-xs", changeColorClass)}>
          {change} {description}
        </p>
      </CardContent>
    </Card>
  );
}

export function DashboardCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <DashboardCard
        title="Total Revenue"
        value="$1,250.00"
        change="+12.5%"
        changeType="increase"
        description="Trending up this month"
      />
      <DashboardCard
        title="New Customers"
        value="1,234"
        change="-20%"
        changeType="decrease"
        description="Down 20% this period"
      />
      <DashboardCard
        title="Active Accounts"
        value="45,678"
        change="+12.5%"
        changeType="increase"
        description="Strong user retention"
      />
      <DashboardCard
        title="Growth Rate"
        value="4.5%"
        change="+4.5%"
        changeType="increase"
        description="Steady performance increase"
      />
    </div>
  );
} 