import type { Access } from 'payload'

export const isLoggedIn: Access = ({ req }) => {
  return Boolean(req.user)
}

export const isEditorOrAbove: Access = ({ req }) => {
  return Boolean(
    req.user &&
    ['editor', 'superadmin'].includes((req.user as any).role)
  )
}

export const isSuperAdmin: Access = ({ req }) => {
  return Boolean(
    req.user &&
    (req.user as any).role === 'superadmin'
  )
}
