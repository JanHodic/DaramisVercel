'use client'

import { useCallback, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useField, useDocumentInfo } from '@payloadcms/ui'
import type { LeafletMouseEvent } from 'leaflet'
import { useMapEvents } from 'react-leaflet'

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      // keep it minimal; stopPropagation helps a bit in Payload Admin
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const oe = (e as any).originalEvent as MouseEvent | undefined
      oe?.stopPropagation?.()

      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// React-Leaflet dynamic imports (admin běží v Nextu, SSR off)
const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false })

export function ProjectMapField() {
  const centerLatField = useField<number>({ path: 'centerLat' })
  const centerLngField = useField<number>({ path: 'centerLng' })
  const zoomField = useField<number>({ path: 'defaultZoom' })

  const { id: currentDocId } = useDocumentInfo() as any
  const isSaved = Boolean(currentDocId)

  const locale: 'cs' | 'en' =
    typeof document !== 'undefined' && document?.documentElement?.lang?.startsWith('en') ? 'en' : 'cs'

  // Fix ikon v Next bundlu (stejné jako u POI)
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

  const setCenterFromClick = useCallback(
    (lat: number, lng: number) => {
      // stejné chování jako u POI: pokud ještě není uložený dokument, nešaháme do form fieldů
      // (Payload admin bývá agresivní na unsaved/invalid docs)
      if (!isSaved) return

      centerLatField.setValue(lat)
      centerLngField.setValue(lng)
    },
    [centerLatField, centerLngField, isSaved]
  )

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ fontSize: 13, opacity: 0.85 }}>
        <div style={{ fontWeight: 700, opacity: 0.95 }}>{locale === 'cs' ? 'Mapa projektu' : 'Project map'}</div>
        <div style={{ marginTop: 2 }}>
          {locale === 'cs'
            ? 'Klik do mapy nastaví centerLat/centerLng projektu.'
            : 'Clicking the map sets the project centerLat/centerLng.'}
        </div>
        {!isSaved ? (
          <div style={{ marginTop: 6, color: '#b45309' }}>
            {locale === 'cs'
              ? 'Tip: Nejdřív ulož projekt (vyplň povinná pole a Save). Pak klik do mapy začne nastavovat souřadnice bez varování o odchodu.'
              : 'Tip: Save the project first. Then map clicks will set coordinates without the leave-page prompt.'}
          </div>
        ) : null}
      </div>

      <div style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ height: 420, width: '100%' }}>
          <MapContainer
            center={[center.lat, center.lng]}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            keyboard={false}
          >
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <MapClickHandler onClick={setCenterFromClick} />

            {typeof centerLatField.value === 'number' && typeof centerLngField.value === 'number' ? (
              <Marker position={[centerLatField.value, centerLngField.value]}>
                <Popup>
                  <div style={{ fontSize: 13 }}>
                    <div style={{ fontWeight: 700 }}>{locale === 'cs' ? 'Střed mapy' : 'Map center'}</div>
                    <div style={{ opacity: 0.75, marginTop: 4 }}>
                      {centerLatField.value.toFixed(6)}, {centerLngField.value.toFixed(6)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ) : null}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}