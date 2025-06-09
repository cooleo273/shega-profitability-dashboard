"use client"

import { format } from "date-fns"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"


interface CostBreakdownReportProps {
	dateRange: {
		from: Date
		to: Date
	}
	projectId: string
}

type CostData = {
	month: string
	direct: number
	indirect: number
	categories: {
		labor: number
		materials: number
		contractors: number
		overhead: number
		software: number
		facilities: number
	}
}

export function CostBreakdownReport({ dateRange, projectId }: CostBreakdownReportProps) {
	const [data, setData] = useState<CostData[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [debugInfo, setDebugInfo] = useState<string | null>(null)

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true)
		setError(null)
			setDebugInfo(null)
			try {
				const fromDate = dateRange.from.toISOString().split('T')[0]
				const toDate = dateRange.to.toISOString().split('T')[0]
				const params = new URLSearchParams({ from: fromDate, to: toDate })
				if (projectId !== 'all') params.append('projectId', projectId)
				
				const url = `/api/reports/cost-breakdown?${params.toString()}`
				setDebugInfo(`Fetching from: ${url}`)
				
				const response = await fetch(url)
				if (!response.ok) {
					const errorData = await response.json()
					throw new Error(errorData.error || 'Failed to fetch cost breakdown data')
				}
				const result = await response.json()
				
				if (!Array.isArray(result)) {
					throw new Error('Invalid response format from server')
				}
				
				if (result.length === 0) {
					setDebugInfo(`No data found for date range: ${fromDate} to ${toDate}${projectId !== 'all' ? ` and project ID: ${projectId}` : ''}`)
				}
				
				setData(result)
			} catch (err) {
				console.error('Error fetching cost breakdown:', err)
				setError(err instanceof Error ? err.message : 'An unknown error occurred')
			} finally {
				setIsLoading(false)
			}
		}

		fetchData()
	}, [dateRange, projectId])

	// Calculate totals
	const totalDirect = data.reduce((sum, item) => sum + item.direct, 0)
	const totalIndirect = data.reduce((sum, item) => sum + item.indirect, 0)
	const totalCost = totalDirect + totalIndirect

	// Calculate category totals
	const categoryTotals = data.reduce((acc, item) => {
		Object.entries(item.categories).forEach(([category, amount]) => {
			acc[category] = (acc[category] || 0) + amount
		})
		return acc
	}, {} as Record<string, number>)

	// Format currency
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value)
	}

	// Loading state
	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center h-[350px]">
				<Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
				<span>Loading cost breakdown data...</span>
			</div>
		)
	}

	// Error state
	if (error) {
		return (
			<div className="space-y-4">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
				{debugInfo && (
					<Alert>
						<AlertTitle>Debug Information</AlertTitle>
						<AlertDescription>{debugInfo}</AlertDescription>
					</Alert>
				)}
			</div>
		)
	}

	// No data state
	if (data.length === 0) {
		return (
			<div className="space-y-4">
				<div className="text-center text-muted-foreground py-8">
					No data available for the selected filters.
				</div>
				{debugInfo && (
					<Alert>
						<AlertTitle>Debug Information</AlertTitle>
						<AlertDescription>{debugInfo}</AlertDescription>
					</Alert>
				)}
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Direct Costs</CardTitle>
						<CardDescription>
							{format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatCurrency(totalDirect)}</div>
						<p className="text-xs text-muted-foreground">{((totalDirect / totalCost) * 100).toFixed(1)}% of total</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Indirect Costs</CardTitle>
						<CardDescription>
							{format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatCurrency(totalIndirect)}</div>
						<p className="text-xs text-muted-foreground">{((totalIndirect / totalCost) * 100).toFixed(1)}% of total</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Total Costs</CardTitle>
						<CardDescription>
							{format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle>Cost Breakdown</CardTitle>
						<CardDescription>Direct vs. indirect costs over time</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-[350px]">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={data}
									margin={{
										top: 20,
										right: 30,
										left: 20,
										bottom: 5,
									}}
								>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="month" />
									<YAxis tickFormatter={(value) => `$${value / 1000}k`} />
									<Tooltip formatter={(value) => [formatCurrency(value as number), ""]} animationDuration={300} />
									<Legend />
									<Bar
										dataKey="direct"
										stackId="a"
										name="Direct Costs"
										fill="#009A6A"
										radius={[8, 8, 0, 0]}
									/>
									<Bar
										dataKey="indirect"
										stackId="a"
										name="Indirect Costs"
										fill="#94A3B8"
										radius={[8, 8, 0, 0]}
									/>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle>Cost Categories</CardTitle>
						<CardDescription>Breakdown of costs by category</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Category</TableHead>
										<TableHead className="text-right">Amount</TableHead>
										<TableHead className="text-right">% of Total</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{Object.entries(categoryTotals).map(([categoryName, amount]) => (
										<TableRow key={categoryName}>
											<TableCell className="font-medium capitalize">{categoryName}</TableCell>
											<TableCell className="text-right">{formatCurrency(amount)}</TableCell>
											<TableCell className="text-right">{((amount / totalCost) * 100).toFixed(1)}%</TableCell>
										</TableRow>
									))}
									<TableRow className="font-medium">
										<TableCell>Total</TableCell>
										<TableCell className="text-right">{formatCurrency(totalCost)}</TableCell>
										<TableCell className="text-right">100.0%</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
