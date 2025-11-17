'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loading } from '@/components/ui/Loading'
import { ADMIN_USER_ID } from '@/lib/constants'

export default function AdminStorePage() {
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchStores = async () => {
    // 관리자 권한 체크
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== ADMIN_USER_ID) {
      router.push('/')
      return
    }

    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('가게 목록 로드 실패:', error.message)
    } else {
      setStores(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchStores()
  }, [])

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 상단 헤더 */}
      <header className="pt-6 pb-4 px-5 flex items-center justify-between sticky top-0 bg-white z-10 border-b border-gray-100">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <svg
            className="w-7 h-7 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-[22px] font-bold text-gray-800">가게 관리</h1>
        <div className="w-7" />
      </header>

      {/* 가게 리스트 */}
      {loading ? (
        <Loading />
      ) : (
        <div className="px-5 py-4">
          {stores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">🏪</div>
              <p className="text-gray-500 text-base">등록된 가게가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => router.push(`/admin/store/${store.id}`)}
                  className="w-full bg-white border border-gray-200 rounded-2xl p-4 hover:border-[#EB5A36] transition-colors text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        {store.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        📍 {store.address || '주소 없음'}
                      </p>
                      {store.phone && (
                        <p className="text-sm text-gray-600">
                          📞 {store.phone}
                        </p>
                      )}
                    </div>
                    <div className="text-2xl ml-4">🏪</div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      등록일: {new Date(store.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
