'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useField, useDocumentInfo } from '@payloadcms/ui'
import { useMap, useMapEvents } from 'react-leaflet'

function forceImmediateSave() {
  const btn =
    document.querySelector('form button[type="submit"]') ||
    document.querySelector('button[data-action="save"]')

  if (btn instanceof HTMLButtonElement && !btn.disabled) {
    btn.click()
  }
}

function MapZoomFieldSync({
  onZoom,
  onSaveAfterZoom,
  throttleRef,
  throttleMs = 800,
}: {
  onZoom: (z: number) => void
  onSaveAfterZoom: () => void
  throttleRef: React.MutableRefObject<number>
  throttleMs?: number
}) {
  useMapEvents({
    zoomend(e) {
      const z = e.target.getZoom?.()
      if (typeof z !== 'number') return

      // 1) nejdřív zapiš zoom do fieldu
      onZoom(z)

      // 2) throttle: save max 1x za throttleMs
      const now = Date.now()
      if (now - throttleRef.current < throttleMs) return
      throttleRef.current = now

      // 3) save až v dalším ticku (aby se field value propsala)
      const prev = window.onbeforeunload
      window.onbeforeunload = null

      setTimeout(() => {
        onSaveAfterZoom()

        // vrať hlášku zpátky
        setTimeout(() => {
          window.onbeforeunload = prev
        }, 0)
      }, 0)
    },
  })

  return null
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const oe = (e as any).originalEvent as MouseEvent | undefined
      const target = (oe?.target as HTMLElement | null) ?? null

      // ignoruj kliky na zoom ovládání
      if (target?.closest?.('.leaflet-control')) return

      oe?.stopPropagation?.()

      // 🔥 OKAMŽITÝ SAVE – PŘED změnou stavu
      forceImmediateSave()

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
  const zoomField = useField<number>({ path: 'locationTab.defaultZoom' })

  const mapRef = useRef<any>(null)

  const getCurrentMapZoom = useCallback(() => {
    const z = mapRef.current?.getZoom?.()
    return typeof z === 'number' && Number.isFinite(z) ? z : undefined
  }, [])

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

  function MapInstanceRef({ mapRef }: { mapRef: React.MutableRefObject<any> }) {
    const map = useMap()
    useEffect(() => {
        mapRef.current = map
    }, [map, mapRef])
    return null
  }

  const clickSave = useCallback(() => {
    const saveBtn = findSaveButton()
    if (!saveBtn) {
      return
    }
    saveBtn.click()
  }, [locale])

  const setZoomAndSyncMap = useCallback(
  (nextZoom: number) => {
    // clamp (podle potřeby)
    const z = Math.max(1, Math.min(20, nextZoom))

    // 1) změň field (to je to „zdroj pravdy“)
    zoomField.setValue(z)

    // 2) přizpůsob mapu hned
    mapRef.current?.setZoom?.(z, { animate: false })

    // 3) volitelné: uložit hned, aby to nezůstalo dirty
    const prev = window.onbeforeunload
    window.onbeforeunload = null
    setTimeout(() => {
      clickSave()
      setTimeout(() => {
        window.onbeforeunload = prev
      }, 0)
    }, 0)
  },
  [zoomField, clickSave]
)

  const zoomIn = useCallback(() => {
    const current =
        typeof zoomField.value === 'number' && Number.isFinite(zoomField.value) ? zoomField.value : DEFAULT_ZOOM
    setZoomAndSyncMap(current + 1)
    }, [zoomField.value, setZoomAndSyncMap])

  const zoomOut = useCallback(() => {
    const current =
        typeof zoomField.value === 'number' && Number.isFinite(zoomField.value) ? zoomField.value : DEFAULT_ZOOM
    setZoomAndSyncMap(current - 1)
    }, [zoomField.value, setZoomAndSyncMap])

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
    const lat =
      typeof centerLatField.value === 'number' && Number.isFinite(centerLatField.value)
        ? centerLatField.value
        : DEFAULT_CENTER.lat
    const lng =
      typeof centerLngField.value === 'number' && Number.isFinite(centerLngField.value)
        ? centerLngField.value
        : DEFAULT_CENTER.lng
    return { lat, lng }
  }, [centerLatField.value, centerLngField.value])

  const zoom = useMemo(() => {
    const z = typeof zoomField.value === 'number' && Number.isFinite(zoomField.value) ? zoomField.value : DEFAULT_ZOOM
    return z
  }, [zoomField.value])

    const applyPosition = useCallback(
    (lat: number, lng: number, zoomFromMap?: number) => {
        setUiError('')

        centerLatField.setValue(lat)
        centerLngField.setValue(lng)

        // ✅ uložit zoom jen při změně polohy (když ho máme)
        if (typeof zoomFromMap === 'number' && Number.isFinite(zoomFromMap)) {
        zoomField.setValue(zoomFromMap)
        }

        // nový dokument: první move udělá autosave až když jsou hodnoty opravdu propsané
        if (!isSaved && !saveAttemptedRef.current) {
        saveAttemptedRef.current = true
        pendingFirstMoveRef.current = { lat, lng }
        setAutoSaving(true)
        return
        }

        // uložený dokument / další pohyby -> save hned
        ;(async () => {
        await sleep(80)
        clickSave()
        })()
    },
    [centerLatField, centerLngField, zoomField, clickSave, isSaved]
    )

    const onMapClick = useCallback(
    (lat: number, lng: number) => {
        const z = getCurrentMapZoom()
        applyPosition(lat, lng, z)
    },
    [applyPosition, getCurrentMapZoom]
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
        setUiError(
          locale === 'cs'
            ? 'Nenašel jsem tlačítko Save/Uložit v adminu.'
            : 'Could not find the Save button in admin.'
        )
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
        <div style={{ fontWeight: 700, opacity: 0.95 }}>
          {locale === 'cs' ? 'Poloha projektu' : 'Project position'}
        </div>
        <div style={{ fontWeight: 700, opacity: 0.95 }}>
          {locale === 'cs' ? 'Klikněte do mapy pro určení polohy projektu' : 'Click to map for project positioning'}
        </div>

        {!isSaved ? (
          <div style={{ marginTop: 6, color: '#b45309' }}>
            {autoSaving ? (locale === 'cs' ? 'Ukládám…' : 'Saving…') : null}
          </div>
        ) : null}

        {uiError ? <div style={{ marginTop: 6, color: '#b91c1c' }}>{uiError}</div> : null}
      </div>

      <div style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
            type="button"
            onClick={zoomOut}
            style={{ border: '1px solid rgba(0,0,0,0.15)', borderRadius: 10, padding: '8px 12px', cursor: 'pointer' }}
        >
            –
        </button>

        <div style={{ fontSize: 13, opacity: 0.8, minWidth: 60, textAlign: 'center' }}>
            Zoom: {typeof zoomField.value === 'number' ? zoomField.value : DEFAULT_ZOOM}
        </div>
            <button
                type="button"
                onClick={zoomIn}
                style={{ border: '1px solid rgba(0,0,0,0.15)', borderRadius: 10, padding: '8px 12px', cursor: 'pointer' }}
            >
                +
            </button>
        </div>

        <div style={{ height: 420, width: '100%' }}>
          {isClient ? (
            <MapContainer
              key={mapKey}
              zoomControl={false}
              center={[center.lat, center.lng]}
              zoom={zoom}
              style={{ height: '100%', width: '100%' }}
              keyboard={false}
            >
              <MapInstanceRef mapRef={mapRef} />
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapInstanceRef mapRef={mapRef} />

              {/* ✅ klíčová oprava: uložit až po zoomend */}
              <MapZoomFieldSync
                onZoom={(z) => zoomField.setValue(z)}
                onSaveAfterZoom={clickSave}
                throttleRef={lastSaveAtRef}
                throttleMs={800}
              />

              <MapViewSync center={center} zoom={zoom} />
              <MapClickHandler onClick={onMapClick} />

              {/* jediný marker = centerLat/centerLng, draggable a přepisuje fieldy */}
              <Marker
                position={[center.lat, center.lng]}
                draggable
                eventHandlers={{
                  dragstart: () => {
                    forceImmediateSave()
                  },
                    dragend: (e) => {
                    const ll = e.target.getLatLng()
                    forceImmediateSave()
                    const z = getCurrentMapZoom()
                    applyPosition(ll.lat, ll.lng, z)
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