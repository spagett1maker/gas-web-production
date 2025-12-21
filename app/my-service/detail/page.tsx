'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Loading } from '@/components/ui/Loading'
import ServiceDetailClient from '../[id]/client'

function ServiceDetailContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  if (!id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="body text-secondary">서비스 ID가 필요합니다.</p>
      </div>
    )
  }

  return <ServiceDetailClient id={id} />
}

export default function ServiceDetailPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ServiceDetailContent />
    </Suspense>
  )
}
