import { PlannerIntegration } from "@/components/microsoft-planner/planner-integration"

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Project Tasks</h1>
        <p className="text-muted-foreground">
          Manage and track tasks across all your projects. Syncs with Microsoft Planner.
        </p>
      </div>

      <PlannerIntegration />
    </div>
  )
}
