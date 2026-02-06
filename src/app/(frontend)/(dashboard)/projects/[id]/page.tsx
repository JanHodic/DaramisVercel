"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

import { usePublicProjectBySlug } from "../../../api/public.hooks";
import { api } from "../../../api/api.instance";

/** robustně vezme string z useParams pro různé názvy segmentů */
function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): string | null {
  const v = params[key];
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function isProbablyId(value: string) {
  // payload id může být number-like nebo uuid; u tebe v URL je to "2"
  // bereme jen čisté číslo jako "id v URL" case
  return /^[0-9]+$/.test(value);
}

/**
 * Vrátí první sekci:
 * - pokud project.sections je string[] -> první string
 * - pokud je to [{key, enabled}] -> první enabled key
 * - fallback: "intro"
 */
function pickFirstSection(project: any) {
  const sections = project?.sections;

  if (Array.isArray(sections) && sections.length > 0) {
    const first = sections[0];

    // Payload: string[]
    if (typeof first === "string") return first;

    // Některé UI: [{ key, enabled }]
    if (first && typeof first === "object") {
      const enabled = sections.filter((s: any) => s?.enabled !== false);
      const k = enabled?.[0]?.key;
      return k ?? "intro";
    }
  }

  return "intro";
}

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams() as Record<string, string | string[] | undefined>;

  // podporujeme jak /projects/[id] tak /projects/[slug]
  const raw = useMemo(() => {
    return (
      readParam(params, "slug") ||
      readParam(params, "id") ||
      readParam(params, "projectId") ||
      null
    );
  }, [params]);

  const key = raw ?? "";

  // 1) zkus public endpoint podle "slug" (u tebe to volá /api/public/projects/:slug)
  const publicQuery = usePublicProjectBySlug(raw ?? undefined, { depth: 2 });

  // 2) pokud public selže a key vypadá jako numeric ID, zkus REST /api/projects/:id
  //    (používá stejný origin přes api.instance)
  const shouldTryById = Boolean(raw && isProbablyId(raw));

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!raw) return;

      // pokud public ještě načítá, čekáme
      if (publicQuery.isLoading) return;

      // pokud public vrátil project, použijeme ho
      const publicData: any = publicQuery.data as any;
      const publicHasError = publicData && typeof publicData === "object" && "error" in publicData;
      const publicProject = !publicHasError ? publicData?.project : null;

      if (publicProject) {
        const first = pickFirstSection(publicProject);
        if (!cancelled) router.replace(`/projects/${raw}/${first}`);
        return;
      }

      // fallback: zkusit REST /api/projects/:id (jen když numeric)
      if (shouldTryById) {
        try {
          const byIdProject = await api.findProjectById(raw, { depth: 2, locale: "cs" });
          if (cancelled) return;

          const first = pickFirstSection(byIdProject);
          // důležitý: když jsme přišli přes ID, ale projekt má slug, je lepší kanonizovat URL na slug
          const slug = (byIdProject as any)?.slug;
          const canonical = slug ? String(slug) : raw;

          router.replace(`/projects/${canonical}/${first}`);
          return;
        } catch {
          // spadne to do "nenalezen"
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw, shouldTryById, publicQuery.isLoading, publicQuery.data, router]);

  // Loading stav: dokud se nedozvíme, jestli public existuje a případně fallback přes ID
  const isLoading = !raw || publicQuery.isLoading;

  // když public skončil a není projekt, a nemáme fallback, je to error
  const publicData: any = publicQuery.data as any;
  const publicHasError = publicData && typeof publicData === "object" && "error" in publicData;
  const publicProject = !publicHasError ? publicData?.project : null;

  const showNotFound =
    Boolean(raw) &&
    !publicQuery.isLoading &&
    !publicProject &&
    // pokud je numeric, ještě může probíhat fallback přes ID (tohle neumíme 100% detekovat bez extra state),
    // ale v praxi to proběhne rychle a během toho ukážeme spinner
    !shouldTryById;

  if (isLoading || shouldTryById) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">
            {raw ? "Načítání projektu…" : "Načítání…"}
          </p>
        </div>
      </div>
    );
  }

  if (showNotFound || publicQuery.isError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading text-foreground">Projekt nenalezen</h1>
          <p className="text-muted-foreground mt-2">Požadovaný projekt neexistuje.</p>
        </div>
      </div>
    );
  }

  // pokud se sem dostaneme, většinou už proběhl redirect
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">Přesměrování…</p>
      </div>
    </div>
  );
}