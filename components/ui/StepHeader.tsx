'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, X } from 'lucide-react'
import { ProgressBar } from './ProgressBar'

interface StepHeaderProps {
  title: string
  currentStep: number
  totalSteps: number
  onBack?: () => void
  onClose?: () => void
  showProgress?: boolean
}

export function StepHeader({
  title,
  currentStep,
  totalSteps,
  onBack,
  onClose,
  showProgress = true,
}: StepHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      router.back()
    }
  }

  return (
    <header className="app-header border-b border-[var(--color-border-light)]">
      {/* Navigation Row */}
      <div className="h-[52px] px-5 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-gray-100)] transition-colors -ml-2"
        >
          <ArrowLeft className="w-6 h-6 text-[var(--color-text-primary)]" />
        </button>

        <h1 className="text-[18px] font-bold text-[var(--color-text-primary)]">
          {title}
        </h1>

        <button
          onClick={handleClose}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-gray-100)] transition-colors -mr-2"
        >
          <X className="w-6 h-6 text-[var(--color-text-secondary)]" />
        </button>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="px-5 pb-3">
          <ProgressBar
            currentStep={currentStep}
            totalSteps={totalSteps}
            showLabel={false}
          />
        </div>
      )}
    </header>
  )
}
