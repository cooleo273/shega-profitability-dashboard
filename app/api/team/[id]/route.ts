import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { role, projectId, hourlyRate } = body

    // Update user's hourly rate
    const updatedUser = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: {
        hourlyRate,
        role,
      },
    })

    // Update or create project team member
    if (projectId) {
      await prisma.projectTeamMember.upsert({
        where: {
          projectId_userId: {
            projectId,
            userId: params.id,
          },
        },
        update: {
          role,
        },
        create: {
          projectId,
          userId: params.id,
          role,
          hours: 0, // Default hours
        },
      })
    }

    // Fetch updated user with project information
    const userWithProjects = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      include: {
        projectTeamMembers: {
          include: {
            project: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(userWithProjects)
  } catch (error) {
    console.error("Error updating team member:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 