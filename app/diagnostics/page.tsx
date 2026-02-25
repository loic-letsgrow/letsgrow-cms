'use client'

import { CSSProperties, useEffect, useState } from 'react'
import { NavBar } from '@/components/shared/NavBar'
import { DiagnosticSidebar, Diagnosis } from './DiagnosticSidebar'
import { DiagnosticDetail } from './DiagnosticDetail'
import { PillButton } from '@/components/shared/PillButton'
import { createBrowserClient } from '@/lib/supabase/client'
import { colors, dimensions, typography } from '@/lib/theme'

const statusOrder: Record<string, number> = { pending: 0, done: 1 }

export default function DiagnosticsPage() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchDiagnoses = async () => {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from('diagnoses')
        .select('id, session_id, created_at, crop, model_name, cost_usd, primary_diagnosis, primary_common_name, primary_confidence, secondary_diagnosis, secondary_common_name, secondary_confidence, treatment_shown, treatment_group, expert_validation, expert_correct_diagnosis, photo_1_url, photo_2_url, reasoning, expert_notes, treatment_validation, expert_correct_treatment, status, treatment_groups(name, active_ingredients)')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to load diagnoses:', error)
      } else {
        const typed = (data as unknown as Diagnosis[]) || []
        typed.sort((a, b) => {
          const sa = statusOrder[a.status] ?? 0
          const sb = statusOrder[b.status] ?? 0
          if (sa !== sb) return sa - sb
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        setDiagnoses(typed)
        if (typed.length > 0) setSelectedId(typed[0].id)
      }
      setLoading(false)
    }
    fetchDiagnoses()
  }, [])

  const selected = diagnoses.find(d => d.id === selectedId) || null

  const updateDiagnosis = (id: string, fields: Partial<Diagnosis>) => {
    setDiagnoses(prev => {
      const updated = prev.map(d => d.id === id ? { ...d, ...fields } : d)
      updated.sort((a, b) => {
        const sa = statusOrder[a.status] ?? 0
        const sb = statusOrder[b.status] ?? 0
        if (sa !== sb) return sa - sb
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      return updated
    })
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    const diagnosis = diagnoses.find(d => d.id === id)
    if (!diagnosis) return

    if (newStatus === 'done') {
      const hasDiagnosis = !!diagnosis.primary_diagnosis
      const hasTreatment = diagnosis.treatment_shown && !!diagnosis.treatment_groups

      if (hasDiagnosis && hasTreatment) {
        if (!diagnosis.expert_validation || !diagnosis.treatment_validation) {
          setWarningMessage('Please validate the diagnosis and treatment before marking as done.')
          return
        }
      } else if (hasDiagnosis) {
        if (!diagnosis.expert_validation) {
          setWarningMessage('Please validate the diagnosis before marking as done.')
          return
        }
      }
    }

    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('diagnoses')
      .update({ status: newStatus })
      .eq('id', id)

    if (!error) {
      updateDiagnosis(id, { status: newStatus })
    }
  }

  const pageStyle: CSSProperties = {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }

  const contentRowStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  }

  if (loading) {
    return (
      <div style={pageStyle}>
        <NavBar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.superDarkGrey }}>
          Loading diagnoses...
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <NavBar />
      <div style={contentRowStyle}>
        <DiagnosticSidebar
          diagnoses={diagnoses}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <DiagnosticDetail
          key={selectedId ?? 'none'}
          diagnosis={selected}
          status={selected?.status ?? 'pending'}
          onStatusChange={(newStatus) => selectedId && handleStatusChange(selectedId, newStatus)}
          onUpdate={(fields) => selectedId && updateDiagnosis(selectedId, fields)}
        />
      </div>
      {warningMessage && (
        <div onClick={() => setWarningMessage(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'pointer' }}>
          <div style={{ backgroundColor: colors.white, borderRadius: dimensions.radiusMedium, padding: dimensions.spacingLg, minWidth: 300, textAlign: 'center' }}>
            <div style={{ fontSize: typography.sizeMd, fontWeight: typography.weightNormal, color: colors.textDarkBlue }}>
              {warningMessage}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
