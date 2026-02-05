import type {
  Project,
  ProjectSection,
  ProjectStatus,
} from '../api/api.client'

import type {
  UIProject,
  UIProjectStatus,
  UISectionType,
} from './UITypes'

import type { Media } from '../api/api.client'

export function mediaToUrl(media?: string | Media | null): string | null {
  if (!media) return null
  if (typeof media === 'string') return media
  return media.url ?? null
}

export function mediaToThumbnail(media?: string | Media | null): string | null {
  if (!media || typeof media === 'string') return null
  return (
    media.sizes?.thumbnail?.url ??
    media.thumbnailURL ??
    media.url ??
    null
  )
}

/* -----------------------------
 * Enum mappers
 * ---------------------------- */

const statusMap: Record<ProjectStatus, UIProjectStatus> = {
  planned: 'planned',
  current: 'current',
  finished: 'completed',
}

const sectionMap: Record<ProjectSection, UISectionType> = {
  location: 'location',
  gallery: 'gallery',
  standards: 'standards',
  timeline: 'timeline',
  units: 'units',
  model3d: 'model',
  amenities: 'amenities',
}

/* -----------------------------
 * Main mapper
 * ---------------------------- */

export function mapProjectToUIProject(p: Project): UIProject {
  return {
    id: p.id,
    name: p.title,
    status: statusMap[p.status],

    mainImage: mediaToUrl(p.cover) ?? '',
    icon: mediaToUrl(p.logo),

    webLink: `/projekty/${p.slug}`,
    youtubeUrl: p.heroYouTubeUrl ?? null,

    sections: (p.sections ?? [])
      .map((s) => sectionMap[s])
      .filter(Boolean),

    location: {
      lat: p.locationTab?.centerLat ?? 0,
      lng: p.locationTab?.centerLng ?? 0,
      address: p.city ?? '',
    },

    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }
}

/* -----------------------------
 * Collection helper
 * ---------------------------- */

export function mapProjectsToUIProjects(projects: Project[]): UIProject[] {
  return projects.map(mapProjectToUIProject)
}

