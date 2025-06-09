import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    // Get total and active projects
    const totalProjects = await prisma.project.count()
    const activeProjects = await prisma.project.count({
      where: {
        status: {
          in: ["In Progress", "Planning"]
        }
      }
    })

    // Calculate total revenue from time logs
    const timeLogs = await prisma.timeLog.findMany({
      where: {
        billable: true,
        date: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
        }
      },
      include: {
        project: true,
        user: true
      }
    })

    const totalRevenue = timeLogs.reduce((sum, log) => {
      const rate = log.project.hourlyRate || log.user.hourlyRate
      return sum + (log.hours * rate)
    }, 0)

    // Calculate average profitability
    const projects = await prisma.project.findMany({
      include: {
        timeLogs: true,
        expenses: true
      }
    })

    const projectProfitabilities = projects.map(project => {
      const revenue = project.timeLogs.reduce((sum, log) => {
        const rate = project.hourlyRate
        return sum + (log.hours * rate)
      }, 0)

      const costs = project.expenses.reduce((sum, expense) => sum + expense.amount, 0)
      const profit = revenue - costs
      return (profit / revenue) * 100
    }).filter(p => !isNaN(p) && isFinite(p))

    const averageProfitability = projectProfitabilities.length > 0
      ? projectProfitabilities.reduce((sum, p) => sum + p, 0) / projectProfitabilities.length
      : 0

    // Get project performance data
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const projectPerformance = await prisma.project.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      _count: true
    })

    // Get financial overview data
    const financialData = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "date") as month,
        SUM(CASE WHEN "billable" = true THEN "hours" * COALESCE(p."hourlyRate", u."hourlyRate") ELSE 0 END) as revenue,
        SUM(CASE WHEN "billable" = false THEN "hours" * COALESCE(p."hourlyRate", u."hourlyRate") ELSE 0 END) as expenses
      FROM "TimeLog" tl
      LEFT JOIN "Project" p ON tl."projectId" = p.id
      LEFT JOIN "User" u ON tl."userId" = u.id
      WHERE "date" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "date")
      ORDER BY month ASC
    `

    // Get revenue breakdown by project
    const revenueBreakdown = await prisma.project.findMany({
      select: {
        name: true,
        timeLogs: {
          where: {
            billable: true,
            date: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
            }
          }
        },
        hourlyRate: true
      }
    })

    const revenueByProject = revenueBreakdown.map(project => ({
      name: project.name,
      value: project.timeLogs.reduce((sum, log) => sum + (log.hours * project.hourlyRate), 0)
    }))

    // Get cost distribution
    const costDistribution = await prisma.projectExpense.groupBy({
      by: ['type'],
      _sum: {
        amount: true
      },
      where: {
        date: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
        }
      }
    })

    return NextResponse.json({
      metrics: {
        totalProjects,
        activeProjects,
        totalRevenue,
        averageProfitability
      },
      projectPerformance,
      financialData,
      revenueBreakdown: revenueByProject,
      costDistribution
    })
  } catch (error) {
    console.error("Dashboard data error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
} 