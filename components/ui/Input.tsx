import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, size = 'md', className = '', ...props }, ref) => {
    const widthClass = fullWidth ? 'w-full' : ''

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm rounded-lg',
      md: 'px-4 py-3 text-base rounded-xl',
      lg: 'px-5 py-4 text-lg rounded-xl',
    }

    return (
      <div className={`${widthClass}`}>
        {label && (
          <label className="block body-sm font-medium text-secondary mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            border text-primary bg-white
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            placeholder:text-tertiary
            disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-secondary
            transition-all duration-200
            ${error ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]' : 'border-[var(--color-border)]'}
            ${sizeStyles[size]}
            ${fullWidth ? 'w-full' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 body-sm text-[var(--color-error)]">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
