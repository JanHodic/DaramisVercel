"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Building2 } from 'lucide-react';

interface ProjectMarkerProps {
  projectIcon: string | null;
  projectName: string;
  position: { x: number; y: number };
}

const TRANSITION = 'all 0.3s ease-in-out';

export function ProjectMarker({ projectIcon, projectName, position }: ProjectMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="absolute"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
    >
      <div className="relative">
        {/* Ground dot - THE ANCHOR */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 z-10">
          <div className="w-3 h-3 rounded-full bg-primary ring-2 ring-white shadow-lg" />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 pointer-events-none"
            style={{
              width: isHovered ? '24px' : '20px',
              height: isHovered ? '24px' : '20px',
              opacity: isHovered ? 0 : 1,
              animation: isHovered ? 'none' : 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
              transition: TRANSITION,
            }}
          />
        </div>

        {/* Marker assembly */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
          style={{ bottom: '0' }}
        >
          <div
            className="cursor-pointer flex flex-col items-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Marker body */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                width: isHovered ? '150px' : '56px',
                height: isHovered ? '160px' : '56px',
                paddingTop: isHovered ? '16px' : '10px',
                paddingBottom: isHovered ? '16px' : '10px',
                paddingLeft: isHovered ? '16px' : '0',
                paddingRight: isHovered ? '16px' : '0',
                borderRadius: isHovered ? '16px' : '28px',
                boxShadow: isHovered
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                  : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                transition: TRANSITION,
              }}
            >
              {/* Logo container */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                  position: 'relative',
                  width: isHovered ? '64px' : '36px',
                  height: isHovered ? '64px' : '36px',
                  backgroundColor: isHovered ? 'rgb(249 250 251)' : 'transparent',
                  borderRadius: isHovered ? '12px' : '18px',
                  transition: TRANSITION,
                }}
              >
                {projectIcon ? (
                  <div
                    style={{
                      width: isHovered ? '48px' : '28px',
                      height: isHovered ? '48px' : '28px',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: TRANSITION,
                    }}
                  >
                    <Image
                      src={projectIcon}
                      alt={projectName}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <Building2
                    className="text-primary"
                    style={{
                      width: isHovered ? '36px' : '24px',
                      height: isHovered ? '36px' : '24px',
                      transition: TRANSITION,
                    }}
                  />
                )}
              </div>

              {/* Text content - always rendered, animated with max-height */}
              <div
                style={{
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  maxHeight: isHovered ? '60px' : '0',
                  marginTop: isHovered ? '12px' : '0',
                  opacity: isHovered ? 1 : 0,
                  transition: TRANSITION,
                }}
              >
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', lineHeight: 1.25 }}>
                  {projectName}
                </p>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                  Klikněte pro detail
                </p>
              </div>
            </div>

            {/* Stem */}
            <div
              style={{
                backgroundColor: '#d1d5db',
                width: '2px',
                height: isHovered ? '10px' : '6px',
                transition: TRANSITION,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
