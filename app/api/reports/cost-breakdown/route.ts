import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/reports/cost-breakdown?from=YYYY-MM-DD&to=YYYY-MM-DD&projectId=optional
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const projectId = searchParams.get("projectId")

    console.log("Received request with params:", { from, to, projectId })

    if (!from || !to) {
      return NextResponse.json({ error: "Missing from or to date" }, { status: 400 })
    }

    // Validate project exists if specified
    if (projectId && projectId !== "all") {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true, name: true, startDate: true, endDate: true }
      })

      if (!project) {
        return NextResponse.json({ 
          error: "Project not found",
          details: `No project found with ID: ${projectId}`
        }, { status: 404 })
      }

      console.log("Found project:", {
        id: project.id,
        name: project.name,
        startDate: project.startDate,
        endDate: project.endDate
      })
    }

    // Build the where clause for time logs
    const whereClause: any = {
      date: {
        gte: new Date(from),
        lte: new Date(to)
      }
    }

    // Add project filter if specified
    if (projectId && projectId !== "all") {
      whereClause.projectId = projectId
    }

    console.log("Query where clause:", whereClause)

    // Get all time logs within the date range
    const timeLogs = await prisma.timeLog.findMany({
      where: whereClause,
      include: {
        user: true,
        project: true
      }
    })

    console.log("Found time logs:", timeLogs.length)

    // If no time logs found, check if the project exists and has any time logs
    if (timeLogs.length === 0 && projectId && projectId !== "all") {
      const projectTimeLogs = await prisma.timeLog.findMany({
        where: { projectId },
        select: { date: true },
        orderBy: { date: 'desc' },
        take: 1
      })

      if (projectTimeLogs.length > 0) {
        console.log("Project has time logs, but none in the specified date range")
        console.log("Latest time log date:", projectTimeLogs[0].date)
      } else {
        console.log("Project has no time logs at all")
      }
    }

    // Group time logs by month and calculate costs
    const monthlyData = timeLogs.reduce((acc: any, log) => {
      const month = new Date(log.date).toLocaleString('default', { month: 'short' })
      const year = new Date(log.date).getFullYear()
      const monthKey = `${month} ${year}`

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month,
          direct: 0,
          indirect: 0,
          categories: {
            labor: 0,
            materials: 0,
            contractors: 0,
            overhead: 0,
            software: 0,
            facilities: 0
          }
        }
      }

      // Calculate cost based on user's hourly rate or project's hourly rate
      const hourlyRate = log.user.hourlyRate || log.project.hourlyRate || 0
      const cost = log.hours * hourlyRate

      // Add to direct costs if billable, otherwise to indirect
      if (log.billable) {
        acc[monthKey].direct += cost
        // Categorize as labor cost
        acc[monthKey].categories.labor += cost
      } else {
        acc[monthKey].indirect += cost
        // Categorize as overhead cost
        acc[monthKey].categories.overhead += cost
      }

      return acc
    }, {})

    // Convert to array and sort by date
    const costBreakdown = Object.values(monthlyData).sort((a: any, b: any) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return months.indexOf(a.month) - months.indexOf(b.month)
    })

    console.log("Final cost breakdown:", costBreakdown)

    return NextResponse.json(costBreakdown)
  } catch (error) {
    console.error("Error fetching cost breakdown:", error)
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
