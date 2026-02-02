// Project Types
export type ProjectStatus = 'current' | 'planned' | 'completed';

export type SectionType = 'intro' | 'location' | 'model' | 'units' | 'gallery' | 'amenities' | 'standards' | 'timeline';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  mainImage: string;
  icon: string | null;
  webLink: string | null;
  youtubeUrl?: string | null;
  buildingPlanFile?: string | null;
  sections: SectionType[];
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Unit Types
export type UnitStatus = 'available' | 'reserved' | 'sold';
export type Disposition = '1+kk' | '2+kk' | '3+kk' | '4+kk';

export interface Unit {
  id: string;
  name: string;
  floor: number;
  building: string;
  size: number;
  disposition: Disposition;
  balcony: boolean;
  balconyArea?: number;
  terrace: boolean;
  terraceArea?: number;
  gardenArea?: number;
  orientation?: string;
  price: number;
  status: UnitStatus;
  floorPlan: string;
  floorPlanPdf?: string;
}

// Amenity Types
export interface Amenity {
  id: string;
  name: string;
  description?: string;
  image?: string;
  video?: string;
  order: number;
}

// Timeline Types
export interface TimelineMilestone {
  id: string;
  name: string;
  description?: string;
  dateFrom?: string;
  dateTo?: string;
  order: number;
}

// Location/Map Types
export interface LocationCategory {
  id: string;
  name: string;
  nameEn: string;
  color: string;
  icon: string;
}

export interface MapLocation {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  description?: string;
  image?: string | null;
  link?: string | null;
}

// PDF Types
export interface PDFDocument {
  id: string;
  name: string;
  file: string;
  thumbnail: string;
  order: number;
}

// Gallery Types
export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  order: number;
}

// User Types
export type UserRole = 'superadmin' | 'editor' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string | null;
  createdAt: string;
}

export interface RolePermissions {
  name: string;
  permissions: string[];
}

// Auth Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// i18n Types
export type Language = 'cs' | 'en';

export interface TranslationStrings {
  [key: string]: string | TranslationStrings;
}
