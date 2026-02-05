"use client";

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  Filter,
  ZoomIn,
  ZoomOut,
  Locate,
  X,
  ExternalLink,
  Bus,
  Coffee,
  Utensils,
  ShoppingCart,
  GraduationCap,
  HeartPulse,
  Dumbbell,
  Trees,
  MapPin,
  FileText
} from 'lucide-react';

//import locationsData from '@/data/locations.json';

import { ProjectMarker } from './map';
import { useLanguage } from '../../contexts/LanguageContext';
import { fetchProjects } from '../../api/apiClient.public';
import { Separator } from '@radix-ui/react-separator';
import { cn } from '@/utilities/ui';
import { UILocationCategory, UIProject } from '../../mappers/UITypes';


interface LocationMapProps {
  projectId: string;
  projectLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  projectName: string;
  projectIcon?: string | null;
  isPlannedProject?: boolean;
  buildingPlanFile?: string | null;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'bus': Bus,
  'coffee': Coffee,
  'utensils': Utensils,
  'shopping-cart': ShoppingCart,
  'graduation-cap': GraduationCap,
  'heart-pulse': HeartPulse,
  'dumbbell': Dumbbell,
  'trees': Trees,
};

export default function LocationMap({ projectId, projectLocation, projectName, projectIcon, isPlannedProject = false, buildingPlanFile }: LocationMapProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isBuildingPlanOpen, setIsBuildingPlanOpen] = useState(false);
  const { t, language } = useLanguage();

  const [projects, setProjects] = useState<UIProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<UILocationCategory[]>([]);

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

  // Sample location for panel demo
  const sampleLocation = {
    name: "Costa Coffee",
    description: "Oblíbená kavárna s terasou a výbornou kávou. Ideální místo pro setkání nebo práci.",
    image: "https://picsum.photos/seed/location-costa/400/300",
    link: "https://www.costa.cz"
  };

  const sampleCategory = categories.find(c => c.id === 'cafe') || categories[0];

  return (
    <div className="h-full w-full relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Building Plan Fullscreen Modal */}
      {isBuildingPlanOpen && buildingPlanFile && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsBuildingPlanOpen(false)}
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-50"
          >
            <X className="h-6 w-6" />
          </Button>
          {buildingPlanFile.endsWith('.pdf') ? (
            <iframe
              src={buildingPlanFile}
              className="w-full h-full max-w-6xl max-h-[90vh]"
              title={t('map.buildingPlan')}
            />
          ) : (
            <img
              src={buildingPlanFile}
              alt={t('map.buildingPlan')}
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>
      )}

      {/* Component Showcase - Markers (hidden for planned projects) */}
      {!isPlannedProject && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              {language === 'en' ? 'POI Markers' : 'POI Markery'}
            </p>
            <div className="flex flex-wrap gap-3">
              {categories.map(category => {
                const IconComponent = iconMap[category.icon] || MapPin;
                return (
                  <div key={category.id} className="flex flex-col items-center gap-1">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                      style={{ backgroundColor: category.color }}
                    >
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {language === 'en' ? category.nameEn : category.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Project Marker Showcase */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <ProjectMarker
          projectIcon="/daramis-logo.svg"
          projectName={projectName}
          position={{ x: 50, y: 50 }}
        />
      </div>

      {/* Category Filter - Top Right (hidden for planned projects) */}
      {!isPlannedProject && (
        <div className="absolute top-4 right-4 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="gap-2 shadow-lg bg-white/95 backdrop-blur-sm border border-gray-200"
              >
                <Filter className="h-4 w-4" />
                {language === 'en' ? 'Filter' : 'Filtr'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {categories.map(category => (
                <DropdownMenuCheckboxItem
                  key={category.id}
                  checked={false}
                >
                  <span
                    className="w-3 h-3 rounded-full mr-2 inline-block"
                    style={{ backgroundColor: category.color }}
                  />
                  {language === 'en' ? category.nameEn : category.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Building Plan Button - Bottom Left */}
      {buildingPlanFile && (
        <div className="absolute bottom-4 left-4 z-20">
          <Button
            variant="secondary"
            className="gap-2 shadow-lg bg-white/95 backdrop-blur-sm border border-gray-200"
            onClick={() => setIsBuildingPlanOpen(true)}
          >
            <FileText className="h-4 w-4" />
            {t('map.buildingPlan')}
          </Button>
        </div>
      )}

      {/* Zoom Controls - Bottom Center */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/95 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-gray-200 z-20">
        <Button
          variant="ghost"
          size="icon"
          disabled
          className="hover:bg-primary/10 disabled:opacity-50"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[3rem] text-center text-muted-foreground">
          100%
        </span>
        <Button
          variant="ghost"
          size="icon"
          disabled
          className="hover:bg-primary/10 disabled:opacity-50"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button
          variant="ghost"
          size="icon"
          disabled
          className="hover:bg-primary/10"
        >
          <Locate className="h-4 w-4" />
        </Button>
      </div>

      {/* Location Detail Panel - Demo (hidden for planned projects) */}
      {!isPlannedProject && (
      <div
        className={cn(
          "absolute top-0 right-0 h-full bg-white shadow-2xl z-40 transition-transform duration-300 ease-out",
          "w-full md:w-1/3 md:min-w-[320px] md:max-w-[400px]",
          isPanelOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: sampleCategory?.color }}
              />
              <span className="text-sm text-muted-foreground">
                {language === 'en' ? sampleCategory?.nameEn : sampleCategory?.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPanelOpen(false)}
              className="hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Title */}
              <h2 className="font-heading text-2xl md:text-3xl text-gray-900">
                {sampleLocation.name}
              </h2>

              {/* Description */}
              <p className="text-base text-muted-foreground leading-relaxed">
                {sampleLocation.description}
              </p>

              {/* Image */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                <Image
                  src={sampleLocation.image}
                  alt={sampleLocation.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Link button */}
              <Button className="w-full gap-2" disabled>
                {language === 'en' ? 'Visit website' : 'Navštívit web'}
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </ScrollArea>
        </div>
      </div>
      )}

      {/* Toggle panel button when closed (hidden for planned projects) */}
      {!isPlannedProject && !isPanelOpen && (
        <Button
          onClick={() => setIsPanelOpen(true)}
          className="absolute top-1/2 right-4 -translate-y-1/2 z-30"
          variant="secondary"
        >
          {language === 'en' ? 'Show Panel' : 'Zobrazit panel'}
        </Button>
      )}
    </div>
  );
}
