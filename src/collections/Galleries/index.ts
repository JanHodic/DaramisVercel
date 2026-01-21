// src/collections/Galleries.ts
import type { CollectionConfig } from 'payload'
import { isLoggedIn, isEditorOrAbove } from '../../access/index'

export const Galleries: CollectionConfig = {
  slug: 'galleries',
  admin: { useAsTitle: 'name' },
  access: { read: () => true, create: isEditorOrAbove, update: isEditorOrAbove, delete: isEditorOrAbove },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    {
      name: 'categories',
      type: 'array',
      fields: [
        { name: 'key', type: 'text', required: true }, // exterior/interior/location/views
        { name: 'label', type: 'text', localized: true, required: true },
      ],
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'media', type: 'upload', relationTo: 'media', required: true },
        { name: 'category', type: 'text' },
        { name: 'caption', type: 'text', localized: true },
        { name: 'order', type: 'number', defaultValue: 0 },
      ],
    },
  ],
}
