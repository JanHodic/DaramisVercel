import type { CollectionConfig } from 'payload'
import { isLoggedIn, isEditorOrAbove } from '../../access/index'

export const PointsOfInterest: CollectionConfig = {
  slug: 'pointsOfInterests',
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
    create: isEditorOrAbove,
    update: isEditorOrAbove,
    delete: isEditorOrAbove,
  },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },

    {
      name: 'category',
      type: 'relationship',
      relationTo: 'poi-categories',
      required: true,
    },

    { name: 'lat', type: 'number', required: true },
    { name: 'lng', type: 'number', required: true },

    { name: 'distanceText', type: 'text', localized: true }, // "5 min"
    { name: 'description', type: 'textarea', localized: true },

    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },

    {
      name: 'links',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', localized: true },
        { name: 'url', type: 'text' },
      ],
    },
  ],
}
