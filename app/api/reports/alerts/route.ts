import { NextRequest, NextResponse } from 'next/server'
import prisma from "@/lib/prisma"
import { Project, ProjectTeamMember, TimeLog } from "@prisma/client"

type ProjectWithRelations = Project & {
  teamMembers: (ProjectTeamMember & {
    user: {
      hourlyRate: number | null
    }
  })[]
  timeLogs: TimeLog[]
}

export async function GET() {
  try {
    // Get all projects with their team members and time logs
    const projects = await prisma.project.findMany({
      include: {
        teamMembers: {
          include: {
            user: {
              select: {
                hourlyRate: true
              }
            }
          }
        },
        timeLogs: true
      }
    }) as ProjectWithRelations[]

    const alerts = []

    // Check each project for potential issues
    for (const project of projects) {
      // Calculate total labor cost from time logs
      const laborCost = project.timeLogs.reduce((total: number, log) => {
        const hourlyRate = log.billable ? project.hourlyRate : 0
        return total + (log.hours * hourlyRate)
      }, 0)

      // Calculate total cost (labor cost only for now)
      const totalCost = laborCost

      // Check budget alerts
      if (totalCost > project.budget) {
        alerts.push({
          id: `budget-${project.id}`,
          projectId: project.id,
          projectName: project.name,
          type: 'budget',
          severity: 'high',
          message: `Project has exceeded its budget by ${((totalCost - project.budget) / project.budget * 100).toFixed(1)}%`,
          createdAt: new Date().toISOString(),
        })
      } else if (totalCost > project.budget * 0.9) {
        alerts.push({
          id: `budget-warning-${project.id}`,
          projectId: project.id,
          projectName: project.name,
          type: 'budget',
          severity: 'medium',
          message: `Project is approaching budget limit (${((totalCost / project.budget) * 100).toFixed(1)}% used)`,
          createdAt: new Date().toISOString(),
        })
      }

      // Check deadline alerts
      const today = new Date()
      if (project.endDate) {
        const endDate = new Date(project.endDate)
        const daysUntilEnd = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntilEnd < 0) {
          alerts.push({
            id: `deadline-${project.id}`,
            projectId: project.id,
            projectName: project.name,
            type: 'deadline',
            severity: 'high',
            message: 'Project has passed its deadline',
            createdAt: new Date().toISOString(),
          })
        } else if (daysUntilEnd < 7) {
          alerts.push({
            id: `deadline-warning-${project.id}`,
            projectId: project.id,
            projectName: project.name,
            type: 'deadline',
            severity: 'medium',
            message: `Project deadline is approaching (${daysUntilEnd} days remaining)`,
            createdAt: new Date().toISOString(),
          })
        }
      }

      // Check resource alerts
      if (project.teamMembers.length === 0) {
        alerts.push({
          id: `resource-${project.id}`,
          projectId: project.id,
          projectName: project.name,
          type: 'resource',
          severity: 'high',
          message: 'Project has no team members assigned',
          createdAt: new Date().toISOString(),
        })
      }

      // Check quality alerts based on project status
      if (project.status === 'AT_RISK') {
        alerts.push({
          id: `quality-${project.id}`,
          projectId: project.id,
          projectName: project.name,
          type: 'quality',
          severity: 'high',
          message: 'Project is at risk of not meeting quality standards',
          createdAt: new Date().toISOString(),
        })
      }
    }

    return NextResponse.json(alerts)
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
