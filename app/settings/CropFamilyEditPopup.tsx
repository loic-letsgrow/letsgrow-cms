'use client'

// ============================================================================
// CROP FAMILY EDIT POPUP
// Edit a crop family name and its associated pests/diseases.
// Renaming cascades automatically to crops and crop_pests_diseases via FK CASCADE.
// ============================================================================

import { useState, useEffect, CSSProperties } from 'react'
import { PopupCard } from '@/components/shared/ui/PopupCard'
import { PillButton } from '@/components/shared/PillButton'
import { colors, typography, dimensions } from '@/lib/theme'
import { popup } from '@/lib/theme/dimensions'
import { createBrowserClient } from '@/lib/supabase/client'

interface CropFamily {
  name: string
}

interface ScientificName {
  name: string
  type: string
  common_name: string
}

interface CropFamilyEditPopupProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  cropFamily: CropFamily | null
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
        .select('name, type, common_name')
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

  const diseases = allNames.filter(n => n.type === 'disease')
  const pests = allNames.filter(n => n.type === 'pest')

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
    padding: '8px',
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 6,
  }

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
      <span style={labelStyle}>Pests & Diseases</span>
      <div style={containerStyle}>
        {diseases.length > 0 && <div style={groupLabelStyle}>Diseases</div>}
        {diseases.map(n => (
          <span key={n.name} style={getTagStyle(selected.includes(n.name))} onClick={() => toggle(n.name)} title={n.common_name}>
            {n.name}
          </span>
        ))}
        {pests.length > 0 && <div style={groupLabelStyle}>Pests</div>}
        {pests.map(n => (
          <span key={n.name} style={getTagStyle(selected.includes(n.name))} onClick={() => toggle(n.name)} title={n.common_name}>
            {n.name}
          </span>
        ))}
      </div>
    </div>
  )
}

export function CropFamilyEditPopup({ isOpen, onClose, onSave, cropFamily }: CropFamilyEditPopupProps) {
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [selectedScientificNames, setSelectedScientificNames] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const isEditMode = cropFamily !== null

  useEffect(() => {
    if (!isOpen) return
    setNameError(null)
    if (cropFamily) {
      setName(cropFamily.name)
      const loadAssociations = async () => {
        const supabase = createBrowserClient()
        const { data } = await supabase
          .from('crop_pests_diseases')
          .select('scientific_name')
          .eq('crop_family', cropFamily.name)
        if (data) setSelectedScientificNames(data.map(r => r.scientific_name))
      }
      loadAssociations()
    } else {
      setName('')
      setSelectedScientificNames([])
    }
  }, [isOpen, cropFamily?.name])

  const handleSave = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) { setNameError('Name is required'); return }

    setSaving(true)
    const supabase = createBrowserClient()

    try {
      if (isEditMode && cropFamily) {
        // Check for duplicate name (excluding current)
        if (trimmedName !== cropFamily.name) {
          const { data: existing } = await supabase
            .from('crop_families')
            .select('name')
            .ilike('name', trimmedName)
            .single()
          if (existing && existing.name.toLowerCase() !== cropFamily.name.toLowerCase()) { setNameError('A crop family with this name already exists'); setSaving(false); return }
          // Rename — CASCADE handles crops and crop_pests_diseases automatically
          const { error } = await supabase
            .from('crop_families')
            .update({ name: trimmedName })
            .eq('name', cropFamily.name)
          if (error) throw error
        }
        // Update associations using new name
        const { error: deleteError } = await supabase
          .from('crop_pests_diseases')
          .delete()
          .eq('crop_family', trimmedName)
        if (deleteError) throw deleteError
        if (selectedScientificNames.length > 0) {
          const { error: insertError } = await supabase
            .from('crop_pests_diseases')
            .insert(selectedScientificNames.map(sn => ({ crop_family: trimmedName, scientific_name: sn })))
          if (insertError) throw insertError
        }
      } else {
        // Check for duplicate name on new entry
        const { data: existing } = await supabase
          .from('crop_families')
          .select('name')
          .ilike('name', trimmedName)
          .single()
        if (existing) { setNameError('A crop family with this name already exists'); setSaving(false); return }
        const { error } = await supabase.from('crop_families').insert({ name: trimmedName })
        if (error) throw error
        if (selectedScientificNames.length > 0) {
          const { error: insertError } = await supabase
            .from('crop_pests_diseases')
            .insert(selectedScientificNames.map(sn => ({ crop_family: trimmedName, scientific_name: sn })))
          if (insertError) throw insertError
        }
      }

      await onSave()
      onClose()
    } catch (error) {
      console.error('Error saving crop family:', error)
      alert('Failed to save crop family')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!cropFamily) return
    const confirmed = window.confirm(
      `Delete crop family "${cropFamily.name}"? This will also remove all its pest/disease associations. This cannot be undone.`
    )
    if (!confirmed) return
    const supabase = createBrowserClient()
    await supabase.from('crop_pests_diseases').delete().eq('crop_family', cropFamily.name)
    const { error } = await supabase.from('crop_families').delete().eq('name', cropFamily.name)
    if (error) { alert('Failed to delete crop family'); return }
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

  const inputLabelStyle: CSSProperties = {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 11,
    color: colors.textDarkBlue,
    marginBottom: 4,
    fontWeight: 500,
    display: 'block',
  }

  const inputStyle: CSSProperties = {
    width: 250,
    height: 28,
    fontSize: 13,
    color: colors.textDarkBlue,
    border: `1px solid ${nameError ? colors.error : colors.border}`,
    borderRadius: dimensions.radiusSmall,
    paddingLeft: 8,
    paddingRight: 8,
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'Inter, system-ui, sans-serif',
  }

  const errorStyle: CSSProperties = {
    fontSize: 11,
    color: colors.error,
    marginTop: 3,
  }

  const buttonsRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: isEditMode ? 'space-between' : 'flex-end',
    alignItems: 'center',
    marginTop: 16,
  }

  return (
    <PopupCard isOpen={isOpen} onClose={onClose} width="50vw" backgroundColor={colors.white}>
      <div style={titleStyle}>{isEditMode ? 'Edit Crop Family' : 'Add New Crop Family'}</div>
      <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 4 }}>

        <div style={fieldGroupStyle}>
          <span style={inputLabelStyle}>Name *</span>
          <input
            value={name}
            onChange={e => { setName(e.target.value); setNameError(null) }}
            style={inputStyle}
          />
          {nameError && <div style={errorStyle}>{nameError}</div>}
        </div>

        <div style={fieldGroupStyle}>
          <ScientificNameMultiSelect
            selected={selectedScientificNames}
            onChange={setSelectedScientificNames}
          />
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
