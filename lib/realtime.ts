import { PrismaClient } from '@prisma/client'
import { Server } from 'socket.io'

const prisma = new PrismaClient()

export function setupRealtimeSubscriptions(io: Server) {
  // Listen for project changes
  prisma.$subscribe.project({
    create: true,
    update: true,
    delete: true,
  }).then((subscription) => {
    subscription.on('data', async (data) => {
      // Fetch the full project data with relations
      const project = await prisma.project.findUnique({
        where: { id: data.id },
        include: {
          client: true,
          teamMembers: {
            include: {
              user: true
            }
          },
          deliverables: true
        }
      })
      
      // Emit the updated project data to all connected clients
      io.emit('project:update', project)
    })
  })

  // Listen for team member changes
  prisma.$subscribe.projectTeamMember({
    create: true,
    update: true,
    delete: true,
  }).then((subscription) => {
    subscription.on('data', async (data) => {
      // Fetch the related project with updated team members
      const project = await prisma.project.findUnique({
        where: { id: data.projectId },
        include: {
          teamMembers: {
            include: {
              user: true
            }
          }
        }
      })
      
      // Emit the updated project data
      io.emit('project:update', project)
    })
  })

  // Listen for deliverable changes
  prisma.$subscribe.deliverable({
    create: true,
    update: true,
    delete: true,
  }).then((subscription) => {
    subscription.on('data', async (data) => {
      // Fetch the related project with updated deliverables
      const project = await prisma.project.findUnique({
        where: { id: data.projectId },
        include: {
          deliverables: true
        }
      })
      
      // Emit the updated project data
      io.emit('project:update', project)
    })
  })
} 