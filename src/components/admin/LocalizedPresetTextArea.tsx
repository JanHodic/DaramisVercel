'use client'

import React, { useMemo, useState } from 'react'
import { useField, useLocale, SelectInput } from '@payloadcms/ui'

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
  { value: 'start', label: { en: 'Start', cs: 'Start' }, text: { en: 'Project started.', cs: 'Projekt zahájen.' } },
  { value: 'in_progress', label: { en: 'In progress', cs: 'Rozestavěno' }, text: { en: 'Construction is in progress.', cs: 'Projekt je ve výstavbě.' } },
  { value: 'done', label: { en: 'Completed', cs: 'Dokončeno' }, text: { en: 'Project completed.', cs: 'Projekt dokončen.' } },
]

export default function LocalizedPresetTextArea({ path, readOnly, clientProps }: Props) {
  const presets = clientProps?.presets?.length ? clientProps.presets : FALLBACK_PRESETS

  const localeKey = getLocaleKey(useLocale())
  const { value, setValue } = useField<string>({ path: `${path}.${localeKey}` })

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
        <textarea
          className="textarea"
          value={current}
          onChange={(e) => apply(e.target.value)}
          disabled={!!readOnly}
          rows={4}
        />
      </div>

      <div className="field-type__wrap">
        <SelectInput
          // “name/path” tady slouží jen UI, neukládá se do dat
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
  )
}