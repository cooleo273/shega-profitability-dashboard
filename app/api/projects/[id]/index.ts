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
            client: true,
            team: true,
            deliverables: true,
            tasks: true,
          },
        })
        
        if (!project) {
          return res.status(404).json({ error: 'Project not found' })
        }
        
        return res.status(200).json(project)
        
      case 'PUT':
        const data = req.body
        const updatedProject = await prisma.project.update({
          where: { id },
          data,
        })
        
        return res.status(200).json(updatedProject)
        
      case 'DELETE':
        await prisma.project.delete({
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