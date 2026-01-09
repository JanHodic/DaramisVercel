// src/collections/Projects.ts
import type { CollectionConfig } from 'payload'
import { isLoggedIn, isEditorOrAbove } from '../../access/index'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'city', 'updatedAt'] },
  access: {
    read: isLoggedIn,
    create: isEditorOrAbove,
    update: isEditorOrAbove,
    delete: isEditorOrAbove,
  },
  fields: [
    // --- basics
    { name: 'title', type: 'text', localized: true, required: true },
    { name: 'subtitle', type: 'text', localized: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'current',
      options: [
        { label: 'Planned', value: 'planned' },
        { label: 'Current', value: 'current' },
        { label: 'Finished', value: 'finished' },
      ],
    },
    { name: 'city', type: 'text', localized: true },
    { name: 'cover', type: 'upload', relationTo: 'media' },

    // --- dashboard presentation config
    {
      name: 'dashboard',
      type: 'group',
      fields: [
        { name: 'pinLat', type: 'number' },
        { name: 'pinLng', type: 'number' },
        { name: 'badgeLabel', type: 'text', localized: true },
        {
          name: 'highlights',
          type: 'array',
          fields: [
            { name: 'title', type: 'text', localized: true, required: true },
            { name: 'value', type: 'text', localized: true },
            { name: 'icon', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },

    // --- sections switch + ordering (big win!)
    {
      name: 'sections',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'key',
          type: 'select',
          required: true,
          options: [
            { label: 'Location & Surroundings', value: 'location' },
            { label: 'Gallery / Views', value: 'gallery' },
            { label: 'Amenities', value: 'amenities' },
            { label: 'Standards / PDFs', value: 'standards' },
            { label: 'Timeline', value: 'timeline' },
            { label: 'Units / Realpad', value: 'units' },
            { label: '3D Model', value: 'model3d' },
          ],
        },
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        { name: 'titleOverride', type: 'text', localized: true },
      ],
    },

    // --- relations to content modules
    { name: 'location', type: 'relationship', relationTo: 'locations' },
    { name: 'gallery', type: 'relationship', relationTo: 'galleries' },
    { name: 'amenities', type: 'relationship', relationTo: 'amenitySets' },
    { name: 'standards', type: 'relationship', relationTo: 'pdfLibraries' },
    { name: 'timeline', type: 'relationship', relationTo: 'timelines' },
    { name: 'units', type: 'relationship', relationTo: 'unitConfigs' },
    { name: 'model3d', type: 'relationship', relationTo: 'models3d' },
  ],
}
