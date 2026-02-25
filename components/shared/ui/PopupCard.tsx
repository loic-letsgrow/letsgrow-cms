'use client'

import { CSSProperties, ReactNode } from 'react'
import ReactDOM from 'react-dom'
import { colors, dimensions, typography } from '@/lib/theme'
import { popup } from '@/lib/theme/dimensions'
import { PillButton } from '@/components/shared/PillButton'

interface PopupCardProps {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  title?: string
  width?: number | string
  minWidth?: number
  minHeight?: number | string
  backgroundColor?: string
  onCancel?: () => void
  onSave?: () => void
  saveLabel?: string
  saving?: boolean
}

export function PopupCard({
  children,
  isOpen,
  onClose,
  title,
  width,
  minWidth = 400,
  minHeight = 300,
  backgroundColor = colors.mediumGrey,
  onCancel,
  onSave,
  saveLabel = 'Save',
  saving = false,
}: PopupCardProps) {
  if (!isOpen) return null

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '10vh',
    zIndex: 9999,
  }

  const cardStyle: CSSProperties = {
    backgroundColor,
    border: `1px solid ${colors.border}`,
    borderRadius: dimensions.radiusLarge,
    paddingTop: popup.paddingVertical,
    paddingBottom: popup.paddingVertical,
    paddingLeft: popup.paddingHorizontal,
    paddingRight: popup.paddingHorizontal,
    ...(width ? { width } : { minWidth }),
    minHeight,
    maxWidth: '90vw',
    overflow: 'visible',
  }

  const titleStyle: CSSProperties = {
    fontSize: typography.sizeLg,
    fontWeight: typography.weightSemibold,
    color: colors.textDarkBlue,
    marginBottom: popup.titleMarginBottom,
  }

  const buttonsRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: popup.buttonGap,
    marginTop: popup.buttonsMarginTop,
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const showButtons = onCancel || onSave

  return ReactDOM.createPortal(
    <div style={overlayStyle} onClick={handleOverlayClick}>
      <div style={cardStyle}>
        {title && <div style={titleStyle}>{title}</div>}
        {children}
        {showButtons && (
          <div style={buttonsRowStyle}>
            {onCancel && <PillButton label="Cancel" variant="secondary" onClick={onCancel} width={80} />}
            {onSave && <PillButton label={saving ? 'Saving...' : saveLabel} variant="primary" onClick={onSave} disabled={saving} width={80} />}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
