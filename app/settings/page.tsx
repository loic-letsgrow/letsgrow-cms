'use client'

import { CSSProperties, useState, useEffect } from 'react'
import { NavBar } from '@/components/shared/NavBar'
import { SettingsCard } from './SettingsCard'
import { UserEditPopup } from './UserEditPopup'
import { colors } from '@/lib/theme'
import { createBrowserClient } from '@/lib/supabase/client'

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

export default function SettingsPage() {
  const [users, setUsers] = useState<VegClinicUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<VegClinicUser | null>(null)
  const [popupOpen, setPopupOpen] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    const supabase = createBrowserClient()
    const { data, error } = await supabase
      .from('vegclinic_users')
      .select('id, first_name, last_name, email, role, code, authorized, device_id, initialized, initialized_at, created_at')
    if (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Format users for SettingsCard
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

  const existingCodes = users.map(u => u.code)

  const handleAdd = () => {
    setSelectedUser(null)
    setPopupOpen(true)
  }

  const handleEdit = (userId: string) => {
    const u = users.find(usr => usr.id === userId)
    setSelectedUser(u || null)
    setPopupOpen(true)
  }

  const handleSave = async () => {
    await fetchUsers()
  }

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
    paddingLeft: 120,
    paddingRight: 120,
    paddingTop: 16,
    paddingBottom: 16,
  }

  const contentRowStyle: CSSProperties = {
    display: 'flex',
    gap: 20,
    width: '100%',
    flex: 1,
    minHeight: 0,
    maxWidth: 400,
  }

  return (
    <div style={pageStyle}>
      <NavBar />
      <main style={mainContentStyle}>
        <div style={contentRowStyle}>
          <SettingsCard
            title="Users"
            items={loading ? [] : usersItems}
            onAdd={handleAdd}
            onItemClick={handleEdit}
          />
        </div>
        <UserEditPopup
          isOpen={popupOpen}
          onClose={() => { setPopupOpen(false); setSelectedUser(null) }}
          onSave={handleSave}
          user={selectedUser}
          existingCodes={existingCodes}
        />
      </main>
    </div>
  )
}
