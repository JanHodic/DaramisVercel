// src/collections/Locations.ts
import type { CollectionConfig } from 'payload'
import { isLoggedIn, isEditorOrAbove } from '../../access/index'

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: { useAsTitle: 'name' },
  access: { read: isLoggedIn, create: isEditorOrAbove, update: isEditorOrAbove, delete: isEditorOrAbove },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    { name: 'centerLat', type: 'number', required: true },
    { name: 'centerLng', type: 'number', required: true },
    { name: 'defaultZoom', type: 'number', defaultValue: 13 },
    {
      name: 'filters',
      type: 'array',
      fields: [
        { name: 'key', type: 'text', required: true },
        { name: 'label', type: 'text', localized: true, required: true },
        { name: 'icon', type: 'upload', relationTo: 'media' },
        { name: 'defaultOn', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      name: 'pointsOfInterests',
      type: 'relationship',
      relationTo: 'pointsOfInterests',
      hasMany: true,
    },
    {
      name: 'advantages',
      type: 'relationship',
      relationTo: 'advantages',
      hasMany: true,
    },
  ],
}
