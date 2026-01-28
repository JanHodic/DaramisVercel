// src/collections/Posts.ts
import type { CollectionConfig } from 'payload'

export default const Post: CollectionConfig = {
  slug: 'post',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'content', type: 'textarea' },
  ],
}