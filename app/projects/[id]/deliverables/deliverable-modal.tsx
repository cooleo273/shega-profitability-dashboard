"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Deliverable {
  id: string
  name: string
  description: string | null
  dueDate: string
  status: string
  hours: number
}

interface DeliverableModalProps {
  deliverable?: Deliverable
  projectId: string
  isOpen: boolean
  onClose: () => void
}

export function DeliverableModal({
  deliverable,
  projectId,
  isOpen,
  onClose,
}: DeliverableModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dueDate: "",
    status: "Not Started",
    hours: 0,
  })

  useEffect(() => {
    if (deliverable) {
      setFormData({
        name: deliverable.name,
        description: deliverable.description || "",
        dueDate: deliverable.dueDate.split("T")[0],
        status: deliverable.status,
        hours: deliverable.hours,
      })
    } else {
      setFormData({
        name: "",
        description: "",
        dueDate: "",
        status: "Not Started",
        hours: 0,
      })
    }
  }, [deliverable])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = deliverable
        ? `/api/projects/${projectId}/deliverables/${deliverable.id}`
        : `/api/projects/${projectId}/deliverables`
      
      const response = await fetch(url, {
        method: deliverable ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error(`Failed to ${deliverable ? 'update' : 'create'} deliverable`)

      router.refresh()
      onClose()
    } catch (error) {
      console.error(`Error ${deliverable ? 'updating' : 'creating'} deliverable:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{deliverable ? 'Edit' : 'Create'} Deliverable</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">Hours</Label>
            <Input
              id="hours"
              type="number"
              min="0"
              step="0.5"
              value={formData.hours}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  hours: parseFloat(e.target.value),
                }))
              }
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : deliverable ? "Save Changes" : "Create Deliverable"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 