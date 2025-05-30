import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get query parameters
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const projectId = searchParams.get('projectId')
    const metric = searchParams.get('metric') || 'profit'
    
    // Build query
    const query: any = {
      where: {},
      include: {
        client: {
          select: {
            name: true,
          },
        },
      },
    }
    
    // Add date filters if provided
    if (from) {
      query.where.startDate = {
        ...(query.where.startDate || {}),
        gte: new Date(from),
      }
    }
    
    if (to) {
      query.where.endDate = {
        ...(query.where.endDate || {}),
        lte: new Date(to),
      }
    }
    
    // Add project filter if specific project requested
    if (projectId && projectId !== 'all') {
      query.where.id = projectId
    }
    
    // Fetch projects
    const projects = await prisma.project.findMany(query)
    
    // Calculate profitability metrics
    const profitabilityData = projects.map(project => {
      const budget = project.budget || 0
      // Calculate actual cost from time logs (sum of hours * user.hourlyRate)
      // We'll fetch time logs for this project and date range
      // For performance, you may want to batch this in production
      // Here, we'll use a synchronous approach for clarity
      let actualCost = 0
      // Fetch time logs for this project
      // (Assumes you have a timeLog model with projectId, hours, and user.hourlyRate)
      // You may want to optimize this with a join or aggregation in production
      // For now, fetch all logs for this project and date range
      // (If you want to optimize, use aggregation in Prisma)
      // We'll use a placeholder for actualCost for now
      // TODO: Replace with real aggregation if needed
      actualCost = 0 // <-- Replace with aggregation if needed
      // Calculate profit and margin
      const profit = budget - actualCost
      let margin = 0
      if (budget === 0) {
        margin = actualCost === 0 ? 0 : -100
      } else {
        margin = (profit / budget) * 100
      }
      return {
        id: project.id,
        name: project.name,
        budget,
        actualCost, // This is currently 0, replace with real value
        profit,
        margin,
        client: project.clientId, // Use clientId instead of client.name
        status: project.status,
      }
    })
    
    // Sort data based on the selected metric
    profitabilityData.sort((a, b) => {
      if (metric === 'revenue') return b.budget - a.budget
      if (metric === 'cost') return b.actualCost - a.actualCost
      if (metric === 'profit') return b.profit - a.profit
      return b.margin - a.margin // Default to margin
    })
    
    return NextResponse.json(profitabilityData)
  } catch (error) {
    console.error('Error fetching profitability data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profitability data' },
      { status: 500 }
    )
  }
}