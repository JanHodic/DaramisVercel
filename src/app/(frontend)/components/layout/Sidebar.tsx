"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Home,
  Settings,
  MapPin,
  Box,
  LayoutGrid,
  Image,
  PlusCircle,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Cog,
  Play,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Project, SectionType } from '../../lib/types';
import { fetchAllProjects, findProject } from '../../api/apiClient.public';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const sectionIcons: Record<string, React.ElementType> = {
  intro: Play,
  location: MapPin,
  model: Box,
  units: LayoutGrid,
  gallery: Image,
  amenities: PlusCircle,
  standards: FileText,
  timeline: Clock,
};

// Admin section configuration
const adminSections = [
  { id: 'settings', label: 'Obecné nastavení', icon: Cog },
  { id: 'location', label: 'Mapa', icon: MapPin },
  { id: 'model', label: '3D Model', icon: Box },
  { id: 'gallery', label: 'Galerie', icon: Image },
  { id: 'amenities', label: 'Služby a vybavení', icon: PlusCircle },
  { id: 'standards', label: 'Podklady', icon: FileText },
  { id: 'timeline', label: 'Časová osa', icon: Clock },
  { id: 'units', label: 'Jednotky', icon: LayoutGrid },
] as const;

// ---- Payload helpers

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, canEdit } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(false);

  // Load projects from backend
  useEffect(() => {
    const controller = new AbortController();
    const locale = (language === 'cs' ? 'cs' : 'en') as 'cs' | 'en';

    setIsLoadingProjects(true);
    fetchAllProjects(locale, controller.signal)
      .then(setProjects)
      .finally(() => setIsLoadingProjects(false));

    return () => controller.abort();
  }, [language]);

  console.log(projects);

  // Check if we're on a project detail page
  const projectMatch = pathname.match(/\/projects\/([^/]+)/);
  const currentProjectKey = projectMatch ? projectMatch[1] : null;

  // Check if we're on an admin project page
  const adminProjectMatch = pathname.match(/\/admin\/projects\/([^/]+)/);
  const adminProjectKey = adminProjectMatch ? adminProjectMatch[1] : null;

  const currentProjects = useMemo(
    () => projects.filter(p => (p as any).status === 'current'),
    [projects]
  );

  const currentProject = useMemo(
    () => findProject(projects, currentProjectKey),
    [projects, currentProjectKey]
  );

  const adminProject = useMemo(
    () => findProject(projects, adminProjectKey),
    [projects, adminProjectKey]
  );

  const adminActiveSection = searchParams.get('section') || 'settings';

  // Check if we're on the dashboard
  const isDashboard = pathname === '/' || pathname === '';

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    console.log('Logout clicked');
  };

  const isSectionType = (v: unknown): v is SectionType => {
    return typeof v === 'string' && v.length > 0
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex flex-col h-full bg-card border-r border-border transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className={cn("p-4 flex items-center", isCollapsed ? "justify-center" : "justify-start")}>
          <Link href="/" className="flex items-center">
            {isCollapsed ? (
              <img
                src="/daramis-favicon.png"
                alt="Daramis"
                className="w-8 h-8 object-contain"
              />
            ) : (
              <img
                src="/daramis-logo.svg"
                alt="Daramis"
                className="h-10 w-auto object-contain"
              />
            )}
          </Link>
        </div>

        <Separator />

        {/* Main Navigation */}
        <div className="p-2">
          <NavItem
            href="/"
            icon={Home}
            label={t('nav.dashboard')}
            isCollapsed={isCollapsed}
            isActive={isDashboard}
          />
        </div>

        <Separator />

        {/* Project Sections (only when in project detail, not admin) */}
        {(currentProject?.sections ?? [])
          .map((s: any) => (typeof s === 'string' ? s : (s?.key as SectionType | undefined)))
          .filter(isSectionType)
          .map((section:any) => {
            const Icon = sectionIcons[section] || FileText
            const sectionPath = `/projects/${currentProjectKey}/${section}`
            const isActive = pathname === sectionPath

            return (
              <NavItem
                key={section}
                href={sectionPath}
                icon={Icon}
                label={t(`section.${section}`)}
                isCollapsed={isCollapsed}
                isActive={isActive}
              />
            )
          })}

        {/* Admin Project Sections (when in admin project settings) */}
        {adminProject && (
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {!isCollapsed && (
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  {(adminProject as any).name ?? (adminProject as any).title ?? 'Project'}
                </p>
              )}
              {adminSections.map((section) => {
                const Icon = section.icon;
                const sectionPath = `/admin/projects/${adminProjectKey}?section=${section.id}`;
                const isActive = adminActiveSection === section.id;

                return (
                  <NavItem
                    key={section.id}
                    href={sectionPath}
                    icon={Icon}
                    label={section.label}
                    isCollapsed={isCollapsed}
                    isActive={isActive}
                  />
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Current Projects List (only on dashboard) */}
        {isDashboard && !isCollapsed && (
          <ScrollArea className="flex-1">
            <div className="p-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 pb-6 border-b border-border">
                {t('status.current')}
              </p>

              {isLoadingProjects ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">Načítám…</div>
              ) : (
                <div className="space-y-1 pt-2">
                  {currentProjects.map((project) => (
                    <Link
                      key={(project as any).id}
                      href={`/projects/${(project as any).slug ?? (project as any).id}`}
                      className={cn(
                        "block px-3 py-2 rounded-md text-sm transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        pathname === `/projects/${(project as any).slug ?? (project as any).id}` &&
                          "bg-accent text-accent-foreground"
                      )}
                    >
                      {(project as any).name ?? (project as any).title ?? 'Project'}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Spacer when in project detail */}
        {currentProject && <div className="flex-1" />}

        {/* Bottom Section */}
        <div className="mt-auto">
          <Separator />

          {/* Collapse Toggle (only in project detail) */}
          {currentProject && (
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className={cn(
                  "w-full justify-start",
                  isCollapsed && "justify-center"
                )}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Minimalizovat
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Settings (for editors and admins) */}
          {canEdit() && (
            <div className="p-2">
              <NavItem
                href="/admin"
                icon={Settings}
                label={t('nav.settings')}
                isCollapsed={isCollapsed}
                isActive={pathname.startsWith('/admin')}
              />
            </div>
          )}

          {/* Language Switch */}
          {!isCollapsed && (
            <div className="p-2 px-3">
              <div className="flex items-center gap-1 p-1 bg-muted rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLanguage('cs')}
                  className={cn(
                    "h-7 px-3 text-xs flex-1",
                    language === 'cs' && "bg-background shadow-sm"
                  )}
                >
                  CZ
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLanguage('en')}
                  className={cn(
                    "h-7 px-3 text-xs flex-1",
                    language === 'en' && "bg-background shadow-sm"
                  )}
                >
                  EN
                </Button>
              </div>
            </div>
          )}

          {/* User Info with Logout */}
          {!isCollapsed && user && (
            <div className="p-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="px-3 py-2 text-sm text-muted-foreground cursor-pointer hover:bg-accent rounded-md transition-colors">
                    <p className="font-medium text-foreground truncate">{user.name}</p>
                    <p className="text-xs truncate">{user.email}</p>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('auth.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
  isActive: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon: Icon, label, isCollapsed, isActive, onClick }: NavItemProps) {
  const content = (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
        isCollapsed && "justify-center px-2"
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return content;
}