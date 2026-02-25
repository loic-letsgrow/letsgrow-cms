'use client'

import { useState, useRef, useEffect, CSSProperties } from 'react'
import { colors, dimensions, typography } from '@/lib/theme'
import { fieldHeight } from '@/lib/theme/dimensions'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  width?: number
  disabled?: boolean
  maxHeight?: number
  optionHeight?: number
  placeholder?: string
}

export function Select({ value, onChange, options, width, disabled = false, maxHeight = 300, optionHeight = 30, placeholder = 'Select...' }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [dropUp, setDropUp] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)
  const selectedIndex = options.findIndex(opt => opt.value === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && dropdownRef.current && selectedIndex > 0) {
      dropdownRef.current.scrollTop = selectedIndex * optionHeight
    }
  }, [isOpen, selectedIndex, optionHeight])

  const handleOpen = () => {
    if (disabled) return
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropUp(window.innerHeight - rect.bottom < maxHeight)
    }
    setIsOpen(!isOpen)
  }

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: width ? width : '100%',
    minWidth: 0,
  }

  const buttonStyle: CSSProperties = {
    appearance: 'none',
    height: fieldHeight,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: dimensions.radiusSmall,
    border: (isFocused || isOpen) ? `2px solid ${colors.focusBorder}` : `1px solid ${colors.border}`,
    backgroundColor: colors.white,
    fontSize: typography.sizeXsSm,
    color: value ? colors.textDarkBlue : colors.superDarkGrey,
    width: '100%',
    textAlign: 'left',
    cursor: disabled ? 'default' : 'pointer',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transform: (isHovered && !disabled && !isOpen) ? 'scale(1.02)' : 'scale(1)',
    transition: 'transform 150ms ease-out',
  }

  const chevronStyle: CSSProperties = {
    width: 6,
    height: 6,
    borderRight: `1px solid ${colors.textDarkBlue}`,
    borderBottom: `1px solid ${colors.textDarkBlue}`,
    transform: 'rotate(45deg)',
    flexShrink: 0,
    marginTop: -2,
  }

  const dropdownStyle: CSSProperties = {
    position: 'absolute',
    top: dropUp ? 'auto' : '100%',
    bottom: dropUp ? '100%' : 'auto',
    left: 0,
    width: '100%',
    minWidth: width || 140,
    zIndex: 50,
    borderRadius: dimensions.radiusSmall,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.white,
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    maxHeight,
    overflowY: 'auto',
    boxSizing: 'border-box',
  }

  const getOptionStyle = (isSelected: boolean): CSSProperties => ({
    height: optionHeight,
    paddingLeft: 12,
    paddingRight: 12,
    display: 'flex',
    alignItems: 'center',
    fontSize: typography.sizeXsSm,
    cursor: 'pointer',
    backgroundColor: isSelected ? colors.lightBlue : colors.white,
    color: colors.textDarkBlue,
    fontWeight: isSelected ? typography.weightMedium : typography.weightNormal,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  })

  return (
    <div style={containerStyle}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={buttonStyle}
        disabled={disabled}
      >
        <span style={{ flex: 1 }}>{selectedOption?.label || placeholder}</span>
        <span style={chevronStyle} />
      </button>
      {isOpen && (
        <div ref={dropdownRef} style={dropdownStyle} onMouseDown={(e) => e.stopPropagation()}>
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => { onChange(option.value); setIsOpen(false) }}
              style={getOptionStyle(option.value === value)}
              onMouseEnter={(e) => { if (option.value !== value) e.currentTarget.style.backgroundColor = colors.mediumGrey }}
              onMouseLeave={(e) => { if (option.value !== value) e.currentTarget.style.backgroundColor = colors.white }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
