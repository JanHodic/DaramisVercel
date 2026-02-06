"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { UIGalleryImage } from '../../mappers/UITypes';

interface GalleryProps {
  images: UIGalleryImage[];
  projectName: string;
}

// Background color for empty space around images
const GALLERY_BG_COLOR = '#E9F4F0';

export function Gallery({ images, projectName }: GalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isImageLandscape, setIsImageLandscape] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  // Check if image is landscape or portrait to determine nav colors
  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const container = containerRef.current;
    if (!container) return;

    const containerAspect = container.clientWidth / container.clientHeight;
    const imageAspect = img.naturalWidth / img.naturalHeight;

    // If image aspect ratio is wider than container, image fills width (landscape behavior)
    // Navigation dots will be over the background color, so use dark
    // If image aspect ratio is taller than container, image fills height (portrait behavior)
    // Navigation dots will be over the image, so use light
    setIsImageLandscape(imageAspect >= containerAspect);
  }, []);

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Touch handlers for swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }
  };

  if (images.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.noData')}</p>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  // Determine navigation colors based on image orientation
  // Light colors when over image (portrait fills height), dark when over background (landscape fills width)
  const navDotActiveColor = isImageLandscape ? 'bg-gray-800' : 'bg-white';
  const navDotInactiveColor = isImageLandscape ? 'bg-gray-800/40 hover:bg-gray-800/60' : 'bg-white/40 hover:bg-white/60';
  const navArrowClass = isImageLandscape
    ? 'bg-gray-800/30 text-gray-800 hover:bg-gray-800/50 hover:text-gray-800'
    : 'bg-black/30 text-white hover:bg-black/50 hover:text-white';

  return (
    <div
      ref={containerRef}
      className="h-full w-full relative flex items-center justify-center"
      style={{ backgroundColor: GALLERY_BG_COLOR }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Image Display - Full resolution, no crop, maintain aspect ratio */}
      <div className="w-full h-full flex items-center justify-center">
        {currentImage.src.startsWith('http') ? (
          <img
            src={currentImage.src}
            alt={currentImage.alt}
            className="max-w-full max-h-full object-contain"
            onLoad={handleImageLoad}
          />
        ) : (
          <div className="relative flex flex-col items-center">
            {/* Grid pattern */}
            <div className="absolute inset-0 -m-32 opacity-10" style={{
              backgroundImage: 'linear-gradient(#004C45 1px, transparent 1px), linear-gradient(90deg, #004C45 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }} />

            {/* Icon and label */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ImageIcon className="w-16 h-16 md:w-24 md:h-24 text-primary/40" strokeWidth={1} />
              </div>
              <p className="mt-6 text-lg font-heading text-primary/80">Vizualizace {currentIndex + 1}</p>
              <p className="mt-1 text-sm text-muted-foreground">{currentImage.alt}</p>
            </div>
          </div>
        )}
      </div>

      {/* Overlay with controls */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 md:p-6 md:pr-28 flex items-center justify-between pointer-events-auto">
          <div className="text-white">
            <h3 className="font-heading text-lg md:text-xl">{projectName}</h3>
            <p className="text-white/70 text-sm">{currentImage.alt}</p>
          </div>
          <div className="text-white/70 text-sm bg-black/30 px-3 py-1 rounded-full">
            {currentIndex + 1} {t('gallery.of')} {images.length}
          </div>
        </div>

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrev}
          className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full pointer-events-auto", navArrowClass)}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          className={cn("absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full pointer-events-auto", navArrowClass)}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>

        {/* Bottom pagination dots - color based on what's behind them */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex
                  ? cn("w-8", navDotActiveColor)
                  : navDotInactiveColor
              )}
              aria-label={`Přejít na obrázek ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
