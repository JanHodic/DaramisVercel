// src/collections/Advantages.ts
import type { CollectionConfig } from 'payload'
import { isLoggedIn, isEditorOrAbove } from '../../access/index'

export const Advantages: CollectionConfig = {
  slug: 'advantages',
  admin: { useAsTitle: 'title' },
  access: { read: isLoggedIn, create: isEditorOrAbove, update: isEditorOrAbove, delete: isEditorOrAbove },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    { name: 'short', type: 'textarea', localized: true },
    { name: 'icon', type: 'upload', relationTo: 'media' },
    {
      name: 'content',
      type: 'richText',
      localized: true,
    },
  ],
}
