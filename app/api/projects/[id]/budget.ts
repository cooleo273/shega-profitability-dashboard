import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' })
  }

  try {
    if (req.method === 'GET') {
      // Get project details
      const project = await prisma.project.findUnique({
        where: { id },
        select: {
          budget: true,
          hourlyRate: true,
          estimatedHours: true,
        },
      })
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' })
      }
      
      // Get time logs for the project
      const timeLogs = await prisma.timeLog.findMany({
        where: {
          projectId: id,
        },
        select: {
          hours: true,
          billable: true,
        },
      })
      
      // Calculate actual hours and cost
      const totalHours = timeLogs.reduce((sum, log) => sum + log.hours, 0)
      const billableHours = timeLogs
        .filter(log => log.billable)
        .reduce((sum, log) => sum + log.hours, 0)
      
      const actualCost = totalHours * project.hourlyRate
      const billableValue = billableHours * project.hourlyRate
      
      // Calculate budget metrics
      const budgetData = {
        budget: project.budget,
        hourlyRate: project.hourlyRate,
        estimatedHours: project.estimatedHours,
        actualHours: totalHours,
        billableHours: billableHours,
        nonBillableHours: totalHours - billableHours,
        actualCost: actualCost,
        billableValue: billableValue,
        budgetRemaining: project.budget - actualCost,
        budgetUtilizationPercentage: (actualCost / project.budget) * 100,
        hoursUtilizationPercentage: (totalHours / project.estimatedHours) * 100,
      }
      
      return res.status(200).json(budgetData)
    }
    
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Request error', error)
    return res.status(500).json({ error: 'Error processing request' })
  }
}