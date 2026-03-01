'use client'

import { CSSProperties, useState } from 'react'
import { colors, dimensions, typography } from '@/lib/theme'
import { fieldHeight } from '@/lib/theme/dimensions'

interface TextFieldProps {
  label: string
  value: string | null
  required?: boolean
  readonly?: boolean
  onChange?: (value: string) => void
  error?: string | null
  width?: number
}

export function TextField({
  label,
  value,
  required = false,
  readonly = false,
  onChange,
  error,
  width,
}: TextFieldProps) {
  const [isHovered, setIsHovered] = useState(false)

  const isEmpty = !value || value.trim() === ''
  const displayError = error ?? (required && isEmpty ? 'Required' : null)

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: width,
  }

  const labelStyle: CSSProperties = {
    fontSize: typography.sizeXxxs,
    color: colors.textDarkBlue,
    marginBottom: 4,
  }

  const inputStyle: CSSProperties = {
    height: fieldHeight,
    border: displayError ? `2px solid ${colors.error}` : `1px solid ${colors.border}`,
    borderRadius: dimensions.radiusSmall,
    padding: '0 8px',
    fontSize: typography.sizeXsSm,
    color: colors.textDarkBlue,
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: readonly ? colors.mediumGrey : colors.white,
    outline: 'none',
    textAlign: 'left',
    transform: (isHovered && !readonly) ? 'scale(1.03)' : 'scale(1)',
    boxShadow: (isHovered && !readonly)
      ? '0 3px 5px -1px rgba(0, 0, 0, 0.1), 0 2px 3px -1px rgba(0, 0, 0, 0.06)'
      : 'none',
    transition: 'transform 150ms ease-out, box-shadow 150ms ease-out',
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
      <input
        type="text"
        value={value ?? ''}
        readOnly={readonly}
        tabIndex={readonly ? -1 : 0}
        onChange={(e) => onChange?.(e.target.value)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={inputStyle}
      />
      {displayError && <span style={errorStyle}>{displayError}</span>}
    </div>
  )
}
