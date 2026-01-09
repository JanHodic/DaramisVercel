// src/collections/PdfLibraries.ts
import type { CollectionConfig } from 'payload'
import { isLoggedIn, isEditorOrAbove } from '../../access/index'

export const PdfLibraries: CollectionConfig = {
  slug: 'pdfLibraries',
  admin: { useAsTitle: 'name' },
  access: { read: isLoggedIn, create: isEditorOrAbove, update: isEditorOrAbove, delete: isEditorOrAbove },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    {
      name: 'documents',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', localized: true, required: true },
        { name: 'file', type: 'upload', relationTo: 'media', required: true },
        { name: 'category', type: 'text' }, // standards/changes/pricing/...
        { name: 'order', type: 'number', defaultValue: 0 },
      ],
    },
  ],
}
