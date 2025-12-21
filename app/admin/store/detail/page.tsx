'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Loading } from '@/components/ui/Loading'
import AdminStoreDetailClient from '../[id]/client'

function StoreDetailContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  if (!id) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">가게 ID가 필요합니다.</p>
      </div>
    )
  }

  return <AdminStoreDetailClient id={id} />
}

export default function AdminStoreDetailPage() {
  return (
    <Suspense fallback={<Loading />}>
      <StoreDetailContent />
    </Suspense>
  )
}
