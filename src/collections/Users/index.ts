// src/collections/Users.ts
import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '../../access/index'

function assertPasswordStrongEnough(pwRaw: string, emailRaw?: string) {
  const pw = String(pwRaw ?? '')
  const issues: string[] = []
  const len = pw.length

  // 1) prázdné / whitespace-only
  if (!pw || pw.trim().length === 0) {
    throw new Error('Heslo nesmí být prázdné.')
  }

  if (len < 12) issues.push('Heslo musí mít alespoň 12 znaků.')
  if (!/[a-z]/.test(pw)) issues.push('Přidej malé písmeno.')
  if (!/[A-Z]/.test(pw)) issues.push('Přidej velké písmeno.')
  if (!/[0-9]/.test(pw)) issues.push('Přidej číslo.')
  if (!/[^A-Za-z0-9]/.test(pw)) issues.push('Přidej speciální znak.')

  // lehká pojistka na opakující se znaky
  if (/^(.)\1+$/.test(pw)) issues.push('Heslo nesmí být tvořené jedním opakujícím se znakem.')

  // 2) heslo nesmí obsahovat část emailu (lokální část před @)
  const email = String(emailRaw ?? '').trim().toLowerCase()
  if (email.includes('@')) {
    const localPart = email.split('@')[0]
    const pwLower = pw.toLowerCase()
    if (localPart && localPart.length >= 3 && pwLower.includes(localPart)) {
      issues.push('Heslo nesmí obsahovat část emailu.')
    }
  }

  if (issues.length) {
    throw new Error(issues.join(' '))
  }
}

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
  hooks: {
    beforeValidate: [
      async ({ data, operation }) => {
        // Payload při create/update může posílat password v data
        if ((operation === 'create' || operation === 'update') && data?.password) {
          assertPasswordStrongEnough(String(data.password), data?.email ? String(data.email) : undefined)
        }
        return data
      },
    ],
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