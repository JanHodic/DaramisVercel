"use client";

import { useParams } from "next/navigation";

import { Amenities } from "@/app/(frontend)/components/projects/Amenities";
import { usePublicProjectBySlug } from "@/app/(frontend)/api/public.hooks";
import { createDaramisApiClient } from "../../../../api/api.client";

export default function AmenitiesPage() {
  const params = useParams();
  const slug = params.id as string;
  console.log(slug);

  const { data, isLoading, isError } = usePublicProjectBySlug(slug, { depth: 6 });

  //const { data, isLoading, isError } = createDaramisApiClient.;

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (isError || !data || "error" in (data as any)) return <div className="p-6">Failed to load.</div>;

  const project = (data as any).project;
  const amenities = project?.amenities ?? [];

  return (
    <div className="h-full">
      <Amenities amenities={amenities} projectName={project?.title ?? ""} />
    </div>
  );
}