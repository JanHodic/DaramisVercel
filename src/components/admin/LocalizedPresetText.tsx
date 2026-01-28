'use client'

import React, { useMemo, useState } from 'react'
import { SelectInput, TextInput, useField, useLocale } from '@payloadcms/ui'

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

  const options = useMemo(
    () =>
      presets.map((p) => ({
        label: p.label[localeKey],
        value: p.value,
      })),
    [presets, localeKey],
  )

  return (
    <div className="localized-preset-field">
      <div className="field-type__wrap">
        <TextInput
          path={path}
          value={current}
          onChange={(e: any) => apply(e?.target?.value ?? '')}
          readOnly={!!readOnly}
        />
      </div>

      <div className="field-type__wrap">
        <div className="localized-preset-field__select">
          <SelectInput
            name={`${path}-preset`}
            path={`${path}-preset`}
            options={options}
            value={selected || matched || ''}
            onChange={(val: any) => {
              const next = typeof val === 'string' ? val : val?.value
              if (!next) return

              setSelected(next)
              const preset = presets.find((p) => p.value === next)
              if (preset) apply(preset.text[localeKey])
            }}
            isClearable
            placeholder="Vyber předvolbu…"
          />
        </div>
      </div>
    </div>
  )
}