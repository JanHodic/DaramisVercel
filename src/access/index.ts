import type { Access } from 'payload'

/**
 * Payload při renderu Admin UI volá access funkce
 * BEZ auth kontextu.
 *
 * V tom případě je req.context.disableAccessControl === true
 * a MUSÍME pustit přístup, jinak se admin rozbije.
 */
const isAdminRender = (req: any): boolean =>
  req?.context?.disableAccessControl === true

export const isLoggedIn: Access = ({ req }) => {
  if (isAdminRender(req)) return true
  return Boolean(req.user)
}

export const isEditorOrAbove: Access = ({ req }) => {
  if (isAdminRender(req)) return true

  const user: any = req.user
  if (!user) return false

  // role string
  if (typeof user.role === 'string') {
    return ['editor', 'admin', 'superadmin'].includes(user.role)
  }

  // roles array
  if (Array.isArray(user.roles)) {
    return user.roles.some((r: string) =>
      ['editor', 'admin', 'superadmin'].includes(r)
    )
  }

  // fallback flagy
  if (user.admin === true || user.isAdmin === true || user.isSuperAdmin === true) {
    return true
  }

  return false
}

export const isSuperAdmin: Access = ({ req }) => {
  if (isAdminRender(req)) return true

  const user: any = req.user
  if (!user) return false

  if (user.role === 'superadmin') return true
  if (Array.isArray(user.roles) && user.roles.includes('superadmin')) return true
  if (user.isSuperAdmin === true) return true

  return false
}
