"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { DeliverableModal } from "./deliverable-modal"

interface Deliverable {
  id: string
  name: string
  description: string | null
  dueDate: string
  status: string
  hours: number
}

interface DeliverablesListProps {
  deliverables: Deliverable[]
  projectId: string
}

export function DeliverablesList({ deliverables, projectId }: DeliverablesListProps) {
  const router = useRouter()
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | undefined>(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleDelete = async (deliverableId: string) => {
    if (!confirm("Are you sure you want to delete this deliverable?")) return

    try {
      const response = await fetch(
        `/api/projects/${projectId}/deliverables/${deliverableId}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) throw new Error("Failed to delete deliverable")
      router.refresh()
    } catch (error) {
      console.error("Error deleting deliverable:", error)
    }
  }

  const handleCreate = () => {
    setSelectedDeliverable(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (deliverable: Deliverable) => {
    setSelectedDeliverable(deliverable)
    setIsModalOpen(true)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Deliverables</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Deliverable
        </Button>
      </div>

      <div className="grid gap-6">
        {deliverables.map((deliverable) => (
          <Card key={deliverable.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">
                {deliverable.name}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(deliverable)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(deliverable.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {deliverable.description && (
                  <p className="text-sm text-gray-500">{deliverable.description}</p>
                )}
                <div className="flex items-center space-x-4 text-sm">
                  <Badge variant="outline">
                    Due: {format(new Date(deliverable.dueDate), "MMM d, yyyy")}
                  </Badge>
                  <Badge
                    variant={
                      deliverable.status === "Completed"
                        ? "success"
                        : deliverable.status === "In Progress"
                        ? "secondary"
                        : "default"
                    }
                  >
                    {deliverable.status}
                  </Badge>
                  <span className="text-gray-500">
                    {deliverable.hours} hours
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DeliverableModal
        deliverable={selectedDeliverable}
        projectId={projectId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
} 