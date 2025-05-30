"use client"

import { format } from "date-fns"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"

// Mock variance data
const varianceData = [
	{
		category: "Labor",
		budget: 120000,
		actual: 105000,
		variance: 15000,
		variancePercent: 12.5,
	},
	{
		category: "Materials",
		budget: 50000,
		actual: 55000,
		variance: -5000,
		variancePercent: -10,
	},
	{
		category: "Software",
		budget: 30000,
		actual: 28000,
		variance: 2000,
		variancePercent: 6.67,
	},
	{
		category: "Travel",
		budget: 15000,
		actual: 12000,
		variance: 3000,
		variancePercent: 20,
	},
	{
		category: "Equipment",
		budget: 25000,
		actual: 30000,
		variance: -5000,
		variancePercent: -20,
	},
	{
		category: "Contractors",
		budget: 80000,
		actual: 85000,
		variance: -5000,
		variancePercent: -6.25,
	},
	{
		category: "Marketing",
		budget: 40000,
		actual: 35000,
		variance: 5000,
		variancePercent: 12.5,
	},
]

// Project-specific variance data
const projectVarianceData = {
	"1": [
		// Website Redesign
		{
			category: "Design",
			budget: 20000,
			actual: 18000,
			variance: 2000,
			variancePercent: 10,
		},
		{
			category: "Development",
			budget: 40000,
			actual: 25000,
			variance: 15000,
			variancePercent: 37.5,
		},
		{
			category: "Testing",
			budget: 10000,
			actual: 2000,
			variance: 8000,
			variancePercent: 80,
		},
		{
			category: "Project Management",
			budget: 5000,
			actual: 0,
			variance: 5000,
			variancePercent: 100,
		},
	],
	"2": [
		// Mobile App Development
		{
			category: "UI Design",
			budget: 30000,
			actual: 32000,
			variance: -2000,
			variancePercent: -6.67,
		},
		{
			category: "Frontend",
			budget: 45000,
			actual: 40000,
			variance: 5000,
			variancePercent: 11.11,
		},
		{
			category: "Backend",
			budget: 35000,
			actual: 30000,
			variance: 5000,
			variancePercent: 14.29,
		},
		{
			category: "QA",
			budget: 10000,
			actual: 8000,
			variance: 2000,
			variancePercent: 20,
		},
	],
}

interface VarianceReportProps {
	dateRange: {
		from: Date
		to: Date
	}
	projectId: string
	metric: string
}

export function VarianceReport({ dateRange, projectId, metric }: VarianceReportProps) {
	const [useMock, setUseMock] = useState(false)
	const [realData, setRealData] = useState<typeof varianceData>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!useMock) {
			setLoading(true)
			setError(null)
			const from = dateRange.from.toISOString().split("T")[0]
			const to = dateRange.to.toISOString().split("T")[0]
			const params = new URLSearchParams({ from, to })
			if (projectId !== "all") params.append("projectId", projectId)
			fetch(`/api/reports/variance?${params.toString()}`)
				.then((res) => {
					if (!res.ok) throw new Error("No real data available")
					return res.json()
				})
				.then((data) => setRealData(data))
				.catch((err) => setError(err.message))
				.finally(() => setLoading(false))
		}
	}, [dateRange.from, dateRange.to, projectId, useMock])

	// Get data based on project selection and mock toggle
	const data: typeof varianceData =
		useMock
			? (projectId !== "all" && (projectVarianceData as Record<string, typeof varianceData>)[projectId]
				? (projectVarianceData as Record<string, typeof varianceData>)[projectId]
				: varianceData)
			: realData && realData.length > 0
				? realData
				: []

	// Calculate totals
	const totalBudget = data.reduce((sum: number, item) => sum + item.budget, 0)
	const totalActual = data.reduce((sum: number, item) => sum + item.actual, 0)
	const totalVariance = totalBudget - totalActual
	const totalVariancePercent = totalBudget > 0 ? (totalVariance / totalBudget) * 100 : 0

	// Format currency
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value)
	}

	// Prepare data for horizontal bar chart
	const chartData = [...data].sort((a, b) => a.variancePercent - b.variancePercent)

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2 mb-2">
				<Switch checked={useMock} onCheckedChange={setUseMock} />
				<span>Show Mock Data</span>
				{loading && <span className="text-xs text-muted-foreground ml-2">Loading real data...</span>}
				{error && <span className="text-xs text-destructive ml-2">{error}</span>}
			</div>
			{!useMock && !loading && !error && data.length === 0 && (
				<div className="text-center text-muted-foreground py-8">
					No data available for the selected filters.
				</div>
			)}
			{(useMock || data.length > 0) && (
				<>
					<div className="grid gap-4 md:grid-cols-4">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium">Total Budget</CardTitle>
								<CardDescription>
									{format(dateRange.from, "MMM d, yyyy")} -{" "}
									{format(dateRange.to, "MMM d, yyyy")}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium">Total Actual</CardTitle>
								<CardDescription>
									{format(dateRange.from, "MMM d, yyyy")} -{" "}
									{format(dateRange.to, "MMM d, yyyy")}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{formatCurrency(totalActual)}</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium">Total Variance</CardTitle>
								<CardDescription>
									{format(dateRange.from, "MMM d, yyyy")} -{" "}
									{format(dateRange.to, "MMM d, yyyy")}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div
									className={`text-2xl font-bold ${
										totalVariance >= 0 ? "text-green-600" : "text-red-600"
									}`}
								>
									{formatCurrency(totalVariance)}
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium">Variance %</CardTitle>
								<CardDescription>
									{format(dateRange.from, "MMM d, yyyy")} -{" "}
									{format(dateRange.to, "MMM d, yyyy")}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div
									className={`text-2xl font-bold ${
										totalVariancePercent >= 0 ? "text-green-600" : "text-red-600"
									}`}
								>
									{totalVariancePercent.toFixed(1)}%
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="grid gap-6 md:grid-cols-2">
						<Card className="md:col-span-2">
							<CardHeader>
								<CardTitle>Budget vs. Actual by Category</CardTitle>
								<CardDescription>
									Comparison of budgeted and actual costs by category
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-[400px]">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart
											data={chartData}
											layout="vertical"
											margin={{
												top: 20,
												right: 30,
												left: 70,
												bottom: 5,
											}}
										>
											<CartesianGrid
												strokeDasharray="3 3"
												horizontal={true}
												vertical={false}
											/>
											<XAxis type="number" tickFormatter={(value) => `${value}%`} />
											<YAxis type="category" dataKey="category" width={100} />
											<Tooltip
												formatter={(value, name) => {
													return [`${value}%`, "Variance"]
												}}
												labelFormatter={(value) => `Category: ${value}`}
												animationDuration={300}
											/>
											<Bar
												dataKey="variancePercent"
												name="Variance %"
												radius={[0, 8, 8, 0]}
												animationDuration={800}
											>
												{chartData.map((entry, index) => (
													<Cell
														key={`cell-${index}`}
														fill={
															entry.variancePercent >= 0
																? "#009A6A"
																: "#ef4444"
														}
													/>
												))}
											</Bar>
										</BarChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>

						<Card className="md:col-span-2">
							<CardHeader>
								<CardTitle>Variance Analysis</CardTitle>
								<CardDescription>
									Detailed breakdown of budget variance by category
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="rounded-md border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Category</TableHead>
												<TableHead className="text-right">Budget</TableHead>
												<TableHead className="text-right">Actual</TableHead>
												<TableHead className="text-right">Variance</TableHead>
												<TableHead className="text-right">Variance %</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{data.map((item) => (
												<TableRow key={item.category}>
													<TableCell className="font-medium">
														{item.category}
													</TableCell>
													<TableCell className="text-right">
														{formatCurrency(item.budget)}
													</TableCell>
													<TableCell className="text-right">
														{formatCurrency(item.actual)}
													</TableCell>
													<TableCell
														className={`text-right ${
															item.variance >= 0
																? "text-green-600"
																: "text-red-600"
														}`}
													>
														{formatCurrency(item.variance)}
													</TableCell>
													<TableCell
														className={`text-right ${
															item.variancePercent >= 0
																? "text-green-600"
																: "text-red-600"
														}`}
													>
														{item.variancePercent.toFixed(1)}%
													</TableCell>
												</TableRow>
											))}
											<TableRow className="font-medium">
												<TableCell>Total</TableCell>
												<TableCell className="text-right">
													{formatCurrency(totalBudget)}
												</TableCell>
												<TableCell className="text-right">
													{formatCurrency(totalActual)}
												</TableCell>
												<TableCell
													className={`text-right ${
														totalVariance >= 0
															? "text-green-600"
															: "text-red-600"
													}`}
												>
													{formatCurrency(totalVariance)}
												</TableCell>
												<TableCell
													className={`text-right ${
														totalVariancePercent >= 0
															? "text-green-600"
															: "text-red-600"
													}`}
												>
													{totalVariancePercent.toFixed(1)}%
												</TableCell>
											</TableRow>
										</TableBody>
									</Table>
								</div>
							</CardContent>
						</Card>
					</div>
				</>
			)}
		</div>
	)
}
