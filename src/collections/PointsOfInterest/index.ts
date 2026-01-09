// src/collections/PointsOfInterests.ts
import type { CollectionConfig } from 'payload'
import { isLoggedIn, isEditorOrAbove } from '../../access/index'

export const PointsOfInterest: CollectionConfig = {
  slug: 'pointsOfInterests',
  admin: { useAsTitle: 'name' },
  access: { read: isLoggedIn, create: isEditorOrAbove, update: isEditorOrAbove, delete: isEditorOrAbove },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    { name: 'category', type: 'text', required: true }, // matches Locations.filters.key
    { name: 'lat', type: 'number', required: true },
    { name: 'lng', type: 'number', required: true },
    { name: 'distanceText', type: 'text', localized: true }, // "5 min"
    { name: 'description', type: 'textarea', localized: true },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'links',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', localized: true },
        { name: 'url', type: 'text' },
      ],
    },
  ],
}
