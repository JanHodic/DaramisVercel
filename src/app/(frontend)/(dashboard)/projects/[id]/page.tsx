"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../api/api.instance";

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): string | null {
  const v = params[key];
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function isNumericId(value: string) {
  return /^[0-9]+$/.test(value);
}

/**
 * Vrátí první sekci:
 * - Payload: sections jako string[]  (např. ["location","gallery"])
 * - UI: sections jako [{ key, enabled }]  (např. [{key:"gallery", enabled:true}])
 * - fallback: "intro"
 */
function pickFirstSection(project: any) {
  const sections = project?.sections;

  if (Array.isArray(sections) && sections.length > 0) {
    const first = sections[0];

    if (typeof first === "string") return first;

    if (first && typeof first === "object") {
      const enabled = sections.filter((s: any) => s?.enabled !== false);
      const key = enabled?.[0]?.key;
      return key ?? "intro";
    }
  }

  return "intro";
}

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams() as Record<string, string | string[] | undefined>;

  const key = useMemo(() => {
    return (
      readParam(params, "slug") ||
      readParam(params, "id") ||
      readParam(params, "projectId") ||
      null
    );
  }, [params]);

  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAndRedirect() {
      if (!key) {
        setIsLoading(false);
        setNotFound(true);
        return;
      }

      setIsLoading(true);
      setNotFound(false);

      try {
        let project: any = null;

        // 1) numeric -> /api/projects/:id
        if (isNumericId(key)) {
          try {
            project = await api.findProjectById(key, { depth: 2, locale: "cs" });
          } catch {
            project = null;
          }
        }

        // 2) fallback -> find by slug přes listProjects + where
        if (!project) {
          const res = await api.listProjects({
            limit: 1,
            page: 1,
            depth: 2,
            locale: "cs",
            where: { slug: { equals: key } },
          });

          project = res?.docs?.[0] ?? null;
        }

        if (cancelled) return;

        if (!project) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        const first = pickFirstSection(project);
        const slug = project?.slug ? String(project.slug) : key;

        router.replace(`/projects/${slug}/${first}`);
      } catch (e) {
        if (cancelled) return;
        setNotFound(true);
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    }

    loadAndRedirect();

    return () => {
      cancelled = true;
    };
  }, [key, router]);

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

  if (notFound) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading text-foreground">
            Projekt nenalezen
          </h1>
          <p className="text-muted-foreground mt-2">
            Požadovaný projekt neexistuje.
          </p>
        </div>
      </div>
    );
  }

  // while redirecting (většinou už to přesměruje)
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">Přesměrování…</p>
      </div>
    </div>
  );
}
