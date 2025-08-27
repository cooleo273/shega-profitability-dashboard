"use client"

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Sector,
} from "recharts"
import type { TooltipProps } from "recharts"
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"
import { useState } from "react"

interface CostData {
  type: string
  _sum: {
    amount: number
  }
}

interface CostDistributionChartProps {
  data: CostData[]
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5']

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const entry = payload[0].payload
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-xl">
        <div className="flex items-center mb-2">
          <span className="mr-2.5 inline-block h-3 w-3 rounded-full" style={{ backgroundColor: entry.fill }}/>
          <p className="text-sm font-semibold text-card-foreground">{entry.name}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Amount: <span className="font-medium text-card-foreground">{formatCurrency(entry.value)}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Share: <span className="font-medium text-card-foreground">{entry.percent ? (entry.percent * 100).toFixed(1) : 0}%</span>
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
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="hsl(var(--background))"
        strokeWidth={3}
        style={{
          filter: `drop-shadow(0 6px 12px ${fill}50)`,
          transform: 'translateY(-2px) scale(1.02)',
        }}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 3}
        outerRadius={innerRadius - 1}
        fill={fill}
        opacity={0.5}
      />
    </g>
  );
};

export function CostDistributionChart({ data }: CostDistributionChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  // Transform data for the chart
  const chartData = data.map(item => ({
    name: item.type,
    value: item._sum.amount
  }))

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  return (
    <div className="relative h-[300px] w-full bg-card rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value: string) => (
              <span className="text-xs text-muted-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}