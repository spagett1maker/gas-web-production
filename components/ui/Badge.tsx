import { ReactNode } from 'react'

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[#F5F5F7] text-[#636366]',
  primary: 'bg-[#FEF2EE] text-[#EB5B37]',
  success: 'bg-[#F0FDF4] text-[#22C55E]',
  warning: 'bg-[#FFFBEB] text-[#F59E0B]',
  error: 'bg-[#FEF2F2] text-[#EF4444]',
  info: 'bg-[#EFF6FF] text-[#3B82F6]',
}

export function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-[12px]',
  }

  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full tracking-[-0.2px]
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}

// 상태 뱃지 (서비스 상태용)
interface StatusBadgeProps {
  status: '요청됨' | '진행중' | '완료' | '취소' | string
  className?: string
}

const statusVariants: Record<string, BadgeVariant> = {
  '요청됨': 'primary',
  '진행중': 'info',
  '완료': 'success',
  '취소': 'error',
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const variant = statusVariants[status] || 'default'

  return (
    <Badge variant={variant} size="md" className={className}>
      {status}
    </Badge>
  )
}
