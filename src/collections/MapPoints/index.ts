import type { CollectionConfig } from 'payload'
import { isLoggedIn, isEditorOrAbove } from '../../access/index'

export const MapPoints: CollectionConfig = {
  slug: 'mapPoints',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'project', 'updatedAt'],
  },
  access: {
    read: () => true,        // <-- důležité (pro frontend)
    create: isEditorOrAbove,
    update: isEditorOrAbove,
    delete: isEditorOrAbove,
  },
  fields: [
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      admin: {
        description: 'Ke kterému projektu bod patří',
      },
    },

    {
      name: 'name',
      type: 'text',
      localized: true,
      required: true,
    },

    {
      name: 'lat',
      type: 'number',
      required: true,
      admin: {
        description: 'Zeměpisná šířka',
      },
    },

    {
      name: 'lng',
      type: 'number',
      required: true,
      admin: {
        description: 'Zeměpisná délka',
      },
    },

    {
      name: 'model3d',
      type: 'relationship',
      relationTo: 'models3d',
      required: true,
      admin: {
        description: '3D model, který se otevře po kliknutí',
      },
    },

    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Náhled do popupu (bez načítání 3D)',
      },
    },

    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Volitelné řazení bodů',
      },
    },
  ],
}