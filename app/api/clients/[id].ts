import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid client ID' })
  }

  try {
    switch (req.method) {
      case 'GET':
        const client = await prisma.client.findUnique({
          where: { id },
        })
        
        if (!client) {
          return res.status(404).json({ error: 'Client not found' })
        }
        
        return res.status(200).json(client)
        
      case 'PUT':
        const data = req.body
        const updatedClient = await prisma.client.update({
          where: { id },
          data,
        })
        
        return res.status(200).json(updatedClient)
        
      case 'DELETE':
        await prisma.client.delete({
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