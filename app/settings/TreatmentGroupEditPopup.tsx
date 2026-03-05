'use client'

// ============================================================================
// TREATMENT GROUP EDIT POPUP
// scientific_names are selected via multi-select loaded from scientific_names table.
// active_ingredients remain free text (comma-separated) as they are not normalized.
// ============================================================================

import { useState, useEffect, CSSProperties } from 'react'
import { PopupCard } from '@/components/shared/ui/PopupCard'
import { TextField } from '@/components/shared/TextField'
import { PillButton } from '@/components/shared/PillButton'
import { colors, typography, dimensions } from '@/lib/theme'
import { popup } from '@/lib/theme/dimensions'
import { createBrowserClient } from '@/lib/supabase/client'

interface TreatmentGroup {
  id: string
  name: string
  scientific_names: string[]
  active_ingredients: string[]
  pre_treatment_advice_en: string | null
  pre_treatment_advice_id: string | null
}

interface ScientificName {
  name: string
  type: string
}

interface TreatmentGroupEditPopupProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  treatmentGroup: TreatmentGroup | null
}

function TextAreaField({ label, value, onChange, hint }: {
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
}) {
  const labelStyle: CSSProperties = {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 11,
    color: colors.textDarkBlue,
    marginBottom: 4,
    display: 'block',
    fontWeight: 500,
  }
  return (
    <div>
      <span style={labelStyle}>{label}</span>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={3}
        style={{
          width: '100%',
          fontSize: 13,
          color: colors.textDarkBlue,
          border: `1px solid ${colors.border}`,
          borderRadius: dimensions.radiusSmall,
          padding: '6px 8px',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'Inter, system-ui, sans-serif',
          boxSizing: 'border-box',
          lineHeight: 1.5,
        }}
      />
      {hint && <div style={{ fontSize: 11, color: colors.superDarkGrey, marginTop: 3 }}>{hint}</div>}
    </div>
  )
}

function ScientificNameMultiSelect({ selected, onChange }: {
  selected: string[]
  onChange: (names: string[]) => void
}) {
  const [allNames, setAllNames] = useState<ScientificName[]>([])

  useEffect(() => {
    const fetch = async () => {
      const supabase = createBrowserClient()
      const { data } = await supabase
        .from('scientific_names')
        .select('name, type')
        .order('type')
        .order('name')
      if (data) setAllNames(data)
    }
    fetch()
  }, [])

  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter(n => n !== name))
    } else {
      onChange([...selected, name])
    }
  }

  const labelStyle: CSSProperties = {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 11,
    color: colors.textDarkBlue,
    marginBottom: 6,
    display: 'block',
    fontWeight: 500,
  }

  const containerStyle: CSSProperties = {
    border: `1px solid ${colors.border}`,
    borderRadius: dimensions.radiusSmall,
    padding: '6px 8px',
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 6,
  }

  const diseases = allNames.filter(n => n.type === 'disease')
  const pests = allNames.filter(n => n.type === 'pest')

  const groupLabelStyle: CSSProperties = {
    width: '100%',
    fontSize: 10,
    fontWeight: 600,
    color: colors.superDarkGrey,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 2,
  }

  const getTagStyle = (isSelected: boolean): CSSProperties => ({
    fontSize: 12,
    padding: '3px 10px',
    borderRadius: 9999,
    border: `1px solid ${isSelected ? colors.primaryBlue : colors.border}`,
    backgroundColor: isSelected ? colors.lightBlue : colors.white,
    color: colors.textDarkBlue,
    cursor: 'pointer',
    userSelect: 'none' as const,
    fontFamily: 'Inter, system-ui, sans-serif',
  })

  return (
    <div>
      <span style={labelStyle}>Scientific Names *</span>
      <div style={containerStyle}>
        {diseases.length > 0 && <div style={groupLabelStyle}>Diseases</div>}
        {diseases.map(n => (
          <span key={n.name} style={getTagStyle(selected.includes(n.name))} onClick={() => toggle(n.name)}>
            {n.name}
          </span>
        ))}
        {pests.length > 0 && <div style={groupLabelStyle}>Pests</div>}
        {pests.map(n => (
          <span key={n.name} style={getTagStyle(selected.includes(n.name))} onClick={() => toggle(n.name)}>
            {n.name}
          </span>
        ))}
      </div>
    </div>
  )
}

export function TreatmentGroupEditPopup({ isOpen, onClose, onSave, treatmentGroup }: TreatmentGroupEditPopupProps) {
  const [name, setName] = useState('')
  const [scientificNames, setScientificNames] = useState<string[]>([])
  const [activeIngredients, setActiveIngredients] = useState('')
  const [preAdviceEn, setPreAdviceEn] = useState('')
  const [preAdviceId, setPreAdviceId] = useState('')
  const [saving, setSaving] = useState(false)

  const isEditMode = treatmentGroup !== null

  useEffect(() => {
    if (isOpen) {
      if (treatmentGroup) {
        setName(treatmentGroup.name)
        setScientificNames(treatmentGroup.scientific_names ?? [])
        setActiveIngredients(treatmentGroup.active_ingredients.join(', '))
        setPreAdviceEn(treatmentGroup.pre_treatment_advice_en ?? '')
        setPreAdviceId(treatmentGroup.pre_treatment_advice_id ?? '')
      } else {
        setName('')
        setScientificNames([])
        setActiveIngredients('')
        setPreAdviceEn('')
        setPreAdviceId('')
      }
    }
  }, [isOpen, treatmentGroup?.id])

  const parseList = (value: string): string[] =>
    value.split(',').map(s => s.trim()).filter(Boolean)

  const handleSave = async () => {
    if (!name.trim()) { alert('Name is required'); return }
    if (scientificNames.length === 0) { alert('At least one scientific name is required'); return }
    if (!activeIngredients.trim()) { alert('At least one active ingredient is required'); return }

    setSaving(true)
    const supabase = createBrowserClient()

    const data = {
      name: name.trim(),
      scientific_names: scientificNames,
      active_ingredients: parseList(activeIngredients),
      pre_treatment_advice_en: preAdviceEn.trim() || null,
      pre_treatment_advice_id: preAdviceId.trim() || null,
    }

    try {
      if (isEditMode && treatmentGroup) {
        const { error } = await supabase.from('treatment_groups').update(data).eq('id', treatmentGroup.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('treatment_groups').insert(data)
        if (error) throw error
      }
      await onSave()
      onClose()
    } catch (error) {
      console.error('Error saving treatment group:', error)
      alert('Failed to save treatment group')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!treatmentGroup) return
    const confirmed = window.confirm(`Delete treatment group "${treatmentGroup.name}"? This cannot be undone.`)
    if (!confirmed) return
    const supabase = createBrowserClient()
    const { error } = await supabase.from('treatment_groups').delete().eq('id', treatmentGroup.id)
    if (error) { alert('Failed to delete treatment group'); return }
    await onSave()
    onClose()
  }

  const titleStyle: CSSProperties = {
    fontSize: typography.sizeLg,
    fontWeight: 600,
    color: colors.textDarkBlue,
    marginBottom: 16,
  }

  const fieldGroupStyle: CSSProperties = { marginBottom: popup.fieldGap }

  const buttonsRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: isEditMode ? 'space-between' : 'flex-end',
    alignItems: 'center',
    marginTop: 16,
  }

  return (
    <PopupCard isOpen={isOpen} onClose={onClose} width="50vw" backgroundColor={colors.white}>
      <div style={titleStyle}>{isEditMode ? 'Edit Treatment Group' : 'Add New Treatment Group'}</div>
      <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 4 }}>

        <div style={fieldGroupStyle}>
          <TextField label="Name" value={name} onChange={setName} required />
        </div>

        <div style={fieldGroupStyle}>
          <ScientificNameMultiSelect selected={scientificNames} onChange={setScientificNames} />
        </div>

        <div style={fieldGroupStyle}>
          <TextAreaField
            label="Active Ingredients"
            value={activeIngredients}
            onChange={setActiveIngredients}
            hint="Comma-separated, e.g. Abamectin, Klorpirifos"
          />
        </div>

        <div style={fieldGroupStyle}>
          <TextAreaField label="Pre-treatment Advice (English)" value={preAdviceEn} onChange={setPreAdviceEn} />
        </div>

        <div style={fieldGroupStyle}>
          <TextAreaField label="Pre-treatment Advice (Bahasa)" value={preAdviceId} onChange={setPreAdviceId} />
        </div>

      </div>
      <div style={buttonsRowStyle}>
        {isEditMode && <PillButton label="Delete" variant="danger" onClick={handleDelete} />}
        <div style={{ display: 'flex', gap: 12 }}>
          <PillButton label="Cancel" variant="secondary" onClick={onClose} width={80} />
          <PillButton label={saving ? 'Saving...' : 'Save'} onClick={handleSave} disabled={saving} width={80} />
        </div>
      </div>
    </PopupCard>
  )
}
