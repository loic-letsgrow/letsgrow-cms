'use client'

import { CSSProperties, useState, Fragment } from 'react'
import { colors, dimensions, typography } from '@/lib/theme'
import { SearchPill } from '@/components/shared/SearchPill'

export interface Diagnosis {
  id: string
  session_id: string
  created_at: string
  crop: string
  model_name: string
  primary_diagnosis: string
  primary_common_name: string
  primary_confidence: number
  secondary_diagnosis: string | null
  secondary_common_name: string | null
  treatment_shown: boolean
  treatment_group: string | null
  expert_validation: string | null
  expert_correct_diagnosis: string | null
  treatment_groups: { name: string; active_ingredients: string[] } | null
  photo_1_url: string
  photo_2_url: string | null
  reasoning: string | null
  expert_notes: string | null
  treatment_validation: string | null
  expert_correct_treatment: string | null
  status: string
}

interface DiagnosticSidebarProps {
  diagnoses: Diagnosis[]
  selectedId: string | null
  onSelect: (id: string) => void
}

function getStatusColor(status: string): string {
  if (status === 'done') return colors.diagnosisDone
  return colors.diagnosisPending
}

export function DiagnosticSidebar({ diagnoses, selectedId, onSelect }: DiagnosticSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = diagnoses.filter(d =>
    d.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.primary_common_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.primary_diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.status || 'pending').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pendingDiagnoses = filtered.filter(d => d.status !== 'done')
  const doneDiagnoses = filtered.filter(d => d.status === 'done')

  const sidebarStyle: CSSProperties = {
    width: dimensions.sidebarWidth,
    height: '100%',
    flexShrink: 0,
    backgroundColor: colors.darkGrey,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }

  const searchWrapperStyle: CSSProperties = {
    padding: `${dimensions.spacingMd}px ${dimensions.spacingSm}px ${dimensions.spacingSm}px`,
  }

  const listStyle: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: `0 ${dimensions.spacingSm}px ${dimensions.spacingSm}px ${dimensions.spacingSm}px`,
    display: 'flex',
    flexDirection: 'column',
  }

  const groupHeaderStyle = (color: string, isFirst: boolean): CSSProperties => ({
    backgroundColor: color,
    padding: `${dimensions.spacingSm}px ${dimensions.spacingSm}px`,
    fontSize: typography.sizeXs,
    fontWeight: typography.weightSemibold,
    color: colors.textDarkBlue,
    textTransform: 'uppercase',
    flexShrink: 0,
    marginBottom: dimensions.spacingSm,
    marginTop: isFirst ? 0 : dimensions.spacingMd,
    marginLeft: -dimensions.spacingSm,
    marginRight: -dimensions.spacingSm,
  })

  const renderGroup = (items: Diagnosis[], label: string, color: string, isFirst: boolean) => {
    if (items.length === 0) return null
    return (
      <>
        <div style={groupHeaderStyle(color, isFirst)}>{label}</div>
        {items.map((d, index) => (
          <Fragment key={d.id}>
            <DiagnosticCard
              diagnosis={d}
              isSelected={d.id === selectedId}
              onClick={() => onSelect(d.id)}
            />
            {index < items.length - 1 && (
              <div style={{
                height: 1,
                backgroundColor: colors.lightBlueBorder,
                marginLeft: dimensions.spacingSm,
                marginRight: dimensions.spacingSm,
                flexShrink: 0,
              }} />
            )}
          </Fragment>
        ))}
      </>
    )
  }

  return (
    <aside style={sidebarStyle}>
      <div style={searchWrapperStyle}>
        <SearchPill value={searchTerm} onChange={setSearchTerm} placeholder="Search" />
      </div>
      <div style={listStyle}>
        {renderGroup(pendingDiagnoses, 'Pending', colors.diagnosisPending, true)}
        {renderGroup(doneDiagnoses, 'Done', colors.diagnosisDone, pendingDiagnoses.length === 0)}
        {filtered.length === 0 && (
          <div style={{ padding: dimensions.spacingMd, color: colors.superDarkGrey, fontSize: typography.sizeXs, textAlign: 'center' }}>
            No diagnoses found
          </div>
        )}
      </div>
    </aside>
  )
}

function DiagnosticCard({ diagnosis, isSelected, onClick }: { diagnosis: Diagnosis, isSelected: boolean, onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false)

  const getValidationColor = () => {
    if (diagnosis.expert_validation === 'confirmed') return colors.lightGreen
    if (diagnosis.expert_validation === 'rejected') return colors.lightRed
    return 'transparent'
  }

  const cardStyle: CSSProperties = {
    textAlign: 'left',
    padding: `${dimensions.spacingSm}px ${dimensions.spacingSm}px`,
    borderRadius: dimensions.radiusSmall,
    transition: 'background-color 0.15s',
    backgroundColor: isSelected ? colors.primaryBlue : (isHovered ? colors.hoverGrey : 'transparent'),
    color: isSelected ? colors.white : colors.textDarkBlue,
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    borderLeft: `3px solid ${getValidationColor()}`,
    position: 'relative',
  }

  const nameStyle: CSSProperties = {
    fontSize: typography.sizeSm,
    fontWeight: typography.weightSemibold,
    lineHeight: 1.2,
    marginBottom: dimensions.spacingXs,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }

  const subtextStyle: CSSProperties = {
    fontSize: typography.sizeXs,
    fontWeight: typography.weightMedium,
    lineHeight: 1.3,
    opacity: isSelected ? 0.8 : 0.6,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }

  const confidenceBadgeStyle: CSSProperties = {
    display: 'inline-block',
    fontSize: typography.sizeXxxs,
    fontWeight: typography.weightSemibold,
    padding: '1px 5px',
    borderRadius: 99,
    marginTop: 3,
    backgroundColor: 'transparent',
    border: `1px solid ${isSelected ? colors.white : colors.primaryBlue}`,
    color: isSelected ? colors.white : colors.textDarkBlue,
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={cardStyle}
    >
      <div style={{
        position: 'absolute',
        top: 6,
        right: dimensions.spacingSm,
        width: 14,
        height: 14,
        borderRadius: '50%',
        backgroundColor: getStatusColor(diagnosis.status),
      }} />
      <div>
        <div style={nameStyle}>{diagnosis.crop}</div>
        <div style={{ ...subtextStyle, marginBottom: 3 }}>
          {new Date(diagnosis.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
          <span style={subtextStyle}>{diagnosis.primary_diagnosis}</span>
          <span style={confidenceBadgeStyle}>{diagnosis.primary_confidence}%</span>
        </div>
        <div style={subtextStyle}>{diagnosis.model_name}</div>
      </div>
    </button>
  )
}
