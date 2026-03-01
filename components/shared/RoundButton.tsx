'use client'

import { CSSProperties, useState } from 'react'
import { colors } from '@/lib/theme'
import { buttonHeight } from '@/lib/theme/dimensions'

interface RoundButtonProps {
  label: string
  onClick?: () => void
  disabled?: boolean
  size?: number
}

export function RoundButton({ label, onClick, disabled = false, size = buttonHeight }: RoundButtonProps) {
  const [animating, setAnimating] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

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
    width: size,
    height: size,
    borderRadius: '50%',
    border: 'none',
    backgroundColor: colors.primaryBlue,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    boxSizing: 'border-box',
    filter: animating ? 'brightness(1.15)' : 'brightness(1)',
    boxShadow: animating
      ? '0 4px 12px rgba(0, 100, 200, 0.3)'
      : '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'filter 200ms ease-out, box-shadow 200ms ease-out',
  }

  const iconSize = Math.round(size * 0.4)

  return (
    <div
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        style={buttonStyle}
        onClick={handleClick}
        disabled={disabled}
        aria-label={label}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 12 12">
          <line x1="6" y1="1" x2="6" y2="11" stroke={colors.white} strokeWidth="2" strokeLinecap="round" />
          <line x1="1" y1="6" x2="11" y2="6" stroke={colors.white} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
