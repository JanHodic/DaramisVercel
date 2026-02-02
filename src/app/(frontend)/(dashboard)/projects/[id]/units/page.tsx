"use client";

import { useParams } from "next/navigation";
import { UnitsTable } from "@/components/projects/UnitsTable";
import { usePublicProjectBySlug } from "@/api/public.hooks";

export default function UnitsPage() {
  const params = useParams();
  const slug = params.id as string;

  const { data, isLoading, isError } = usePublicProjectBySlug(slug, { depth: 6 });

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (isError || !data || "error" in (data as any)) return <div className="p-6">Failed to load.</div>;

  const project = (data as any).project;

  // project.units = relationship to unitConfigs (config), NOT actual units from Realpad
  const unitConfig = project?.units;

  // Until Realpad cache endpoint exists:
  const units: any[] = [];

  if (!unitConfig) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Konfigurace jednotek není nastavena (unitConfigs)</p>
        </div>
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Jednotky zatím nejsou načtené (čeká se na Realpad sync/cache)</p>
          <p className="text-xs text-muted-foreground">
            Projekt má nastavený unitConfig, ale ještě nemáme endpoint s konkrétními jednotkami.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <UnitsTable units={units as any} projectId={slug} />
    </div>
  );
}