import { ReactNode, HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'elevated' | 'outlined'
}

export const Card = ({ children, variant = 'default', className = '', ...props }: CardProps) => {
  const variantStyles = {
    default: 'bg-white rounded-2xl shadow-sm border border-[var(--color-border)]',
    elevated: 'bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow',
    outlined: 'bg-white rounded-2xl border-2 border-[var(--color-border)]',
  }

  return (
    <div
      className={`${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export const CardHeader = ({ children, className = '' }: CardHeaderProps) => {
  return (
    <div className={`px-6 py-4 border-b border-[var(--color-border)] ${className}`}>
      {children}
    </div>
  )
}

interface CardBodyProps {
  children: ReactNode
  className?: string
}

export const CardBody = ({ children, className = '' }: CardBodyProps) => {
  return (
    <div className={`px-6 py-5 ${className}`}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export const CardFooter = ({ children, className = '' }: CardFooterProps) => {
  return (
    <div className={`px-6 py-4 border-t border-[var(--color-border)] ${className}`}>
      {children}
    </div>
  )
}

// CardContent alias for CardBody (for compatibility with gas-dashboard style)
export const CardContent = CardBody
