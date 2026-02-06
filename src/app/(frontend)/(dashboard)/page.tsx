"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../api/api.instance";
import type { Project } from "../api/api.client";

function pickFirstSection(project: any) {
  // podporuje: sections: string[] i sections: [{ key: "gallery" }, ...]
  const raw = Array.isArray(project?.sections) ? project.sections : [];

  const keys = raw
    .map((s: any) => {
      if (typeof s === "string") return s;
      if (s && typeof s === "object" && typeof s.key === "string") return s.key;
      return null;
    })
    .filter(Boolean) as string[];

  // sjednocení názvů sekcí podle tvého routingu
  const normalized = keys.map((k) => (k === "model3d" ? "model" : k));

  return normalized[0] ?? "intro";
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();

  const id = useMemo(() => String((params as any)?.id ?? "").trim(), [params]);

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        setIsLoading(true);
        setIsError(false);

        // ID-only: pokud není číslo, rovnou error
        if (!/^\d+$/.test(id)) {
          throw new Error(`Project id must be numeric, got: "${id}"`);
        }

        const p = await api.findProjectById(id, {
          depth: 2,
          locale: "cs",
        });

        if (!mounted) return;

        setProject(p);

        const first = pickFirstSection(p);
        router.replace(`/projects/${id}/${first}`);
      } catch (e) {
        console.error("Failed to load project by id", e);
        if (mounted) setIsError(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    if (id) run();

    return () => {
      mounted = false;
    };
  }, [id, router]);

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

  if (isError || !project) {
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