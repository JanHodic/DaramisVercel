"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Project, UIProjectStatus, UIUnit } from "../../lib/types";
import { useLanguage } from "../../contexts/LanguageContext";
import { ProjectCard } from "./ProjectCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "../../lib/utils";
import { UIProject } from "../../mappers/UITypes";

interface ProjectSliderProps {
  projects: UIProject[];
}

type FilterStatus = "all" | UIProjectStatus;

/**
 * Bez units.json:
 * - pokud backend posílá `project.availableUnits` (number), použijeme to
 * - nebo pokud posílá `project.units` (Unit[]), spočítáme available
 * - jinak vrátíme undefined (a ProjectCard nic neukáže)
 */
function getAvailableUnitsCountFromProject(project: Project): number | undefined {
  const anyProject = project as any;

  if (typeof anyProject.availableUnits === "number") return anyProject.availableUnits;

  const units = anyProject.units as UIUnit[] | undefined | null;
  if (Array.isArray(units)) {
    return units.filter((u) => u?.status === "available").length;
  }

  return undefined;
}

function projectKeyForUrl(project: Project): string {
  const anyProject = project as any;
  return (anyProject.slug as string) || String(anyProject.id);
}

export function ProjectSlider({ projects }: ProjectSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t, language } = useLanguage();

  const filteredProjects = useMemo(() => {
    const list = (projects ?? [])
      .filter((p) => filter === "all" || p.status === filter)
      .sort((a, b) => {
        const order: Record<UIProjectStatus, number> = { current: 0, planned: 1, completed: 2 };
        return order[a.status] - order[b.status];
      });

    return list;
  }, [projects, filter]);

  // reset index when filter changes / list changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [filter, filteredProjects.length]);

  // keep index safe when list shrinks
  useEffect(() => {
    if (filteredProjects.length === 0) return;
    setCurrentIndex((idx) => Math.min(idx, filteredProjects.length - 1));
  }, [filteredProjects.length]);

  const goToNext = useCallback(() => {
    if (filteredProjects.length === 0) return;
    setCurrentIndex((i) => (i + 1) % filteredProjects.length);
  }, [filteredProjects.length]);

  const goToPrev = useCallback(() => {
    if (filteredProjects.length === 0) return;
    setCurrentIndex((i) => (i - 1 + filteredProjects.length) % filteredProjects.length);
  }, [filteredProjects.length]);

  const handleProjectClick = useCallback(
    (project: Project) => {
      const key = projectKeyForUrl(project);

      if (project.status === "current" || project.status === "planned") {
        router.push(`/projects/${key}`);
        return;
      }

      const anyProject = project as any;
      const webLink = anyProject.webLink as string | undefined;

      if (project.status === "completed" && webLink) {
        window.open(webLink, "_blank", "noopener,noreferrer");
      }
    },
    [router]
  );

  // Touch swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0]?.clientX ?? null);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0]?.clientX ?? null);
  };

  const onTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;

    if (distance > minSwipeDistance) goToNext();
    if (distance < -minSwipeDistance) goToPrev();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "ArrowLeft") goToPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  const currentProject = filteredProjects[currentIndex];
  const anyCurrent = currentProject as any;
  const currentWebLink = anyCurrent?.webLink as string | undefined;

  return (
    <div className="h-full flex flex-col">
      {/* Filter Tabs */}
      <div className="px-4 md:px-8 py-4 flex justify-center">
        <Tabs value={filter} onValueChange={(v: unknown) => setFilter(v as FilterStatus)}>
          <TabsList className="bg-card">
            <TabsTrigger value="all">{t("status.all")}</TabsTrigger>
            <TabsTrigger value="current">{t("status.current")}</TabsTrigger>
            <TabsTrigger value="planned">{t("status.planned")}</TabsTrigger>
            <TabsTrigger value="completed">{t("status.completed")}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Slider */}
      <div className="flex-1 relative px-4 md:px-8 pb-4 md:pb-8">
        {filteredProjects.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">{t("common.noData")}</p>
          </div>
        ) : (
          <>
            <div
              ref={containerRef}
              className="relative h-full max-w-6xl mx-auto"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Stacked Cards */}
              <div className="absolute inset-0" key={filter}>
                {filteredProjects.map((project, index) => {
                  const offset = index - currentIndex;
                  const isVisible = Math.abs(offset) <= 2;
                  if (!isVisible) return null;

                  const availableUnits = getAvailableUnitsCountFromProject(project);

                  return (
                    <div
                      key={(project as any).id ?? (project as any).slug ?? index}
                      className={cn(
                        "absolute inset-0 transition-transform duration-500 ease-out",
                        offset === 0 && "z-30",
                        (offset === 1 || offset === -1) && "z-20",
                        (offset >= 2 || offset <= -2) && "z-10"
                      )}
                      style={{
                        transform: `translateX(${offset * 8}%) scale(${1 - Math.abs(offset) * 0.05})`,
                        opacity: offset === 0 ? 1 : 1 - Math.abs(offset) * 0.3,
                        pointerEvents: offset === 0 ? "auto" : "none",
                      }}
                    >
                      <ProjectCard
                        project={project}
                        isActive={offset === 0}
                        onClick={() => offset === 0 && handleProjectClick(project)}
                        availableUnits={availableUnits}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Arrows */}
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-40 bg-card shadow-lg hidden md:flex"
                onClick={goToPrev}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-40 bg-card shadow-lg hidden md:flex"
                onClick={goToNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* External link for completed */}
              {currentProject?.status === "completed" && currentWebLink && (
                <a href={currentWebLink} target="_blank" rel="noopener noreferrer" className="absolute bottom-4 right-4 z-40">
                  <Button variant="secondary" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    {language === "cs" ? "Zobrazit na webu" : "Open website"}
                  </Button>
                </a>
              )}
            </div>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-40">
              {filteredProjects.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentIndex ? "w-8 bg-white" : "bg-white/40 hover:bg-white/60"
                  )}
                  aria-label={language === "cs" ? `Přejít na projekt ${index + 1}` : `Go to project ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}