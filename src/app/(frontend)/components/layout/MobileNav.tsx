"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import {
  Menu,
  Home,
  ArrowLeft,
  Settings,
  MapPin,
  Box,
  LayoutGrid,
  Image,
  Wrench,
  FileText,
  Clock,
} from "lucide-react";
import { cn } from "../../lib/utils";

import { api } from "../../api/api.instance";
import { mapProjectsToUIProjects } from "../../mappers/mapApiToUI";
import type { UIProject } from "../../mappers/UITypes";
import type { Project, PayloadListResponse } from "../../api/api.client";

const sectionIcons: Record<string, React.ElementType> = {
  location: MapPin,
  model: Box,
  units: LayoutGrid,
  gallery: Image,
  amenities: Wrench,
  standards: FileText,
  timeline: Clock,
};

function getProjectKeyForUrl(p: UIProject): string {
  // Prefer slug always. If missing, fallback to id but log error.
  const anyP = p as any;
  const slug = typeof anyP?.slug === "string" ? anyP.slug.trim() : "";
  if (slug) return slug;

  console.error("Project missing slug (URL fallback to id). Fix mapper/data:", p);
  return String(anyP?.id ?? "");
}

function getSectionKey(section: any): string {
  // supports both array of strings ["gallery", ...] and array of objects [{key:"gallery"}]
  if (typeof section === "string") return section;
  if (section && typeof section === "object") {
    if (typeof section.key === "string") return section.key;
    if (typeof section.slug === "string") return section.slug;
    if (typeof section.id === "string") return section.id;
  }
  return "";
}

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, canEdit } = useAuth();
  const { t, language } = useLanguage();

  const locale = (language === "cs" || language === "en" ? language : "cs") as
    | "cs"
    | "en";

  const [projects, setProjects] = useState<UIProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProjects() {
      try {
        setLoading(true);

        const res: PayloadListResponse<Project> = await api.listProjects({
          limit: 200,
          page: 1,
          depth: 2,
          locale,
          // where: { status: { equals: "current" } },
        });

        const ui = mapProjectsToUIProjects(res?.docs ?? []);
        if (mounted) setProjects(ui);
      } catch (e) {
        console.error("Failed to load projects in MobileNav", e);
        if (mounted) setProjects([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProjects();
    return () => {
      mounted = false;
    };
  }, [locale]);

  const currentProjects = useMemo(
    () => projects.filter((p) => p.status === "current"),
    [projects]
  );

  // /projects/:idOrSlug or /projects/:idOrSlug/:section
  const projectMatch = pathname.match(/\/projects\/([^/]+)/);
  const currentProjectKey = projectMatch ? projectMatch[1] : null;

  const currentProject = useMemo(() => {
    if (!currentProjectKey) return null;
    const key = String(currentProjectKey);
    return (
      projects.find((p) => String((p as any).slug) === key) ||
      projects.find((p) => String((p as any).id) === key) ||
      null
    );
  }, [projects, currentProjectKey]);

  const isDashboard = pathname === "/" || pathname === "";
  const showBackButton = !isDashboard;

  const getBackPath = () => {
    if (currentProjectKey) {
      // If we are in a section sub-route, go back to project root
      if (pathname.match(/\/projects\/[^/]+\/[^/]+/)) {
        return `/projects/${currentProjectKey}`;
      }
      // If we are at project root, go back to dashboard
      return "/";
    }
    return "/";
  };

  const handleNavClick = () => setIsOpen(false);

  // Build section list from UIProject.
  // Your UIProject may have sections as strings or something else; we handle both.
  const projectSections = useMemo(() => {
    const secs: any[] = (currentProject as any)?.sections ?? [];
    if (!Array.isArray(secs)) return [];
    return secs
      .map(getSectionKey)
      .filter(Boolean)
      // normalize legacy keys
      .map((k) => (k === "model3d" ? "model" : k));
  }, [currentProject]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border md:hidden">
      <div className="flex items-center justify-between p-4">
        <Link
          href="/"
          className="text-xl font-heading text-primary tracking-wider"
        >
          DARAMIS
        </Link>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Otevřít menu</span>
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-80 p-0">
            <SheetHeader className="p-4">
              <SheetTitle className="text-left font-heading text-primary tracking-wider">
                DARAMIS
              </SheetTitle>
            </SheetHeader>

            <ScrollArea className="h-[calc(100vh-80px)]">
              <div className="p-4 space-y-4">
                {/* Back Button */}
                {showBackButton && (
                  <>
                    <Link
                      href={getBackPath()}
                      onClick={handleNavClick}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      <span>{t("nav.back")}</span>
                    </Link>
                    <Separator />
                  </>
                )}

                {/* Dashboard Link */}
                <Link
                  href="/"
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isDashboard
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                >
                  <Home className="h-5 w-5" />
                  <span>{t("nav.dashboard")}</span>
                </Link>

                <Separator />

                {/* Project Sections (when in project) */}
                {currentProject && (
                  <>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3">
                      {(currentProject as any)?.name ??
                        (currentProject as any)?.title ??
                        "Projekt"}
                    </p>

                    <div className="space-y-1">
                      {projectSections.map((sectionKey) => {
                        const Icon =
                          sectionIcons[sectionKey] || sectionIcons["standards"];

                        const sectionPath = `/projects/${currentProjectKey}/${sectionKey}`;
                        const isActive = pathname === sectionPath;

                        return (
                          <Link
                            key={sectionKey}
                            href={sectionPath}
                            onClick={handleNavClick}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-accent"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{t(`section.${sectionKey}`)}</span>
                          </Link>
                        );
                      })}
                    </div>

                    <Separator />
                  </>
                )}

                {/* Current Projects (on dashboard) */}
                {isDashboard && (
                  <>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3">
                      {t("status.current")}
                    </p>

                    <div className="space-y-1">
                      {loading ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          Načítání…
                        </div>
                      ) : currentProjects.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          {t("common.noData")}
                        </div>
                      ) : (
                        currentProjects.map((project) => {
                          const key = getProjectKeyForUrl(project);

                          return (
                            <Link
                              key={(project as any).id ?? key}
                              href={key ? `/projects/${key}` : "/"}
                              onClick={handleNavClick}
                              className="block px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                            >
                              {(project as any)?.name ??
                                (project as any)?.title ??
                                "Projekt"}
                            </Link>
                          );
                        })
                      )}
                    </div>

                    <Separator />
                  </>
                )}

                {/* Settings (for editors and admins) */}
                {canEdit() && (
                  <Link
                    href="/admin"
                    onClick={handleNavClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      pathname.startsWith("/admin")
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    )}
                  >
                    <Settings className="h-5 w-5" />
                    <span>{t("nav.settings")}</span>
                  </Link>
                )}

                {/* User Info */}
                {user && (
                  <>
                    <Separator />
                    <div className="px-3 py-2">
                      <p className="font-medium">
                        {(user as any).name ?? (user as any).fullName ?? "Uživatel"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(user as any).email ?? ""}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}