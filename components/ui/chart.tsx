import type * as React from "react"

import { cn } from "@/lib/utils"

export const ChartContainer = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("rounded-md border bg-card p-4 shadow-sm", className)} {...props} />
}

export const Chart = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("", className)} {...props} />
}

export const ChartTooltipContent = ({
  formatter,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { formatter?: (value: number) => string }) => {
  return (
    <div className={cn("rounded-md border bg-popover p-2 shadow-sm", className)} {...props}>
      {props.payload &&
        props.payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span style={{ color: item.color }}>{item.name}:</span>
            <span>{formatter ? formatter(item.value) : item.value}</span>
          </div>
        ))}
    </div>
  )
}

export const ChartLegend = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export const ChartTooltip = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("", className)} {...props} />
}
