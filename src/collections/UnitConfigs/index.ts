// src/collections/UnitConfigs.ts
import type { CollectionConfig } from 'payload'
import { isLoggedIn, isEditorOrAbove } from '../../access/index'

export const UnitConfigs: CollectionConfig = {
  slug: 'unitConfigs',
  admin: { useAsTitle: 'name' },
  access: { read: isLoggedIn, create: isEditorOrAbove, update: isEditorOrAbove, delete: isEditorOrAbove },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    { name: 'realpadBaseUrl', type: 'text' },
    { name: 'realpadProjectId', type: 'text' },
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
  ],
}
