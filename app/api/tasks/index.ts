import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const tasks = await prisma.task.findMany({
          include: {
            project: true,
          },
        })
        return res.status(200).json(tasks)
        
      case 'POST':
        const data = req.body
        const task = await prisma.task.create({
          data: {
            title: data.title,
            description: data.description,
            status: data.status || 'notStarted',
            priority: data.priority || 'medium',
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            percentComplete: parseFloat(data.percentComplete) || 0,
            project: {
              connect: { id: data.projectId },
            },
          },
          include: {
            project: true,
          },
        })
        return res.status(201).json(task)
        
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Request error', error)
    return res.status(500).json({ error: 'Error processing request' })
  }
}