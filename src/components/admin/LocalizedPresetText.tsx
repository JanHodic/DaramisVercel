'use client'

import React, { useMemo, useState } from 'react'
import { useField, useLocale } from '@payloadcms/ui'

type Preset = {
  value: string
  label: { en: string; cs: string }
  text: { en: string; cs: string }
}

type Props = {
  path: string
  readOnly?: boolean
  clientProps?: {
    presets?: Preset[]
  }
}

const getLocaleKey = (locale: any): 'cs' | 'en' => {
  const key = typeof locale === 'string' ? locale : locale?.code
  return key === 'cs' ? 'cs' : 'en'
}

const FALLBACK_PRESETS: Preset[] = [
  { value: 'start', label: { en: 'Start', cs: 'Start' }, text: { en: 'Start', cs: 'Start' } },
  { value: 'in_progress', label: { en: 'In progress', cs: 'Rozestavěno' }, text: { en: 'In progress', cs: 'Rozestavěno' } },
  { value: 'done', label: { en: 'Completed', cs: 'Dokončeno' }, text: { en: 'Completed', cs: 'Dokončeno' } },
]

export default function LocalizedPresetText({ path, readOnly, clientProps }: Props) {
  const presets = clientProps?.presets?.length ? clientProps.presets : FALLBACK_PRESETS

  // ✅ localized field v adminu = string pro aktuální locale
  const { value, setValue } = useField<string>({ path })
  const localeKey = getLocaleKey(useLocale())

  const current = useMemo(() => String(value ?? ''), [value])
  const [selected, setSelected] = useState<string>('')

  const apply = (next: string) => setValue(next)

  const matched = useMemo(() => {
    const hit = presets.find((p) => p.text[localeKey] === current)
    return hit?.value ?? ''
  }, [presets, current, localeKey])

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: -6 }}>Titulek</div>

      <input
        value={current}
        onChange={(e) => apply(e.target.value)}
        disabled={!!readOnly}
        style={{
          width: '100%',
          height: 44,
          borderRadius: 8,
          border: '1px solid var(--theme-elevation-150)',
          background: 'var(--theme-input-bg)',
          color: 'var(--theme-text)',
          padding: '0 12px',
          outline: 'none',
        }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 44px', gap: 10, alignItems: 'center' }}>
        <select
          value={selected || matched || ''}
          onChange={(e) => {
            const next = e.target.value
            setSelected(next)

            const preset = presets.find((p) => p.value === next)
            if (preset) apply(preset.text[localeKey])
          }}
          disabled={!!readOnly}
          style={{
            width: '100%',
            height: 44,
            borderRadius: 8,
            border: '1px solid var(--theme-elevation-150)',
            background: 'var(--theme-input-bg)',
            color: 'var(--theme-text)',
            padding: '0 12px',
          }}
        >
          <option value="" disabled>
            Vyber předvolbu…
          </option>
          {presets.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label[localeKey]}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setSelected('')}
          disabled={!!readOnly}
          style={{
            height: 44,
            width: 44,
            borderRadius: 8,
            border: '1px solid var(--theme-elevation-150)',
            background: 'var(--theme-elevation-0)',
            color: 'var(--theme-text)',
            cursor: readOnly ? 'not-allowed' : 'pointer',
          }}
          title="Vyčistit"
        >
          ×
        </button>
      </div>
    </div>
  )
}