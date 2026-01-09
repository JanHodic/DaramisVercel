// src/globals/AppSettings.ts
import type { GlobalConfig } from 'payload'
import { isEditorOrAbove, isLoggedIn } from '../access'

export const AppSettings: GlobalConfig = {
  slug: 'appSettings',
  access: { read: isLoggedIn, update: isEditorOrAbove },
  fields: [
    { name: 'appName', type: 'text', localized: true, required: true },
    {
      name: 'dashboardDefaultView',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Map', value: 'map' },
      ],
    },
    {
      name: 'mapDefaults',
      type: 'group',
      fields: [
        { name: 'defaultShowPlanned', type: 'checkbox', defaultValue: true },
        { name: 'defaultShowCurrent', type: 'checkbox', defaultValue: true },
        { name: 'defaultShowFinished', type: 'checkbox', defaultValue: false },
      ],
    },
    { name: 'brandPrimaryColor', type: 'text', defaultValue: '#0EA5E9' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
  ],
}
