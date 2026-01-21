import type { CollectionConfig } from 'payload'
import { isLoggedIn, isEditorOrAbove } from '../../access/index'

export const Timelines: CollectionConfig = {
  slug: 'timelines',
  admin: { useAsTitle: 'name' },
  access: { read: () => true, create: isEditorOrAbove, update: isEditorOrAbove, delete: isEditorOrAbove },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },

    {
      name: 'items',
      type: 'relationship',
      relationTo: 'timeline-items',
      hasMany: true,
    },
  ],
}
