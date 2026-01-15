// src/collections/Projects.ts
import type { CollectionConfig } from 'payload'
import { isLoggedIn, isEditorOrAbove } from '../../access/index'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'city', 'updatedAt'],
  },
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

    // --- 3D visualization (media upload)
    {
      name: 'model3d',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: '3D vizualizace / viewer (např. Unity WebGL build)',
      },
    },

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

    // --- sections switch + ordering
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
            { label: 'Standards / PDFs', value: 'standards' },
            { label: 'Timeline', value: 'timeline' },
            { label: 'Units / Realpad', value: 'units' },
          ],
        },
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        { name: 'titleOverride', type: 'text', localized: true },
      ],
    },

    // --- relations to content modules
    { name: 'location', type: 'relationship', relationTo: 'locations' },
    { name: 'gallery', type: 'relationship', relationTo: 'galleries' },

    // --- standards now directly media (PDFs, brochures, etc.)
    {
      name: 'standards',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },

    { name: 'timeline', type: 'relationship', relationTo: 'timelines' },
    // --- Realpad integration (per project)
    {
      name: 'realpad',
      type: 'group',
      admin: {
        description: 'Realpad PRICELIST sync config (per project). Values are used server-side only.',
      },
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false },

        { name: 'login', type: 'text' },
        {
          name: 'password',
          type: 'text',
          admin: {
            description: 'Stored server-side only. Do NOT expose to frontend.',
          },
        },

        { name: 'screenId', type: 'number' },
        { name: 'projectId', type: 'number' },
        { name: 'developerId', type: 'number' },

        // Optional: allow per-project frequency if you want (default hourly in cron)
        {
          name: 'syncFrequencyMinutes',
          type: 'number',
          defaultValue: 60,
          admin: { description: 'How often to refresh Realpad data for this project (minutes).' },
        },

        // Sync metadata / logging (readonly)
        { name: 'lastSyncAt', type: 'date', admin: { readOnly: true } },
        {
          name: 'lastSyncStatus',
          type: 'select',
          options: [
            { label: 'OK', value: 'ok' },
            { label: 'Error', value: 'error' },
            { label: 'Skipped', value: 'skipped' },
          ],
          admin: { readOnly: true },
        },
        {
          name: 'lastSyncError',
          type: 'textarea',
          admin: { readOnly: true },
        },
      ],
    },

    { name: 'units', type: 'relationship', relationTo: 'unitConfigs' },
  ],
}