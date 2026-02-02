"use client";

import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '../../lib/utils';

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-md">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage('cs')}
        className={cn(
          "h-7 px-2 text-xs",
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
          "h-7 px-2 text-xs",
          language === 'en' && "bg-background shadow-sm"
        )}
      >
        EN
      </Button>
    </div>
  );
}
