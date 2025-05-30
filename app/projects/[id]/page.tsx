import { ProjectDetail } from "@/components/projects/project-detail"

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  return (
    <div className="space-y-4">
      <ProjectDetail id={id} />
    </div>
  );
}
