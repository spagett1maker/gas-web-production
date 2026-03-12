'use client'

import { ReactNode, useEffect, useState } from 'react'
import { Check, X, AlertTriangle, Info } from 'lucide-react'
import { Button } from './Button'

// 디자인 시스템 스펙:
// - 명확한 상태 표시: 성공, 에러, 경고, 정보
// - 체크마크 애니메이션 (check-draw)
// - 바운스 인 애니메이션

type FeedbackType = 'success' | 'error' | 'warning' | 'info'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  type: FeedbackType
  title: string
  description?: string
  primaryLabel?: string
  primaryAction?: () => void
  secondaryLabel?: string
  secondaryAction?: () => void
  autoClose?: number // ms
}

const feedbackConfig: Record<FeedbackType, {
  bgColor: string
  iconColor: string
  icon: typeof Check
}> = {
  success: {
    bgColor: 'bg-[#F0FDF4]',
    iconColor: 'text-[#22C55E]',
    icon: Check,
  },
  error: {
    bgColor: 'bg-[#FEF2F2]',
    iconColor: 'text-[#EF4444]',
    icon: X,
  },
  warning: {
    bgColor: 'bg-[#FFFBEB]',
    iconColor: 'text-[#F59E0B]',
    icon: AlertTriangle,
  },
  info: {
    bgColor: 'bg-[#EFF6FF]',
    iconColor: 'text-[#3B82F6]',
    icon: Info,
  },
}

export function FeedbackModal({
  isOpen,
  onClose,
  type,
  title,
  description,
  primaryLabel = '확인',
  primaryAction,
  secondaryLabel,
  secondaryAction,
  autoClose,
}: FeedbackModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showCheck, setShowCheck] = useState(false)

  const config = feedbackConfig[type]
  const Icon = config.icon

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsAnimating(true)
      document.body.style.overflow = 'hidden'
      // 아이콘 애니메이션 지연
      setTimeout(() => {
        setIsAnimating(false)
        setShowCheck(true)
      }, 300)
    } else {
      setShowCheck(false)
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

  // Auto close
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(onClose, autoClose)
      return () => clearTimeout(timer)
    }
  }, [isOpen, autoClose, onClose])

  if (!isVisible) return null

  const handlePrimary = () => {
    if (primaryAction) {
      primaryAction()
    }
    onClose()
  }

  const handleSecondary = () => {
    if (secondaryAction) {
      secondaryAction()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-200 ${
          isOpen && !isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-xl max-w-sm w-full transition-all duration-300 ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-90 translate-y-8'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div className="px-6 pt-8 pb-6 text-center">
          {/* 아이콘 */}
          <div
            className={`w-16 h-16 mx-auto mb-5 ${config.bgColor} rounded-full flex items-center justify-center transition-transform duration-500 ${
              showCheck ? 'scale-100' : 'scale-0'
            }`}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <Icon
              className={`w-8 h-8 ${config.iconColor}`}
              strokeWidth={type === 'success' ? 3 : 2}
            />
          </div>

          {/* 타이틀 */}
          <h3 className="text-[20px] font-bold text-[#1A1A1A] mb-2 tracking-[-0.3px]">
            {title}
          </h3>

          {/* 설명 */}
          {description && (
            <p className="text-[15px] text-[#8E8E93] leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* 버튼 */}
        <div className="px-5 pb-5">
          {secondaryLabel ? (
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={handleSecondary}
              >
                {secondaryLabel}
              </Button>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handlePrimary}
              >
                {primaryLabel}
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handlePrimary}
            >
              {primaryLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// 간단한 토스트 스타일 피드백 (화면 상단)
interface ToastFeedbackProps {
  isOpen: boolean
  onClose: () => void
  type: FeedbackType
  message: string
  duration?: number
}

export function ToastFeedback({
  isOpen,
  onClose,
  type,
  message,
  duration = 3000,
}: ToastFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false)

  const config = feedbackConfig[type]
  const Icon = config.icon

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  if (!isVisible) return null

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-[80] transition-all duration-300 ${
        isOpen
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-4'
      }`}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="bg-[#1A1A1A] rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg mx-auto max-w-md">
        <div className={`w-6 h-6 ${config.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} strokeWidth={2.5} />
        </div>
        <p className="text-[14px] text-white font-medium flex-1">
          {message}
        </p>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center text-white/50 active:text-white/80"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
