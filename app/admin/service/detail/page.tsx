'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Loading } from '@/components/ui/Loading'
import AdminServiceDetailClient from '../[id]/client'

function ServiceDetailContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  if (!id) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">서비스 ID가 필요합니다.</p>
      </div>
    )
  }

  return <AdminServiceDetailClient id={id} />
}

export default function AdminServiceDetailPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ServiceDetailContent />
    </Suspense>
  )
}
