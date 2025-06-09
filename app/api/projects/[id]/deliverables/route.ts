import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/projects/[id]/deliverables
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    const deliverables = await prisma.deliverable.findMany({
      where: {
        projectId: id,
      },
      orderBy: {
        dueDate: 'asc',
      },
    })

    return NextResponse.json(deliverables)
  } catch (error) {
    console.error("Error fetching deliverables:", error)
    return NextResponse.json(
      { error: "Failed to fetch deliverables" },
      { status: 500 }
    )
  }
}

// POST /api/projects/[id]/deliverables
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params

    const body = await req.json()
    const { name, description, dueDate, status, hours } = body

    const deliverable = await prisma.deliverable.create({
      data: {
        name,
        description,
        dueDate: new Date(dueDate),
        status,
        projectId: id,
        hours
      },
    })

    return NextResponse.json(deliverable)
  } catch (error) {
    console.error("Error creating deliverable:", error)
    return NextResponse.json(
      { error: "Failed to create deliverable" },
      { status: 500 }
    )
  }
}

