import { forwardRef, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ title, children, variant = 'primary', size = 'md', fullWidth = false, className = '', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'

    const variantStyles = {
      primary: 'bg-primary hover:bg-[var(--color-primary-hover)] text-white shadow-md hover:shadow-lg',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-primary border border-gray-200 hover:border-gray-300',
      outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
      danger: 'bg-[var(--color-error)] hover:bg-red-600 text-white shadow-md hover:shadow-lg',
    }

    const sizeStyles = {
      sm: 'px-4 py-2 text-sm rounded-xl',
      md: 'px-6 py-3 text-base rounded-2xl',
      lg: 'px-8 py-4 text-lg rounded-2xl',
    }

    const widthClass = fullWidth ? 'w-full' : ''

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthClass} ${className}`}
        {...props}
      >
        {title || children}
      </button>
    )
  }
)

Button.displayName = 'Button'
