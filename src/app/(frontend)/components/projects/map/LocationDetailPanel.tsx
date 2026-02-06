"use client";

import Image from 'next/image';
import { X, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { useLanguage } from '../../../contexts/LanguageContext';
import { cn } from '../../../lib/utils';
import { UILocationCategory, UIMapLocation } from '@/app/(frontend)/mappers/UITypes';

interface LocationDetailPanelProps {
  location: UIMapLocation | null;
  category: UILocationCategory | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LocationDetailPanel({ location, category, isOpen, onClose }: LocationDetailPanelProps) {
  const { t, language } = useLanguage();

  if (!location || !category) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "absolute top-0 right-0 h-full bg-white shadow-2xl z-40 transition-transform duration-300 ease-out",
          "w-full md:w-1/3 md:min-w-[320px] md:max-w-[450px]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm text-muted-foreground">
                {language === 'en' ? category.nameEn : category.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Title */}
              <h2 className="font-heading text-2xl md:text-3xl text-gray-900">
                {location.name}
              </h2>

              {/* Description */}
              {location.description && (
                <p className="text-base text-muted-foreground leading-relaxed">
                  {location.description}
                </p>
              )}

              {/* Image */}
              {location.image && (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                  <Image
                    src={location.image}
                    alt={location.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Link button */}
              {location.link && (
                <Button
                  asChild
                  className="w-full gap-2"
                >
                  <a href={location.link} target="_blank" rel="noopener noreferrer">
                    {language === 'en' ? 'Visit website' : 'Navštívit web'}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
