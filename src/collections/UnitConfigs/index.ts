// src/collections/UnitConfigs.ts
import type { CollectionConfig } from 'payload'
import { isLoggedIn, isEditorOrAbove } from '../../access/index'

export const UnitConfigs: CollectionConfig = {
  slug: 'unitConfigs',
  admin: { useAsTitle: 'name' },
  access: { read: isLoggedIn, create: isEditorOrAbove, update: isEditorOrAbove, delete: isEditorOrAbove },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },

    { name: 'maxCompare', type: 'number', defaultValue: 4 },

    {
      name: 'featuredRules',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', localized: true },
        { name: 'field', type: 'text' }, // "pricePerM2"
        { name: 'direction', type: 'select', options: ['asc', 'desc'], defaultValue: 'asc' },
      ],
    },

    {
      name: 'realpad',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false },

        // Base URL + API credentials (per unitConfig / per project)
        { name: 'baseUrl', type: 'text' },
        { name: 'login', type: 'text' },
        { name: 'password', type: 'text', admin: { description: 'Stored server-side only.' } },

        { name: 'screenId', type: 'number' },

        // ✅ jen JEDEN projectId field (žádný top-level realpadProjectId)
        { name: 'projectId', type: 'text' },

        { name: 'developerId', type: 'number' },

        // optional
        { name: 'syncFrequencyMinutes', type: 'number', defaultValue: 60 },

        // readonly sync metadata
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
        { name: 'lastSyncError', type: 'textarea', admin: { readOnly: true } },
      ],
    },
  ],
}