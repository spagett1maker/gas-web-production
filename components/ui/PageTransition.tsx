'use client'

import { ReactNode, useEffect, useState } from 'react'

// 디자인 시스템 스펙:
// - 페이지 진입 애니메이션 (fade-in-scale)
// - 스텝 전환 애니메이션 (slide)
// - 리스트 스태거 애니메이션

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 마운트 시 애니메이션 시작
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`transition-all duration-300 ${className} ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4'
      }`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {children}
    </div>
  )
}

// 스텝 전환 애니메이션
interface StepTransitionProps {
  children: ReactNode
  step: number
  direction?: 'forward' | 'backward'
  className?: string
}

export function StepTransition({
  children,
  step,
  direction = 'forward',
  className = '',
}: StepTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(step)

  useEffect(() => {
    if (step !== currentStep) {
      setIsVisible(false)
      const timer = setTimeout(() => {
        setCurrentStep(step)
        setIsVisible(true)
      }, 150)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(true)
    }
  }, [step, currentStep])

  const translateX = direction === 'forward' ? 'translate-x-4' : '-translate-x-4'

  return (
    <div
      className={`transition-all duration-300 ${className} ${
        isVisible
          ? 'opacity-100 translate-x-0'
          : `opacity-0 ${translateX}`
      }`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {children}
    </div>
  )
}

// 스태거 리스트 아이템
interface StaggerItemProps {
  children: ReactNode
  index: number
  delay?: number // ms per item
  className?: string
}

export function StaggerItem({
  children,
  index,
  delay = 50,
  className = '',
}: StaggerItemProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * delay)
    return () => clearTimeout(timer)
  }, [index, delay])

  return (
    <div
      className={`transition-all duration-300 ${className} ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2'
      }`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        transitionDelay: `${index * delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// 스태거 리스트 컨테이너
interface StaggerListProps {
  children: ReactNode[]
  delay?: number
  className?: string
}

export function StaggerList({
  children,
  delay = 50,
  className = '',
}: StaggerListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <StaggerItem key={index} index={index} delay={delay}>
          {child}
        </StaggerItem>
      ))}
    </div>
  )
}

// 카운트업 애니메이션
interface CountUpProps {
  value: number
  duration?: number // ms
  prefix?: string
  suffix?: string
  className?: string
  formatter?: (value: number) => string
}

export function CountUp({
  value,
  duration = 1000,
  prefix = '',
  suffix = '',
  className = '',
  formatter = (v) => v.toLocaleString(),
}: CountUpProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const startValue = displayValue

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.floor(startValue + (value - startValue) * easeProgress)

      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return (
    <span className={className}>
      {prefix}
      {formatter(displayValue)}
      {suffix}
    </span>
  )
}

// 스켈레톤 로딩
interface SkeletonProps {
  width?: string | number
  height?: string | number
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

export function Skeleton({
  width,
  height,
  rounded = 'md',
  className = '',
}: SkeletonProps) {
  const roundedClass = {
    none: 'rounded-none',
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full',
  }

  return (
    <div
      className={`skeleton ${roundedClass[rounded]} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  )
}

// 스켈레톤 텍스트
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 ? '60%' : '100%'}
          rounded="sm"
        />
      ))}
    </div>
  )
}

// 스켈레톤 아바타
export function SkeletonAvatar({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <Skeleton
      width={size}
      height={size}
      rounded="full"
      className={className}
    />
  )
}

// 스켈레톤 카드
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-2xl p-4 space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <SkeletonAvatar size={40} />
        <div className="flex-1 space-y-2">
          <Skeleton height={14} width="40%" rounded="sm" />
          <Skeleton height={12} width="60%" rounded="sm" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  )
}
