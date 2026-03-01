'use client'

import { CSSProperties, useState } from 'react'
import { colors, dimensions, typography } from '@/lib/theme'
import { RoundButton } from '@/components/shared/RoundButton'
import { SearchPill } from '@/components/shared/SearchPill'

interface SettingsCardItem {
  id: string
  label: string
  subtitle?: string
  searchText?: string
}

interface SettingsCardProps {
  title: string
  items: SettingsCardItem[]
  onAdd?: () => void
  onItemClick?: (id: string) => void
}

function PencilIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.textDarkBlue}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: 0.5, flexShrink: 0 }}
    >
      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
      <path d="m15 5 4 4"/>
    </svg>
  )
}

export function SettingsCard({ title, items, onAdd, onItemClick }: SettingsCardProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null)

  const cardStyle: CSSProperties = {
    flex: 1,
    backgroundColor: colors.mediumGrey,
    border: `1px solid ${colors.border}`,
    borderRadius: dimensions.radiusMedium,
    alignSelf: 'stretch',
    minHeight: 0,
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: dimensions.spacingSm,
    paddingBottom: dimensions.spacingSm,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }

  const headerRowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: dimensions.spacingSm,
    paddingLeft: 6,
    paddingRight: 6,
  }

  const titleStyle: CSSProperties = {
    fontSize: typography.sizeLg,
    fontWeight: typography.weightSemibold,
    color: colors.textDarkBlue,
  }

  const searchContainerStyle: CSSProperties = {
    marginBottom: dimensions.spacingSm,
    paddingLeft: 6,
    paddingRight: 6,
  }

  const listStyle: CSSProperties = {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
  }

  const listItemStyle: CSSProperties = {
    paddingTop: dimensions.spacingSm,
    paddingBottom: dimensions.spacingSm,
    paddingLeft: dimensions.spacingSm,
    paddingRight: dimensions.spacingSm,
    cursor: 'pointer',
    borderRadius: dimensions.radiusSmall,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  }

  const dividerStyle: CSSProperties = {
    borderBottom: `1px solid ${colors.border}`,
    marginLeft: dimensions.spacingSm,
    marginRight: dimensions.spacingSm,
  }

  const labelStyle: CSSProperties = {
    fontSize: typography.sizeXsSm,
    color: colors.textDarkBlue,
  }

  const subtitleStyle: CSSProperties = {
    fontSize: typography.sizeXs,
    fontWeight: 300,
    color: colors.textDarkBlue,
    opacity: 0.6,
    marginTop: 2,
  }

  const filteredItems = items.filter(item => {
    const term = searchTerm.toLowerCase()
    return item.label.toLowerCase().includes(term) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(term)) ||
      (item.searchText && item.searchText.toLowerCase().includes(term))
  })

  return (
    <div style={cardStyle}>
      <div style={headerRowStyle}>
        <span style={titleStyle}>{title}</span>
        {onAdd && <RoundButton label="+" onClick={onAdd} />}
      </div>

      <div style={searchContainerStyle}>
        <SearchPill value={searchTerm} onChange={setSearchTerm} />
      </div>

      <div style={listStyle}>
        {filteredItems.map((item, index) => (
          <div key={item.id}>
            <div
              style={{
                ...listItemStyle,
                backgroundColor: hoveredItemId === item.id ? colors.darkGrey : 'transparent',
              }}
              onMouseEnter={() => setHoveredItemId(item.id)}
              onMouseLeave={() => setHoveredItemId(null)}
              onClick={() => onItemClick?.(item.id)}
            >
              <div>
                <div style={labelStyle}>{item.label}</div>
                {item.subtitle && <div style={subtitleStyle}>{item.subtitle}</div>}
              </div>
              <PencilIcon />
            </div>
            {index < filteredItems.length - 1 && <div style={dividerStyle} />}
          </div>
        ))}
      </div>
    </div>
  )
}
