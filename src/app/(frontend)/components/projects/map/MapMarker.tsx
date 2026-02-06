"use client";

import { useState } from 'react';

import {
  Bus,
  Coffee,
  Utensils,
  ShoppingCart,
  GraduationCap,
  HeartPulse,
  Dumbbell,
  Trees
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { UILocationCategory, UIMapLocation } from '@/app/(frontend)/mappers/UITypes';

interface MapMarkerProps {
  location: UIMapLocation;
  category: UILocationCategory;
  position: { x: number; y: number };
  onClick?: () => void;
  isClickable: boolean;
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

export function MapMarker({ location, category, position, onClick, isClickable }: MapMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);

  const IconComponent = iconMap[category.icon] || Bus;

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-full"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover label */}
      <div
        className={cn(
          "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap transition-all duration-200 z-20",
          "bg-white/95 backdrop-blur-sm border border-gray-100",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
        )}
      >
        <span className="text-sm font-medium text-gray-800">{location.name}</span>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white/95" />
        </div>
      </div>

      {/* Marker */}
      <div
        onClick={isClickable ? onClick : undefined}
        className={cn(
          "relative flex flex-col items-center transition-transform duration-200",
          isClickable && "cursor-pointer hover:scale-110",
          !isClickable && "cursor-default"
        )}
      >
        {/* Pin head */}
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200",
            isHovered && "ring-2 ring-white ring-offset-2"
          )}
          style={{ backgroundColor: category.color }}
        >
          <IconComponent className="w-5 h-5 text-white" />
        </div>

        {/* Pin point */}
        <div
          className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent -mt-px"
          style={{ borderTopColor: category.color }}
        />

        {/* Shadow */}
        <div className="absolute -bottom-1 w-4 h-1 bg-black/20 rounded-full blur-sm" />
      </div>
    </div>
  );
}
