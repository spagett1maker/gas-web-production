import { forwardRef, ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', fullWidth = false, loading = false, className = '', disabled, ...props }, ref) => {
    const isDisabled = disabled || loading

    const baseStyles = [
      'inline-flex items-center justify-center',
      'font-semibold tracking-[-0.3px]',
      'transition-all duration-150',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-[0.98]',
    ].join(' ')

    const variantStyles = {
      primary: 'bg-[#EB5B37] text-white active:bg-[#D9482A]',
      secondary: 'bg-[#F5F5F7] text-[#1A1A1A] active:bg-[#EBEBED]',
      ghost: 'bg-transparent text-[#8E8E93] active:bg-[#F5F5F7]',
      danger: 'bg-[#EF4444] text-white active:bg-[#DC2626]',
    }

    // 디자인 시스템 스펙:
    // Large: 52px, 0 24px, 16px font (주요 액션)
    // Medium: 44px, 0 20px, 15px font (일반 버튼)
    // Small: 36px, 0 16px, 14px font (인라인 버튼)
    // XSmall: 28px, 0 12px, 12px font (태그, 필터)
    // Radius: 12px 통일 (xs만 8px)
    const sizeStyles = {
      xs: 'h-7 px-3 text-[12px] rounded-lg',
      sm: 'h-9 px-4 text-[14px] rounded-[10px]',
      md: 'h-11 px-5 text-[15px] rounded-[10px]',
      lg: 'h-[52px] px-6 text-[16px] rounded-xl',
    }

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
