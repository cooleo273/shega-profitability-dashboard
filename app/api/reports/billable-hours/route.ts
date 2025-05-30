import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/reports/billable-hours?from=YYYY-MM-DD&to=YYYY-MM-DD&projectId=optional
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const projectId = searchParams.get("projectId")

    if (!from || !to) {
      return NextResponse.json({ error: "Missing from or to date" }, { status: 400 })
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

    console.log('Fetching time logs with where clause:', whereClause)

    // Get all time logs within the date range
    const timeLogs = await prisma.timeLog.findMany({
      where: whereClause,
      include: {
        user: true,
        project: true
      }
    })

    console.log(`Found ${timeLogs.length} time logs`)

    if (timeLogs.length === 0) {
      return NextResponse.json([])
    }

    // Group time logs by user
    const userHours = timeLogs.reduce((acc: any, log) => {
      const userId = log.userId
      if (!acc[userId]) {
        acc[userId] = {
          id: userId,
          name: log.user.name,
          role: log.user.role,
          totalHours: 0,
          billableHours: 0,
          projects: new Map()
        }
      }

      // Add to total hours
      acc[userId].totalHours += log.hours

      // Add to billable hours if billable
      if (log.billable) {
        acc[userId].billableHours += log.hours
      }

      // Track project hours
      const projectKey = log.projectId
      if (!acc[userId].projects.has(projectKey)) {
        acc[userId].projects.set(projectKey, {
          name: log.project.name,
          hours: 0,
          billable: 0
        })
      }

      const projectHours = acc[userId].projects.get(projectKey)
      projectHours.hours += log.hours
      if (log.billable) {
        projectHours.billable += log.hours
      }

      return acc
    }, {})

    // Convert to array and calculate percentages
    const teamMembers = Object.values(userHours).map((member: any) => ({
      ...member,
      billablePercentage: member.totalHours > 0 
        ? Math.round((member.billableHours / member.totalHours) * 100) 
        : 0,
      projects: Array.from(member.projects.values())
    }))

    console.log(`Processed ${teamMembers.length} team members`)

    return NextResponse.json(teamMembers)
  } catch (error) {
    console.error("Error fetching billable hours:", error)
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
