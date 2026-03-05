'use client'

// ============================================================================
// CROP EDIT POPUP
// Edit or add a crop in the crops table.
// crop_name: auto-capitalizes each word, editable with duplicate check
// crop_family: loaded from crop_families table
// ============================================================================

import { useState, useEffect, CSSProperties } from 'react'
import { PopupCard } from '@/components/shared/ui/PopupCard'
import { SelectField } from '@/components/shared/SelectField'
import { PillButton } from '@/components/shared/PillButton'
import { colors, typography, dimensions } from '@/lib/theme'
import { popup } from '@/lib/theme/dimensions'
import { createBrowserClient } from '@/lib/supabase/client'

interface Crop {
  crop_name: string
  crop_family: string
}

interface CropEditPopupProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  crop: Crop | null
}

// Capitalize first letter of each word
const toTitleCase = (str: string) =>
  str.replace(/\b\w/g, c => c.toUpperCase())

export function CropEditPopup({ isOpen, onClose, onSave, crop }: CropEditPopupProps) {
  const [cropName, setCropName] = useState('')
  const [cropNameError, setCropNameError] = useState<string | null>(null)
  const [cropFamily, setCropFamily] = useState('')
  const [cropFamilyOptions, setCropFamilyOptions] = useState<{ value: string; label: string }[]>([])
  const [saving, setSaving] = useState(false)

  const isEditMode = crop !== null

  useEffect(() => {
    const fetch = async () => {
      const supabase = createBrowserClient()
      const { data } = await supabase.from('crop_families').select('name').order('name')
      if (data) setCropFamilyOptions(data.map(f => ({ value: f.name, label: f.name })))
    }
    fetch()
  }, [])

  useEffect(() => {
    if (isOpen) {
      setCropNameError(null)
      if (crop) {
        setCropName(crop.crop_name)
        setCropFamily(crop.crop_family)
      } else {
        setCropName('')
        setCropFamily('')
      }
    }
  }, [isOpen, crop?.crop_name])

  const handleSave = async () => {
    const trimmedName = toTitleCase(cropName.trim())
    if (!trimmedName) { setCropNameError('Crop name is required'); return }
    if (!cropFamily) { alert('Crop family is required'); return }

    setSaving(true)
    const supabase = createBrowserClient()

    try {
      // Duplicate check (case-insensitive, exclude current in edit mode)
      const { data: existing } = await supabase
        .from('crops')
        .select('crop_name')
        .ilike('crop_name', trimmedName)
        .single()
      if (existing && (!isEditMode || existing.crop_name.toLowerCase() !== crop!.crop_name.toLowerCase())) {
        setCropNameError('A crop with this name already exists')
        setSaving(false)
        return
      }

      if (isEditMode && crop) {
        const { error } = await supabase
          .from('crops')
          .update({ crop_name: trimmedName, crop_family: cropFamily })
          .eq('crop_name', crop.crop_name)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('crops')
          .insert({ crop_name: trimmedName, crop_family: cropFamily })
        if (error) throw error
      }
      await onSave()
      onClose()
    } catch (error) {
      console.error('Error saving crop:', error)
      alert('Failed to save crop')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!crop) return
    const confirmed = window.confirm(`Delete crop "${crop.crop_name}"? This cannot be undone.`)
    if (!confirmed) return
    const supabase = createBrowserClient()
    const { error } = await supabase.from('crops').delete().eq('crop_name', crop.crop_name)
    if (error) { alert('Failed to delete crop'); return }
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
    border: `1px solid ${cropNameError ? colors.error : colors.border}`,
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
    marginTop: 'auto',
    paddingTop: 16,
  }

  return (
    <PopupCard isOpen={isOpen} onClose={onClose} minWidth={380} backgroundColor={colors.white}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 260 }}>
        <div style={titleStyle}>{isEditMode ? 'Edit Crop' : 'Add New Crop'}</div>

        <div style={fieldGroupStyle}>
          <span style={inputLabelStyle}>Crop Name *</span>
          <input
            value={cropName}
            onChange={e => { setCropName(e.target.value); setCropNameError(null) }}
            onBlur={e => setCropName(toTitleCase(e.target.value))}
            style={inputStyle}
          />
          {cropNameError && <div style={errorStyle}>{cropNameError}</div>}
        </div>

        <div style={{ ...fieldGroupStyle, width: 250 }}>
          <SelectField
            label="Crop Family"
            value={cropFamily}
            onChange={setCropFamily}
            options={cropFamilyOptions}
            required
          />
        </div>

        <div style={buttonsRowStyle}>
          {isEditMode && <PillButton label="Delete" variant="danger" onClick={handleDelete} />}
          <div style={{ display: 'flex', gap: 12 }}>
            <PillButton label="Cancel" variant="secondary" onClick={onClose} width={80} />
            <PillButton label={saving ? 'Saving...' : 'Save'} onClick={handleSave} disabled={saving} width={80} />
          </div>
        </div>
      </div>
    </PopupCard>
  )
}
