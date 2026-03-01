'use client'

// ============================================================================
// USER EDIT POPUP
// Edit or add a VegClinic user. Fields match the vegclinic_users Supabase table.
// Code field has duplicate check. Device can be reset to allow re-registration.
// Invite button is placeholder for future email functionality.
// ============================================================================

import { useState, useEffect, CSSProperties } from 'react'
import { PopupCard } from '@/components/shared/ui/PopupCard'
import { TextField } from '@/components/shared/TextField'
import { SelectField } from '@/components/shared/SelectField'
import { PillButton } from '@/components/shared/PillButton'
import { colors, typography } from '@/lib/theme'
import { popup } from '@/lib/theme/dimensions'
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

interface UserEditPopupProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  user: VegClinicUser | null  // null = add new user
  existingCodes: string[]
}

const roleOptions = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Project Manager', label: 'Project Manager' },
  { value: 'Team Leader', label: 'Team Leader' },
  { value: 'Data Assistant', label: 'Data Assistant' },
  { value: 'LSIO', label: 'LSIO' },
  { value: 'MAKO', label: 'MAKO' },
  { value: 'TFO', label: 'TFO' },
]

const authorizedOptions = [
  { value: 'true', label: 'Authorized' },
  { value: 'false', label: 'Blocked' },
]

export function UserEditPopup({
  isOpen,
  onClose,
  onSave,
  user,
  existingCodes,
}: UserEditPopupProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [code, setCode] = useState('')
  const [authorized, setAuthorized] = useState('true')
  const [saving, setSaving] = useState(false)

  const isEditMode = user !== null

  // Populate form when popup opens
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFirstName(user.first_name || '')
        setLastName(user.last_name || '')
        setEmail(user.email || '')
        setRole(user.role || '')
        setCode(user.code || '')
        setAuthorized(user.authorized ? 'true' : 'false')
      } else {
        setFirstName('')
        setLastName('')
        setEmail('')
        setRole('')
        setCode('')
        setAuthorized('true')
      }
    }
  }, [isOpen, user?.id])

  const handleSave = async () => {
    const trimmedFirstName = firstName.trim()
    const trimmedLastName = lastName.trim()
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedCode = code.trim().toUpperCase()

    // Validate required fields
    if (!trimmedFirstName) { alert('First name is required'); return }
    if (!role) { alert('Role is required'); return }
    if (!trimmedCode) { alert('Code is required'); return }

    // Check for duplicate code (case-insensitive), excluding current user in edit mode
    const isDuplicateCode = existingCodes.some(
      existing =>
        existing.toUpperCase() === trimmedCode &&
        (!isEditMode || existing.toUpperCase() !== user?.code?.toUpperCase())
    )
    if (isDuplicateCode) {
      alert('A user with this code already exists')
      return
    }

    setSaving(true)
    const supabase = createBrowserClient()

    const userData = {
      first_name: trimmedFirstName,
      last_name: trimmedLastName || null,
      email: trimmedEmail || null,
      role,
      code: trimmedCode,
      authorized: authorized === 'true',
    }

    try {
      if (isEditMode && user) {
        const { error } = await supabase
          .from('vegclinic_users')
          .update(userData)
          .eq('id', user.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('vegclinic_users')
          .insert({ id: crypto.randomUUID(), lms_user_id: '', ...userData })
        if (error) throw error
      }

      await onSave()
      onClose()
    } catch (error) {
      console.error('Error saving user:', error)
      alert('Failed to save user')
    } finally {
      setSaving(false)
    }
  }

  const handleResetDevice = async () => {
    if (!user) return
    const confirmed = window.confirm(
      `This will reset the code for ${user.first_name}. He will no longer be able to log in to VegClinic on his phone. You will need to enter a new Code and re-invite him.\n\nAre you sure you want to do that?`
    )
    if (!confirmed) return

    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('vegclinic_users')
      .update({ device_id: null, initialized: false, initialized_at: null, code: '' })
      .eq('id', user.id)

    if (error) {
      alert('Failed to reset access')
    } else {
      alert('Access reset successfully')
      await onSave()
      onClose()
    }
  }

  const handleInvite = () => {
    alert('Email invite — coming soon')
  }

  // Styles
  const titleStyle: CSSProperties = {
    fontSize: typography.sizeLg,
    fontWeight: 600,
    color: colors.textDarkBlue,
    marginBottom: 16,
  }

  const fieldGroupStyle: CSSProperties = {
    marginBottom: popup.fieldGap,
  }

  const rowStyle: CSSProperties = {
    display: 'flex',
    gap: 12,
  }

  const halfFieldStyle: CSSProperties = {
    flex: 1,
  }

  const infoSectionStyle: CSSProperties = {
    marginTop: 8,
    padding: '10px 12px',
    backgroundColor: colors.mediumGrey,
    borderRadius: 8,
    fontSize: typography.sizeXs,
    color: colors.superDarkGrey,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  }

  const infoRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }

  const resetLinkStyle: CSSProperties = {
    fontSize: typography.sizeXs,
    color: colors.primaryBlue,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    padding: 0,
    textDecoration: 'underline',
  }

  const buttonsRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: isEditMode ? 'space-between' : 'flex-end',
    alignItems: 'center',
    marginTop: 16,
  }

  return (
    <PopupCard
      isOpen={isOpen}
      onClose={onClose}
      minWidth={420}
      backgroundColor={colors.white}
    >
      <div style={titleStyle}>
        {isEditMode ? 'Edit User' : 'Add New User'}
      </div>

      {/* First Name / Last Name */}
      <div style={{ ...fieldGroupStyle, ...rowStyle }}>
        <div style={halfFieldStyle}>
          <TextField label="First Name" value={firstName} onChange={setFirstName} required />
        </div>
        <div style={halfFieldStyle}>
          <TextField label="Last Name" value={lastName} onChange={setLastName} />
        </div>
      </div>

      {/* Email */}
      <div style={fieldGroupStyle}>
        <TextField label="Email" value={email} onChange={setEmail} />
      </div>

      {/* Role / Code */}
      <div style={{ ...fieldGroupStyle, ...rowStyle }}>
        <div style={halfFieldStyle}>
          <SelectField label="Role" value={role} onChange={setRole} options={roleOptions} required />
        </div>
        <div style={halfFieldStyle}>
          <TextField label="Code" value={code} onChange={(v) => setCode(v.toUpperCase())} required />
        </div>
      </div>

      {/* Authorized */}
      <div style={fieldGroupStyle}>
        <SelectField
          label="Status"
          value={authorized}
          onChange={setAuthorized}
          options={authorizedOptions}
        />
      </div>

      {/* Device info (edit mode only) */}
      {isEditMode && user && (
        <div style={infoSectionStyle}>
          <div style={infoRowStyle}>
            <span>Device: {user.device_id || 'Not registered'}</span>
            {user.device_id && (
              <button type="button" style={resetLinkStyle} onClick={handleResetDevice}>
                Reset
              </button>
            )}
          </div>
          <div>
            {user.initialized
              ? `Initialized: ${user.initialized_at ? new Date(user.initialized_at).toLocaleDateString() : 'Yes'}`
              : 'Not initialized'
            }
          </div>
        </div>
      )}

      {/* Buttons row */}
      <div style={buttonsRowStyle}>
        {isEditMode && (
          <PillButton label="Invite" variant="primary" onClick={handleInvite} />
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          <PillButton label="Cancel" variant="secondary" onClick={onClose} width={80} />
          <PillButton label={saving ? 'Saving...' : 'Save'} onClick={handleSave} disabled={saving} width={80} />
        </div>
      </div>
    </PopupCard>
  )
}
