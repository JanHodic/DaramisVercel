import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

export async function getRedirects(_depth = 1) {
  const _payload = await getPayload({ config: configPromise })

  /*const { docs: redirects } = await _payload.find({
    collection: 'redirects' as any,
    depth: _depth,
    limit: 1000,
    pagination: false,
  })*/

  return [] // redirects
}

/**
 * Returns a unstable_cache function mapped with the cache tag for 'redirects'.
 *
 * Cache all redirects together to avoid multiple fetches.
 */
export const getCachedRedirects = () =>
  unstable_cache(async () => getRedirects(), ['redirects'], {
    tags: ['redirects'],
  })
