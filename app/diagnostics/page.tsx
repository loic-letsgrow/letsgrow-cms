'use client'

import { CSSProperties, useEffect, useState } from 'react'
import { NavBar } from '@/components/shared/NavBar'
import { DiagnosticSidebar, Diagnosis } from './DiagnosticSidebar'
import { DiagnosticDetail } from './DiagnosticDetail'
import { createBrowserClient } from '@/lib/supabase/client'
import { colors } from '@/lib/theme'

export default function DiagnosticsPage() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDiagnoses = async () => {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from('diagnostics')
        .select('id, session_id, created_at, crop, model_name, primary_diagnosis, primary_common_name, primary_confidence, secondary_diagnosis, secondary_common_name, treatment_shown, treatment_group, expert_validation, expert_correct_diagnosis, photo_1_url, photo_2_url, reasoning, expert_notes, treatment_validation, expert_correct_treatment, treatment_groups(name, active_ingredients)')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to load diagnoses:', error)
      } else {
        setDiagnoses(data || [])
        if (data && data.length > 0) setSelectedId(data[0].id)
      }
      setLoading(false)
    }
    fetchDiagnoses()
  }, [])

  const selected = diagnoses.find(d => d.id === selectedId) || null

  const updateDiagnosis = (id: string, fields: Partial<Diagnosis>) => {
    setDiagnoses(prev => prev.map(d => d.id === id ? { ...d, ...fields } : d))
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
        <DiagnosticDetail key={selectedId ?? 'none'} diagnosis={selected} onUpdate={(fields) => selectedId && updateDiagnosis(selectedId, fields)} />
      </div>
    </div>
  )
}
