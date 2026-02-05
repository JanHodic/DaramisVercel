"use client";

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UIUserRole } from '../../lib/types';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import { cn } from '../../lib/utils';

const roles: { value: UIUserRole; label: string; description: string }[] = [
  { value: 'superadmin', label: 'Super Admin', description: 'Plný přístup' },
  { value: 'editor', label: 'Editor', description: 'Může upravovat' },
  { value: 'viewer', label: 'Prohlížitel', description: 'Pouze prohlížení' },
];

const roleColors: Record<UIUserRole, string> = {
  superadmin: 'bg-red-500',
  editor: 'bg-blue-500',
  viewer: 'bg-green-500',
};

export function RoleSwitcher() {
  const { user, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const currentRole = roles.find(r => r.value === user.role);

  return (
    <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 gap-2 shadow-lg border bg-white/95 backdrop-blur-sm hover:bg-white",
              "transition-all duration-200 text-xs md:text-sm md:h-10"
            )}
          >
            <div className={cn("w-3 h-3 rounded-full", roleColors[user.role])} />
            <span className="font-medium">{currentRole?.label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="end" side="top">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground px-2 py-1 font-medium">
              Přepnout roli
            </p>
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => {
                  switchRole(role.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-2 py-2 rounded-md text-left",
                  "hover:bg-accent transition-colors",
                  user.role === role.value && "bg-accent"
                )}
              >
                <div className={cn("w-3 h-3 rounded-full", roleColors[role.value])} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{role.label}</div>
                  <div className="text-xs text-muted-foreground">{role.description}</div>
                </div>
                {user.role === role.value && (
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
