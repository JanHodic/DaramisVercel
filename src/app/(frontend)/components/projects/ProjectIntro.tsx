"use client";

import { useState, useCallback } from 'react';
import { Project } from '@/lib/types';

interface ProjectIntroProps {
  project: Project;
}

function getYouTubeEmbedUrl(url: string): string | null {
  // Extract video ID from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
    }
  }
  return null;
}

export function ProjectIntro({ project }: ProjectIntroProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const youtubeEmbedUrl = project.youtubeUrl ? getYouTubeEmbedUrl(project.youtubeUrl) : null;
  const hasVideo = !!youtubeEmbedUrl;

  const handlePlayVideo = useCallback(() => {
    setIsVideoPlaying(true);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Project Name */}
      <div className="px-8 py-6">
        <h1 className="text-4xl font-heading font-bold text-foreground">
          {project.name}
        </h1>
      </div>

      {/* Visual - Image or Video */}
      <div className="flex-1 px-8 pb-8">
        <div className="relative w-full h-full rounded-lg overflow-hidden bg-muted">
          {hasVideo ? (
            // YouTube Video
            isVideoPlaying ? (
              <iframe
                src={`${youtubeEmbedUrl}&autoplay=1`}
                title={project.name}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              // Video thumbnail with play button
              <div
                className="absolute inset-0 cursor-pointer group"
                onClick={handlePlayVideo}
              >
                <img
                  src={project.mainImage}
                  alt={project.name}
                  className="w-full h-full object-contain"
                  style={{ backgroundColor: '#E9F4F0' }}
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg
                      className="w-8 h-8 text-primary ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            )
          ) : (
            // Static Image
            <img
              src={project.mainImage}
              alt={project.name}
              className="w-full h-full object-contain"
              style={{ backgroundColor: '#E9F4F0' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
