'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'

// Payload UI hooks – podle verze payloadu můžeš potřebovat jiný import.
// Payload v3 obvykle: import { useField, useDocumentInfo } from '@payloadcms/ui'
// Payload v2 obvykle: import { useField } from 'payload/components/forms'; import { useDocumentInfo } from 'payload/components/utilities';

import { useField, useDocumentInfo } from '@payloadcms/ui'
import type { LeafletMouseEvent } from 'leaflet'
import { useMapEvents } from 'react-leaflet'

type Localized = { cs?: string; en?: string }

type POI = {
  id: string
  project: string | { id: string }
  name?: Localized | string
  category: string
  lat: number
  lng: number
}

const POI_CATEGORIES = [
  { label: { en: 'School', cs: 'Škola' }, value: 'school' },
  { label: { en: 'Shop', cs: 'Obchod' }, value: 'shop' },
  { label: { en: 'Park', cs: 'Park' }, value: 'park' },
  { label: { en: 'Public Transport', cs: 'MHD' }, value: 'transport' },
  { label: { en: 'Restaurant', cs: 'Restaurace' }, value: 'restaurant' },
  { label: { en: 'Pharmacy', cs: 'Lékárna' }, value: 'pharmacy' },
  { label: { en: 'Hospital', cs: 'Nemocnice' }, value: 'hospital' },
  { label: { en: 'Sport', cs: 'Sport' }, value: 'sport' },
] as const

function getProjectId(project: POI['project']) {
  return typeof project === 'string' ? project : project?.id
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const oe = (e as any).originalEvent as MouseEvent | undefined
      oe?.stopPropagation?.()

      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function readLocalized(val: Localized | string | undefined, locale: 'cs' | 'en') {
  if (!val) return ''
  if (typeof val === 'string') return val
  return val[locale] ?? val.en ?? val.cs ?? ''
}

function getLabel(v: string, locale: 'cs' | 'en') {
  return POI_CATEGORIES.find((c) => c.value === v)?.label?.[locale] ?? v
}

// React-Leaflet dynamic imports (admin běží v Nextu, SSR off)
const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false })

async function payloadFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Payload request failed (${res.status}): ${text}`)
  }
  return (await res.json()) as T
}

export function POIMapField() {
  // tyhle fieldy jsou v dokumentu POI
  const latField = useField<number>({ path: 'lat' })
  const lngField = useField<number>({ path: 'lng' })
  const projectField = useField<any>({ path: 'project' })

  // hezké: předvyplnit i name/category při vytváření nového POI z mapy
  const nameField = useField<any>({ path: 'name' })
  const categoryField = useField<any>({ path: 'category' })

  const { id: currentDocId } = useDocumentInfo() as any
  const isSaved = Boolean(currentDocId)

  const locale: 'cs' | 'en' =
    typeof document !== 'undefined' && document?.documentElement?.lang?.startsWith('en') ? 'en' : 'cs'

  const [pois, setPois] = useState<POI[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // draft pro “přidat POI klikem”
  const [draft, setDraft] = useState<null | { lat: number; lng: number }>(null)
  const [draftName, setDraftName] = useState('')
  const [draftCategory, setDraftCategory] = useState<(typeof POI_CATEGORIES)[number]['value']>('school')
  const [saving, setSaving] = useState(false)

  // Fix ikon v Next bundlu
  useEffect(() => {
    ;(async () => {
      try {
        const L = (await import('leaflet')).default
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: '/leaflet/marker-icon-2x.png',
          iconUrl: '/leaflet/marker-icon.png',
          shadowUrl: '/leaflet/marker-shadow.png',
        })
      } catch {
        // ignore
      }
    })()
  }, [])

  const projectId = useMemo(() => getProjectId(projectField.value), [projectField.value])

  const loadPOIs = useCallback(async () => {
    if (!projectId) {
      setPois([])
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await payloadFetch<{ docs: POI[] }>(
        `/api/pointsOfInterests?where[project][equals]=${encodeURIComponent(projectId)}&limit=200`
      )
      setPois(data.docs ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadPOIs()
  }, [loadPOIs])

  const setLatLngFromClick = useCallback(
    (lat: number, lng: number) => {
      latField.setValue(lat)
      lngField.setValue(lng)
    },
    [latField, lngField]
  )

  const onMapClick = useCallback(
    (lat: number, lng: number) => {
      // ✅ Když dokument ještě není uložený, nesahej do form fieldů (stabilita adminu),
      // ale pořád dovol “draft” pro vytvoření nového POI z mapy.
      if (isSaved) {
        setLatLngFromClick(lat, lng)
      }

      setDraft({ lat, lng })
      setDraftName('')
      setDraftCategory('school')
    },
    [isSaved, setLatLngFromClick]
  )

  const createPOI = useCallback(async () => {
    if (!projectId || !draft) return

    const name = draftName.trim()
    if (!name) {
      setError(locale === 'cs' ? 'Zadej název POI.' : 'Please enter a POI name.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const body = {
        project: projectId,
        name: { [locale]: name },
        category: draftCategory,
        lat: draft.lat,
        lng: draft.lng,
      }

      const created = await payloadFetch<POI>(`/api/pointsOfInterests`, {
        method: 'POST',
        body: JSON.stringify(body),
      })

      setPois((prev) => [created, ...prev])
      setDraft(null)

      // bonus: když zrovna edituješ prázdný POI, můžeš si předvyplnit i jeho hodnoty
      if (!currentDocId) {
        nameField?.setValue?.({ [locale]: name })
        categoryField?.setValue?.(draftCategory)
        latField.setValue(draft.lat)
        lngField.setValue(draft.lng)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }, [
    projectId,
    draft,
    draftName,
    draftCategory,
    locale,
    currentDocId,
    nameField,
    categoryField,
    latField,
    lngField,
  ])

  const deletePOI = useCallback(async (id: string) => {
    setError('')
    try {
      await payloadFetch(`/api/pointsOfInterests/${encodeURIComponent(id)}`, { method: 'DELETE' })
      setPois((prev) => prev.filter((p) => p.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }, [])

  const center = useMemo(() => {
    const lat = typeof latField.value === 'number' ? latField.value : 50.0755
    const lng = typeof lngField.value === 'number' ? lngField.value : 14.4378
    return { lat, lng }
  }, [latField.value, lngField.value])

  const visiblePois = useMemo(() => {
    if (!projectId) return []
    return pois.filter((p) => getProjectId(p.project) === projectId)
  }, [pois, projectId])

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <div style={{ fontSize: 13, opacity: 0.85 }}>
          <div style={{ fontWeight: 700, opacity: 0.95 }}>{locale === 'cs' ? 'POI mapa' : 'POI map'}</div>
          <div style={{ marginTop: 2 }}>
            {locale === 'cs'
              ? 'Klik do mapy nastaví lat/lng tohoto POI. Zároveň můžeš založit nový POI nebo mazat existující.'
              : 'Click sets lat/lng for this POI. You can also create a new POI or delete existing ones.'}
          </div>

          {!isSaved ? (
            <div style={{ marginTop: 6, color: '#b45309' }}>
              {locale === 'cs'
                ? 'Tip: Nejprve vyplň povinná pole a ulož POI. Pak klik do mapy bude nastavovat lat/lng bez otravného potvrzování odchodu.'
                : 'Tip: First fill required fields and save the POI. Then map clicks will set lat/lng without the leave-page confirmation.'}
            </div>
          ) : null}

          {!projectId ? (
            <div style={{ marginTop: 6, color: '#b45309' }}>
              {locale === 'cs'
                ? 'Nejdřív vyber Projekt (pole "project").'
                : 'Select a Project first (the "project" field).'}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={loadPOIs}
          disabled={loading || !projectId}
          style={{
            border: '1px solid rgba(0,0,0,0.15)',
            borderRadius: 8,
            padding: '8px 10px',
            fontSize: 13,
            cursor: loading || !projectId ? 'not-allowed' : 'pointer',
            opacity: loading || !projectId ? 0.6 : 1,
          }}
        >
          {loading ? (locale === 'cs' ? 'Načítám…' : 'Loading…') : locale === 'cs' ? 'Obnovit' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <div
          style={{
            border: '1px solid rgba(239,68,68,0.35)',
            background: 'rgba(239,68,68,0.08)',
            padding: 10,
            borderRadius: 10,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 12, alignItems: 'start' }}>
        <div style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ height: 520, width: '100%' }}>
            <MapContainer center={[center.lat, center.lng]} zoom={13} style={{ height: '100%', width: '100%' }} keyboard={false}>
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapClickHandler onClick={onMapClick} />

              {/* Marker pro aktuálně editovaný POI (lat/lng pole) – jen když máme čísla */}
              {typeof latField.value === 'number' && typeof lngField.value === 'number' ? (
                <Marker position={[latField.value, lngField.value]}>
                  <Popup>
                    <div style={{ fontSize: 13 }}>
                      <div style={{ fontWeight: 700 }}>{locale === 'cs' ? 'Tento POI' : 'This POI'}</div>
                      <div style={{ opacity: 0.75, marginTop: 4 }}>
                        {latField.value.toFixed(6)}, {lngField.value.toFixed(6)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ) : null}

              {/* Existující POI v projektu */}
              {visiblePois.map((p) => (
                <Marker key={p.id} position={[p.lat, p.lng]}>
                  <Popup>
                    <div style={{ display: 'grid', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{readLocalized(p.name as any, locale) || 'POI'}</div>
                        <div style={{ fontSize: 12, opacity: 0.7 }}>{getLabel(p.category, locale)}</div>
                        <div style={{ fontSize: 12, opacity: 0.7 }}>
                          {p.lat.toFixed(6)}, {p.lng.toFixed(6)}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => setLatLngFromClick(p.lat, p.lng)}
                          style={{
                            border: '1px solid rgba(0,0,0,0.15)',
                            borderRadius: 8,
                            padding: '8px 10px',
                            fontSize: 13,
                            cursor: 'pointer',
                          }}
                        >
                          {locale === 'cs' ? 'Použít pro tento POI (lat/lng)' : 'Use for this POI (lat/lng)'}
                        </button>

                        <button
                          type="button"
                          onClick={() => deletePOI(p.id)}
                          style={{
                            border: '1px solid rgba(239,68,68,0.45)',
                            borderRadius: 8,
                            padding: '8px 10px',
                            fontSize: 13,
                            cursor: 'pointer',
                            background: 'rgba(239,68,68,0.06)',
                          }}
                          disabled={p.id === currentDocId}
                          title={
                            p.id === currentDocId
                              ? locale === 'cs'
                                ? 'Aktuální dokument mazej přes standardní Delete v adminu.'
                                : 'Delete this doc via the admin delete action.'
                              : ''
                          }
                        >
                          {locale === 'cs' ? 'Smazat POI' : 'Delete POI'}
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Draft marker pro nový POI */}
              {draft ? (
                <Marker position={[draft.lat, draft.lng]}>
                  <Popup>
                    <div style={{ fontSize: 13 }}>
                      {locale === 'cs' ? 'Nový POI' : 'New POI'}: {draft.lat.toFixed(6)}, {draft.lng.toFixed(6)}
                    </div>
                  </Popup>
                </Marker>
              ) : null}
            </MapContainer>
          </div>
        </div>

        {/* Panel pro vytvoření nového POI z kliknutí */}
        <div style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 14, padding: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>
            {locale === 'cs' ? 'Přidat nový POI (klikem)' : 'Add new POI (by click)'}
          </div>

          {!projectId ? (
            <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>
              {locale === 'cs' ? 'Nejdřív vyber projekt.' : 'Pick a project first.'}
            </div>
          ) : !draft ? (
            <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>
              {locale === 'cs'
                ? isSaved
                  ? 'Klikni do mapy — nastaví lat/lng tohoto POI a nabídne vytvoření nového.'
                  : 'Klikni do mapy — nabídne vytvoření nového POI. Lat/lng tohoto POI se začne nastavovat až po uložení.'
                : isSaved
                  ? 'Click the map — sets lat/lng for this POI and offers creating a new one.'
                  : 'Click the map — offers creating a new POI. Lat/lng for this POI will be set after saving.'}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {draft.lat.toFixed(6)}, {draft.lng.toFixed(6)}
              </div>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, opacity: 0.7 }}>{locale === 'cs' ? 'Název' : 'Name'}</span>
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder={locale === 'cs' ? 'Např. ZŠ Komenského' : 'e.g. Central School'}
                  style={{
                    border: '1px solid rgba(0,0,0,0.18)',
                    borderRadius: 10,
                    padding: '8px 10px',
                    fontSize: 13,
                  }}
                />
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, opacity: 0.7 }}>{locale === 'cs' ? 'Kategorie' : 'Category'}</span>
                <select
                  value={draftCategory}
                  onChange={(e) => setDraftCategory(e.target.value as any)}
                  style={{
                    border: '1px solid rgba(0,0,0,0.18)',
                    borderRadius: 10,
                    padding: '8px 10px',
                    fontSize: 13,
                  }}
                >
                  {POI_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label[locale]}
                    </option>
                  ))}
                </select>
              </label>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={createPOI}
                  disabled={saving}
                  style={{
                    flex: 1,
                    border: '1px solid rgba(0,0,0,0.15)',
                    borderRadius: 10,
                    padding: '9px 10px',
                    fontSize: 13,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? (locale === 'cs' ? 'Ukládám…' : 'Saving…') : locale === 'cs' ? 'Vytvořit POI' : 'Create POI'}
                </button>

                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  style={{
                    border: '1px solid rgba(0,0,0,0.15)',
                    borderRadius: 10,
                    padding: '9px 10px',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {locale === 'cs' ? 'Zrušit' : 'Cancel'}
                </button>
              </div>
            </div>
          )}

          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.08)', fontSize: 12, opacity: 0.75 }}>
            {locale === 'cs' ? `POI v projektu: ${visiblePois.length}` : `POIs in project: ${visiblePois.length}`}
          </div>
        </div>
      </div>
    </div>
  )
}
