import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        client: true,
        teamMembers: {
          include: {
            user: true
          }
        },
        deliverables: true,
        expenses: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(projects)
  } catch (error: any) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { message: error.message || "Failed to fetch projects" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('Received project data:', data)
    
    // Validate required fields
    if (!data.name || !data.clientId) {
      console.log('Validation failed:', { name: data.name, clientId: data.clientId })
      return NextResponse.json(
        { message: "Project name and client are required" },
        { status: 400 }
      )
    }

    // Create the project with all relationships
    const projectData: Prisma.ProjectCreateInput = {
      name: data.name,
      description: data.description,
      status: data.status,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      budget: data.budget,
      hourlyRate: data.hourlyRate,
      estimatedHours: data.estimatedHours,
      profitMargin: data.profitMargin || 20, // Default to 20% if not provided
      client: {
        connect: {
          id: data.clientId
        }
      },
      teamMembers: {
        create: data.teamMembers.map((member: any) => ({
          userId: member.userId,
          role: member.role,
          hours: member.hours
        }))
      },
      deliverables: {
        create: data.deliverables.map((deliverable: any) => ({
          name: deliverable.name,
          dueDate: new Date(deliverable.dueDate),
          hours: deliverable.hours,
          status: deliverable.status
        }))
      }
    }

    // Add expenses if they exist
    if (data.expenses && data.expenses.length > 0) {
      projectData.expenses = {
        create: data.expenses.map((expense: any) => ({
          name: expense.name,
          amount: expense.amount,
          type: expense.type,
          description: expense.description,
          date: new Date(expense.date)
        }))
      }
    }

    const project = await prisma.project.create({
      data: projectData,
      include: {
        client: true,
        teamMembers: {
          include: {
            user: true
          }
        },
        deliverables: true,
        expenses: true
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error: any) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { message: error.message || "Failed to create project" },
      { status: 500 }
    )
  }
}