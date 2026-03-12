import { ReactNode, HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'elevated' | 'interactive'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', padding = 'md', className = '', ...props }, ref) => {
    // 디자인 시스템 스펙:
    // Default: 16px radius, shadow 0 1px 4px, padding 16px
    // Elevated: 20px radius, shadow 0 4px 16px, padding 20px
    // Interactive: Default + 터치 피드백
    const variantStyles = {
      default: 'bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)]',
      elevated: 'bg-white rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.08)]',
      interactive: 'bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] active:bg-[#F9F9F9] active:scale-[0.98] transition-all duration-150 cursor-pointer',
    }

    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-5',
    }

    return (
      <div
        ref={ref}
        className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// 카드 헤더
interface CardHeaderProps {
  children: ReactNode
  className?: string
  action?: ReactNode
}

export const CardHeader = ({ children, className = '', action }: CardHeaderProps) => {
  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      <h3 className="text-[15px] font-semibold text-[#1A1A1A] tracking-[-0.3px]">
        {children}
      </h3>
      {action && (
        <div className="text-[13px] text-[#8E8E93]">
          {action}
        </div>
      )}
    </div>
  )
}

// 카드 바디
interface CardBodyProps {
  children: ReactNode
  className?: string
}

export const CardBody = ({ children, className = '' }: CardBodyProps) => {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

// 카드 푸터
interface CardFooterProps {
  children: ReactNode
  className?: string
}

export const CardFooter = ({ children, className = '' }: CardFooterProps) => {
  return (
    <div className={`mt-3 pt-3 border-t border-[#F2F2F7] ${className}`}>
      {children}
    </div>
  )
}

export const CardContent = CardBody
