"use client";

import { usePublicProjectBySlug } from "@/app/(frontend)/api/public.hooks";
import { Timeline } from "@/app/(frontend)/components/projects/Timeline";
import { useParams } from "next/navigation";


function pickMilestones(project: any) {
  const t = project?.timeline;

  // possibilities:
  // - relationship resolved doc: { ... , items: [...] }
  // - relationship array
  // - timeline items in separate collection
  if (!t) return [];

  if (Array.isArray(t)) {
    // maybe already milestones
    return t;
  }

  // common patterns
  if (Array.isArray(t.items)) return t.items;
  if (Array.isArray(t.milestones)) return t.milestones;

  // fallback: if timeline is a single milestone-like doc
  return [];
}

export default function TimelinePage() {
  const params = useParams();
  const slug = params.id as string;

  const { data, isLoading, isError } = usePublicProjectBySlug(slug, { depth: 6 });

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (isError || !data || "error" in (data as any)) return <div className="p-6">Failed to load.</div>;

  const project = (data as any).project;
  const milestones = pickMilestones(project);

  return (
    <div className="h-full">
      <Timeline milestones={milestones} projectName={project?.title ?? ""} />
    </div>
  );
}