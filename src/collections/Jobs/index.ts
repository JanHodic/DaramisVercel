import type { CollectionConfig } from 'payload'
import { isLoggedIn, isEditorOrAbove } from '../../access'

export const Jobs: CollectionConfig = {
  slug: 'jobs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'published', 'updatedAt'],
  },
  access: {
    read: isLoggedIn, // pokud chceš veřejně přes /public/jobs, nech read v adminu klidně jen pro login
    create: isEditorOrAbove,
    update: isEditorOrAbove,
    delete: isEditorOrAbove,
  },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    { name: 'slug', type: 'text', required: true, unique: true },

    // publish toggle (aby šlo na FE filtrovat jen public)
    { name: 'published', type: 'checkbox', defaultValue: true },

    // basic content
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
    },

    // meta / attributes (optional, ale praktické)
    { name: 'location', type: 'text', localized: true },
    { name: 'employmentType', type: 'select', options: ['full-time', 'part-time', 'contract', 'internship'] },
    { name: 'department', type: 'text', localized: true },

    // attachments (PDF etc.) → jde do R2 přes media
    {
      name: 'attachments',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
  ],
}
