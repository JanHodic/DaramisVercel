// src/collections/Amenities.ts
import type { CollectionConfig } from 'payload'
import { isLoggedIn, isEditorOrAbove } from '../../access/index'

export const Amenities: CollectionConfig = {
  slug: 'amenities',
  admin: { useAsTitle: 'title' },
  access: { read: isLoggedIn, create: isEditorOrAbove, update: isEditorOrAbove, delete: isEditorOrAbove },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'media', type: 'upload', relationTo: 'media' },
  ],
}
