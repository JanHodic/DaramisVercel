// src/collections/PointsOfInterest.ts
import type { CollectionConfig } from 'payload'
import { isEditorOrAbove } from '../../access/index'

/**
 * POI categories are now just an in-code array (no separate collection).
 * Add/remove options here.
 */
const POI_CATEGORIES = [
  { label: { en: 'School', cs: 'Škola' }, value: 'school' },
  { label: { en: 'Shop', cs: 'Obchod' }, value: 'shop' },
  { label: { en: 'Park', cs: 'Park' }, value: 'park' },
  { label: { en: 'Public Transport', cs: 'MHD' }, value: 'transport' },
  { label: { en: 'Restaurant', cs: 'Restaurace' }, value: 'restaurant' },
  { label: { en: 'Pharmacy', cs: 'Lékárna' }, value: 'pharmacy' },
  { label: { en: 'Hospital', cs: 'Nemocnice' }, value: 'hospital' },
  { label: { en: 'Sport', cs: 'Sport' }, value: 'sport' },
] as const

export const PointsOfInterest: CollectionConfig = {
  slug: 'pointsOfInterests',
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
    create: isEditorOrAbove,
    update: isEditorOrAbove,
    delete: isEditorOrAbove,
  },
  fields: [
    // 1:N vazba: jeden Project má mnoho POI
    {
      name: 'project',
      label: { en: 'Project', cs: 'Projekt' },
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: {
          en: 'This POI belongs to a single project.',
          cs: 'Tento POI patří k jednomu projektu.',
        },
      },
    },

    {
      name: 'poiMap',
      type: 'ui',
      admin: {
        position: 'main',
        components: {
          Field: 'src/components/admin/POIMapField#POIMapField',
        },
      },
    },

    { name: 'name', label: { en: 'Name', cs: 'Název' }, type: 'text', localized: true, required: true },

    // category = enum (no poi-categories collection)
    {
      name: 'category',
      label: { en: 'Category', cs: 'Kategorie' },
      type: 'select',
      required: true,
      options: POI_CATEGORIES as any,
      admin: {
        description: {
          en: 'Category enum (stored directly on the POI).',
          cs: 'Kategorie jako enum (uloženo přímo v POI).',
        },
      },
    },

    { name: 'lat', label: { en: 'Latitude', cs: 'Zeměpisná šířka' }, type: 'number', required: true },
    { name: 'lng', label: { en: 'Longitude', cs: 'Zeměpisná délka' }, type: 'number', required: true },

    { name: 'distanceText', label: { en: 'Distance Text', cs: 'Text vzdálenosti' }, type: 'text', localized: true }, // "5 min"
    { name: 'description', label: { en: 'Description', cs: 'Popis' }, type: 'textarea', localized: true },

    {
      name: 'logo',
      label: { en: 'Logo', cs: 'Logo' },
      type: 'upload',
      relationTo: 'media',
    },

    {
      name: 'links',
      label: { en: 'Links', cs: 'Odkazy' },
      type: 'array',
      fields: [
        { name: 'label', label: { en: 'Label', cs: 'Popisek' }, type: 'text', localized: true },
        { name: 'url', label: { en: 'URL', cs: 'URL' }, type: 'text' },
      ],
    },
  ],
}