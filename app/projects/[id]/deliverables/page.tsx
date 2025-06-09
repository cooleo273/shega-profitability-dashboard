import { DeliverablesList } from "./deliverables-list"

async function getDeliverables(projectId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/projects/${projectId}/deliverables`, {
    cache: 'no-store'
  })
  
  if (!res.ok) {
    throw new Error('Failed to fetch deliverables')
  }
  
  return res.json()
}

export default async function DeliverablesPage({
  params,
}: {
  params: { id: string }
}) {
    const { id } = await params
  const deliverables = await getDeliverables(id)

  return <DeliverablesList deliverables={deliverables} projectId={id} />
} 