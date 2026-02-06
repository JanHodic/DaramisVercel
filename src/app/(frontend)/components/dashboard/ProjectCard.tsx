"use client";

import Image from "next/image";
import { useLanguage } from "../../contexts/LanguageContext";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";
import type { UIProject, UIProjectStatus } from "../../mappers/UITypes";

interface ProjectCardProps {
  project: UIProject;
  isActive?: boolean;
  onClick?: () => void;
  availableUnits?: number;
}

function pickImageUrl(project: UIProject): string | null {
  const anyP = project as any;

  // Nejčastější Payload vztahy: cover je buď string id nebo objekt Media s url
  const cover = anyP?.cover;
  const coverUrl =
    typeof cover === "string"
      ? null
      : typeof cover?.url === "string"
      ? cover.url
      : null;

  // fallbacky (kdybys někde měl cover přímo string url)
  const coverStringUrl = typeof cover === "string" && cover.startsWith("http") ? cover : null;

  // legacy fallbacky
  const mainImage =
    typeof anyP?.mainImage === "string" && anyP.mainImage.trim().length > 0
      ? anyP.mainImage.trim()
      : null;

  return coverUrl || coverStringUrl || mainImage || null;
}

function pickTitle(project: UIProject): string {
  const anyP = project as any;

  const title =
    typeof project?.name === "string" && project.name.trim().length > 0
      ? project.name.trim()
      : typeof anyP?.name === "string" && anyP.name.trim().length > 0
      ? anyP.name.trim()
      : "Project";

  return title;
}

export function ProjectCard({ project, isActive = false, onClick, availableUnits }: ProjectCardProps) {
  const { t, language } = useLanguage();

  const getStatusBadge = (status: UIProjectStatus) => {
    const variants: Record<UIProjectStatus, { className: string; label: string }> = {
      current: {
        className: "bg-primary text-primary-foreground",
        label: t("status.current"),
      },
      planned: {
        className: "bg-secondary text-secondary-foreground",
        label: t("status.planned"),
      },
      completed: {
        className: "bg-muted text-muted-foreground",
        label: t("status.completed"),
      },
    };

    return variants[status];
  };

  const statusBadge = getStatusBadge(project.status);

  const getAvailableUnitsText = () => {
    if (availableUnits === undefined) return null;

    if (language === "cs") {
      if (availableUnits === 0) return "Žádné volné jednotky";
      if (availableUnits === 1) return "1 volná jednotka";
      if (availableUnits >= 2 && availableUnits <= 4) return `${availableUnits} volné jednotky`;
      return `${availableUnits} volných jednotek`;
    }

    return `${availableUnits} available unit${availableUnits !== 1 ? "s" : ""}`;
  };

  const imgSrc = pickImageUrl(project);
  const projectTitle = pickTitle(project);

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative w-full h-full rounded-xl overflow-hidden transition-all duration-300",
        "bg-gradient-to-br from-daramis-green-200 to-daramis-green-100",
        "cursor-pointer",
        isActive ? "ring-2 ring-primary/30" : ""
      )}
    >
      {/* Background */}
      <div className="absolute inset-0">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={projectTitle}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={isActive}
          />
        ) : null}

        {/* Overlay gradient (always) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
        <Badge className={cn("self-start mb-3", statusBadge?.className)}>{statusBadge?.label}</Badge>

        <h2 className="text-2xl md:text-4xl font-heading text-white tracking-wide">{projectTitle}</h2>

        {getAvailableUnitsText() && (
          <p className="text-white/80 mt-2 text-sm md:text-base">{getAvailableUnitsText()}</p>
        )}
      </div>
    </div>
  );
}