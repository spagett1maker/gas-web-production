import { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

// 디자인 시스템 스펙:
// - 최소 높이: 56px
// - 좌측 아이콘: 40x40px, radius 12px
// - 제목: 15px Semibold, #1A1A1A
// - 설명: 13px Regular, #8E8E93
// - 패딩: 16px (부모 컨테이너에서 적용)
// - 하단 구분선: 1px, #F2F2F7 (마지막 제외)

interface ListRowProps {
  icon?: ReactNode
  iconBg?: string
  title: string
  subtitle?: string
  value?: string | ReactNode
  showArrow?: boolean
  onClick?: () => void
  isLast?: boolean
  className?: string
}

export function ListRow({
  icon,
  iconBg = '#F5F5F7',
  title,
  subtitle,
  value,
  showArrow = true,
  onClick,
  isLast = false,
  className = '',
}: ListRowProps) {
  const Wrapper = onClick ? 'button' : 'div'

  return (
    <Wrapper
      onClick={onClick}
      className={`
        w-full min-h-[56px] flex items-center gap-3 py-3
        ${onClick ? 'active:bg-[#F9F9F9] transition-colors duration-150' : ''}
        ${!isLast ? 'border-b border-[#F2F2F7]' : ''}
        ${className}
      `}
    >
      {/* 아이콘: 40x40px, radius 12px */}
      {icon && (
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </div>
      )}

      {/* 텍스트 */}
      <div className="flex-1 min-w-0 text-left">
        <p className="text-[15px] font-semibold text-[#1A1A1A] tracking-[-0.3px] truncate">
          {title}
        </p>
        {subtitle && (
          <p className="text-[13px] text-[#8E8E93] tracking-[-0.2px] truncate mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* 값 또는 화살표 */}
      {value && (
        <div className="text-[15px] text-[#8E8E93] tracking-[-0.2px] flex-shrink-0">
          {value}
        </div>
      )}
      {showArrow && onClick && (
        <ChevronRight className="w-5 h-5 text-[#C7C7CC] flex-shrink-0" />
      )}
    </Wrapper>
  )
}

// 리스트 그룹 - 패딩 16px
interface ListGroupProps {
  children: ReactNode
  className?: string
}

export function ListGroup({ children, className = '' }: ListGroupProps) {
  return (
    <div className={`bg-white rounded-2xl px-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] ${className}`}>
      {children}
    </div>
  )
}

// 리스트 헤더
interface ListHeaderProps {
  children: ReactNode
  action?: ReactNode
  className?: string
}

export function ListHeader({ children, action, className = '' }: ListHeaderProps) {
  return (
    <div className={`flex items-center justify-between py-3 ${className}`}>
      <span className="text-[13px] font-medium text-[#8E8E93] tracking-[-0.2px]">
        {children}
      </span>
      {action}
    </div>
  )
}
