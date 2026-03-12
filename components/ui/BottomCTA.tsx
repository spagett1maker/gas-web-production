'use client'

import { ReactNode } from 'react'
import { Button } from './Button'

// 디자인 시스템 스펙:
// - 위치: fixed bottom
// - 패딩: 16px 20px + safe-area-bottom
// - 배경: #FFFFFF
// - 상단 보더: 1px solid #F2F2F7

interface BottomCTAProps {
  children?: ReactNode
  primaryLabel?: string
  primaryAction?: () => void
  primaryDisabled?: boolean
  primaryLoading?: boolean
  secondaryLabel?: string
  secondaryAction?: () => void
  className?: string
}

export function BottomCTA({
  children,
  primaryLabel,
  primaryAction,
  primaryDisabled,
  primaryLoading,
  secondaryLabel,
  secondaryAction,
  className = '',
}: BottomCTAProps) {
  // 커스텀 children이 있으면 그대로 렌더링
  if (children) {
    return (
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-[45]
          bg-white border-t border-[#F2F2F7]
          px-5 pt-3
          ${className}
        `}
        style={{ paddingBottom: 'calc(12px + var(--safe-area-bottom, 0px))' }}
      >
        {children}
      </div>
    )
  }

  // 기본 버튼 레이아웃
  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-[45]
        bg-white border-t border-[#F2F2F7]
        px-5 pt-3
        ${className}
      `}
      style={{ paddingBottom: 'calc(12px + var(--safe-area-bottom, 0px))' }}
    >
      <div className={`flex gap-3 ${secondaryLabel ? '' : ''}`}>
        {secondaryLabel && (
          <Button
            variant="secondary"
            size="lg"
            onClick={secondaryAction}
            className="flex-1"
          >
            {secondaryLabel}
          </Button>
        )}
        {primaryLabel && (
          <Button
            variant="primary"
            size="lg"
            onClick={primaryAction}
            disabled={primaryDisabled}
            loading={primaryLoading}
            className={secondaryLabel ? 'flex-1' : 'w-full'}
          >
            {primaryLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

// BottomCTA가 있는 페이지용 여백
export function BottomCTASpacer() {
  return (
    <div
      className="w-full"
      style={{ height: 'calc(76px + var(--safe-area-bottom, 0px))' }}
    />
  )
}
