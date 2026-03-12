'use client'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  showLabel?: boolean
}

export function ProgressBar({
  currentStep,
  totalSteps,
  showLabel = true,
}: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="w-full">
      <div className="progress-bar h-1">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-center text-[13px] text-[var(--color-text-secondary)] mt-2">
          {currentStep} / {totalSteps}
        </p>
      )}
    </div>
  )
}
