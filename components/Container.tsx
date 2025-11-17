import { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  className?: string
}

export const Container = ({ children, className = '' }: ContainerProps) => {
  return (
    <div className={`flex flex-1 m-6 ${className}`}>
      {children}
    </div>
  )
}
