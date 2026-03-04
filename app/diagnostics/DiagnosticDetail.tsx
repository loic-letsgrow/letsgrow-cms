'use client'

import { CSSProperties, useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { colors, dimensions, typography } from '@/lib/theme'
import { Diagnosis } from './DiagnosticSidebar'
import { Badge } from '@/components/shared/ui/Badge'
import { NotePopup } from './NotePopup'
import { DiagnosisValidation, TreatmentValidation } from './ValidationButtons'

interface DiagnosticDetailProps {
  diagnosis: Diagnosis | null
  status: string
  onStatusChange: (newStatus: string) => void
  onUpdate: (fields: Partial<Diagnosis>) => void
}

export function DiagnosticDetail({ diagnosis, status, onStatusChange, onUpdate }: DiagnosticDetailProps) {
  const mainStyle: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    backgroundColor: colors.white,
    padding: `${dimensions.titleRowPaddingTop}px clamp(${dimensions.pageSidebarPaddingMin}px, 5vw, ${dimensions.pageSidebarPaddingMax}px)`,
  }

  if (!diagnosis) {
    return (
      <div style={{ ...mainStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: colors.superDarkGrey, fontSize: typography.sizeMd }}>
          Select a diagnosis from the list
        </div>
      </div>
    )
  }

  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null)
  const [expertValidation, setExpertValidation] = useState(diagnosis.expert_validation)
  const [expertCorrectDiagnosis, setExpertCorrectDiagnosis] = useState(diagnosis.expert_correct_diagnosis)
  const [treatmentValidation, setTreatmentValidation] = useState(diagnosis.treatment_validation)
  const [expertCorrectTreatment, setExpertCorrectTreatment] = useState(diagnosis.expert_correct_treatment)

  const [displayCommonName, setDisplayCommonName] = useState(diagnosis.primary_common_name)

  useEffect(() => {
    if (!diagnosis.primary_diagnosis || diagnosis.primary_diagnosis === 'Uncertain') return
    const lookup = async () => {
      const supabase = createBrowserClient()
      const { data } = await supabase
        .from('pest_diseases')
        .select('common_name')
        .eq('scientific_name', diagnosis.primary_diagnosis)
        .limit(1)
        .single()
      if (data?.common_name) setDisplayCommonName(data.common_name)
    }
    lookup()
  }, [diagnosis.primary_diagnosis])

  const date = new Date(diagnosis.created_at).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  const sectionTitleStyle: CSSProperties = {
    fontSize: typography.sizeSm,
    fontWeight: typography.weightSemibold,
    color: colors.superDarkGrey,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: dimensions.spacingSm,
    marginTop: dimensions.spacingLg,
  }

  const labelStyle: CSSProperties = {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: typography.sizeXxxs,
    color: colors.textDarkBlue,
    marginBottom: 4,
  }

  const valueStyle: CSSProperties = {
    fontSize: typography.sizeSm,
    color: colors.textDarkBlue,
    fontWeight: typography.weightSemibold,
  }


  const fieldStyle: CSSProperties = {
    marginBottom: 10,
  }

  const cardStyle: CSSProperties = {
    backgroundColor: colors.mediumGrey,
    border: `1px solid ${colors.border}`,
    borderRadius: dimensions.radiusMedium,
    paddingTop: dimensions.cardTopPadding,
    paddingBottom: dimensions.cardBottomPadding,
    paddingLeft: dimensions.cardLeftPadding,
    paddingRight: 12,
    overflowY: 'auto',
    minHeight: 0,
  }

  // Portrait aspect ratio container for images (3:4)
  const imageWrapperStyle: CSSProperties = {
    width: 240,
    aspectRatio: '3 / 4',
    borderRadius: dimensions.radiusSmall,
    border: `1px solid ${colors.border}`,
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: colors.darkGrey,
  }

  const imageStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  }

  const reasoningStyle: CSSProperties = {
    backgroundColor: colors.mediumGrey,
    borderRadius: dimensions.radiusSmall,
    padding: dimensions.spacingMd,
    fontSize: typography.sizeXs,
    color: colors.textDarkBlue,
    whiteSpace: 'pre-wrap',
    lineHeight: 1.6,
    marginTop: dimensions.spacingSm,
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: colors.white }}>
      {/* Fixed title row */}
      <div style={{
        backgroundColor: colors.white,
        paddingLeft: `clamp(${dimensions.pageSidebarPaddingMin}px, 4vw, 60px)`,
        paddingRight: `clamp(${dimensions.pageSidebarPaddingMin}px, 4vw, 60px)`,
        paddingTop: dimensions.titleRowPaddingTop,
        paddingBottom: dimensions.titleRowPaddingBottom,
        zIndex: 3,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: dimensions.spacingXl }}>
          <div style={{ fontSize: typography.sizeXxl, fontWeight: typography.weightSemibold, color: colors.textDarkBlue }}>
            {diagnosis.crop} - {diagnosis.primary_diagnosis}
          </div>
          <NotePopup
            diagnosisId={diagnosis.id}
            initialNote={diagnosis.expert_notes}
            onSaved={(note) => { diagnosis.expert_notes = note }}
          />
          <StatusSelect value={status} onChange={onStatusChange} />
          <div style={{ marginLeft: 'auto', fontSize: typography.sizeSm, color: colors.textDarkBlue, flexShrink: 0, textAlign: 'right' }}>
            <div>{date}</div>
            <div>
              {diagnosis.model_name}
              {diagnosis.cost_usd != null && (
                <span style={{ marginLeft: 6 }}>
                  ({(diagnosis.cost_usd * 100).toFixed(1)}¢)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingLeft: `clamp(${dimensions.pageSidebarPaddingMin}px, 4vw, 60px)`,
        paddingRight: `clamp(${dimensions.pageSidebarPaddingMin}px, 4vw, 60px)`,
        paddingBottom: dimensions.spacingLg,
      }}>
        {/* Top row: 3 equal columns via CSS grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: dimensions.spacingLg }}>
          {/* Photo 1 */}
          <div onClick={() => setZoomedPhoto(diagnosis.photo_1_url)} style={{ aspectRatio: '3 / 4', borderRadius: dimensions.radiusSmall, border: `1px solid ${colors.border}`, overflow: 'hidden', backgroundColor: colors.darkGrey, cursor: 'zoom-in' }}>
            <img src={diagnosis.photo_1_url} alt="Photo 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Results card — wrapper locks height to match photo aspect ratio */}
          <div style={{ aspectRatio: '3 / 4', overflow: 'hidden' }}>
          <div style={{ ...cardStyle, overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ fontSize: 21, fontWeight: typography.weightSemibold, color: colors.textDarkBlue, marginBottom: dimensions.spacingMd }}>
              {displayCommonName?.toLowerCase() === 'uncertain' ? (
                <><span style={{ fontWeight: typography.weightNormal }}>Diagnosis </span>Uncertain</>
              ) : (
                <><span style={{ fontWeight: typography.weightNormal }}>Likely </span>{displayCommonName}</>
              )}
            </div>

          <div style={{ marginBottom: 4 }}>
            <DiagnosisValidation
              key={`diag-${diagnosis.id}`}
              diagnosisId={diagnosis.id}
              crop={diagnosis.crop}
              label="Primary"
              value={diagnosis.primary_diagnosis}
              confidence={diagnosis.primary_confidence}
              currentValidation={expertValidation}
              currentCorrect={expertCorrectDiagnosis}
              onSaved={(v, c) => { setExpertValidation(v); setExpertCorrectDiagnosis(c); onUpdate({ expert_validation: v, expert_correct_diagnosis: c }) }}
            />
          </div>

          {diagnosis.secondary_diagnosis && diagnosis.primary_confidence < 70 && (
            <div style={fieldStyle}>
              <span style={labelStyle}>Secondary</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: dimensions.spacingSm }}>
                <span style={valueStyle}>{diagnosis.secondary_diagnosis}</span>
                {diagnosis.secondary_confidence != null && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    borderRadius: 9999,
                    paddingLeft: 8,
                    paddingRight: 8,
                    paddingTop: 1,
                    paddingBottom: 1,
                    fontSize: typography.sizeXs,
                    fontWeight: typography.weightMedium,
                    backgroundColor: 'transparent',
                    border: `1px solid ${colors.primaryBlue}`,
                    color: colors.textDarkBlue,
                    flexShrink: 0,
                  }}>{diagnosis.secondary_confidence}%</span>
                )}
              </div>
            </div>
          )}

          {diagnosis.short_note && (
            <div style={fieldStyle}>
              <span style={labelStyle}>Note</span>
              <div style={valueStyle}>{diagnosis.short_note}</div>
            </div>
          )}

          {diagnosis.follow_up_suggestion && (
            <div style={{ marginBottom: 14 }}>
              <span style={labelStyle}>Follow-up Suggestion</span>
              <div style={valueStyle}>{diagnosis.follow_up_suggestion}</div>
              <div style={{ borderBottom: `1px solid ${colors.border}`, marginTop: 16 }} />
            </div>
          )}

          <div style={{ marginBottom: 4 }}>
            {diagnosis.treatment_shown && diagnosis.treatment_groups ? (
              <TreatmentValidation
                key={`treat-${diagnosis.id}`}
                diagnosisId={diagnosis.id}
                label="Treatment"
                value={diagnosis.treatment_groups.name}
                currentValidation={treatmentValidation}
                currentCorrect={expertCorrectTreatment}
                onSaved={(v, c) => { setTreatmentValidation(v); setExpertCorrectTreatment(c); onUpdate({ treatment_validation: v, expert_correct_treatment: c }) }}
              />
            ) : (
              <>
                <span style={labelStyle}>Treatment</span>
                <div style={valueStyle}>Not safe to recommend</div>
              </>
            )}
          </div>

          {diagnosis.pre_treatment_advice && (
            <div style={fieldStyle}>
              <span style={labelStyle}>Pre-treatment advice</span>
              <div style={valueStyle}>{diagnosis.pre_treatment_advice}</div>
            </div>
          )}

          {diagnosis.treatment_shown && diagnosis.treatment_groups && (
            <div style={fieldStyle}>
              <span style={labelStyle}>Active ingredients</span>
              <div style={valueStyle}>
                {diagnosis.treatment_groups.active_ingredients.join(', ')}
              </div>
            </div>
          )}
          </div>
          </div>

          {/* Photo 2 */}
          <div onClick={() => diagnosis.photo_2_url && setZoomedPhoto(diagnosis.photo_2_url)} style={{ aspectRatio: '3 / 4', borderRadius: dimensions.radiusSmall, border: `1px solid ${colors.border}`, overflow: 'hidden', backgroundColor: colors.darkGrey, cursor: diagnosis.photo_2_url ? 'zoom-in' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {diagnosis.photo_2_url
              ? <img src={diagnosis.photo_2_url} alt="Photo 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: typography.sizeXs, color: colors.superDarkGrey, fontStyle: 'italic' }}>No photo 2</span>
            }
          </div>
        </div>

        {/* AI Reasoning card */}
        <div style={{ ...cardStyle, marginTop: dimensions.spacingLg }}>
          <div style={{ fontSize: 21, fontWeight: typography.weightSemibold, color: colors.textDarkBlue, marginBottom: dimensions.spacingMd }}>
            AI Chain-of-Thought
          </div>
          <div style={{ fontSize: typography.sizeXs, color: colors.textDarkBlue, lineHeight: 1.6 }}>
            {(diagnosis.reasoning ?? '—').split('\n').map((line, i) => {
              // Detect step headers like "STEP 1 - IMAGE QUALITY ASSESSMENT:" or all-caps lines ending with ":"
              const isStepHeader = /^(STEP\s+\d|[A-Z][A-Z\s\-&]+:)/.test(line.trim())
              // Replace **text** with bold spans
              const parts = line.split(/\*\*(.*?)\*\*/g)
              return (
                <div key={i} style={{ minHeight: '1.4em', fontWeight: isStepHeader ? typography.weightSemibold : undefined }}>
                  {parts.map((part, j) =>
                    j % 2 === 1
                      ? <strong key={j}>{part}</strong>
                      : part
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Photo zoom popup */}
        {zoomedPhoto && (
          <div
            onClick={() => setZoomedPhoto(null)}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              cursor: 'zoom-out',
            }}
          >
            <img
              src={zoomedPhoto}
              alt="Zoomed"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: dimensions.radiusMedium,
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                touchAction: 'pinch-zoom',
                cursor: 'default',
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

const statusOptions = [
  { value: 'pending', label: 'PENDING' },
  { value: 'done', label: 'DONE' },
]

function getStatusColor(status: string): string {
  if (status === 'done') return colors.diagnosisDone
  return colors.diagnosisPending
}

function StatusSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentOption = statusOptions.find(o => o.value === value)

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: 100,
  }

  const buttonStyle: CSSProperties = {
    appearance: 'none',
    width: '100%',
    height: 30,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: dimensions.radiusSmall,
    border: 'none',
    backgroundColor: getStatusColor(value),
    fontSize: typography.sizeXs,
    fontWeight: typography.weightSemibold,
    color: colors.textDarkBlue,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transform: isHovered ? 'scale(1.03)' : 'scale(1)',
    boxShadow: isHovered
      ? '0 3px 5px -1px rgba(0, 0, 0, 0.15), 0 2px 3px -1px rgba(0, 0, 0, 0.1)'
      : '0 1px 2px rgba(0, 0, 0, 0.1)',
    transition: 'transform 150ms ease-out, box-shadow 150ms ease-out',
  }

  const chevronStyle: CSSProperties = {
    width: 6,
    height: 6,
    borderRight: `2px solid ${colors.textDarkBlue}`,
    borderBottom: `2px solid ${colors.textDarkBlue}`,
    transform: isOpen ? 'rotate(-135deg)' : 'rotate(45deg)',
    flexShrink: 0,
    marginTop: isOpen ? 2 : -2,
    transition: 'transform 150ms ease-out',
  }

  const dropdownStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 10,
    borderRadius: dimensions.radiusSmall,
    backgroundColor: 'transparent',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
  }

  const getOptionStyle = (optValue: string): CSSProperties => ({
    height: 30,
    paddingLeft: 12,
    paddingRight: 12,
    display: 'flex',
    alignItems: 'center',
    fontSize: typography.sizeXs,
    cursor: 'pointer',
    backgroundColor: getStatusColor(optValue),
    color: colors.textDarkBlue,
    fontWeight: typography.weightSemibold,
  })

  return (
    <div ref={containerRef} style={containerStyle}>
      <button
        style={buttonStyle}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {currentOption?.label || value}
        <span style={chevronStyle} />
      </button>
      {isOpen && (
        <div style={dropdownStyle}>
          {statusOptions.map(option => (
            <div
              key={option.value}
              style={getOptionStyle(option.value)}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
