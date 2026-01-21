import type { CollectionConfig } from 'payload'
import { isLoggedIn, isEditorOrAbove } from '../../access/index'

export const TimelineItems: CollectionConfig = {
  slug: 'timeline-items',
  admin: { useAsTitle: 'title' },
  access: { read: () => true, create: isEditorOrAbove, update: isEditorOrAbove, delete: isEditorOrAbove },
  defaultSort: 'order',
  fields: [
    {
      name: 'timeline',
      type: 'relationship',
      relationTo: 'timelines',
      required: true,
      index: true,
    },
    {
      name: 'preset',
      type: 'select',
      required: true,
      defaultValue: 'custom',
      options: [
        { label: 'Custom', value: 'custom' },
        { label: 'Item 1', value: 'item1' },
        { label: 'Item 2', value: 'item2' },
        { label: 'Item 3', value: 'item3' },
        { label: 'Item 4', value: 'item4' },
        { label: 'Item 5', value: 'item5' },
        { label: 'Item 6', value: 'item6' },
        { label: 'Item 7', value: 'item7' },
        { label: 'Item 8', value: 'item8' },
      ],
    },
    { name: 'title', type: 'text', localized: true, required: true },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'from', type: 'date', required: true },
    { name: 'to', type: 'date' },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
}
