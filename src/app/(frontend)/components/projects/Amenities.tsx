"use client";

import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

import { ScrollArea } from '../../components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '../../components/ui/aspect-ratio';
import { Image as ImageIcon, Video, X, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { UIAmenity } from '../../mappers/UITypes';

interface AmenitiesProps {
  amenities: UIAmenity[];
  projectName: string;
}

export function Amenities({ amenities, projectName }: AmenitiesProps) {
  const { t } = useLanguage();

  // Find first amenity with content for initial selection
  const firstWithContent = amenities.find(a => !!(a.description || a.image || a.video));
  const [selectedId, setSelectedId] = useState<string | null>(
    firstWithContent?.id || null
  );
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  if (amenities.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.noData')}</p>
      </div>
    );
  }

  // Sort by order
  const sortedAmenities = [...amenities].sort((a, b) => a.order - b.order);
  const selectedAmenity = sortedAmenities.find(a => a.id === selectedId);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card">
        <h1 className="text-2xl md:text-3xl font-heading text-foreground">
          {t('section.amenities')}
        </h1>
        <p className="text-muted-foreground mt-1">{projectName}</p>
      </div>

      {/* Content - Two Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - List of Services */}
        <div className="w-64 md:w-80 border-r border-border bg-card flex-shrink-0">
          <ScrollArea className="h-full">
            <div className="p-2">
              {sortedAmenities.map((amenity) => {
                const hasContent = !!(amenity.description || amenity.image || amenity.video);

                if (!hasContent) {
                  // Non-interactive item - just name, no hover, no click
                  return (
                    <div
                      key={amenity.id}
                      className="w-full text-left px-4 py-3 rounded-lg mb-1 text-foreground"
                    >
                      <span className="font-medium">{amenity.name}</span>
                    </div>
                  );
                }

                // Interactive item with content
                return (
                  <button
                    key={amenity.id}
                    onClick={() => setSelectedId(amenity.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg transition-colors mb-1 flex items-center justify-between",
                      "hover:bg-accent",
                      selectedId === amenity.id
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "text-foreground"
                    )}
                  >
                    <span className="font-medium">{amenity.name}</span>
                    <ChevronRight className={cn(
                      "h-4 w-4 flex-shrink-0",
                      selectedId === amenity.id ? "text-primary-foreground" : "text-muted-foreground"
                    )} />
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Right Column - Selected Service Details */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {selectedAmenity ? (
              <div className="p-6 md:p-8">
                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-heading text-foreground mb-6">
                  {selectedAmenity.name}
                </h2>

                {/* Description */}
                {selectedAmenity.description && (
                  <p className="text-base text-muted-foreground leading-relaxed mb-8">
                    {selectedAmenity.description}
                  </p>
                )}

                {/* Media - Images/Videos */}
                {(selectedAmenity.image || selectedAmenity.video) && (
                  <div className="space-y-4">
                    <AspectRatio
                      ratio={16 / 9}
                      className="bg-gradient-to-br from-daramis-bg to-daramis-green-100 rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => selectedAmenity.image && setFullscreenImage(selectedAmenity.image)}
                    >
                      {selectedAmenity.image ? (
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${selectedAmenity.image})` }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: 'linear-gradient(#004C45 1px, transparent 1px), linear-gradient(90deg, #004C45 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                          }} />
                          {selectedAmenity.video ? (
                            <Video className="w-16 h-16 text-primary/40" strokeWidth={1} />
                          ) : (
                            <ImageIcon className="w-16 h-16 text-primary/40" strokeWidth={1} />
                          )}
                          <p className="mt-3 text-sm text-muted-foreground">
                            {selectedAmenity.video ? 'Video' : 'Obrázek'}: {selectedAmenity.name}
                          </p>
                        </div>
                      )}
                    </AspectRatio>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">Vyberte službu ze seznamu</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setFullscreenImage(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={() => setFullscreenImage(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          <img
            src={fullscreenImage}
            alt="Fullscreen"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
