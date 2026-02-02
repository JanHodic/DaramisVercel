"use client";

import Image from 'next/image';
import { cn } from '../../lib/utils';

interface ImagePlaceholderProps {
  type?: 'image' | 'map' | 'floorplan' | 'gallery';
  label?: string;
  className?: string;
  seed?: string;
  width?: number;
  height?: number;
}

export function ImagePlaceholder({
  type = 'image',
  label,
  className,
  seed,
  width = 800,
  height = 600
}: ImagePlaceholderProps) {
  // Generate a picsum URL with seed for consistent placeholder images
  const placeholderSeed = seed || `placeholder-${type}-${label || 'default'}`;
  const imageUrl = `https://picsum.photos/seed/${placeholderSeed}/${width}/${height}`;

  return (
    <div
      className={cn(
        "w-full h-full relative overflow-hidden",
        className
      )}
    >
      <Image
        src={imageUrl}
        alt={label || type}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
}
