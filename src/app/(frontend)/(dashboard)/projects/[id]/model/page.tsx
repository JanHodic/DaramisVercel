"use client";

import { useParams } from "next/navigation";
import { Model3DPlaceholder } from "@/components/projects/Model3DPlaceholder";
import { usePublicProjectBySlug } from "@/api/public.hooks";

export default function ModelPage() {
  const params = useParams();
  const slug = params.id as string;

  const { data, isLoading, isError } = usePublicProjectBySlug(slug, { depth: 6 });

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (isError || !data || "error" in (data as any)) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Projekt nenalezen</p>
      </div>
    );
  }

  const project = (data as any).project;

  return (
    <div className="h-full">
      <Model3DPlaceholder projectId={slug} projectName={project?.title ?? ""} />
    </div>
  );
}