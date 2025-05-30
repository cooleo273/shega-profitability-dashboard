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
        const timeLogs = await prisma.timeLog.findMany({
          where: {
            projectId: id,
          },
          include: {
            user: true,
            task: true,
          },
          orderBy: {
            date: 'desc',
          },
        })
        
        return res.status(200).json(timeLogs)
        
      case 'POST':
        const data = req.body
        const timeLog = await prisma.timeLog.create({
          data: {
            date: new Date(data.date),
            hours: parseFloat(data.hours),
            description: data.description,
            billable: data.billable !== undefined ? data.billable : true,
            startTime: data.startTime,
            endTime: data.endTime,
            user: {
              connect: { id: data.userId },
            },
            project: {
              connect: { id },
            },
            task: data.taskId ? {
              connect: { id: data.taskId },
            } : undefined,
          },
          include: {
            user: true,
            task: true,
          },
        })
        
        return res.status(201).json(timeLog)
        
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Request error', error)
    return res.status(500).json({ error: 'Error processing request' })
  }
}