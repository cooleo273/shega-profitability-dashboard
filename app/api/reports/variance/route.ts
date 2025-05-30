import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/reports/variance?from=YYYY-MM-DD&to=YYYY-MM-DD&projectId=optional
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const projectId = searchParams.get("projectId")

  if (!from || !to) {
    return NextResponse.json({ error: "Missing from or to date" }, { status: 400 })
  }

  // Build filter for time logs
  const where: any = {
    date: {
      gte: new Date(from),
      lte: new Date(to),
    },
  }
  if (projectId && projectId !== "all") {
    where.projectId = projectId
  }

  // Fetch time logs with user and project info
  const logs = await prisma.timeLog.findMany({
    where,
    include: {
      user: true,
      project: true,
    },
  })

  // Group by project and compare actual vs. budgeted hours/cost
  const projectMap: Record<string, any> = {}
  for (const log of logs) {
    const project = log.project || { id: log.projectId, name: "Unknown", budgetedHours: 0, budgetedCost: 0 }
    if (!projectMap[project.id]) {
      projectMap[project.id] = {
        projectId: project.id,
        projectName: project.name,
        totalHours: 0,
        totalCost: 0,
        budgetedHours: project.estimatedHours || 0, // Use estimatedHours as budgetedHours
        budgetedCost: project.budget || 0, // Use budget as budgetedCost
      }
    }
    projectMap[project.id].totalHours += log.hours
    // Assume user.hourlyRate exists on user
    const hourlyRate = log.user?.hourlyRate || 0
    projectMap[project.id].totalCost += log.hours * hourlyRate
  }

  // Calculate variance
  const result = Object.values(projectMap).map((p: any) => ({
    ...p,
    hoursVariance: p.totalHours - p.budgetedHours,
    costVariance: p.totalCost - p.budgetedCost,
  }))

  return NextResponse.json(result)
}
