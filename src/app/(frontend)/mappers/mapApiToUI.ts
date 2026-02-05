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

const DEFAULT_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://daramis-vercel.vercel.app'

function absolutize(url: string, baseUrl: string) {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

export function mediaToUrl(
  media?: string | Media | null,
  baseUrl: string = DEFAULT_BASE,
): string | null {
  if (!media) return null

  const url =
    typeof media === 'string'
      ? media
      : media.url ??
        media.sizes?.large?.url ??
        media.sizes?.medium?.url ??
        media.sizes?.thumbnail?.url ??
        null

  if (!url) return null
  return absolutize(url, baseUrl)
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


const BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://daramis-vercel.vercel.app'

export function mapProjectToUIProject(p: Project): UIProject {
  return {
    id: p.id,
    name: p.title,
    status: statusMap[p.status],

    mainImage: mediaToUrl(p.cover, BASE) ?? '',   
    icon: mediaToUrl(p.logo, BASE),              

    webLink: `/projekty/${p.slug}`,
    youtubeUrl: p.heroYouTubeUrl ?? null,

    sections: (p.sections ?? []).map((s) => sectionMap[s]).filter(Boolean),

    location: {
      lat: p.locationTab?.centerLat ?? 0,
      lng: p.locationTab?.centerLng ?? 0,
      address: p.city ?? '',
    },

    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }
}

export function mapProjectsToUIProjects(projects: Project[]): UIProject[] {
  return projects.map(mapProjectToUIProject)
}

