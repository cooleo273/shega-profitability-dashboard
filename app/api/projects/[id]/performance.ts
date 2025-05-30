import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' })
  }

  try {
    switch (req.method) {
      case 'GET':
        const project = await prisma.project.findUnique({
          where: { id },
          include: {
            timeLogs: true,
            tasks: true,
            deliverables: true,
          },
        })
        
        if (!project) {
          return res.status(404).json({ error: 'Project not found' })
        }
        
        // Calculate total hours logged
        const totalHours = project.timeLogs.reduce((sum, log) => sum + log.hours, 0)
        
        // Calculate billable hours
        const billableHours = project.timeLogs
          .filter(log => log.billable)
          .reduce((sum, log) => sum + log.hours, 0)
        
        // Calculate billable percentage
        const billablePercentage = totalHours > 0 
          ? (billableHours / totalHours) * 100 
          : 0
        
        // Calculate task completion
        const completedTasks = project.tasks.filter(task => task.status === 'completed').length
        const totalTasks = project.tasks.length
        const taskCompletionPercentage = totalTasks > 0 
          ? (completedTasks / totalTasks) * 100 
          : 0
        
        // Calculate deliverable completion
        const completedDeliverables = project.deliverables.filter(d => d.status === 'Completed').length
        const totalDeliverables = project.deliverables.length
        const deliverableCompletionPercentage = totalDeliverables > 0 
          ? (completedDeliverables / totalDeliverables) * 100 
          : 0
        
        // Calculate revenue (assuming hourlyRate * billableHours)
        const revenue = project.hourlyRate * billableHours
        
        // Calculate profit (revenue - cost)
        const cost = project.hourlyRate * totalHours
        const profit = revenue - cost
        
        // Calculate profit margin
        const profitMargin = revenue > 0 
          ? (profit / revenue) * 100 
          : 0
        
        return res.status(200).json({
          totalHours,
          billableHours,
          billablePercentage,
          taskCompletion: {
            completed: completedTasks,
            total: totalTasks,
            percentage: taskCompletionPercentage,
          },
          deliverableCompletion: {
            completed: completedDeliverables,
            total: totalDeliverables,
            percentage: deliverableCompletionPercentage,
          },
          financial: {
            revenue,
            cost,
            profit,
            profitMargin,
          },
        })
        
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Request error', error)
    return res.status(500).json({ error: 'Error processing request' })
  }
}