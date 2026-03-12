import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helper?: string
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, fullWidth = false, size = 'md', className = '', ...props }, ref) => {
    const sizeStyles = {
      sm: 'h-10 px-3 text-[14px] rounded-[10px]',
      md: 'h-12 px-4 text-[15px] rounded-[10px]',
      lg: 'h-14 px-4 text-[16px] rounded-[10px]',
    }

    const inputStyles = [
      'w-full bg-[#F5F5F7] text-[#1A1A1A]',
      'placeholder:text-[#C7C7CC]',
      'outline-none',
      'transition-all duration-150',
      'focus:bg-white focus:ring-2 focus:ring-[#EB5B37]/20',
      error ? 'ring-2 ring-[#EF4444]/50 bg-[#FEF2F2]' : '',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ].join(' ')

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2 tracking-[-0.2px]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`${inputStyles} ${sizeStyles[size]} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-2 text-[13px] text-[#EF4444] tracking-[-0.2px]">{error}</p>
        )}
        {helper && !error && (
          <p className="mt-2 text-[13px] text-[#8E8E93] tracking-[-0.2px]">{helper}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// 텍스트에어리어
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helper?: string
  fullWidth?: boolean
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helper, fullWidth = false, className = '', ...props }, ref) => {
    const textareaStyles = [
      'w-full bg-[#F5F5F7] text-[#1A1A1A]',
      'px-4 py-3 text-[15px] rounded-[10px]',
      'placeholder:text-[#C7C7CC]',
      'outline-none resize-none',
      'transition-all duration-150',
      'focus:bg-white focus:ring-2 focus:ring-[#EB5B37]/20',
      error ? 'ring-2 ring-[#EF4444]/50 bg-[#FEF2F2]' : '',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ].join(' ')

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2 tracking-[-0.2px]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`${textareaStyles} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-2 text-[13px] text-[#EF4444] tracking-[-0.2px]">{error}</p>
        )}
        {helper && !error && (
          <p className="mt-2 text-[13px] text-[#8E8E93] tracking-[-0.2px]">{helper}</p>
        )}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'
