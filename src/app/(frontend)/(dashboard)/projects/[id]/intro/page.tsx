"use client";

import { useParams } from "next/navigation";
import { ProjectIntro } from "@/components/projects/ProjectIntro";
import { usePublicProjectBySlug } from "@/api/public.hooks";

export default function IntroPage() {
  const params = useParams();
  const slug = params.id as string;

  const { data, isLoading, isError } = usePublicProjectBySlug(slug, { depth: 6 });

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (isError || !data || "error" in (data as any)) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading text-foreground">Projekt nenalezen</h1>
          <p className="text-muted-foreground mt-2">Požadovaný projekt neexistuje.</p>
        </div>
      </div>
    );
  }

  const project = (data as any).project;

  return (
    <div className="h-full">
      <ProjectIntro project={project} />
    </div>
  );
}