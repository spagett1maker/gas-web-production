import { cn } from '@/lib/utils'
import { Clock, Loader2, CheckCircle, XCircle, LucideIcon } from 'lucide-react'

interface StatusBadgeProps {
  status: string
  className?: string
  showIcon?: boolean
}

const statusConfig: Record<string, { bg: string; text: string; icon: LucideIcon; animate?: boolean }> = {
  '요청됨': {
    bg: 'bg-[#FEF2EE]',
    text: 'text-[#EB5B37]',
    icon: Clock,
  },
  '진행중': {
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#3B82F6]',
    icon: Loader2,
    animate: true,
  },
  '완료': {
    bg: 'bg-[#F0FDF4]',
    text: 'text-[#22C55E]',
    icon: CheckCircle,
  },
  '취소': {
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#EF4444]',
    icon: XCircle,
  },
}

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig['요청됨']
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold tracking-[-0.2px]',
        config.bg,
        config.text,
        className
      )}
    >
      {showIcon && (
        <Icon className={cn('w-3.5 h-3.5', config.animate && 'animate-spin')} strokeWidth={2.5} />
      )}
      {status}
    </span>
  )
}
