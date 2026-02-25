'use client'

import { useState } from 'react'
import { PopupCard } from '@/components/shared/ui/PopupCard'
import { PillButton } from '@/components/shared/PillButton'
import { createBrowserClient } from '@/lib/supabase/client'
import { colors, typography, dimensions } from '@/lib/theme'

interface NotePopupProps {
  diagnosisId: string
  initialNote: string | null
  onSaved: (note: string) => void
}

export function NotePopup({ diagnosisId, initialNote, onSaved }: NotePopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [note, setNote] = useState(initialNote ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const supabase = createBrowserClient()
    await supabase
      .from('diagnoses')
      .update({ expert_notes: note || null })
      .eq('id', diagnosisId)
    setSaving(false)
    onSaved(note)
    setIsOpen(false)
  }

  return (
    <>
      <PillButton label="Note" variant="primary" onClick={() => setIsOpen(true)} width={70} />
      <PopupCard
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Expert Note"
        width="40vw"
        minHeight={200}
        onCancel={() => setIsOpen(false)}
        onSave={handleSave}
        saving={saving}
      >
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note about this diagnosis..."
          style={{
            width: '100%',
            minHeight: 120,
            borderRadius: dimensions.radiusSmall,
            border: `1px solid ${colors.border}`,
            padding: dimensions.spacingSm,
            fontSize: typography.sizeSm,
            color: colors.textDarkBlue,
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </PopupCard>
    </>
  )
}
