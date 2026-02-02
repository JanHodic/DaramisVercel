"use client";

import { useState, Suspense } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { RoleSwitcher } from './RoleSwitcher';
import { cn } from '../../lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation */}
      <MobileNav />

      {/* Desktop Layout */}
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Suspense fallback={<div className="w-64 h-full bg-card border-r" />}>
            <Sidebar
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
          </Suspense>
        </div>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 overflow-auto",
            "pt-16 md:pt-0" // Add padding top for mobile nav
          )}
        >
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Floating Role Switcher */}
      <RoleSwitcher />
    </div>
  );
}
