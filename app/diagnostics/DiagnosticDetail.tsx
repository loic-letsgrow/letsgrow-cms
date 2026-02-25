'use client'

import { CSSProperties, useState } from 'react'
import { colors, dimensions, typography } from '@/lib/theme'
import { Diagnosis } from './DiagnosticSidebar'
import { Badge } from '@/components/shared/ui/Badge'
import { NotePopup } from './NotePopup'
import { DiagnosisValidation, TreatmentValidation } from './ValidationButtons'

interface DiagnosticDetailProps {
  diagnosis: Diagnosis | null
  onUpdate: (fields: Partial<Diagnosis>) => void
}

export function DiagnosticDetail({ diagnosis, onUpdate }: DiagnosticDetailProps) {
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
    marginBottom: dimensions.spacingMd,
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
          <div style={{ marginLeft: 'auto', fontSize: typography.sizeSm, color: colors.textDarkBlue, flexShrink: 0, textAlign: 'right' }}>
            <div>{date}</div>
            <div>{diagnosis.model_name}</div>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: dimensions.spacingMd }}>
              <div style={{ fontSize: 21, fontWeight: typography.weightSemibold, color: colors.textDarkBlue }}>
                Diagnosis
              </div>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 9999,
                paddingLeft: 10,
                paddingRight: 10,
                paddingTop: 2,
                paddingBottom: 2,
                fontSize: typography.sizeSm,
                fontWeight: typography.weightMedium,
                backgroundColor: 'transparent',
                border: `1px solid ${colors.primaryBlue}`,
                color: colors.textDarkBlue,
              }}>
                {diagnosis.primary_confidence}%
              </span>
            </div>

          <div style={fieldStyle}>
            <DiagnosisValidation
              key={`diag-${diagnosis.id}`}
              diagnosisId={diagnosis.id}
              crop={diagnosis.crop}
              label="Primary"
              value={diagnosis.primary_diagnosis}
              currentValidation={expertValidation}
              currentCorrect={expertCorrectDiagnosis}
              onSaved={(v, c) => { setExpertValidation(v); setExpertCorrectDiagnosis(c); onUpdate({ expert_validation: v, expert_correct_diagnosis: c }) }}
            />
          </div>

          {diagnosis.secondary_diagnosis && diagnosis.primary_confidence < 70 && (
            <div style={fieldStyle}>
              <span style={labelStyle}>Secondary</span>
              <div style={valueStyle}>{diagnosis.secondary_diagnosis}</div>
            </div>
          )}

          <div style={fieldStyle}>
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
                <div style={valueStyle}>No</div>
              </>
            )}
          </div>

          {diagnosis.treatment_shown && diagnosis.treatment_groups && (
            <div style={fieldStyle}>
              <span style={labelStyle}>Recommendations</span>
              <div style={valueStyle}>
                If there are more than 3 caterpillars per plant, apply the treatment. If less than 3 per plant, then pick them up manually.
              </div>
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
