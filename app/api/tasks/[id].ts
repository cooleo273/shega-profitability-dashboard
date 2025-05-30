import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid task ID' })
  }

  try {
    switch (req.method) {
      case 'GET':
        const task = await prisma.task.findUnique({
          where: { id },
          include: {
            project: true,
          },
        })
        
        if (!task) {
          return res.status(404).json({ error: 'Task not found' })
        }
        
        return res.status(200).json(task)
        
      case 'PUT':
        const data = req.body
        const updatedTask = await prisma.task.update({
          where: { id },
          data: {
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            percentComplete: data.percentComplete !== undefined 
              ? parseFloat(data.percentComplete) 
              : undefined,
          },
          include: {
            project: true,
          },
        })
        
        return res.status(200).json(updatedTask)
        
      case 'DELETE':
        await prisma.task.delete({
          where: { id },
        })
        
        return res.status(204).end()
        
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Request error', error)
    return res.status(500).json({ error: 'Error processing request' })
  }
}