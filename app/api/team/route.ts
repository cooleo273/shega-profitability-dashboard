import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const users = await prisma.user.findMany({
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

    // Transform the data to match the expected format
    const teamMembers = users.map(user => ({
      id: user.id,
      name: user.name,
      role: user.role,
      hourlyRate: user.hourlyRate,
      projectTeamMembers: user.projectTeamMembers.map(member => ({
        project: member.project.name,
        role: member.role,
        hours: member.hours,
      })),
    }))

    return NextResponse.json(teamMembers)
  } catch (error) {
    console.error("Error fetching team members:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 