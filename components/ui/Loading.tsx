interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  fullscreen?: boolean
  color?: 'primary' | 'white'
}

export const Loading = ({ size = 'md', fullscreen = true, color = 'primary' }: LoadingProps) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-[3px]',
    lg: 'h-14 w-14 border-4',
  }

  const colorClasses = {
    primary: 'border-[#EB5B37]',
    white: 'border-white',
  }

  const spinner = (
    <div
      className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]} border-t-transparent border-l-transparent`}
    />
  )

  if (fullscreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7F7F8]">
        {spinner}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  )
}

export const LoadingScreen = ({ message = '로딩중...' }: { message?: string }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F7F7F8]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-[#EB5B37] border-t-transparent border-l-transparent mx-auto" />
        <p className="mt-4 text-[14px] text-[#8E8E93] tracking-[-0.2px]">{message}</p>
      </div>
    </div>
  )
}

// Inline loading spinner
export const Spinner = ({ size = 'sm', className = '' }: { size?: 'xs' | 'sm' | 'md'; className?: string }) => {
  const sizeClasses = {
    xs: 'h-4 w-4 border-[1.5px]',
    sm: 'h-5 w-5 border-2',
    md: 'h-6 w-6 border-2',
  }

  return (
    <div
      className={`animate-spin rounded-full ${sizeClasses[size]} border-current border-t-transparent border-l-transparent ${className}`}
    />
  )
}
