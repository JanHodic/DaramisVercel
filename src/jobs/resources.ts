import type { Payload } from 'payload'

export async function ensureRealpadResourceAsMedia(
  payload: Payload,
  uid: string,
  type: 'pdf' | 'plan' | 'image' | 'other' = 'other',
) {
  const existing = await payload.find({
    collection: 'media',
    where: { 'external.realpad.uid': { equals: uid } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs?.[0]) return existing.docs[0]

  const res = await fetch(`https://cms.realpad.eu/resource/${uid}`)
  if (!res.ok) throw new Error(`Realpad resource download failed uid=${uid} HTTP ${res.status}`)

  const buf = Buffer.from(await res.arrayBuffer())
  const contentType = res.headers.get('content-type') || 'application/octet-stream'

  return payload.create({
    collection: 'media',
    data: {
      external: { realpad: { uid, type } },
    } as any,
    file: {
      data: buf,
      mimetype: contentType,
      name: uid,
      size: buf.length,
    } as any,
  })
}
