'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

// 디자인 시스템 스펙:
// - 삼쩜삼 스타일 바텀시트
// - 스프링 애니메이션
// - 드래그로 닫기 지원
// - 배경 딤 처리

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  showHandle?: boolean
  snapPoints?: number[] // 0-100 사이의 높이 퍼센트
  initialSnap?: number
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  showHandle = true,
  snapPoints = [50, 90],
  initialSnap = 0,
}: BottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentSnap, setCurrentSnap] = useState(initialSnap)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsAnimating(true)
      document.body.style.overflow = 'hidden'
      // 애니메이션 후 상태 변경
      setTimeout(() => setIsAnimating(false), 400)
    } else if (isVisible) {
      setIsAnimating(true)
      setTimeout(() => {
        setIsVisible(false)
        setIsAnimating(false)
        document.body.style.overflow = 'unset'
      }, 300)
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
    currentY.current = e.touches[0].clientY
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    currentY.current = e.touches[0].clientY
    const diff = currentY.current - startY.current
    if (diff > 0) {
      setDragY(diff)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    if (dragY > 100) {
      onClose()
    }
    setDragY(0)
  }

  const sheetHeight = `${snapPoints[currentSnap]}vh`

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[60]">
      {/* 배경 딤 */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen && !isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* 바텀시트 */}
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[20px] shadow-[0_-4px_24px_rgba(0,0,0,0.12)] transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          height: sheetHeight,
          transform: isDragging ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? 'none' : undefined,
          paddingBottom: 'var(--safe-area-bottom, 0px)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 핸들 */}
        {showHandle && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-9 h-1 bg-[#E5E5EA] rounded-full" />
          </div>
        )}

        {/* 헤더 */}
        {title && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#F2F2F7]">
            <h3 className="text-[17px] font-semibold text-[#1A1A1A] tracking-[-0.3px]">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-[#8E8E93] active:bg-[#F5F5F7] rounded-full transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        )}

        {/* 컨텐츠 */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  )
}

// 액션 시트 (간단한 선택 옵션)
interface ActionSheetOption {
  label: string
  onClick: () => void
  variant?: 'default' | 'destructive'
  icon?: ReactNode
}

interface ActionSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  options: ActionSheetOption[]
}

export function ActionSheet({ isOpen, onClose, title, options }: ActionSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} showHandle={true} snapPoints={[40]}>
      <div className="px-5 py-4">
        {title && (
          <p className="text-[13px] text-[#8E8E93] text-center mb-4">{title}</p>
        )}

        <div className="space-y-1">
          {options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => {
                option.onClick()
                onClose()
              }}
              className={`w-full py-4 px-4 rounded-xl text-left flex items-center gap-3 active:bg-[#F5F5F7] transition-colors ${
                option.variant === 'destructive' ? 'text-[#EF4444]' : 'text-[#1A1A1A]'
              }`}
            >
              {option.icon && (
                <span className="w-6 h-6 flex items-center justify-center">
                  {option.icon}
                </span>
              )}
              <span className="text-[16px] font-medium">{option.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 py-4 bg-[#F5F5F7] rounded-xl text-[16px] font-semibold text-[#1A1A1A] active:bg-[#EBEBED] transition-colors"
        >
          취소
        </button>
      </div>
    </BottomSheet>
  )
}
