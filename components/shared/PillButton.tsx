'use client'

import { CSSProperties, useState } from 'react'
import { colors, typography } from '@/lib/theme'
import { buttonHeight } from '@/lib/theme/dimensions'

interface PillButtonProps {
  label: string
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  disabled?: boolean
  width?: number
}

export function PillButton({ label, variant = 'primary', onClick, disabled = false, width }: PillButtonProps) {
  const [animating, setAnimating] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const isPrimary = variant === 'primary'

  const handleClick = async () => {
    setAnimating(true)
    await new Promise(resolve => setTimeout(resolve, 200))
    setAnimating(false)
    onClick?.()
  }

  const containerStyle: CSSProperties = {
    display: 'inline-block',
    transform: (animating || isHovered) ? 'scale(1.08)' : 'scale(1)',
    transition: 'transform 200ms ease-out',
  }

  const buttonStyle: CSSProperties = {
    height: buttonHeight,
    paddingLeft: width ? 0 : 16,
    paddingRight: width ? 0 : 16,
    borderRadius: 9999,
    border: isPrimary ? 'none' : `1.5px solid ${colors.border}`,
    backgroundColor: isPrimary ? colors.primaryBlue : colors.white,
    color: isPrimary ? colors.white : colors.textDarkBlue,
    fontSize: typography.sizeXsSm,
    fontWeight: typography.weightMedium,
    lineHeight: 1,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    width: width,
    boxSizing: 'border-box' as const,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    filter: animating ? 'brightness(1.15)' : 'brightness(1)',
    boxShadow: animating ? '0 4px 12px rgba(0, 100, 200, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'filter 200ms ease-out, box-shadow 200ms ease-out',
  }

  return (
    <div
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button type="button" style={buttonStyle} onClick={handleClick} disabled={disabled}>
        {label}
      </button>
    </div>
  )
}
