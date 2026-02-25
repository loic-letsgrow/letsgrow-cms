'use client'

import { CSSProperties, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings } from 'lucide-react'
import { VERSION } from '@/version'
import { colors, dimensions, typography } from '@/lib/theme'

const menuItems = [
  { label: 'Diagnosis', href: '/diagnostics' },
  { label: 'Dashboard', href: '/dashboard' },
]

export function NavBar() {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [clickedItem, setClickedItem] = useState<string | null>(null)
  const [settingsHovered, setSettingsHovered] = useState(false)
  const [settingsClicked, setSettingsClicked] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [profileHovered, setProfileHovered] = useState(false)
  const isSettingsActive = pathname === '/settings'

  useEffect(() => {
    const handleClickOutside = () => {
      if (showProfileDropdown) setShowProfileDropdown(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showProfileDropdown])

  const handleMenuClick = (label: string) => {
    setClickedItem(label)
    setTimeout(() => setClickedItem(null), 150)
  }

  const handleSettingsClick = () => {
    setSettingsClicked(true)
    setTimeout(() => setSettingsClicked(false), 150)
  }

  const headerStyle: CSSProperties = {
    height: 64,
    backgroundColor: colors.primaryBlue,
    position: 'relative',
    zIndex: 3,
  }

  const containerStyle: CSSProperties = {
    height: '100%',
    paddingLeft: 0,
    paddingRight: dimensions.spacingLg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  const menuContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 60,
    marginRight: 80,
  }

  const getMenuItemStyle = (isActive: boolean, isHovered: boolean, isClicked: boolean): CSSProperties => ({
    fontSize: typography.sizeMd,
    fontWeight: typography.weightMedium,
    color: isActive ? colors.white : (isHovered ? colors.brightGreen : 'rgba(255, 255, 255, 0.9)'),
    textDecorationLine: (isActive || isHovered) ? 'underline' : 'none',
    textDecorationStyle: 'solid',
    textDecorationThickness: 2,
    textDecorationColor: isActive ? colors.white : colors.brightGreen,
    textUnderlineOffset: 8,
    transform: (isClicked || isHovered) ? 'scale(1.04)' : 'scale(1)',
    transition: 'transform 150ms ease-out, color 150ms ease-out',
    display: 'inline-block',
  })

  const rightContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
  }

  const settingsLinkStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottom: (isSettingsActive || settingsHovered) ? '2px solid' : '2px solid transparent',
    borderBottomColor: isSettingsActive ? colors.white : (settingsHovered ? colors.brightGreen : 'transparent'),
    transform: (settingsClicked || settingsHovered) ? 'scale(1.04)' : 'scale(1)',
    transition: 'transform 150ms ease-out, border-color 150ms ease-out',
  }

  const settingsIconStyle: CSSProperties = {
    color: isSettingsActive ? colors.white : (settingsHovered ? colors.brightGreen : 'rgba(255, 255, 255, 0.9)'),
    cursor: 'pointer',
    position: 'relative',
    top: 6,
    transition: 'color 150ms ease-out',
  }

  return (
    <>
      <header style={headerStyle}>
        <div style={containerStyle}>
          {/* Logo group — width matches sidebar */}
          <div style={{ width: dimensions.sidebarWidth, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <Link href="/diagnostics" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Image
              src="/assets/letsgrow-logo.png"
              alt="LetsGrow"
              width={140}
              height={44}
              priority
              style={{ height: 40, width: 'auto' }}
            />
            <span style={{ color: colors.white, fontSize: 12 }}>–</span>
            <span style={{
              fontSize: typography.sizeMd,
              fontWeight: typography.weightMedium,
              color: colors.white,
            }}>
              CMS
            </span>
          </Link>
          </div>

          {/* Menu items */}
          <div style={menuContainerStyle}>
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              const isHovered = hoveredItem === item.label
              const isClicked = clickedItem === item.label
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  style={getMenuItemStyle(isActive, isHovered, isClicked)}
                  onClick={() => handleMenuClick(item.label)}
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Right: settings + profile */}
          <div style={rightContainerStyle}>
            <Link
              href="/settings"
              style={settingsLinkStyle}
              onClick={handleSettingsClick}
              onMouseEnter={() => setSettingsHovered(true)}
              onMouseLeave={() => setSettingsHovered(false)}
            >
              <Settings size={24} style={settingsIconStyle} strokeWidth={1.5} />
            </Link>
            <div
              onClick={(e) => { e.stopPropagation(); setShowProfileDropdown(!showProfileDropdown) }}
              onMouseEnter={() => setProfileHovered(true)}
              onMouseLeave={() => setProfileHovered(false)}
              style={{
                cursor: 'pointer',
                transform: profileHovered ? 'scale(1.06)' : 'scale(1)',
                transition: 'transform 150ms ease-out',
              }}
            >
              <Image
                src="/assets/profile_icon.png"
                alt="Profile"
                width={35}
                height={35}
                style={{ borderRadius: '50%', position: 'relative', top: 3 }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Profile dropdown */}
      {showProfileDropdown && (
        <div
          onClick={() => setShowProfileDropdown(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 10,
          }}
        >
          <div
            style={{
              position: 'fixed',
              top: 16,
              right: 24,
              backgroundColor: 'white',
              borderRadius: dimensions.radiusMedium,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: 180,
              zIndex: 11,
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '10px 16px', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: colors.textDarkBlue }}>
                Expert Review
              </div>
              <div style={{ fontSize: 12, color: colors.superDarkGrey, marginTop: 2 }}>
                Vegify CMS
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: 14,
                color: colors.textDarkBlue,
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.mediumGrey}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <span>Logout</span>
              <span style={{ fontSize: 11, color: colors.superDarkGrey, position: 'relative', top: 3 }}>v{VERSION}</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
