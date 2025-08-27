"use client"

import { useState } from "react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Placeholder data for the chart
const visitorsData = {
  "Last 3 months": [
    { date: "Apr 6", visitors: 200, prevVisitors: 180 },
    { date: "Apr 12", visitors: 300, prevVisitors: 250 },
    { date: "Apr 18", visitors: 250, prevVisitors: 200 },
    { date: "Apr 24", visitors: 350, prevVisitors: 300 },
    { date: "Apr 30", visitors: 280, prevVisitors: 230 },
    { date: "May 6", visitors: 400, prevVisitors: 350 },
    { date: "May 12", visitors: 320, prevVisitors: 280 },
    { date: "May 18", visitors: 450, prevVisitors: 400 },
    { date: "May 24", visitors: 380, prevVisitors: 330 },
    { date: "May 30", visitors: 500, prevVisitors: 450 },
    { date: "Jun 5", visitors: 420, prevVisitors: 370 },
    { date: "Jun 11", visitors: 550, prevVisitors: 500 },
    { date: "Jun 17", visitors: 480, prevVisitors: 430 },
    { date: "Jun 23", visitors: 600, prevVisitors: 550 },
    { date: "Jun 30", visitors: 520, prevVisitors: 470 },
  ],
  "Last 30 days": [
    { date: "Jun 1", visitors: 380, prevVisitors: 330 },
    { date: "Jun 5", visitors: 420, prevVisitors: 370 },
    { date: "Jun 9", visitors: 450, prevVisitors: 400 },
    { date: "Jun 13", visitors: 500, prevVisitors: 450 },
    { date: "Jun 17", visitors: 480, prevVisitors: 430 },
    { date: "Jun 21", visitors: 550, prevVisitors: 500 },
    { date: "Jun 25", visitors: 520, prevVisitors: 470 },
    { date: "Jun 29", visitors: 600, prevVisitors: 550 },
  ],
  "Last 7 days": [
    { date: "Jun 24", visitors: 580, prevVisitors: 530 },
    { date: "Jun 25", visitors: 520, prevVisitors: 470 },
    { date: "Jun 26", visitors: 550, prevVisitors: 500 },
    { date: "Jun 27", visitors: 530, prevVisitors: 480 },
    { date: "Jun 28", visitors: 590, prevVisitors: 540 },
    { date: "Jun 29", visitors: 600, prevVisitors: 550 },
    { date: "Jun 30", visitors: 570, prevVisitors: 520 },
  ],
};

type TimePeriod = "Last 3 months" | "Last 30 days" | "Last 7 days";

export function TotalVisitorsChart() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("Last 3 months");
  const data = visitorsData[selectedPeriod];

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">Total Visitors</CardTitle>
          <p className="text-sm text-muted-foreground">Total for the {selectedPeriod.toLowerCase()}</p>
        </div>
        <div className="flex space-x-2">
          {(Object.keys(visitorsData) as TimePeriod[]).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className={cn(
                selectedPeriod === period ? "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800" : "",
                "min-w-[100px]"
              )}
            >
              {period}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="h-[350px] p-0 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="visitors"
              stroke="#3B82F6"
              fill="url(#colorVisitors)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="prevVisitors"
              stroke="#EF4444"
              fill="url(#colorPrevVisitors)"
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPrevVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 