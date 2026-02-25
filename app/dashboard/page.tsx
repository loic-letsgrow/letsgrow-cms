'use client'

import { NavBar } from '@/components/shared/NavBar'
import { colors, typography } from '@/lib/theme'

export default function DashboardPage() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.superDarkGrey, fontSize: typography.sizeMd }}>
        Dashboard — coming soon
      </div>
    </div>
  )
}
