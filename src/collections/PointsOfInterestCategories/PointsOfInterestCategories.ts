import type { CollectionConfig } from 'payload'
import { isLoggedIn, isEditorOrAbove } from '../../access/index'

export const PointOfInterestCategories: CollectionConfig = {
  slug: 'poi-categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'key'],
  },
  access: {
    read: () => true,
    create: isEditorOrAbove,
    update: isEditorOrAbove,
    delete: isEditorOrAbove,
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Technický klíč (např. school, shop, park)',
      },
    },
    {
      name: 'name',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Ikona kategorie (volitelné)',
      },
    },
  ],
}
