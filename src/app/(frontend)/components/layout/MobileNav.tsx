"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../../components/ui/sheet";
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
  Image as ImageIcon,
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
  model3d: Box,
  units: LayoutGrid,
  gallery: ImageIcon,
  amenities: Wrench,
  standards: FileText,
  timeline: Clock,
};

function isProjectSectionPath(pathname: string) {
  return (
    pathname.includes("/location") ||
    pathname.includes("/model3d") ||
    pathname.includes("/units") ||
    pathname.includes("/gallery") ||
    pathname.includes("/amenities") ||
    pathname.includes("/standards") ||
    pathname.includes("/timeline")
  );
}

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, canEdit } = useAuth();
  const { t, language } = useLanguage();

  const locale = (language === "cs" || language === "en" ? language : "cs") as "cs" | "en";

  const [projects, setProjects] = useState<UIProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Load projects using the SAME api client as dashboard
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);

        const res: PayloadListResponse<Project> = await api.listProjects({
          limit: 200,
          page: 1,
          depth: 2,
          locale,
          // where: { status: { equals: "current" } }, // pokud chceš jen current, odkomentuj
        });

        const ui = mapProjectsToUIProjects(res?.docs ?? []);
        if (mounted) setProjects(ui);
      } catch (e) {
        console.error("MobileNav: failed to load projects", e);
        if (mounted) setProjects([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [locale]);

  const currentProjects = useMemo(() => projects.filter((p) => p.status === "current"), [projects]);

  // Current project id from url: /projects/:id/...
  const projectMatch = pathname.match(/\/projects\/([^/]+)/);
  const currentProjectId = projectMatch ? projectMatch[1] : null;

  const currentProject = useMemo(() => {
    if (!currentProjectId) return null;
    return projects.find((p) => String(p.id) === String(currentProjectId)) ?? null;
  }, [projects, currentProjectId]);

  const isDashboard = pathname === "/" || pathname === "";
  const showBackButton = !isDashboard;

  const getBackPath = () => {
    if (currentProjectId) {
      if (isProjectSectionPath(pathname)) {
        return `/projects/${currentProjectId}`;
      }
      return "/";
    }
    return "/";
  };

  const handleNavClick = () => setIsOpen(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border md:hidden">
      <div className="flex items-center justify-between p-4">
        <Link href="/" className="text-xl font-heading text-primary tracking-wider">
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
                    isDashboard ? "bg-primary text-primary-foreground" : "hover:bg-accent"
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
                      {currentProject.name}
                    </p>

                    <div className="space-y-1">
                      {(currentProject.sections ?? []).map((sectionKey) => {
                        const Icon = sectionIcons[sectionKey] || FileText;
                        const sectionPath = `/projects/${currentProjectId}/${sectionKey}`;
                        const isActive = pathname === sectionPath;

                        return (
                          <Link
                            key={sectionKey}
                            href={sectionPath}
                            onClick={handleNavClick}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                              isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
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
                          {language === "cs" ? "Načítám…" : "Loading…"}
                        </div>
                      ) : (
                        currentProjects.map((project) => (
                          <Link
                            key={String(project.id)}
                            href={`/projects/${project.id}`}
                            onClick={handleNavClick}
                            className="block px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                          >
                            {project.name}
                          </Link>
                        ))
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
                      pathname.startsWith("/admin") ? "bg-primary text-primary-foreground" : "hover:bg-accent"
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
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
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