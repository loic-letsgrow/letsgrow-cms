'use client'

// ============================================================================
// PEST DISEASE EDIT POPUP
// scientific_name is selected from the scientific_names table (dropdown).
// common_name and crop_family remain free/select fields.
// ============================================================================

import { useState, useEffect, CSSProperties } from 'react'
import { PopupCard } from '@/components/shared/ui/PopupCard'
import { TextField } from '@/components/shared/TextField'
import { SelectField } from '@/components/shared/SelectField'
import { PillButton } from '@/components/shared/PillButton'
import { colors, typography } from '@/lib/theme'
import { popup } from '@/lib/theme/dimensions'
import { createBrowserClient } from '@/lib/supabase/client'

interface PestDisease {
  id: string
  scientific_name: string
  common_name: string
  crop_family: string
}

interface PestDiseaseEditPopupProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  pestDisease: PestDisease | null
}

const cropFamilyOptions = [
  { value: 'Tomato', label: 'Tomato' },
  { value: 'Chili', label: 'Chili' },
  { value: 'Eggplant', label: 'Eggplant' },
  { value: 'Cabbage', label: 'Cabbage' },
  { value: 'Cucumber', label: 'Cucumber' },
  { value: 'Beans', label: 'Beans' },
]

export function PestDiseaseEditPopup({ isOpen, onClose, onSave, pestDisease }: PestDiseaseEditPopupProps) {
  const [scientificName, setScientificName] = useState('')
  const [commonName, setCommonName] = useState('')
  const [cropFamily, setCropFamily] = useState('')
  const [scientificNameOptions, setScientificNameOptions] = useState<{ value: string; label: string }[]>([])
  const [saving, setSaving] = useState(false)

  const isEditMode = pestDisease !== null

  // Load scientific names from table
  useEffect(() => {
    const fetch = async () => {
      const supabase = createBrowserClient()
      const { data } = await supabase
        .from('scientific_names')
        .select('name, type')
        .order('type')
        .order('name')
      if (data) {
        setScientificNameOptions(data.map(n => ({
          value: n.name,
          label: `${n.name} (${n.type})`,
        })))
      }
    }
    fetch()
  }, [])

  useEffect(() => {
    if (isOpen) {
      if (pestDisease) {
        setScientificName(pestDisease.scientific_name)
        setCommonName(pestDisease.common_name)
        setCropFamily(pestDisease.crop_family)
      } else {
        setScientificName('')
        setCommonName('')
        setCropFamily('')
      }
    }
  }, [isOpen, pestDisease?.id])

  const handleSave = async () => {
    if (!scientificName) { alert('Scientific name is required'); return }
    if (!commonName.trim()) { alert('Common name is required'); return }
    if (!cropFamily) { alert('Crop family is required'); return }

    setSaving(true)
    const supabase = createBrowserClient()

    try {
      if (isEditMode && pestDisease) {
        const { error } = await supabase
          .from('pest_diseases')
          .update({ scientific_name: scientificName, common_name: commonName.trim(), crop_family: cropFamily })
          .eq('id', pestDisease.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('pest_diseases')
          .insert({ scientific_name: scientificName, common_name: commonName.trim(), crop_family: cropFamily })
        if (error) throw error
      }
      await onSave()
      onClose()
    } catch (error) {
      console.error('Error saving pest/disease:', error)
      alert('Failed to save pest/disease')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!pestDisease) return
    const confirmed = window.confirm(`Delete "${pestDisease.scientific_name} - ${pestDisease.common_name}"? This cannot be undone.`)
    if (!confirmed) return
    const supabase = createBrowserClient()
    const { error } = await supabase.from('pest_diseases').delete().eq('id', pestDisease.id)
    if (error) { alert('Failed to delete'); return }
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
    <PopupCard isOpen={isOpen} onClose={onClose} minWidth={420} backgroundColor={colors.white}>
      <div style={titleStyle}>{isEditMode ? 'Edit Pest / Disease' : 'Add New Pest / Disease'}</div>

      <div style={fieldGroupStyle}>
        <SelectField
          label="Scientific Name"
          value={scientificName}
          onChange={setScientificName}
          options={scientificNameOptions}
          required
        />
      </div>

      <div style={fieldGroupStyle}>
        <TextField label="Common Name" value={commonName} onChange={setCommonName} required />
      </div>

      <div style={fieldGroupStyle}>
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
    </PopupCard>
  )
}
