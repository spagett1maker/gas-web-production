'use client'

import { ReactNode, useEffect, useState } from 'react'
import { X } from 'lucide-react'

// 디자인 시스템 스펙:
// - 스프링 애니메이션 (spring-in)
// - 배경 딤 처리 (fade-in)
// - ESC 키로 닫기
// - 물리적 근접성 (버튼 누른 곳에서 반응)

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
}

export const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = 'md',
  showCloseButton = true,
}: ModalProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsAnimating(true)
      document.body.style.overflow = 'hidden'
      setTimeout(() => setIsAnimating(false), 300)
    } else if (isVisible) {
      setIsAnimating(true)
      setTimeout(() => {
        setIsVisible(false)
        setIsAnimating(false)
        document.body.style.overflow = 'unset'
      }, 200)
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
    }
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isVisible) return null

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-200 ${
          isOpen && !isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative bg-white rounded-2xl shadow-xl ${maxWidthClasses[maxWidth]} w-full mx-4 transition-all duration-300 ${
            isOpen
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-4'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F2F2F7]">
              <h3 className="text-[17px] font-semibold text-[#1A1A1A] tracking-[-0.3px]">{title}</h3>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center text-[#8E8E93] active:text-[#636366] active:bg-[#F2F2F7] rounded-full transition-colors"
                  aria-label="닫기"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="px-5 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
