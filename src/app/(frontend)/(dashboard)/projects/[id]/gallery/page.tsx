"use client";

import { useParams } from "next/navigation";
import { Gallery } from "@/components/projects/Gallery";
import { usePublicProjectBySlug } from "@/api/public.hooks";

export default function GalleryPage() {
  const params = useParams();
  const slug = params.id as string;

  const { data, isLoading, isError } = usePublicProjectBySlug(slug, { depth: 6 });

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (isError || !data || "error" in (data as any)) return <div className="p-6">Failed to load.</div>;

  const project = (data as any).project;
  const gallery = project?.gallery;

  // podle modelu: buď array obrázků, nebo objekt s images
  const images = Array.isArray(gallery) ? gallery : gallery?.images ?? [];

  return (
    <div className="h-full">
      <Gallery images={images} projectName={project?.title ?? ""} />
    </div>
  );
}