import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  let where = {}
  if (start && end) {
    where = {
      date: {
        gte: new Date(start),
        lte: new Date(end),
      },
    }
  }

  try {
    const timeLogs = await prisma.timeLog.findMany({
      where,
      include: {
        user: true,
        project: true,
        task: true,
      },
      orderBy: {
        date: 'desc',
      },
    })
    return NextResponse.json(timeLogs)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch time logs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  try {
    // Validate required fields
    if (!data.userId || !data.projectId) {
      return NextResponse.json({ error: 'Missing userId or projectId' }, { status: 400 })
    }
    // Optionally: check if user and project exist
    const user = await prisma.user.findUnique({ where: { id: data.userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 })
    }
    const project = await prisma.project.findUnique({ where: { id: data.projectId } })
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 400 })
    }
    // Optionally: check if task exists if taskId is provided
    if (data.taskId) {
      const task = await prisma.task.findUnique({ where: { id: data.taskId } })
      if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 400 })
      }
    }
    const timeLog = await prisma.timeLog.create({
      data: {
        date: new Date(data.date),
        hours: parseFloat(data.hours),
        description: data.description,
        billable: data.billable ?? true,
        userId: data.userId,
        projectId: data.projectId,
        taskId: data.taskId ?? null,
        startTime: data.startTime ?? null,
        endTime: data.endTime ?? null,
      },
    })
    return NextResponse.json(timeLog)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create time log', details: error?.message }, { status: 500 })
  }
}