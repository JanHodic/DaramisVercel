"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../api/api.instance";
import type { ApiError } from "../../../api/api.client";

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): string | null {
  const v = params[key];
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function isNumeric(value: string) {
  return /^[0-9]+$/.test(value);
}

/**
 * Vrátí první sekci:
 * - Payload: sections jako string[]  (["location","gallery"...])
 * - UI: sections jako [{ key, enabled }]
 * - fallback: "intro"
 */
function pickFirstSection(project: any) {
  const sections = project?.sections;

  if (Array.isArray(sections) && sections.length > 0) {
    const first = sections[0];

    if (typeof first === "string") return first;

    if (first && typeof first === "object") {
      const enabled = sections.filter((s: any) => s?.enabled !== false);
      return enabled?.[0]?.key ?? "intro";
    }
  }

  return "intro";
}

function getApiErrorMessage(err: unknown) {
  const e = err as any;

  // ApiError z tvého klienta má .status
  const status = typeof e?.status === "number" ? e.status : null;
  const msg =
    e?.message ||
    (typeof e === "string" ? e : null) ||
    "Unknown error";

  if (status) return `API error ${status}: ${msg}`;
  return msg;
}

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams() as Record<string, string | string[] | undefined>;

  const key = useMemo(() => {
    // podporuje [id], [slug], případně [projectId]
    return (
      readParam(params, "id") ||
      readParam(params, "slug") ||
      readParam(params, "projectId") ||
      null
    );
  }, [params]);

  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!key) {
        setIsLoading(false);
        setNotFound(true);
        setErrorText("Missing route param (id/slug).");
        return;
      }

      setIsLoading(true);
      setNotFound(false);
      setErrorText(null);

      try {
        let project: any = null;

        // 1) pokud je to číslo, zkus /api/projects/:id
        if (isNumeric(key)) {
          try {
            project = await api.findProjectById(key, { depth: 2, locale: "cs" });
          } catch (e) {
            project = null;
          }
        }

        // 2) zkus najít podle slug
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

        // 3) fallback: najít podle id přes where (když id není číslo / uuid / string)
        if (!project) {
          const res = await api.listProjects({
            limit: 1,
            page: 1,
            depth: 2,
            locale: "cs",
            where: { id: { equals: key } },
          });
          project = res?.docs?.[0] ?? null;
        }

        if (cancelled) return;

        if (!project) {
          setNotFound(true);
          setErrorText(`Project not found for key="${key}"`);
          setIsLoading(false);
          return;
        }

        const first = pickFirstSection(project);
        const slug = project?.slug ? String(project.slug) : key;

        router.replace(`/projects/${slug}/${first}`);
      } catch (err) {
        if (cancelled) return;
        setNotFound(true);
        setErrorText(getApiErrorMessage(err));
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    }

    run();

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
        <div className="text-center max-w-xl px-6">
          <h1 className="text-2xl font-heading text-foreground">
            Projekt nenalezen
          </h1>
          <p className="text-muted-foreground mt-2">
            Požadovaný projekt neexistuje (nebo není dostupný).
          </p>

          {/* tohle ti řekne PRAVDU proč (403/CORS/404) */}
          {errorText && (
            <pre className="mt-4 text-left text-xs bg-muted/50 border rounded p-3 overflow-auto">
              {errorText}
            </pre>
          )}
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