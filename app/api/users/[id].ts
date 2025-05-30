import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID' })
  }

  try {
    switch (req.method) {
      case 'GET':
        const user = await prisma.user.findUnique({
          where: { id },
        })
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' })
        }
        
        return res.status(200).json(user)
        
      case 'PUT':
        const data = req.body
        const updatedUser = await prisma.user.update({
          where: { id },
          data,
        })
        
        return res.status(200).json(updatedUser)
        
      case 'DELETE':
        await prisma.user.delete({
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