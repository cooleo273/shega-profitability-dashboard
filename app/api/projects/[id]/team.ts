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
            team: true,
          },
        })
        
        if (!project) {
          return res.status(404).json({ error: 'Project not found' })
        }
        
        return res.status(200).json(project.team)
        
      case 'POST':
        const { userIds } = req.body
        
        if (!Array.isArray(userIds)) {
          return res.status(400).json({ error: 'userIds must be an array' })
        }
        
        const updatedProject = await prisma.project.update({
          where: { id },
          data: {
            team: {
              connect: userIds.map((userId: string) => ({ id: userId })),
            },
          },
          include: {
            team: true,
          },
        })
        
        return res.status(200).json(updatedProject.team)
        
      case 'DELETE':
        const { userId } = req.body
        
        if (!userId) {
          return res.status(400).json({ error: 'userId is required' })
        }
        
        const projectAfterRemoval = await prisma.project.update({
          where: { id },
          data: {
            team: {
              disconnect: { id: userId },
            },
          },
          include: {
            team: true,
          },
        })
        
        return res.status(200).json(projectAfterRemoval.team)
        
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Request error', error)
    return res.status(500).json({ error: 'Error processing request' })
  }
}