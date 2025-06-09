import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// PATCH /api/projects/[id]/deliverables/[deliverableId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; deliverableId: string } }
) {
  try {
    const { id, deliverableId } = await params
    const body = await req.json()
    const { name, description, dueDate, status, hours } = body

    const deliverable = await prisma.deliverable.update({
      where: {
        id: deliverableId,
        projectId: id,
      },
      data: {
        name,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status,
        hours
      },
    })

    return NextResponse.json(deliverable)
  } catch (error) {
    console.error("Error updating deliverable:", error)
    return NextResponse.json(
      { error: "Failed to update deliverable" },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id]/deliverables/[deliverableId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; deliverableId: string } }
) {
  try {
    const { id, deliverableId } = await params

    await prisma.deliverable.delete({
      where: {
        id: deliverableId,
        projectId: id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting deliverable:", error)
    return NextResponse.json(
      { error: "Failed to delete deliverable" },
      { status: 500 }
    )
  }
} 