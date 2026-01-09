// src/collections/Users.ts
import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '../../access/index'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email' },
  access: {
    read: isSuperAdmin,
    create: isSuperAdmin,
    update: isSuperAdmin,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'viewer',
      options: [
        { label: 'Viewer', value: 'viewer' },
        { label: 'Editor', value: 'editor' },
        { label: 'Super admin', value: 'superadmin' },
      ],
    },
    { name: 'fullName', type: 'text' },
  ],
}
