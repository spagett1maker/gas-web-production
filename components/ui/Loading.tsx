interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  fullscreen?: boolean
}

export const Loading = ({ size = 'md', fullscreen = true }: LoadingProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-3',
    lg: 'h-16 w-16 border-4',
  }

  const spinner = (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-primary border-r-primary border-b-transparent border-l-transparent`}></div>
  )

  if (fullscreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
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
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent mx-auto"></div>
        <p className="mt-4 body text-secondary">{message}</p>
      </div>
    </div>
  )
}
