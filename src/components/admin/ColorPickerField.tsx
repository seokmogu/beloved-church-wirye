'use client'

import type { TextFieldClientComponent } from 'payload'

import { FieldDescription, FieldError, FieldLabel, useField } from '@payloadcms/ui'
import React from 'react'

const hexColorPattern = /^#[0-9a-fA-F]{6}$/

const normalizePickerValue = (value: string | undefined, fallback: string) => {
  if (value && hexColorPattern.test(value)) {
    return value
  }

  return fallback
}

export const ColorPickerField: TextFieldClientComponent = (props) => {
  const {
    field: {
      admin: { description } = {},
      label,
      required,
    },
    path: pathFromProps,
    readOnly,
  } = props

  const { disabled, path, setValue, showError, value } = useField<string>({
    potentiallyStalePath: pathFromProps,
  })
  const stringValue = typeof value === 'string' ? value : ''
  const pickerValue = normalizePickerValue(stringValue, '#ffffff')
  const isReadOnly = Boolean(readOnly || disabled)

  return (
    <div className="field-type text color-picker-field">
      <FieldLabel label={label} path={path} required={required} />
      <div
        style={{
          alignItems: 'center',
          display: 'grid',
          gap: 10,
          gridTemplateColumns: '44px minmax(140px, 220px)',
        }}
      >
        <input
          aria-label={`${label || path} 색상 선택`}
          data-testid={`color-picker-${path.replace(/\./g, '-')}`}
          disabled={isReadOnly}
          onChange={(event) => setValue(event.target.value)}
          style={{
            border: '1px solid var(--theme-elevation-200)',
            borderRadius: 6,
            cursor: isReadOnly ? 'not-allowed' : 'pointer',
            height: 40,
            padding: 2,
            width: 44,
          }}
          type="color"
          value={pickerValue}
        />
        <input
          aria-label={`${label || path} 색상 코드`}
          disabled={isReadOnly}
          id={`field-${path?.replace(/\./g, '__')}`}
          name={path}
          onChange={(event) => setValue(event.target.value)}
          placeholder="#123125"
          style={{
            fontFamily: 'var(--font-mono)',
            maxWidth: 220,
          }}
          type="text"
          value={stringValue}
        />
      </div>
      <FieldError path={path} showError={showError} />
      <FieldDescription description={description} path={path} />
    </div>
  )
}
