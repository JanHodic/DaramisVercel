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

const DEFAULT_CENTER = { lat: 50.0755, lng: 14.4378 }
const DEFAULT_ZOOM = 13

export function ProjectMapField() {
const centerLatField = useField<number>({ path: 'locationTab.centerLat' })
const centerLngField = useField<number>({ path: 'locationTab.centerLng' })
const zoomField      = useField<number>({ path: 'locationTab.defaultZoom' })

  const { id: currentDocId } = useDocumentInfo() as any
  const isSaved = Boolean(currentDocId)

  const locale: 'cs' | 'en' =
    typeof document !== 'undefined' && document?.documentElement?.lang?.startsWith('en') ? 'en' : 'cs'

  const [autoSaving, setAutoSaving] = useState(false)
  const [uiError, setUiError] = useState<string>('')

  const [isClient, setIsClient] = useState(false)

  // ⏱️ throttle for "save on move"
  const lastSaveAtRef = useRef(0)

  const pendingFirstMoveRef = useRef<null | { lat: number; lng: number }>(null)
  const saveAttemptedRef = useRef(false)

  const clickSave = useCallback(() => {
    const now = Date.now()
    if (now - lastSaveAtRef.current < 900) return
    lastSaveAtRef.current = now

    const saveBtn = findSaveButton()
    if (!saveBtn) {
      setUiError(locale === 'cs' ? 'Nenašel jsem tlačítko Save/Uložit v adminu.' : 'Could not find the Save button in admin.')
      return
    }
    saveBtn.click()
  }, [locale])

  useEffect(() => setIsClient(true), [])

  // ✅ DŮLEŽITÉ: hned nastav hodnoty centerLat/centerLng/zoom, aby required pole nikdy nebyla "prázdná"
  useEffect(() => {
    const latMissing = typeof centerLatField.value !== 'number' || !Number.isFinite(centerLatField.value)
    const lngMissing = typeof centerLngField.value !== 'number' || !Number.isFinite(centerLngField.value)
    const zoomMissing = typeof zoomField.value !== 'number' || !Number.isFinite(zoomField.value)

    if (latMissing) centerLatField.setValue(DEFAULT_CENTER.lat)
    if (lngMissing) centerLngField.setValue(DEFAULT_CENTER.lng)
    if (zoomMissing) zoomField.setValue(DEFAULT_ZOOM)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerLatField.value, centerLngField.value, zoomField.value])

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
    const lat = typeof centerLatField.value === 'number' && Number.isFinite(centerLatField.value) ? centerLatField.value : DEFAULT_CENTER.lat
    const lng = typeof centerLngField.value === 'number' && Number.isFinite(centerLngField.value) ? centerLngField.value : DEFAULT_CENTER.lng
    return { lat, lng }
  }, [centerLatField.value, centerLngField.value])

  const zoom = useMemo(() => {
    const z = typeof zoomField.value === 'number' && Number.isFinite(zoomField.value) ? zoomField.value : DEFAULT_ZOOM
    return z
  }, [zoomField.value])

  const applyPosition = useCallback(
    (lat: number, lng: number) => {
      setUiError('')

      centerLatField.setValue(lat)
      centerLngField.setValue(lng)

      // nový dokument: první move udělá autosave až když jsou hodnoty opravdu propsané
      if (!isSaved && !saveAttemptedRef.current) {
        saveAttemptedRef.current = true
        pendingFirstMoveRef.current = { lat, lng }
        setAutoSaving(true)
        return
      }

      // uložený dokument / další pohyby -> save hned (throttled)
      ;(async () => {
        await sleep(80)
        clickSave()
      })()
    },
    [centerLatField, centerLngField, clickSave, isSaved]
  )

  const onMapClick = useCallback(
    (lat: number, lng: number) => {
      applyPosition(lat, lng)
    },
    [applyPosition]
  )

  // ✅ autosave až ve chvíli, kdy payload opravdu propsal hodnoty do field.value
  useEffect(() => {
    if (isSaved) {
      pendingFirstMoveRef.current = null
      setAutoSaving(false)
      return
    }

    if (!autoSaving) return
    if (!pendingFirstMoveRef.current) return

    const desired = pendingFirstMoveRef.current
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
        pendingFirstMoveRef.current = null
        return
      }

      saveBtn.click()

      await sleep(1200)
      setAutoSaving(false)
    })()
  }, [autoSaving, isSaved, centerLatField.value, centerLngField.value, locale])

  const mapKey = useMemo(() => `${currentDocId ?? 'new'}`, [currentDocId])

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ fontSize: 13, opacity: 0.85 }}>
        <div style={{ fontWeight: 700, opacity: 0.95 }}>{locale === 'cs' ? 'Poloha projektu' : 'Project position'}</div>

        {!isSaved ? (
          <div style={{ marginTop: 6, color: '#b45309' }}>{autoSaving ? (locale === 'cs' ? 'Ukládám…' : 'Saving…') : null}</div>
        ) : null}

        {uiError ? <div style={{ marginTop: 6, color: '#b91c1c' }}>{uiError}</div> : null}
      </div>

      <div style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ height: 420, width: '100%' }}>
          {isClient ? (
            <MapContainer key={mapKey} center={[center.lat, center.lng]} zoom={zoom} style={{ height: '100%', width: '100%' }} keyboard={false}>
              <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              <MapViewSync center={center} zoom={zoom} />
              <MapClickHandler onClick={onMapClick} />

              {/* jediný marker = centerLat/centerLng, draggable a přepisuje fieldy */}
              <Marker
                position={[center.lat, center.lng]}
                draggable
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                eventHandlers={{
                  dragend: (e: any) => {
                    const m = e?.target
                    const ll = m?.getLatLng?.()
                    if (!ll) return
                    applyPosition(ll.lat, ll.lng)
                  },
                }}
              >
                <Popup>
                  <div style={{ fontSize: 13 }}>
                    <div style={{ fontWeight: 700 }}>{locale === 'cs' ? 'Poloha projektu' : 'Project position'}</div>
                    <div style={{ opacity: 0.75, marginTop: 4 }}>
                      {center.lat.toFixed(6)}, {center.lng.toFixed(6)}
                    </div>
                    <div style={{ opacity: 0.7, marginTop: 6 }}>
                      {locale === 'cs' ? 'Klikni do mapy nebo bod přetáhni.' : 'Click the map or drag the marker.'}
                    </div>
                  </div>
                </Popup>
              </Marker>
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