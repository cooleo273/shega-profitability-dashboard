import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id
  if (!id) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    )
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                hourlyRate: true,
                email: true,
              }
            }
          }
        },
        deliverables: true,
        expenses: true,
        tasks: true,
        timeLogs: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                hourlyRate: true,
              }
            }
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id
  if (!id) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    )
  }

  try {
    const data = await request.json()
    const project = await prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        budget: parseFloat(data.budget) || 0,
        hourlyRate: parseFloat(data.hourlyRate) || 0,
        estimatedHours: parseFloat(data.estimatedHours) || 0,
        notes: data.notes,
        client: {
          connect: { id: data.clientId }
        },
        teamMembers: {
          deleteMany: {},
          create: data.teamMembers.map((member: any) => ({
            userId: member.userId,
            role: member.role,
            hours: member.hours
          }))
        },
        deliverables: {
          deleteMany: {},
          create: data.deliverables.map((deliverable: any) => ({
            name: deliverable.name,
            dueDate: new Date(deliverable.dueDate),
            hours: deliverable.hours,
            status: deliverable.status
          }))
        }
      },
      include: {
        client: true,
        teamMembers: {
          include: {
            user: true
          }
        },
        deliverables: true,
        tasks: true,
        timeLogs: true
      },
    })
    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id
  if (!id) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    )
  }

  try {
    // First, delete all related records
    await prisma.$transaction([
      // Delete deliverables
      prisma.deliverable.deleteMany({
        where: { projectId: id }
      }),
      // Delete expenses
      prisma.projectExpense.deleteMany({
        where: { projectId: id }
      }),
      // Delete time logs
      prisma.timeLog.deleteMany({
        where: { projectId: id }
      }),
      // Delete tasks
      prisma.task.deleteMany({
        where: { projectId: id }
      }),
      // Delete team members
      prisma.projectTeamMember.deleteMany({
        where: { projectId: id }
      }),
      // Finally, delete the project
      prisma.project.delete({
        where: { id }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    )
  }
}