import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProjectList } from "@/components/projects/project-list"

export default function ProjectsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <ProjectList />
    </div>
  )
}
