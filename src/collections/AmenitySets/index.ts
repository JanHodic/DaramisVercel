// src/collections/AmenitySets.ts
import type { CollectionConfig } from 'payload'
import { isLoggedIn, isEditorOrAbove } from '../../access/index'

export const AmenitySets: CollectionConfig = {
  slug: 'amenitySets',
  admin: { useAsTitle: 'name' },
  access: { read: isLoggedIn, create: isEditorOrAbove, update: isEditorOrAbove, delete: isEditorOrAbove },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    { name: 'items', type: 'relationship', relationTo: 'amenities', hasMany: true },
  ],
}
