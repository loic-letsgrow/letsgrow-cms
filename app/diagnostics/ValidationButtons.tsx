'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { colors, typography, dimensions } from '@/lib/theme'
import { Select } from '@/components/shared/ui/Select'

interface PestDisease {
  scientific_name: string
  common_name: string
}

interface TreatmentGroup {
  id: string
  name: string
}

const VALIDATION_OPTIONS = [
  { value: '', label: 'Review...' },
  { value: 'correct', label: 'Correct' },
  { value: 'wrong', label: 'Wrong' },
]

function getValidationColor(value: string): string {
  if (value === 'correct') return colors.lightGreen
  if (value === 'wrong') return colors.lightRed
  return colors.white
}

function getValidationBorder(value: string): string {
  if (value === 'correct') return colors.lightGreenBorder
  if (value === 'wrong') return colors.lightRedBorder
  return colors.border
}

const labelStyle = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: typography.sizeXxxs,
  color: colors.textDarkBlue,
  marginBottom: 2,
  display: 'block',
}

const valueStyle = {
  fontSize: typography.sizeSm,
  fontWeight: typography.weightSemibold,
  color: colors.textDarkBlue,
}

function ValidationSelect({ value, onChange, options, placeholder }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const selectedOption = options.find(o => o.value === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!buttonRef.current?.contains(event.target as Node) && !dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: '100%',
          height: 28,
          paddingLeft: 8,
          paddingRight: 8,
          borderRadius: dimensions.radiusSmall,
          border: `1px solid ${getValidationBorder(value)}`,
          backgroundColor: getValidationColor(value),
          fontSize: typography.sizeXs,
          fontWeight: typography.weightSemibold,
          color: colors.textDarkBlue,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transform: isHovered ? 'scale(1.03)' : 'scale(1)',
          transition: 'transform 150ms ease-out',
          boxSizing: 'border-box',
        }}
      >
        <span style={{ flex: 1, textAlign: 'left' }}>{selectedOption?.label || placeholder}</span>
        <span style={{
          width: 6, height: 6,
          borderRight: `1.5px solid ${colors.textDarkBlue}`,
          borderBottom: `1.5px solid ${colors.textDarkBlue}`,
          transform: isOpen ? 'rotate(-135deg)' : 'rotate(45deg)',
          flexShrink: 0,
          marginTop: isOpen ? 2 : -2,
          transition: 'transform 150ms ease-out',
        }} />
      </button>
      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            zIndex: 50,
            borderRadius: dimensions.radiusSmall,
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false) }}
              style={{
                height: 28,
                paddingLeft: 12,
                paddingRight: 12,
                display: 'flex',
                alignItems: 'center',
                fontSize: typography.sizeXs,
                fontWeight: typography.weightSemibold,
                color: colors.textDarkBlue,
                backgroundColor: getValidationColor(opt.value),
                cursor: 'pointer',
                borderBottom: `1px solid ${getValidationBorder(opt.value)}`,
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── DIAGNOSIS VALIDATION ──────────────────────────────────────────────────────

interface DiagnosisValidationProps {
  diagnosisId: string
  crop: string
  label: string
  value: string
  currentValidation: string | null
  currentCorrect: string | null
  onSaved: (validation: string | null, correct: string | null) => void
}

export function DiagnosisValidation({ diagnosisId, crop, label, value, currentValidation, currentCorrect, onSaved }: DiagnosisValidationProps) {
  const [validation, setValidation] = useState(currentValidation ?? '')
  const [correctDiagnosis, setCorrectDiagnosis] = useState(currentCorrect ?? '')
  const [manualEntry, setManualEntry] = useState('')
  const [showManual, setShowManual] = useState(currentCorrect === 'other')
  const [pestDiseases, setPestDiseases] = useState<PestDisease[]>([])

  useEffect(() => {
    const fetch = async () => {
      const supabase = createBrowserClient()
      const { data } = await supabase
        .from('pest_diseases')
        .select('scientific_name, common_name')
        .eq('crop', crop)
        .order('scientific_name')
      if (data) setPestDiseases(data)
    }
    fetch()
  }, [crop])

  const save = async (val: string, correct: string | null) => {
    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('diagnoses')
      .update({
        expert_validation: val || null,
        expert_correct_diagnosis: correct || null,
        reviewed_at: val ? new Date().toISOString() : null,
      })
      .eq('id', diagnosisId)
    if (error) console.error('Save failed:', error.message, error.code, error.details, error.hint)
    else console.log('Saved successfully')
    onSaved(val || null, correct)
  }

  const handleValidationChange = async (val: string) => {
    setValidation(val)
    setCorrectDiagnosis('')
    setShowManual(false)
    await save(val, null)
  }

  const handleCorrectChange = async (val: string) => {
    if (val === 'other') {
      setShowManual(true)
      setCorrectDiagnosis('other')
      return
    }
    setShowManual(false)
    setCorrectDiagnosis(val)
    await save(validation, val)
  }

  const handleManualSave = async () => {
    if (!manualEntry.trim()) return
    setCorrectDiagnosis(manualEntry.trim())
    setShowManual(false)
    await save(validation, manualEntry.trim())
  }

  const pestOptions = [
    ...pestDiseases.map(p => ({ value: p.scientific_name, label: `${p.scientific_name} (${p.common_name})` })),
    { value: 'uncertain', label: 'Uncertain' },
    { value: 'other', label: 'Other (manual entry)' },
  ]

  return (
    <div>
      {/* Row: diagnosis column + review column, both top-aligned */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: dimensions.spacingSm }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={labelStyle}>Primary</span>
          <div style={valueStyle}>{value}</div>
        </div>
        <div style={{ width: 82, flexShrink: 0, paddingTop: 10 }}>
          <ValidationSelect
            value={validation}
            onChange={handleValidationChange}
            options={VALIDATION_OPTIONS}
            placeholder="Review..."
          />
        </div>
      </div>

      {/* Correction row — below, full width */}
      {validation === 'wrong' && (
        <div style={{ marginTop: 6 }}>
          <Select
            value={correctDiagnosis}
            onChange={handleCorrectChange}
            options={pestOptions}
            placeholder="Select correct diagnosis..."
          />
          {showManual && (
            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              <input
                value={manualEntry}
                onChange={(e) => setManualEntry(e.target.value)}
                placeholder="Enter diagnosis..."
                style={{
                  flex: 1,
                  fontSize: typography.sizeXs,
                  border: `1px solid ${colors.border}`,
                  borderRadius: dimensions.radiusSmall,
                  padding: '2px 6px',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleManualSave}
                style={{
                  fontSize: typography.sizeXs,
                  padding: '2px 8px',
                  borderRadius: 99,
                  border: 'none',
                  backgroundColor: colors.primaryBlue,
                  color: colors.white,
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── TREATMENT VALIDATION ──────────────────────────────────────────────────────

interface TreatmentValidationProps {
  diagnosisId: string
  label: string
  value: string
  currentValidation: string | null
  currentCorrect: string | null
  onSaved: (validation: string | null, correct: string | null) => void
}

export function TreatmentValidation({ diagnosisId, label, value, currentValidation, currentCorrect, onSaved }: TreatmentValidationProps) {
  const [validation, setValidation] = useState(currentValidation ?? '')
  const [correctTreatment, setCorrectTreatment] = useState(currentCorrect ?? '')
  const [manualEntry, setManualEntry] = useState('')
  const [showManual, setShowManual] = useState(currentCorrect === 'other')
  const [treatmentGroups, setTreatmentGroups] = useState<TreatmentGroup[]>([])

  useEffect(() => {
    const fetch = async () => {
      const supabase = createBrowserClient()
      const { data } = await supabase
        .from('treatment_groups')
        .select('id, name')
        .order('id')
      if (data) setTreatmentGroups(data)
    }
    fetch()
  }, [])

  const save = async (val: string, correct: string | null) => {
    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('diagnoses')
      .update({
        treatment_validation: val || null,
        expert_correct_treatment: correct || null,
        reviewed_at: val ? new Date().toISOString() : null,
      })
      .eq('id', diagnosisId)
    if (error) console.error('Save failed:', error.message, error.code, error.details, error.hint)
    else console.log('Saved successfully')
    onSaved(val || null, correct)
  }

  const handleValidationChange = async (val: string) => {
    setValidation(val)
    setCorrectTreatment('')
    setShowManual(false)
    await save(val, null)
  }

  const handleCorrectChange = async (val: string) => {
    if (val === 'other') {
      setShowManual(true)
      setCorrectTreatment('other')
      return
    }
    setShowManual(false)
    setCorrectTreatment(val)
    await save(validation, val)
  }

  const handleManualSave = async () => {
    if (!manualEntry.trim()) return
    setCorrectTreatment(manualEntry.trim())
    setShowManual(false)
    await save(validation, manualEntry.trim())
  }

  const treatmentOptions = [
    ...treatmentGroups.map(t => ({ value: t.id, label: t.name })),
    { value: 'uncertain', label: 'Uncertain' },
    { value: 'other', label: 'Other (manual entry)' },
  ]

  return (
    <div>
      {/* Row: treatment column + review column, both top-aligned */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: dimensions.spacingSm }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={labelStyle}>{label}</span>
          <div style={valueStyle}>{value}</div>
        </div>
        <div style={{ width: 82, flexShrink: 0, paddingTop: 10 }}>
          <ValidationSelect
            value={validation}
            onChange={handleValidationChange}
            options={VALIDATION_OPTIONS}
            placeholder="Review..."
          />
        </div>
      </div>

      {/* Correction row — below, full width */}
      {validation === 'wrong' && (
        <div style={{ marginTop: 6 }}>
          <Select
            value={correctTreatment}
            onChange={handleCorrectChange}
            options={treatmentOptions}
            placeholder="Select correct treatment..."
          />
          {showManual && (
            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              <input
                value={manualEntry}
                onChange={(e) => setManualEntry(e.target.value)}
                placeholder="Enter treatment..."
                style={{
                  flex: 1,
                  fontSize: typography.sizeXs,
                  border: `1px solid ${colors.border}`,
                  borderRadius: dimensions.radiusSmall,
                  padding: '2px 6px',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleManualSave}
                style={{
                  fontSize: typography.sizeXs,
                  padding: '2px 8px',
                  borderRadius: 99,
                  border: 'none',
                  backgroundColor: colors.primaryBlue,
                  color: colors.white,
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
