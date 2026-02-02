"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePublicProjectBySlug } from "../../../api/public.hooks";

function pickFirstSection(project: any) {
  const sections = Array.isArray(project?.sections) ? project.sections : [];
  const enabled = sections.filter((s: any) => s?.enabled !== false);

  // your CMS stores: { key: 'gallery' | 'location' | ... }
  const firstKey = enabled?.[0]?.key;

  // fallback if not configured
  return firstKey ?? "intro";
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.id as string;

  const { data, isLoading, isError } = usePublicProjectBySlug(slug, { depth: 2 });

  const project = data && !("error" in (data as any)) ? (data as any).project : null;

  useEffect(() => {
    if (!project) return;
    const first = pickFirstSection(project);
    router.replace(`/projects/${slug}/${first}`);
  }, [project, slug, router]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Načítání projektu…</p>
        </div>
      </div>
    );
  }

  if (isError || !data || "error" in (data as any) || !project) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading text-foreground">Projekt nenalezen</h1>
          <p className="text-muted-foreground mt-2">Požadovaný projekt neexistuje.</p>
        </div>
      </div>
    );
  }

  // while redirecting
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">Přesměrování…</p>
      </div>
    </div>
  );
}
