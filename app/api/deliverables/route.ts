import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const deliverables = await prisma.deliverable.findMany({
      include: {
        project: true,
      },
    })
    return NextResponse.json(deliverables, { status: 200 })
  } catch (error) {
    console.error('Request error', error)
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const deliverable = await prisma.deliverable.create({
      data: {
        name: data.name,
        dueDate: new Date(data.dueDate),
        hours: parseFloat(data.hours) || 0,
        status: data.status || 'Not Started',
        project: {
          connect: { id: data.projectId },
        },
      },
      include: {
        project: true,
      },
    })
    return NextResponse.json(deliverable, { status: 201 })
  } catch (error) {
    console.error('Request error', error)
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}