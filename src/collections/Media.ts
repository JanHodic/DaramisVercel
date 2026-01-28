import type { CollectionConfig } from 'payload'

import { FixedToolbarFeature, InlineToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const useLocalMedia = process.env.MEDIA_LOCAL === 'true'

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },

    // --- External source mapping (Realpad)
    {
      name: 'external',
      type: 'group',
      admin: { description: 'External source mapping (e.g. Realpad resource UID)' },
      fields: [
        {
          name: 'realpad',
          type: 'group',
          fields: [
            {
              name: 'uid',
              type: 'text',
              unique: true,
              admin: { description: 'Realpad immutable resource UID' },
            },
            {
              name: 'type',
              type: 'select',
              options: [
                { label: 'PDF', value: 'pdf' },
                { label: 'Plan', value: 'plan' },
                { label: 'Image', value: 'image' },
                { label: 'Other', value: 'other' },
              ],
              defaultValue: 'other',
            },
          ],
        },
      ],
    },
  ],
  upload: {
    ...(useLocalMedia ? { staticDir: path.resolve(dirname, '../../public/media') } : {}),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      { name: 'thumbnail', width: 300 },
      { name: 'square', width: 500, height: 500 },
      { name: 'small', width: 600 },
      { name: 'medium', width: 900 },
      { name: 'large', width: 1400 },
      { name: 'xlarge', width: 1920 },
      { name: 'og', width: 1200, height: 630, crop: 'center' },
    ],
  },
}