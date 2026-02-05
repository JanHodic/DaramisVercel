"use client";

import { useEffect, useState } from "react";
import { ProjectSlider } from "../components/dashboard/ProjectSlider";
import { createDaramisApiClient } from "../api/api.client";
import type { Project, PayloadListResponse } from "../api/api.client";
import { mapProjectsToUIProjects } from "../mappers/mapApiToUI";
import { UIProject } from "../mappers/UITypes";

const api = createDaramisApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://daramis-vercel.vercel.app',
  getToken: () => localStorage.getItem('token'),
  defaultQuery: { locale: 'cs', depth: 2 },
})

export default function DashboardPage() {
  const [projects, setProjects] = useState<UIProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProjects() {
      try {
        setIsLoading(true);
        setIsError(false);

        const res: PayloadListResponse<Project> = await api.listProjects({
          limit: 100,
          page: 1,
          depth: 2,
          // where: { status: { equals: "current" } },
        });

        if (mounted) {
          setProjects(mapProjectsToUIProjects(res?.docs));
        }
      } catch (err) {
        console.error("Failed to load projects", err);
        if (mounted) setIsError(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadProjects();

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Načítání projektů…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">
          Nepodařilo se načíst projekty.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ProjectSlider projects={projects} />
    </div>
  );
}