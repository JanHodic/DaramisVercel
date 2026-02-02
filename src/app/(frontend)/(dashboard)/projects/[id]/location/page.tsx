"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { usePublicProjectBySlug } from "@/app/(frontend)/api/public.hooks";


const LocationMap = dynamic(
  () => import("src/app/(frontend)/components/projects/LocationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-daramis-green-100 to-daramis-green-200">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Načítání mapy...</p>
        </div>
      </div>
    ),
  }
);

export default function LocationPage() {
  const params = useParams();
  const slug = params.id as string;

  const { data, isLoading, isError } = usePublicProjectBySlug(slug, { depth: 6 });

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (isError || !data || "error" in (data as any)) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Projekt nenalezen</p>
      </div>
    );
  }

  const project = (data as any).project;

  return (
    <div className="h-full">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <LocationMap
        projectId={slug}
        projectLocation={project?.location}
        projectName={project?.title}
        projectIcon={project?.dashboard?.icon}
        isPlannedProject={project?.status === "planned"}
        buildingPlanFile={project?.buildingPlanFile}
      />
    </div>
  );
}