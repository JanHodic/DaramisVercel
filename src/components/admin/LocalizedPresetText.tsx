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
    <div className="field-type text localized-preset-field">
      <label className="field-label">Titulek</label>

      <div className="field-type__wrap">
        <input
          className="input"
          value={current}
          onChange={(e) => apply(e.target.value)}
          disabled={!!readOnly}
        />
      </div>

      <div className="localized-preset-field__row">
        <div className="field-type__wrap">
          <select
            value={selected || matched || ''}
            onChange={(e) => {
              const next = e.target.value
              setSelected(next)

              const preset = presets.find((p) => p.value === next)
              if (preset) apply(preset.text[localeKey])
            }}
            disabled={!!readOnly}
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
        </div>
      </div>
    </div>
  )
}