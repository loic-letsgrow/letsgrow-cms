'use client'

import { CSSProperties, useState, useEffect } from 'react'
import { NavBar } from '@/components/shared/NavBar'
import { SettingsCard } from './SettingsCard'
import { UserEditPopup } from './UserEditPopup'
import { CropFamilyEditPopup } from './CropFamilyEditPopup'
import { CropEditPopup } from './CropEditPopup'
import { ScientificNameEditPopup } from './ScientificNameEditPopup'
import { TreatmentGroupEditPopup } from './TreatmentGroupEditPopup'
import { colors } from '@/lib/theme'
import { createBrowserClient } from '@/lib/supabase/client'

// ── Types ──────────────────────────────────────────────────────────────────

interface VegClinicUser {
  id: string
  first_name: string
  last_name: string | null
  email: string | null
  role: string
  code: string
  authorized: boolean
  device_id: string | null
  initialized: boolean
  initialized_at: string | null
  created_at: string
}

interface CropFamily {
  name: string
  crop_pests_diseases?: { scientific_name: string }[]
}

interface Crop {
  crop_name: string
  crop_family: string
}

interface ScientificName {
  name: string
  type: string
  common_name: string
}

interface TreatmentGroup {
  id: string
  name: string
  scientific_names: string[]
  active_ingredients: string[]
  pre_treatment_advice_en: string | null
  pre_treatment_advice_id: string | null
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  // Users
  const [users, setUsers] = useState<VegClinicUser[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<VegClinicUser | null>(null)
  const [userPopupOpen, setUserPopupOpen] = useState(false)

  // Crop Families
  const [cropFamilies, setCropFamilies] = useState<CropFamily[]>([])
  const [cropFamiliesLoading, setCropFamiliesLoading] = useState(true)
  const [selectedCropFamily, setSelectedCropFamily] = useState<CropFamily | null>(null)
  const [cropFamilyPopupOpen, setCropFamilyPopupOpen] = useState(false)

  // Crops
  const [crops, setCrops] = useState<Crop[]>([])
  const [cropsLoading, setCropsLoading] = useState(true)
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null)
  const [cropPopupOpen, setCropPopupOpen] = useState(false)

  // Scientific Names
  const [scientificNames, setScientificNames] = useState<ScientificName[]>([])
  const [scientificNamesLoading, setScientificNamesLoading] = useState(true)
  const [selectedScientificName, setSelectedScientificName] = useState<ScientificName | null>(null)
  const [scientificNamePopupOpen, setScientificNamePopupOpen] = useState(false)

  // Treatment Groups
  const [treatmentGroups, setTreatmentGroups] = useState<TreatmentGroup[]>([])
  const [treatmentGroupsLoading, setTreatmentGroupsLoading] = useState(true)
  const [selectedTreatmentGroup, setSelectedTreatmentGroup] = useState<TreatmentGroup | null>(null)
  const [treatmentGroupPopupOpen, setTreatmentGroupPopupOpen] = useState(false)

  // ── Fetch functions ──────────────────────────────────────────────────────

  const fetchUsers = async () => {
    setUsersLoading(true)
    const supabase = createBrowserClient()
    const { data, error } = await supabase
      .from('vegclinic_users')
      .select('id, first_name, last_name, email, role, code, authorized, device_id, initialized, initialized_at, created_at')
    if (!error) setUsers(data || [])
    setUsersLoading(false)
  }

  const fetchCropFamilies = async () => {
    setCropFamiliesLoading(true)
    const supabase = createBrowserClient()
    const { data, error } = await supabase
      .from('crop_families')
      .select('name, crop_pests_diseases(scientific_name)')
      .order('name')
    if (!error) setCropFamilies(data || [])
    setCropFamiliesLoading(false)
  }

  const fetchCrops = async () => {
    setCropsLoading(true)
    const supabase = createBrowserClient()
    const { data, error } = await supabase
      .from('crops')
      .select('crop_name, crop_family')
      .order('crop_name')
    if (!error) setCrops(data || [])
    setCropsLoading(false)
  }

  const fetchScientificNames = async () => {
    setScientificNamesLoading(true)
    const supabase = createBrowserClient()
    const { data, error } = await supabase
      .from('scientific_names')
      .select('name, type, common_name')
      .order('type')
      .order('name')
    if (!error) setScientificNames(data || [])
    setScientificNamesLoading(false)
  }

  const fetchTreatmentGroups = async () => {
    setTreatmentGroupsLoading(true)
    const supabase = createBrowserClient()
    const { data, error } = await supabase
      .from('treatment_groups')
      .select('id, name, scientific_names, active_ingredients, pre_treatment_advice_en, pre_treatment_advice_id')
      .order('id')
    if (!error) setTreatmentGroups(data || [])
    setTreatmentGroupsLoading(false)
  }

  useEffect(() => {
    fetchUsers()
    fetchCropFamilies()
    fetchCrops()
    fetchScientificNames()
    fetchTreatmentGroups()
  }, [])

  // ── Card item formatters ─────────────────────────────────────────────────

  const usersItems = [...users]
    .sort((a, b) => {
      const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim().toLowerCase()
      const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim().toLowerCase()
      return nameA.localeCompare(nameB)
    })
    .map(u => ({
      id: u.id,
      label: `${u.first_name || ''} ${u.last_name || ''}`.trim() || '(No name)',
      subtitle: `${u.role}${!u.authorized ? ' · Blocked' : ''}`,
      searchText: `${u.email || ''} ${u.code || ''}`,
    }))

  const cropFamiliesItems = cropFamilies.map(cf => ({
    id: cf.name,
    label: cf.name,
    subtitle: cf.crop_pests_diseases?.map(r => r.scientific_name).join(', ') || '',
  }))

  const cropsItems = crops.map(c => ({
    id: c.crop_name,
    label: c.crop_name,
    subtitle: c.crop_family,
  }))

  const scientificNamesItems = scientificNames.map(s => ({
    id: s.name,
    label: s.name,
    subtitle: s.common_name,
    subtitle2: s.type,
  }))

  const treatmentGroupsItems = treatmentGroups.map(t => ({
    id: t.id,
    label: t.name,
    subtitle: t.scientific_names.join(', '),
  }))

  // ── Styles ───────────────────────────────────────────────────────────────

  const pageStyle: CSSProperties = {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }

  const mainContentStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: colors.white,
    paddingLeft: 60,
    paddingRight: 60,
    paddingTop: 16,
    paddingBottom: 16,
  }

  const contentRowStyle: CSSProperties = {
    display: 'flex',
    gap: 16,
    width: '100%',
    flex: 1,
    minHeight: 0,
  }

  return (
    <div style={pageStyle}>
      <NavBar />
      <main style={mainContentStyle}>
        <div style={contentRowStyle}>

          {/* Crops */}
          <SettingsCard
            title="Crops"
            items={cropsLoading ? [] : cropsItems}
            onAdd={() => { setSelectedCrop(null); setCropPopupOpen(true) }}
            onItemClick={(id) => {
              const c = crops.find(cr => cr.crop_name === id)
              setSelectedCrop(c || null)
              setCropPopupOpen(true)
            }}
          />

          {/* Crop Families */}
          <SettingsCard
            title="Crop Families"
            items={cropFamiliesLoading ? [] : cropFamiliesItems}
            onAdd={() => { setSelectedCropFamily(null); setCropFamilyPopupOpen(true) }}
            onItemClick={(id) => {
              const cf = cropFamilies.find(c => c.name === id)
              setSelectedCropFamily(cf || null)
              setCropFamilyPopupOpen(true)
            }}
          />

          {/* Scientific Names */}
          <SettingsCard
            title="Scientific Names"
            items={scientificNamesLoading ? [] : scientificNamesItems}
            onAdd={() => { setSelectedScientificName(null); setScientificNamePopupOpen(true) }}
            onItemClick={(id) => {
              const s = scientificNames.find(sn => sn.name === id)
              setSelectedScientificName(s || null)
              setScientificNamePopupOpen(true)
            }}
          />

          {/* Treatment Groups */}
          <SettingsCard
            title="Treatment Groups"
            items={treatmentGroupsLoading ? [] : treatmentGroupsItems}
            onAdd={() => { setSelectedTreatmentGroup(null); setTreatmentGroupPopupOpen(true) }}
            onItemClick={(id) => {
              const t = treatmentGroups.find(tg => tg.id === id)
              setSelectedTreatmentGroup(t || null)
              setTreatmentGroupPopupOpen(true)
            }}
          />

          {/* Users */}
          <SettingsCard
            title="Users"
            items={usersLoading ? [] : usersItems}
            onAdd={() => { setSelectedUser(null); setUserPopupOpen(true) }}
            onItemClick={(id) => {
              const u = users.find(usr => usr.id === id)
              setSelectedUser(u || null)
              setUserPopupOpen(true)
            }}
          />

        </div>

        {/* Popups */}
        <UserEditPopup
          isOpen={userPopupOpen}
          onClose={() => { setUserPopupOpen(false); setSelectedUser(null) }}
          onSave={fetchUsers}
          user={selectedUser}
          existingCodes={users.map(u => u.code)}
        />
        <CropFamilyEditPopup
          isOpen={cropFamilyPopupOpen}
          onClose={() => { setCropFamilyPopupOpen(false); setSelectedCropFamily(null) }}
          onSave={fetchCropFamilies}
          cropFamily={selectedCropFamily}
        />
        <CropEditPopup
          isOpen={cropPopupOpen}
          onClose={() => { setCropPopupOpen(false); setSelectedCrop(null) }}
          onSave={fetchCrops}
          crop={selectedCrop}
        />
        <ScientificNameEditPopup
          isOpen={scientificNamePopupOpen}
          onClose={() => { setScientificNamePopupOpen(false); setSelectedScientificName(null) }}
          onSave={fetchScientificNames}
          scientificName={selectedScientificName}
        />
        <TreatmentGroupEditPopup
          isOpen={treatmentGroupPopupOpen}
          onClose={() => { setTreatmentGroupPopupOpen(false); setSelectedTreatmentGroup(null) }}
          onSave={fetchTreatmentGroups}
          treatmentGroup={selectedTreatmentGroup}
        />
      </main>
    </div>
  )
}
