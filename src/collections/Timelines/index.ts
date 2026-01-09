// src/collections/Timelines.ts
import type { CollectionConfig } from 'payload'
import { isLoggedIn, isEditorOrAbove } from '../../access/index'

export const Timelines: CollectionConfig = {
  slug: 'timelines',
  admin: { useAsTitle: 'name' },
  access: { read: isLoggedIn, create: isEditorOrAbove, update: isEditorOrAbove, delete: isEditorOrAbove },
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    {
      name: 'milestones',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', localized: true, required: true },
        { name: 'date', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'planned',
          options: [
            { label: 'Planned', value: 'planned' },
            { label: 'In progress', value: 'inProgress' },
            { label: 'Done', value: 'done' },
          ],
        },
        { name: 'note', type: 'textarea', localized: true },
        { name: 'order', type: 'number', defaultValue: 0 },
      ],
    },
  ],
}
