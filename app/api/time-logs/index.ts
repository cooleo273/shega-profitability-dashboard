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
    return NextResponse.json({ error: 'Failed to create time log' }, { status: 500 })
  }
}