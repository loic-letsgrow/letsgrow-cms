'use client'

// ============================================================================
// SCIENTIFIC NAME EDIT POPUP
// Edit or add a scientific name in the scientific_names table.
// name: editable, duplicate check case-insensitive, CASCADE updates crop_pests_diseases
// type: 'pest' or 'disease'
// common_name: duplicate check case-insensitive
// treatment_groups.scientific_names[] updated manually on rename (array, no FK)
// ============================================================================

import { useState, useEffect, CSSProperties } from 'react'
import { PopupCard } from '@/components/shared/ui/PopupCard'
import { SelectField } from '@/components/shared/SelectField'
import { PillButton } from '@/components/shared/PillButton'
import { colors, typography, dimensions } from '@/lib/theme'
import { popup } from '@/lib/theme/dimensions'
import { createBrowserClient } from '@/lib/supabase/client'

interface ScientificName {
  name: string
  type: string
  common_name: string
}

interface ScientificNameEditPopupProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  scientificName: ScientificName | null
}

const typeOptions = [
  { value: 'pest', label: 'Pest' },
  { value: 'disease', label: 'Disease' },
]

export function ScientificNameEditPopup({ isOpen, onClose, onSave, scientificName }: ScientificNameEditPopupProps) {
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [type, setType] = useState('')
  const [commonName, setCommonName] = useState('')
  const [commonNameError, setCommonNameError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const isEditMode = scientificName !== null

  useEffect(() => {
    if (isOpen) {
      setNameError(null)
      setCommonNameError(null)
      if (scientificName) {
        setName(scientificName.name)
        setType(scientificName.type)
        setCommonName(scientificName.common_name)
      } else {
        setName('')
        setType('')
        setCommonName('')
      }
    }
  }, [isOpen, scientificName?.name])

  const handleSave = async () => {
    const trimmedName = name.trim()
    const trimmedCommon = commonName.trim()
    if (!trimmedName) { setNameError('Name is required'); return }
    if (!type) { alert('Type is required'); return }
    if (!trimmedCommon) { setCommonNameError('Common name is required'); return }

    setSaving(true)
    const supabase = createBrowserClient()

    try {
      // Check duplicate scientific name (case-insensitive, exclude current in edit mode)
      const { data: existingName } = await supabase
        .from('scientific_names')
        .select('name')
        .ilike('name', trimmedName)
        .single()
      if (existingName && (!isEditMode || existingName.name.toLowerCase() !== scientificName!.name.toLowerCase())) {
        setNameError('A scientific name with this name already exists')
        setSaving(false)
        return
      }

      // Check duplicate common name (case-insensitive, exclude current in edit mode)
      const { data: existingCommon } = await supabase
        .from('scientific_names')
        .select('name, common_name')
        .ilike('common_name', trimmedCommon)
        .single()
      if (existingCommon && (!isEditMode || existingCommon.name.toLowerCase() !== scientificName!.name.toLowerCase())) {
        setCommonNameError('A scientific name with this common name already exists')
        setSaving(false)
        return
      }

      if (isEditMode && scientificName) {
        const isRename = trimmedName.toLowerCase() !== scientificName.name.toLowerCase()

        // Update scientific name (CASCADE handles crop_pests_diseases automatically)
        const { error } = await supabase
          .from('scientific_names')
          .update({ name: trimmedName, type, common_name: trimmedCommon })
          .eq('name', scientificName.name)
        if (error) throw error

        // If renamed, also update treatment_groups.scientific_names[] manually (array, no FK)
        if (isRename) {
          const { data: groups } = await supabase
            .from('treatment_groups')
            .select('id, scientific_names')
          if (groups) {
            for (const group of groups) {
              if (group.scientific_names?.includes(scientificName.name)) {
                const updated = group.scientific_names.map((n: string) =>
                  n === scientificName.name ? trimmedName : n
                )
                await supabase
                  .from('treatment_groups')
                  .update({ scientific_names: updated })
                  .eq('id', group.id)
              }
            }
          }
        }
      } else {
        const { error } = await supabase
          .from('scientific_names')
          .insert({ name: trimmedName, type, common_name: trimmedCommon })
        if (error) throw error
      }

      await onSave()
      onClose()
    } catch (error) {
      console.error('Error saving scientific name:', error)
      alert('Failed to save scientific name')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!scientificName) return
    const confirmed = window.confirm(
      `Delete "${scientificName.name}"? This will also remove it from all crop family associations and treatment groups. This cannot be undone.`
    )
    if (!confirmed) return

    const supabase = createBrowserClient()

    // Remove from treatment_groups.scientific_names[] manually
    const { data: groups } = await supabase.from('treatment_groups').select('id, scientific_names')
    if (groups) {
      for (const group of groups) {
        if (group.scientific_names?.includes(scientificName.name)) {
          await supabase
            .from('treatment_groups')
            .update({ scientific_names: group.scientific_names.filter((n: string) => n !== scientificName.name) })
            .eq('id', group.id)
        }
      }
    }

    // Delete from scientific_names (CASCADE handles crop_pests_diseases)
    const { error } = await supabase.from('scientific_names').delete().eq('name', scientificName.name)
    if (error) { alert('Failed to delete scientific name'); return }
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

  const getInputStyle = (hasError: boolean): CSSProperties => ({
    width: 250,
    height: 28,
    fontSize: 13,
    color: colors.textDarkBlue,
    border: `1px solid ${hasError ? colors.error : colors.border}`,
    borderRadius: dimensions.radiusSmall,
    paddingLeft: 8,
    paddingRight: 8,
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'Inter, system-ui, sans-serif',
  })

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
    <PopupCard isOpen={isOpen} onClose={onClose} minWidth={400} backgroundColor={colors.white}>
      <div style={titleStyle}>{isEditMode ? 'Edit Scientific Name' : 'Add New Scientific Name'}</div>

      <div style={fieldGroupStyle}>
        <span style={inputLabelStyle}>Scientific Name *</span>
        <input
          value={name}
          onChange={e => { setName(e.target.value); setNameError(null) }}
          style={getInputStyle(!!nameError)}
        />
        {nameError && <div style={errorStyle}>{nameError}</div>}
      </div>

      <div style={{ ...fieldGroupStyle, width: 250 }}>
        <SelectField label="Type" value={type} onChange={setType} options={typeOptions} required />
      </div>

      <div style={fieldGroupStyle}>
        <span style={inputLabelStyle}>Common Name *</span>
        <input
          value={commonName}
          onChange={e => { setCommonName(e.target.value); setCommonNameError(null) }}
          style={getInputStyle(!!commonNameError)}
        />
        {commonNameError && <div style={errorStyle}>{commonNameError}</div>}
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
