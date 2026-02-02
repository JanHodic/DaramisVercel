"use client";

import { ProjectSlider } from "../components/dashboard/ProjectSlider";
import { usePublicProjects } from "../api/public.hooks";

export default function DashboardPage() {
  // uprav status podle potřeby:
  // - bez status => všechny
  // - status: "current" => jen aktuální
  const { data, isLoading, isError } = usePublicProjects({
    // status: "current",
    limit: 100,
    page: 1,
    depth: 2,
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Načítání projektů…</p>
        </div>
      </div>
    );
  }

  if (isError || !data || "error" in (data as any)) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Nepodařilo se načíst projekty.</p>
      </div>
    );
  }

  const projects = (data as any).docs ?? [];

  return (
    <div className="h-full">
      <ProjectSlider projects={projects} />
    </div>
  );
}