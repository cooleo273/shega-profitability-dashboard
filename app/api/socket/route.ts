import { Server } from 'socket.io'
import { NextApiRequest } from 'next'
import { NextApiResponse } from 'next'
import { setupRealtimeSubscriptions } from '@/lib/realtime'

const ioHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    // Set up real-time subscriptions
    setupRealtimeSubscriptions(io)
  }

  res.end()
}

export const GET = ioHandler
export const POST = ioHandler 