// Project Types
export type UIProjectStatus = 'current' | 'planned' | 'completed';

export type UISectionType = 'intro' | 'location' | 'model' | 'units' | 'gallery' | 'amenities' | 'standards' | 'timeline';

export interface UIProject {
  id: string;
  name: string;
  status: UIProjectStatus;
  mainImage: string;
  icon: string | null;
  webLink: string | null;
  youtubeUrl?: string | null;
  buildingPlanFile?: string | null;
  sections: UISectionType[];
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Unit Types
export type UIUnitStatus = 'available' | 'reserved' | 'sold';
export type UIDisposition = '1+kk' | '2+kk' | '3+kk' | '4+kk';

export interface UIUnit {
  id: string;
  name: string;
  floor: number;
  building: string;
  size: number;
  disposition: UIDisposition;
  balcony: boolean;
  balconyArea?: number;
  terrace: boolean;
  terraceArea?: number;
  gardenArea?: number;
  orientation?: string;
  price: number;
  status: UIUnitStatus;
  floorPlan: string;
  floorPlanPdf?: string;
}

// Amenity Types
export interface UIAmenity {
  id: string;
  name: string;
  description?: string;
  image?: string;
  video?: string;
  order: number;
}

// Timeline Types
export interface UITimelineMilestone {
  id: string;
  name: string;
  description?: string;
  dateFrom?: string;
  dateTo?: string;
  order: number;
}

// Location/Map Types
export interface UILocationCategory {
  id: string;
  name: string;
  nameEn: string;
  color: string;
  icon: string;
}

export interface UIMapLocation {
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
export interface UIPDFDocument {
  id: string;
  name: string;
  file: string;
  thumbnail: string;
  order: number;
}

// Gallery Types
export interface UIGalleryImage {
  id: string;
  src: string;
  alt: string;
  order: number;
}

// User Types
export type UserRole = 'superadmin' | 'editor' | 'viewer';

export interface UIUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string | null;
  createdAt: string;
}

export interface UIRolePermissions {
  name: string;
  permissions: string[];
}

// Auth Types
export interface UIAuthState {
  user: UIUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// i18n Types
export type UILanguage = 'cs' | 'en';

export interface UITranslationStrings {
  [key: string]: string | UITranslationStrings;
}
