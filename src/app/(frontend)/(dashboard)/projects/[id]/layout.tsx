"use client";

import { useParams } from "next/navigation";
import { usePublicProjectBySlug } from "../../../api/public.hooks";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const slug = params.id as string;

  const { data, isLoading, isError } = usePublicProjectBySlug(slug, { depth: 2 });

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

  return <>{children}</>;
}
