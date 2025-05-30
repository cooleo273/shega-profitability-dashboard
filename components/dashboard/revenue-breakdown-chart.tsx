"use client"

import React, { useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from "recharts" // Removed Legend as we'll make a custom one
import type { TooltipProps } from "recharts"
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

// Your COLORS and data structure are good.
// Note: Recharts <Cell fill> doesn't directly consume complex gradient objects like this.
// You'd need to define <linearGradient> in <defs> and reference by ID.
// For simplicity, we'll use COLORS.xxx.main for fill.
const COLORS_DATA = [
  { name: "Web Development", value: 420000, color: "#10B981", id: "web" },
  { name: "Mobile Apps", value: 320000, color: "#3B82F6", id: "mobile" },
  { name: "UI/UX Design", value: 180000, color: "#8B5CF6", id: "uiUx" },
  { name: "Consulting", value: 150000, color: "#F59E0B", id: "consulting" },
  { name: "Maintenance", value: 90000, color: "#6B7280", id: "maintenance" },
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value)
}

const totalRevenue = COLORS_DATA.reduce((sum, item) => sum + item.value, 0)

const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const entry = payload[0].payload // Recharts wraps original data in `payload` object
    const percentage = ((entry.value / totalRevenue) * 100).toFixed(1)
    return (
      <div className="rounded-xl border border-border bg-popover p-3.5 shadow-xl transform transition-all duration-150 ease-out scale-105">
        <div className="flex items-center mb-2">
          <span className="mr-2.5 inline-block h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }}/>
          <p className="text-sm font-semibold text-popover-foreground">{entry.name}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Revenue: <span className="font-medium text-popover-foreground">{formatCurrency(entry.value)}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Share: <span className="font-medium text-popover-foreground">{percentage}%</span>
          </p>
        </div>
      </div>
    )
  }
  return null
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g className="transition-all duration-300 ease-out focus:outline-none" tabIndex={-1}>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6} // Pop out more
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="hsl(var(--background))" // Or var(--card) depending on chart bg
        strokeWidth={3}
        style={{
          filter: `drop-shadow(0 6px 12px ${fill}50)`, // Enhanced shadow
          transform: 'translateY(-2px) scale(1.02)', // Lift and slightly scale
        }}
      />
      {/* Optional inner ring for active state - subtle */}
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 3} // Adjust thickness
        outerRadius={innerRadius - 1} // Adjust thickness
        fill={fill}
        opacity={0.5}
      />
    </g>
  );
};

// This is now a combined Legend and Details Panel
const ChartDetailsPanel = ({ activeIndex, setActiveIndex }: { activeIndex: number | undefined, setActiveIndex: (index: number | undefined) => void }) => {
  return (
    <div className="flex flex-col justify-center items-start md:p-6 space-y-5 h-full">
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Total Revenue</p>
        <p className="text-xl text-foreground">{formatCurrency(totalRevenue)}</p>
      </div>
      <div className="space-y-1 w-full">
        {COLORS_DATA.map((entry, index) => (
          <button
            key={`legend-${entry.id}`}
            className={`flex items-center group w-full text-left py-1 px-2.5 rounded-lg transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:ring-[${entry.color}]`}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(undefined)}
            onClick={() => setActiveIndex(index === activeIndex ? undefined : index)} // Toggle active state on click
            style={{
              backgroundColor: activeIndex === index ? `${entry.color}20` : 'transparent', // Subtle bg for active/hovered
            }}
          >
            <span
              className="mr-3 inline-block h-4 w-4 flex-shrink-0 rounded-full transition-all duration-200 ease-out group-hover:scale-110"
              style={{
                backgroundColor: entry.color,
                boxShadow: `0 0 0 2px hsl(var(--card)), 0 0 0 3px ${entry.color}${activeIndex === index ? '90' : '50'}`,
              }}
            />
            <div className="flex-grow flex justify-between items-center min-w-0">
              <span className={`text-sm font-medium truncate transition-colors ${activeIndex === index ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                {entry.name}
              </span>
              <span className={`text-sm font-semibold transition-colors ${activeIndex === index ? `text-[${entry.color}]` : 'text-foreground group-hover:text-foreground'}`}>
                {((entry.value / totalRevenue) * 100).toFixed(0)}%
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};


export function RevenueBreakdownChart() {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  const onPieLeave = () => {
    // Don't clear activeIndex on pie leave if legend is controlling it
  };

  return (
    <div className="relative h-[300px] w-full bg-card rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row overflow-hidden">
      {/* Chart Area (Left Side) */}
      <div className="w-full md:w-3/5 h-1/2 md:h-full p-2 flex items-center justify-center"> {/* Adjusted width and centering */}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            {/* Removed <Legend /> component from Recharts */}
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={COLORS_DATA} // Use your data array
              cx="50%" // Center within its own container
              cy="50%"
              labelLine={false}
              innerRadius="60%" // Adjust for desired donut thickness
              outerRadius="85%" // Adjust based on container size
              fill="#8884d8" // Default, overridden by Cell
              dataKey="value"
              nameKey="name" // Ensure this matches your data structure
              paddingAngle={2}
              stroke="hsl(var(--background))" // or --card
              strokeWidth={4}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave} // Keep this to allow tooltip to disappear
              animationDuration={800}
              animationEasing="ease-out"
            >
              {COLORS_DATA.map((entry, index) => (
                <Cell
                  key={`cell-${entry.id}`}
                  fill={entry.color} // Use main color for fill
                  style={{
                    filter: activeIndex === index ? undefined : `drop-shadow(0 1px 2px ${entry.color}20)`, // Subtle shadow for non-active
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Smoother transition
                    opacity: activeIndex === undefined || activeIndex === index ? 1 : 0.55, // Dim inactive more
                    transform: activeIndex === index ? 'scale(1.0)' : 'scale(0.98)', // Slight shrink for inactive
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'transparent' }} // No cursor line for pie
              wrapperStyle={{ outline: 'none' }}
              position={{ y: 0 }} // Try to position tooltip nicely
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full md:w-2/5 h-1/2 md:h-full border-t md:border-t-0 md:border-l border-border overflow-y-auto">
        <ChartDetailsPanel activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
      </div>
    </div>
  )
}