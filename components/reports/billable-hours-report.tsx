"use client"

import { format } from "date-fns"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTheme } from "next-themes"

// Define a type for the team member data
type TeamMemberData = {
	id: string
	name: string
	role: string
	totalHours: number
	billableHours: number
	billablePercentage: number
	projects?: Array<{ name: string; hours: number; billable: number }>
}

interface BillableHoursReportProps {
	dateRange: {
		from: Date
		to: Date
	}
	projectId: string
}

export function BillableHoursReport({ dateRange, projectId }: BillableHoursReportProps) {
	const [data, setData] = useState<TeamMemberData[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [debugInfo, setDebugInfo] = useState<string | null>(null)
	const { theme } = useTheme()
	const isDark = theme === 'dark'

	// Fetch data from API
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
				
				const url = `/api/reports/billable-hours?${params.toString()}`
				setDebugInfo(`Fetching from: ${url}`)
				
				const response = await fetch(url)
				if (!response.ok) {
					const errorData = await response.json()
					throw new Error(errorData.error || 'Failed to fetch billable hours data')
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
				console.error('Error fetching billable hours:', err)
				setError(err instanceof Error ? err.message : 'An unknown error occurred')
			} finally {
				setIsLoading(false)
			}
		}

		fetchData()
	}, [dateRange, projectId])

	// Calculate totals
	const totalHours = data.reduce((sum, item) => sum + item.totalHours, 0)
	const totalBillableHours = data.reduce((sum, item) => sum + item.billableHours, 0)
	const averageBillablePercentage = totalHours > 0 ? (totalBillableHours / totalHours) * 100 : 0

	// Prepare data for chart
	const chartData = [...data].sort((a, b) => b.billablePercentage - a.billablePercentage)

	// Loading state
	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center h-[350px]">
				<Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
				<span>Loading billable hours data...</span>
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
								<CardTitle className="text-sm font-medium">Total Hours</CardTitle>
								<CardDescription>
									{format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{totalHours}</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
								<CardDescription>
									{format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{totalBillableHours}</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium">Billable Percentage</CardTitle>
								<CardDescription>
									{format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{averageBillablePercentage.toFixed(1)}%</div>
								<Progress value={averageBillablePercentage} className="mt-2" />
							</CardContent>
						</Card>
					</div>

					<div className="grid gap-6 md:grid-cols-2">
						<Card className="md:col-span-2">
							<CardHeader>
								<CardTitle>Billable Hours by Team Member</CardTitle>
								<CardDescription>Percentage of billable hours for each team member</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-[350px]">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart
											data={chartData}
											margin={{
												top: 20,
												right: 30,
												left: 20,
												bottom: 5,
											}}
										>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="name" />
											<YAxis tickFormatter={(value) => `${value}%`} domain={[0, 100]} />
											<Tooltip formatter={(value) => [`${value}%`, "Billable"]} animationDuration={300} />
											<Bar dataKey="billablePercentage" name="Billable %" radius={[8, 8, 0, 0]} animationDuration={800}>
												{chartData.map((entry, index) => (
													<Cell
														key={`cell-${index}`}
														fill={
															entry.billablePercentage < 70
																? "#ef4444"
																: entry.billablePercentage < 80
																	? "#f59e0b"
																	: "#009A6A"
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
								<CardTitle>Billable Hours Analysis</CardTitle>
								<CardDescription>Detailed breakdown of billable hours by team member</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="rounded-md border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Team Member</TableHead>
												<TableHead>Role</TableHead>
												<TableHead className="text-right">Total Hours</TableHead>
												<TableHead className="text-right">Billable Hours</TableHead>
												<TableHead className="text-right">Billable %</TableHead>
												<TableHead>Utilization</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
									{data.map((item) => (
												<TableRow key={item.id}>
													<TableCell className="font-medium">{item.name}</TableCell>
													<TableCell>{item.role}</TableCell>
													<TableCell className="text-right">{item.totalHours}</TableCell>
													<TableCell className="text-right">{item.billableHours}</TableCell>
													<TableCell className="text-right">{item.billablePercentage}%</TableCell>
													<TableCell>
														<div className="flex items-center gap-2">
															<Progress
																value={item.billablePercentage}
																className="h-2"
																indicatorClassName={
																	item.billablePercentage < 70
																		? "bg-red-500"
																		: item.billablePercentage < 80
																			? "bg-amber-500"
																			: "bg-green-500"
																}
															/>
															<span className="text-xs text-muted-foreground">{item.billablePercentage}%</span>
														</div>
													</TableCell>
												</TableRow>
											))}
											<TableRow className="font-medium">
												<TableCell>Total</TableCell>
												<TableCell></TableCell>
												<TableCell className="text-right">{totalHours}</TableCell>
												<TableCell className="text-right">{totalBillableHours}</TableCell>
												<TableCell className="text-right">{averageBillablePercentage.toFixed(1)}%</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Progress
														value={averageBillablePercentage}
															className="h-2"
															indicatorClassName={
																averageBillablePercentage < 70
																	? "bg-red-500"
																	: averageBillablePercentage < 80
																		? "bg-amber-500"
																		: "bg-green-500"
															}
														/>
														<span className="text-xs text-muted-foreground">{averageBillablePercentage.toFixed(1)}%</span>
													</div>
												</TableCell>
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
