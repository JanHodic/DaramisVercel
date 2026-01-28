'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useField } from '@payloadcms/ui'

// ===== Types =====
type Localized = { cs?: string; en?: string }

type POIItem = {
  name?: Localized | string
  category?: string
  lat?: number
  lng?: number
}

function readLocalized(val: Localized | string | undefined, locale: 'cs' | 'en') {
  if (!val) return ''
  if (typeof val === 'string') return val
  return val[locale] ?? val.en ?? val.cs ?? ''
}

function getLocale(): 'cs' | 'en' {
  if (typeof document === 'undefined') return 'cs'
  return document.documentElement.lang?.startsWith('en') ? 'en' : 'cs'
}

// React-Leaflet dynamic imports (admin běží v Nextu, SSR off)
const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false })

export function POIMapFields() {
  // ===== Fields (v kontextu POI v array položce) =====
  const latField = useField<number>({ path: 'lat' })
  const lngField = useField<number>({ path: 'lng' })

  // ===== Fields (v kontextu projektu – POI array je na rootu projektu) =====
  // Tohle funguje, protože UI komponenta je renderovaná uvnitř array itemu,
  // ale `useField` umí sáhnout i na absolutní path.
  const projectCenterLat = useField<number>({ path: 'centerLat' })
  const projectCenterLng = useField<number>({ path: 'centerLng' })
  const projectZoom = useField<number>({ path: 'defaultZoom' })
  const poiListField = useField<POIItem[] | undefined>({ path: 'pointsOfInterests' })

  const locale = useMemo(() => getLocale(), [])

  // Leaflet icon fix
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

  // ===== Read-only data =====
  const pois = useMemo(() => (Array.isArray(poiListField.value) ? poiListField.value : []), [poiListField.value])

  const center = useMemo(() => {
    const lat =
      typeof latField.value === 'number'
        ? latField.value
        : typeof projectCenterLat.value === 'number'
          ? projectCenterLat.value
          : 50.0755

    const lng =
      typeof lngField.value === 'number'
        ? lngField.value
        : typeof projectCenterLng.value === 'number'
          ? projectCenterLng.value
          : 14.4378

    return { lat, lng }
  }, [latField.value, lngField.value, projectCenterLat.value, projectCenterLng.value])

  const zoom = useMemo(() => {
    const z = typeof projectZoom.value === 'number' ? projectZoom.value : 13
    return Number.isFinite(z) ? z : 13
  }, [projectZoom.value])

  // ===== UI only refresh (pro případ, že Payload někdy neprokreslí změny hned) =====
  const [renderKey, setRenderKey] = useState(0)

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <div style={{ fontSize: 13, opacity: 0.85 }}>
          <div style={{ fontWeight: 700, opacity: 0.95 }}>{locale === 'cs' ? 'POI mapa' : 'POI map'}</div>
          <div style={{ marginTop: 2 }}>
            {locale === 'cs'
              ? 'Pouze zobrazení. Mapou se nic nenastavuje.'
              : 'Read-only. Map does not change any fields.'}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setRenderKey((k) => k + 1)}
          style={{
            border: '1px solid rgba(0,0,0,0.15)',
            borderRadius: 8,
            padding: '8px 10px',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {locale === 'cs' ? 'Obnovit' : 'Refresh'}
        </button>
      </div>

      <div style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ height: 420, width: '100%' }}>
          <MapContainer
            key={renderKey}
            center={[center.lat, center.lng]}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            keyboard={false}
          >
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Marker pro aktuálně editovaný POI (lat/lng pole) */}
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

            {/* Markery všech POI v projektu */}
            {pois
              .filter((p) => typeof p?.lat === 'number' && typeof p?.lng === 'number')
              .map((p, idx) => {
                const name = readLocalized(p.name as any, locale) || (locale === 'cs' ? `POI ${idx + 1}` : `POI ${idx + 1}`)
                return (
                  <Marker key={`${p.lat}-${p.lng}-${idx}`} position={[p.lat as number, p.lng as number]}>
                    <Popup>
                      <div style={{ fontSize: 13 }}>
                        <div style={{ fontWeight: 700 }}>{name}</div>
                        {p.category ? <div style={{ opacity: 0.7, marginTop: 4 }}>{p.category}</div> : null}
                        <div style={{ opacity: 0.75, marginTop: 4 }}>
                          {(p.lat as number).toFixed(6)}, {(p.lng as number).toFixed(6)}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}