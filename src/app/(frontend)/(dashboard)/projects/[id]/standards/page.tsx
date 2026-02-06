"use client";

import { useParams } from "next/navigation";
import pdfsData from '@/app/(frontend)/data/pdfs.json';

import { usePublicProjectBySlug } from "@/app/(frontend)/api/public.hooks";
import { PDFStandards } from "@/app/(frontend)/components/projects/PDFStandards";
import { UIPDFDocument } from "@/app/(frontend)/mappers/UITypes";


function toPdf(doc: any) {
  // Media doc from Payload usually has: url, filename, mimeType, filesize, etc.
  const url = doc?.url ?? doc?.filename ?? "";
  return {
    id: doc?.id ?? doc?.filename ?? url,
    title: doc?.alt ?? doc?.filename ?? "PDF",
    url,
  };
}

export default function StandardsPage() {
  const params = useParams();
  const slug = params.id as string;
  const projectId = params.id as string;

  const { data, isLoading, isError } = usePublicProjectBySlug(slug, { depth: 6 });

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (isError || !data || "error" in (data as any)) return <div className="p-6">Failed to load.</div>;

  const project = (data as any).project;

  const standardsRaw = project?.standards ?? [];
  const pdfs = (pdfsData.pdfs as Record<string, UIPDFDocument[]>)[projectId] || [];

  return (
    <div className="h-full">
      <PDFStandards pdfs={pdfs} projectName={project?.title ?? ""} />
    </div>
  );
}

