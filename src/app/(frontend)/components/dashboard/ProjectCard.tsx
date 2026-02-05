"use client";

import Image from "next/image";

import { useLanguage } from "../../contexts/LanguageContext";
import { Badge } from "../../components/ui/badge";

import { Project, UIProjectStatus } from "../../lib/types";
import { cn } from "../../lib/utils";

interface ProjectCardProps {
  project: Project;
  isActive?: boolean;
  onClick?: () => void;
  availableUnits?: number;
}

export function ProjectCard({
  project,
  isActive = false,
  onClick,
  availableUnits,
}: ProjectCardProps) {
  const { t, language } = useLanguage();
  console.log("loaded");

  const getStatusBadge = (status: UIProjectStatus) => {
    const variants: Record<UIProjectStatus, { className: string; label: string }> =
      {
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
      if (availableUnits >= 2 && availableUnits <= 4)
        return `${availableUnits} volné jednotky`;
      return `${availableUnits} volných jednotek`;
    }
    return `${availableUnits} available unit${availableUnits !== 1 ? "s" : ""}`;
  };

  // ✅ SAFE IMAGE
  const mainImage =
    typeof (project as any)?.mainImage === "string"
      ? (project as any).mainImage.trim()
      : "";

  const imgSrc = mainImage.length > 0 ? mainImage : null;

  const projectName =
    typeof (project as any)?.name === "string" && (project as any).name.trim().length > 0
      ? (project as any).name.trim()
      : "Project";

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative w-full h-full rounded-xl overflow-hidden transition-all duration-300",
        "bg-gradient-to-br from-daramis-green-200 to-daramis-green-100",
        "cursor-pointer"
      )}
    >
      {/* Background */}
      <div className="absolute inset-0">
        {/* ✅ Image render ONLY if src exists */}
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={projectName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : null}

        {/* Overlay gradient (always) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
        <Badge className={cn("self-start mb-3", statusBadge?.className)}>
          {statusBadge?.label}
        </Badge>

        <h2 className="text-2xl md:text-4xl font-heading text-white tracking-wide">
          {projectName}
        </h2>

        {getAvailableUnitsText() && (
          <p className="text-white/80 mt-2 text-sm md:text-base">
            {getAvailableUnitsText()}
          </p>
        )}
      </div>
    </div>
  );
}