'use client'

import { useState, CSSProperties } from 'react'
import { colors, typography } from '@/lib/theme'
import { searchPillHeight } from '@/lib/theme/dimensions'

interface SearchPillProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

export function SearchPill({ value, onChange, placeholder = 'Search' }: SearchPillProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [animating, setAnimating] = useState(false)

  const handleClick = () => {
    setAnimating(true)
    setTimeout(() => setAnimating(false), 150)
  }

  const containerStyle: CSSProperties = {
    position: 'relative',
    transform: (animating || (isHovered && !isFocused)) ? 'scale(1.03)' : 'scale(1)',
    transition: 'transform 150ms ease-out',
  }

  const iconStyle: CSSProperties = {
    position: 'absolute',
    left: 10,
    top: '50%',
    transform: 'translateY(-40%)',
    color: colors.textDarkBlue,
    pointerEvents: 'none',
    zIndex: 1,
  }

  const inputStyle: CSSProperties = {
    width: '100%',
    height: searchPillHeight,
    paddingLeft: 34,
    paddingRight: 12,
    borderRadius: 9999,
    border: isFocused ? `3px solid ${colors.lightBlueBorder}` : `1px solid ${colors.lightBlueBorder}`,
    backgroundColor: colors.white,
    fontSize: typography.sizeXsSm,
    color: colors.textDarkBlue,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 150ms ease-out, border-width 150ms ease-out',
  }

  return (
    <div style={containerStyle}>
      <div style={iconStyle}><SearchIcon /></div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={inputStyle}
      />
    </div>
  )
}
