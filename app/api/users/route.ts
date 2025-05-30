import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        hourlyRate: true
      }
    })
    return NextResponse.json(users, { status: 200 })
  } catch (error) {
    console.error('Request error', error)
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role || 'user',
        hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : 0
      }
    })
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Request error', error)
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 })
  }
}