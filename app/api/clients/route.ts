import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    return NextResponse.json(clients, { status: 200 })
  } catch (error) {
    console.error('Request error', error)
    return NextResponse.json({ error: 'Error fetching clients' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const client = await prisma.client.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      }
    })
    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Request error', error)
    return NextResponse.json({ error: 'Error creating client' }, { status: 500 })
  }
}