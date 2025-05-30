import { CreateProjectForm } from "@/components/projects/create-project-form"


export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const {id} = await params
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit Project</h1>
      <p className="text-muted-foreground">Update project details using the form below.</p>
      <CreateProjectForm projectId={id} />
    </div>
  )
}
