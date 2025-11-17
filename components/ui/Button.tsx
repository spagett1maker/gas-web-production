import { forwardRef, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ title, children, variant = 'primary', fullWidth = false, className = '', ...props }, ref) => {
    const baseStyles = 'items-center rounded-[28px] shadow-md px-6 py-4 font-semibold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

    const variantStyles = {
      primary: 'bg-[#EB5A36] hover:bg-[#FF5A36] text-white',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
      outline: 'border-2 border-[#EB5A36] text-[#EB5A36] hover:bg-[#EB5A36] hover:text-white',
      danger: 'bg-red-500 hover:bg-red-600 text-white',
    }

    const widthClass = fullWidth ? 'w-full' : ''

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${widthClass} ${className}`}
        {...props}
      >
        {title || children}
      </button>
    )
  }
)

Button.displayName = 'Button'
