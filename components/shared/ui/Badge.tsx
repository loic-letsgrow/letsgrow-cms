'use client'

import { CSSProperties, ReactNode } from 'react'
import { colors, typography } from '@/lib/theme'

const badgeVariants = {
  red: { bg: colors.lightRed, border: colors.lightRedBorder },
  green: { bg: colors.lightGreen, border: colors.lightGreenBorder },
  blue: { bg: colors.lightBlue, border: colors.lightBlueBorder },
  neutral: { bg: colors.darkGrey, border: colors.border },
}

interface BadgeProps {
  children: ReactNode
  variant?: 'red' | 'green' | 'blue' | 'neutral'
  paddingHorizontal?: number
  paddingVertical?: number
  width?: number
  fontSize?: number
}

export function Badge({ children, variant = 'blue', paddingHorizontal = 8, paddingVertical = 1, width, fontSize }: BadgeProps) {
  const variantStyle = badgeVariants[variant]

  const badgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: width ?? 'fit-content',
    borderRadius: 9999,
    paddingLeft: paddingHorizontal,
    paddingRight: paddingHorizontal,
    paddingTop: paddingVertical,
    paddingBottom: paddingVertical,
    fontSize: fontSize ?? typography.sizeXsSm,
    backgroundColor: variantStyle.bg,
    border: `1px solid ${variantStyle.border}`,
    color: colors.textDarkBlue,
  }

  return <span style={badgeStyle}>{children}</span>
}
