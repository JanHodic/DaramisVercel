'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useField, useDocumentInfo } from '@payloadcms/ui'
import type { LeafletMouseEvent } from 'leaflet'
import { useMap, useMapEvents } from 'react-leaflet'

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const oe = (e as any).originalEvent as MouseEvent | undefined
      const target = (oe?.target as HTMLElement | null) ?? null

      // ⛔ ignore clicks on leaflet controls (zoom + / - etc.)
      if (target?.closest?.('.leaflet-control')) return

      oe?.stopPropagation?.()
      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function MapViewSync({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom, { animate: false })
  }, [map, center.lat, center.lng, zoom])
  return null
}

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false })

function findSaveButton(): HTMLButtonElement | null {
  const candidates: Array<HTMLButtonElement | null> = [
    document.querySelector('form button[type="submit"]') as HTMLButtonElement | null,
    document.querySelector('button[type="submit"]') as HTMLButtonElement | null,
    document.querySelector('button[data-action="save"]') as HTMLButtonElement | null,
    document.querySelector('button[aria-label*="Save" i]') as HTMLButtonElement | null,
    document.querySelector('button[aria-label*="Uložit" i]') as HTMLButtonElement | null,
  ]

  for (const b of candidates) {
    if (b && !b.disabled) return b
  }

  const buttons = Array.from(document.querySelectorAll('button')) as HTMLButtonElement[]
  const byText = buttons.find((b) => {
    if (b.disabled) return false
    const t = (b.textContent ?? '').trim().toLowerCase()
    return t === 'save' || t === 'uložit' || t === 'ulozit'
  })

  return byText ?? null
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

type POICategory = 'school' | 'shop' | 'park' | 'transport' | 'restaurant' | 'pharmacy' | 'hospital' | 'sport'

type POIItem = {
  name?: Record<string, string> | string
  category: POICategory
  lat: number
  lng: number
  distanceText?: Record<string, string> | string
  description?: Record<string, string> | string
  logo?: string
  links?: Array<{ label?: Record<string, string> | string; url?: string }>
}

export function ProjectMapField() {
  const centerLatField = useField<number>({ path: 'centerLat' })
  const centerLngField = useField<number>({ path: 'centerLng' })
  const zoomField = useField<number>({ path: 'defaultZoom' })

  const poiField = useField<POIItem[] | undefined>({ path: 'pointsOfInterests' })

  const { id: currentDocId } = useDocumentInfo() as any
  const isSaved = Boolean(currentDocId)

  const locale: 'cs' | 'en' =
    typeof document !== 'undefined' && document?.documentElement?.lang?.startsWith('en') ? 'en' : 'cs'

  const [autoSaving, setAutoSaving] = useState(false)
  const [uiError, setUiError] = useState<string>('')

  const pendingFirstClickRef = useRef<null | { lat: number; lng: number }>(null)
  const saveAttemptedRef = useRef(false)

  // first click = set project position, next clicks = add POI
  const didSetProjectPositionRef = useRef(false)

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // ✅ DEFAULTY jen na CREATE (na edit nešahej, jinak se přepíše uložená poloha)
  useEffect(() => {
    if (isSaved) return

    const latMissing = typeof centerLatField.value !== 'number'
    const lngMissing = typeof centerLngField.value !== 'number'
    const zoomMissing = typeof zoomField.value !== 'number'

    if (latMissing) centerLatField.setValue(50.0755)
    if (lngMissing) centerLngField.setValue(14.4378)
    if (zoomMissing) zoomField.setValue(13)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSaved])

  // pokud už má projekt pozici (edit existujícího), hned přepni do "POI mód"
  useEffect(() => {
    if (typeof centerLatField.value === 'number' && typeof centerLngField.value === 'number' && isSaved) {
      didSetProjectPositionRef.current = true
    }
  }, [centerLatField.value, centerLngField.value, isSaved])

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

  const center = useMemo(() => {
    const lat = typeof centerLatField.value === 'number' ? centerLatField.value : 50.0755
    const lng = typeof centerLngField.value === 'number' ? centerLngField.value : 14.4378
    return { lat, lng }
  }, [centerLatField.value, centerLngField.value])

  const zoom = useMemo(() => {
    const z = typeof zoomField.value === 'number' ? zoomField.value : 13
    return Number.isFinite(z) ? z : 13
  }, [zoomField.value])

  const pois = useMemo(() => (Array.isArray(poiField.value) ? poiField.value : []), [poiField.value])

  const makePOIName = useCallback((index1Based: number) => `POI ${index1Based}`, [])

  const addPOIAt = useCallback(
    (lat: number, lng: number) => {
      if (!poiField || typeof poiField.setValue !== 'function') {
        setUiError(locale === 'cs' ? 'Pole POI není dostupné na formuláři.' : 'POI field is not available on the form.')
        return
      }

      const nextIndex = pois.length + 1
      const newPOI: POIItem = {
        name: { [locale]: makePOIName(nextIndex) },
        category: 'school',
        lat,
        lng,
        links: [],
      }

      poiField.setValue([...pois, newPOI])
    },
    [locale, makePOIName, poiField, pois]
  )

  const onMapClick = useCallback(
    (lat: number, lng: number) => {
      setUiError('')

      // 1) první klik = poloha projektu (+ autosave s kontrolou)
      if (!didSetProjectPositionRef.current) {
        didSetProjectPositionRef.current = true

        centerLatField.setValue(lat)
        centerLngField.setValue(lng)

        if (!isSaved && !saveAttemptedRef.current) {
          saveAttemptedRef.current = true
          pendingFirstClickRef.current = { lat, lng }
          setAutoSaving(true)
        }

        return
      }

      // 2) další kliky = přidávání POI
      addPOIAt(lat, lng)
    },
    [addPOIAt, centerLatField, centerLngField, isSaved]
  )

  // ✅ autosave až ve chvíli, kdy payload opravdu propsal hodnoty do field.value (kontrola – NESMÍ ZMIZET)
  useEffect(() => {
    if (isSaved) {
      pendingFirstClickRef.current = null
      setAutoSaving(false)
      return
    }

    if (!autoSaving) return
    if (!pendingFirstClickRef.current) return

    const desired = pendingFirstClickRef.current
    const latOk = typeof centerLatField.value === 'number' && Math.abs(centerLatField.value - desired.lat) < 1e-9
    const lngOk = typeof centerLngField.value === 'number' && Math.abs(centerLngField.value - desired.lng) < 1e-9
    if (!latOk || !lngOk) return

    ;(async () => {
      await sleep(80)

      const saveBtn = findSaveButton()
      if (!saveBtn) {
        setUiError(locale === 'cs' ? 'Nenašel jsem tlačítko Save/Uložit v adminu.' : 'Could not find the Save button in admin.')
        setAutoSaving(false)
        saveAttemptedRef.current = false
        pendingFirstClickRef.current = null
        return
      }

      saveBtn.click()

      await sleep(1200)
      setAutoSaving(false)
    })()
  }, [autoSaving, isSaved, centerLatField.value, centerLngField.value, locale])

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ fontSize: 13, opacity: 0.85 }}>
        <div style={{ fontWeight: 700, opacity: 0.95 }}>
          {locale === 'cs' ? 'Poloha projektu a POI' : 'Project position & POIs'}
        </div>

        {!isSaved ? (
          <div style={{ marginTop: 6, color: '#b45309' }}>{autoSaving ? (locale === 'cs' ? 'Ukládám…' : 'Saving…') : null}</div>
        ) : null}

        {uiError ? <div style={{ marginTop: 6, color: '#b91c1c' }}>{uiError}</div> : null}
      </div>

      <div style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ height: 420, width: '100%' }}>
          {isClient ? (
            <MapContainer
              center={[center.lat, center.lng]}
              zoom={zoom}
              style={{ height: '100%', width: '100%' }}
              keyboard={false}
            >
              <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* ✅ důležité: aby se POI načetly/ukázaly hned po načtení dat (bez prvního kliku) */}
              <MapViewSync center={center} zoom={zoom} />

              <MapClickHandler onClick={onMapClick} />

              {typeof centerLatField.value === 'number' && typeof centerLngField.value === 'number' ? (
                <Marker position={[centerLatField.value, centerLngField.value]}>
                  <Popup>
                    <div style={{ fontSize: 13 }}>
                      <div style={{ fontWeight: 700 }}>{locale === 'cs' ? 'Poloha projektu' : 'Project position'}</div>
                      <div style={{ opacity: 0.75, marginTop: 4 }}>
                        {centerLatField.value.toFixed(6)}, {centerLngField.value.toFixed(6)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ) : null}

              {/* ✅ POI markery se renderují hned z hodnot ve form state */}
              {pois.map((p, i) => (
                <Marker key={`${p.lat}-${p.lng}-${i}`} position={[p.lat, p.lng]}>
                  <Popup>
                    <div style={{ fontSize: 13 }}>
                      <div style={{ fontWeight: 700 }}>
                        {typeof p.name === 'string'
                          ? p.name
                          : (p.name as any)?.[locale] ?? (p.name as any)?.cs ?? (p.name as any)?.en ?? `POI ${i + 1}`}
                      </div>
                      <div style={{ opacity: 0.75, marginTop: 4 }}>
                        {p.lat.toFixed(6)}, {p.lng.toFixed(6)}
                      </div>
                      <div style={{ opacity: 0.7, marginTop: 6 }}>
                        {locale === 'cs' ? 'Kategorie:' : 'Category:'} {p.category}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div style={{ height: '100%', display: 'grid', placeItems: 'center', fontSize: 13, opacity: 0.75 }}>
              {locale === 'cs' ? 'Načítám mapu…' : 'Loading map…'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}