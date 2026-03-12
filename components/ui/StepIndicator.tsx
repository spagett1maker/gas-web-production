'use client'

import { Check } from 'lucide-react'

// 디자인 시스템 스펙:
// - 삼쩜삼 스타일 단계별 인디케이터
// - 완료/진행중/대기 상태 표시
// - 스프링 애니메이션

interface Step {
  label: string
  description?: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number // 1-based index
  variant?: 'horizontal' | 'vertical'
}

export function StepIndicator({
  steps,
  currentStep,
  variant = 'horizontal',
}: StepIndicatorProps) {
  if (variant === 'vertical') {
    return (
      <div className="space-y-0">
        {steps.map((step, idx) => {
          const stepNumber = idx + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isPending = stepNumber > currentStep

          return (
            <div key={idx} className="flex gap-4">
              {/* 숫자/체크 원 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-[#EB5B37] text-white'
                      : isCurrent
                      ? 'bg-[#EB5B37] text-white animate-pulse-dot'
                      : 'bg-[#F5F5F7] text-[#8E8E93]'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" strokeWidth={3} />
                  ) : (
                    <span className="text-[14px] font-bold">{stepNumber}</span>
                  )}
                </div>

                {/* 연결선 */}
                {idx < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-12 transition-colors duration-300 ${
                      isCompleted ? 'bg-[#EB5B37]' : 'bg-[#E5E5EA]'
                    }`}
                  />
                )}
              </div>

              {/* 텍스트 */}
              <div className="pb-12">
                <p
                  className={`text-[15px] font-semibold transition-colors duration-300 ${
                    isCurrent
                      ? 'text-[#1A1A1A]'
                      : isCompleted
                      ? 'text-[#8E8E93]'
                      : 'text-[#C7C7CC]'
                  }`}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-[13px] text-[#8E8E93] mt-0.5">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Horizontal variant (default)
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, idx) => {
        const stepNumber = idx + 1
        const isCompleted = stepNumber < currentStep
        const isCurrent = stepNumber === currentStep
        const isLast = idx === steps.length - 1

        return (
          <div key={idx} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              {/* 숫자/체크 원 */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#EB5B37] text-white'
                    : isCurrent
                    ? 'bg-[#EB5B37] text-white ring-4 ring-[#EB5B37]/20'
                    : 'bg-[#F5F5F7] text-[#8E8E93]'
                }`}
                style={{
                  transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" strokeWidth={3} />
                ) : (
                  <span className="text-[13px] font-bold">{stepNumber}</span>
                )}
              </div>

              {/* 라벨 */}
              <p
                className={`text-[11px] mt-2 text-center transition-colors duration-300 ${
                  isCurrent
                    ? 'text-[#EB5B37] font-semibold'
                    : isCompleted
                    ? 'text-[#8E8E93] font-medium'
                    : 'text-[#C7C7CC] font-medium'
                }`}
              >
                {step.label}
              </p>
            </div>

            {/* 연결선 */}
            {!isLast && (
              <div className="flex-1 h-0.5 mx-2 relative">
                <div className="absolute inset-0 bg-[#E5E5EA]" />
                <div
                  className="absolute inset-y-0 left-0 bg-[#EB5B37] transition-all duration-500"
                  style={{
                    width: isCompleted ? '100%' : '0%',
                  }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// 심플 프로그레스 바 (토스 스타일)
interface SimpleProgressProps {
  current: number
  total: number
  showLabel?: boolean
  animated?: boolean
}

export function SimpleProgress({
  current,
  total,
  showLabel = false,
  animated = true,
}: SimpleProgressProps) {
  const progress = Math.min((current / total) * 100, 100)

  return (
    <div className="w-full">
      <div className="h-1 bg-[#F5F5F7] rounded-full overflow-hidden">
        <div
          className={`h-full bg-[#EB5B37] rounded-full ${
            animated ? 'transition-all duration-500 ease-out' : ''
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-2">
          <span className="text-[12px] text-[#8E8E93]">{current}단계</span>
          <span className="text-[12px] text-[#8E8E93]">{total}단계 중</span>
        </div>
      )}
    </div>
  )
}
