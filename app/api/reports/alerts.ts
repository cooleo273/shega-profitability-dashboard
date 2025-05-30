import { NextRequest, NextResponse } from 'next/server'

// Example: Fetch alerts from your database or service
// Replace this with your real data fetching logic
const mockAlerts = [
  {
    id: '1',
    type: 'warning',
    title: 'Budget Overrun',
    description: 'Project Alpha has exceeded its budget by 15%.',
    projectId: 'alpha',
    date: '2025-05-20',
  },
  {
    id: '2',
    type: 'info',
    title: 'Upcoming Deadline',
    description: 'Project Beta deliverable is due in 3 days.',
    projectId: 'beta',
    date: '2025-05-23',
  },
  {
    id: '3',
    type: 'error',
    title: 'Unbilled Hours',
    description: 'Project Gamma has 40 unbilled hours.',
    projectId: 'gamma',
    date: '2025-05-22',
  },
]

export async function GET(req: NextRequest) {
  // In a real app, filter alerts by query params, user, etc.
  // Example: const { searchParams } = new URL(req.url)
  //          const projectId = searchParams.get('projectId')
  //          const from = searchParams.get('from')
  //          const to = searchParams.get('to')

  // TODO: Replace mockAlerts with real DB query
  return NextResponse.json(mockAlerts)
}
