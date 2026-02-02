"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
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
} from 'lucide-react';
import { cn } from '../../lib/utils';
import projectsData from '../../data/projects.json';
import { Project } from '../../lib/types';
import { fetchProjects } from '../../api/apiClient.public';

const sectionIcons: Record<string, React.ElementType> = {
  location: MapPin,
  model: Box,
  units: LayoutGrid,
  gallery: Image,
  amenities: Wrench,
  standards: FileText,
  timeline: Clock,
};

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, canEdit } = useAuth();
  const { t, language } = useLanguage()

  const locale = (language === 'cs' || language === 'en' ? language : 'cs') as 'cs' | 'en'


  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController()
    setLoading(true)

    fetchProjects(language as 'cs' | 'en', ac.signal)
      .then(setProjects)
      .catch((e) => {
        if (e?.name !== 'AbortError') console.error(e)
      })
      .finally(() => setLoading(false))

    return () => ac.abort()
  }, [t])

  const currentProjects = useMemo(
    () => projects.filter(p => p.status === 'current'),
    [projects]
  )

  // Check if we're on a project detail page
  const projectMatch = pathname.match(/\/projects\/([^/]+)/);
  const currentProjectId = projectMatch ? projectMatch[1] : null;
  const currentProject = currentProjectId
    ? (projectsData.projects as Project[]).find(p => p.id === currentProjectId)
    : null;

  // Check if we're on the dashboard
  const isDashboard = pathname === '/' || pathname === '';

  // Check if we need to show back button
  const showBackButton = pathname !== '/' && pathname !== '';

  const getBackPath = () => {
    if (currentProjectId) {
      if (pathname.includes('/location') || pathname.includes('/model') ||
          pathname.includes('/units') || pathname.includes('/gallery') ||
          pathname.includes('/amenities') || pathname.includes('/standards') ||
          pathname.includes('/timeline')) {
        return `/projects/${currentProjectId}`;
      }
      return '/';
    }
    return '/';
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

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
                      <span>{t('nav.back')}</span>
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
                  <span>{t('nav.dashboard')}</span>
                </Link>

                <Separator />

                {/* Project Sections (when in project) */}
                {currentProject && (
                  <>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3">
                      {currentProject.name}
                    </p>
                    <div className="space-y-1">
                      {currentProject.sections.map((section) => {
                        const Icon = sectionIcons[section] || FileText;
                        const sectionPath = `/projects/${currentProjectId}/${section}`;
                        const isActive = pathname === sectionPath;

                        return (
                          <Link
                            key={section}
                            href={sectionPath}
                            onClick={handleNavClick}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                              isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{t(`section.${section}`)}</span>
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
                      {t('status.current')}
                    </p>
                    <div className="space-y-1">
                      {currentProjects.map((project) => (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          onClick={handleNavClick}
                          className="block px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                        >
                          {project.name}
                        </Link>
                      ))}
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
                      pathname.startsWith('/admin') ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    )}
                  >
                    <Settings className="h-5 w-5" />
                    <span>{t('nav.settings')}</span>
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
