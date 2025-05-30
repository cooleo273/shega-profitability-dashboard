import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id

  if (!id) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    )
  }

  try {
    const expenses = await prisma.projectExpense.findMany({
      where: { projectId: id },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching project expenses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project expenses' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id
  if (!id) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    )
  }

  try {
    const data = await request.json()
    const expense = await prisma.projectExpense.create({
      data: {
        name: data.name,
        amount: parseFloat(data.amount),
        type: data.type,
        description: data.description,
        date: new Date(data.date),
        project: {
          connect: { id }
        }
      }
    })

    // Update project budget based on total costs
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        teamMembers: {
          include: { user: true }
        },
        expenses: true
      }
    })

    if (project) {
      // Calculate total labor cost
      const laborCost = project.teamMembers.reduce((total, member) => {
        const hourlyRate = member.user.hourlyRate || project.hourlyRate
        return total + (hourlyRate * member.hours)
      }, 0)

      // Calculate total expenses
      const totalExpenses = project.expenses.reduce((total, expense) => {
        return total + expense.amount
      }, 0)

      // Calculate total cost
      const totalCost = laborCost + totalExpenses

      // Calculate budget with profit margin
      const budget = totalCost * (1 + project.profitMargin / 100)

      // Update project budget
      await prisma.project.update({
        where: { id },
        data: { budget }
      })
    }

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Error creating project expense:', error)
    return NextResponse.json(
      { error: 'Failed to create project expense' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id
  if (!id) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 }
    )
  }

  try {
    const { expenseId } = await request.json()
    if (!expenseId) {
      return NextResponse.json(
        { error: "Expense ID is required" },
        { status: 400 }
      )
    }

    await prisma.projectExpense.delete({
      where: { id: expenseId }
    })

    // Recalculate project budget
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        teamMembers: {
          include: { user: true }
        },
        expenses: true
      }
    })

    if (project) {
      // Calculate total labor cost
      const laborCost = project.teamMembers.reduce((total, member) => {
        const hourlyRate = member.user.hourlyRate || project.hourlyRate
        return total + (hourlyRate * member.hours)
      }, 0)

      // Calculate total expenses
      const totalExpenses = project.expenses.reduce((total, expense) => {
        return total + expense.amount
      }, 0)

      // Calculate total cost
      const totalCost = laborCost + totalExpenses

      // Calculate budget with profit margin
      const budget = totalCost * (1 + project.profitMargin / 100)

      // Update project budget
      await prisma.project.update({
        where: { id },
        data: { budget }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project expense:', error)
    return NextResponse.json(
      { error: 'Failed to delete project expense' },
      { status: 500 }
    )
  }
} 