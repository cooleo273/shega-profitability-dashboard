"use client"

import { Chart, ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"

// Process time logs into chart data
function processLogsForChart(logs) {
  // Create a map of days with billable and non-billable hours
  const dayMap = {
    Mon: { name: "Mon", billable: 0, nonBillable: 0 },
    Tue: { name: "Tue", billable: 0, nonBillable: 0 },
    Wed: { name: "Wed", billable: 0, nonBillable: 0 },
    Thu: { name: "Thu", billable: 0, nonBillable: 0 },
    Fri: { name: "Fri", billable: 0, nonBillable: 0 },
  }

  // Process each log
  logs.forEach((log) => {
    const date = new Date(log.date)
    const day = date.toLocaleDateString("en-US", { weekday: "short" }).substring(0, 3)

    if (dayMap[day]) {
      if (log.billable) {
        dayMap[day].billable += log.hours
      } else {
        dayMap[day].nonBillable += log.hours
      }
    }
  })

  // Convert map to array
  return Object.values(dayMap)
}

export function TimeLogChart({ logs }) {
  const chartData = processLogsForChart(logs)

  return (
    <ChartContainer>
      <Chart>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
            barGap={0}
            barCategoryGap={8}
            animationDuration={600}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}h`}
              domain={[0, "dataMax + 1"]}
            />
            <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value} hours`} />} />
            <Bar 
              dataKey="billable" 
              fill="#009A6A" 
              name="Billable" 
              radius={[8, 8, 0, 0]} 
              animationDuration={800}
            />
            <Bar 
              dataKey="nonBillable" 
              fill="#94A3B8" 
              name="Non-Billable" 
              radius={[8, 8, 0, 0]} 
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </Chart>
      <ChartLegend>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#009A6A]" />
          <span className="text-xs">Billable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#94A3B8]" />
          <span className="text-xs">Non-Billable</span>
        </div>
      </ChartLegend>
    </ChartContainer>
  )
}
