'use client'

import { CSSProperties } from 'react'
import { Select } from '@/components/shared/ui/Select'
import { colors, typography } from '@/lib/theme'

interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  label: string
  value: string | null
  options: SelectOption[]
  required?: boolean
  disabled?: boolean
  onChange?: (value: string) => void
  error?: string | null
  maxHeight?: number
}

export function SelectField({
  label,
  value,
  options,
  required = false,
  disabled = false,
  onChange,
  error,
  maxHeight,
}: SelectFieldProps) {
  const isEmpty = value === null || value === undefined || String(value) === ''
  const displayError = error ?? (required && isEmpty ? 'Required' : null)

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  }

  const labelStyle: CSSProperties = {
    fontSize: typography.sizeXxxs,
    color: colors.textDarkBlue,
    marginBottom: 4,
  }

  const errorStyle: CSSProperties = {
    color: colors.error,
    fontSize: 10,
    marginTop: 2,
  }

  return (
    <div style={containerStyle}>
      <label style={labelStyle}>
        {label}{required && ' *'}
      </label>
      <Select
        value={String(value ?? '')}
        onChange={(val) => onChange?.(val)}
        options={options}
        disabled={disabled}
        maxHeight={maxHeight}
      />
      {displayError && <span style={errorStyle}>{displayError}</span>}
    </div>
  )
}
