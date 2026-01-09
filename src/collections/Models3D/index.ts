import type { CollectionConfig } from 'payload'
import { isLoggedIn, isEditorOrAbove } from '../../access/index'

export const Models3D: CollectionConfig = {
  slug: 'models3d',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'provider', 'updatedAt'],
  },
  access: {
    read: () => true,        // <-- důležité (pro frontend)
    create: isEditorOrAbove,
    update: isEditorOrAbove,
    delete: isEditorOrAbove,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      localized: true,
      required: true,
    },

    {
      name: 'provider',
      type: 'select',
      required: true,
      defaultValue: 'unity',
      options: [
        { label: 'Unity WebGL', value: 'unity' },
        { label: 'Generic iframe', value: 'iframe' },
        { label: 'GLB (Three.js)', value: 'glb' },
      ],
    },

    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        description:
          'Unity: URL na index.html WebGL buildu (např. /unity/demo/index.html nebo https://cdn/.../index.html)',
      },
    },

    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Náhled do karty / popupu (volitelné)',
      },
    },

    {
      name: 'controlsHint',
      type: 'text',
      localized: true,
      admin: {
        description: 'Např. „Tahem myši otáčíš, kolečkem zoom.“',
      },
    },

    {
      name: 'unityOptions',
      type: 'group',
      admin: {
        condition: (_, siblingData) => siblingData?.provider === 'unity',
      },
      fields: [
        {
          name: 'allowFullscreen',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'heightVh',
          type: 'number',
          defaultValue: 80,
          admin: {
            description: 'Výška iframe v % výšky viewportu',
          },
        },
      ],
    },
  ],
}