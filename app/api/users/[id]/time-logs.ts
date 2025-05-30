import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID' })
  }

  try {
    if (req.method === 'GET') {
      const timeLogs = await prisma.timeLog.findMany({
        where: {
          userId: id,
        },
        include: {
          project: true,
          task: true,
        },
        orderBy: {
          date: 'desc',
        },
      })
      
      return res.status(200).json(timeLogs)
    }
    
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Request error', error)
    return res.status(500).json({ error: 'Error processing request' })
  }
}