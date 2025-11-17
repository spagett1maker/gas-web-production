'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loading } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'

export default function MyStorePage() {
  const [stores, setStores] = useState<any[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [defaultStoreId, setDefaultStoreId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true)
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData?.session?.user.id

      if (!userId) {
        router.push('/login')
        return
      }

      // 내 profile에서 default_store_id 가져오기
      let defaultId = null
      const { data: profile } = await supabase
        .from('profiles')
        .select('default_store_id')
        .eq('id', userId)
        .single()
      defaultId = profile?.default_store_id ?? null
      setDefaultStoreId(defaultId)

      const { data, error } = await supabase
        .from('stores')
        .select('id, name, address')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setStores(data)

        // 불러온 stores에서 defaultId와 일치하는 idx 찾아서 selected로 초기화
        if (defaultId) {
          const idx = data.findIndex((store) => store.id === defaultId)
          setSelected(idx !== -1 ? idx : null)
        }
      } else {
        console.warn('가게 불러오기 실패:', error?.message)
      }
      setLoading(false)
    }

    fetchStores()
  }, [])

  const handleApply = async () => {
    if (selected === null) return
    const selectedStore = stores[selected]
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user.id

    if (userId && selectedStore?.id) {
      const { error } = await supabase
        .from('profiles')
        .update({ default_store_id: selectedStore.id })
        .eq('id', userId)
      if (error) {
        alert('적용에 실패했습니다.')
        return
      }
      alert('기본 가게가 변경되었습니다.')
      router.push('/profile')
    }
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* 상단 헤더 */}
      <header className="pt-6 pb-2 px-5 flex items-center justify-between sticky top-0 bg-white z-10">
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
        <h1 className="text-[22px] font-bold text-gray-800">나의 가게</h1>
        <div className="w-7" />
      </header>

      {/* 가게 리스트 */}
      <div className="px-5 pb-24">
        {loading ? (
          <Loading />
        ) : stores.length === 0 ? (
          <p className="text-center text-gray-400 mt-6">
            등록된 가게가 없습니다.
          </p>
        ) : (
          <div className="space-y-3 mt-4">
            {stores.map((store, idx) => (
              <button
                key={store.id}
                className="w-full bg-white rounded-2xl border border-gray-200 px-4 py-3 flex items-center justify-between hover:border-[#EB5A36] transition-colors"
                onClick={() => setSelected(idx)}
              >
                <div className="text-left">
                  <p className="text-base font-bold text-gray-800 mb-1">
                    {store.name}
                  </p>
                  <p className="text-[13px] text-gray-500">{store.address}</p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selected === idx
                      ? 'border-[#FF5A36]'
                      : 'border-[#FADCD2]'
                  }`}
                >
                  {selected === idx && (
                    <div className="w-3.5 h-3.5 rounded-full bg-[#FF5A36]" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 가게 추가 버튼 */}
        <button
          className="w-full bg-[#FFF2EE] rounded-2xl py-3 flex items-center justify-center mt-4 hover:bg-[#FFE5DD] transition-colors"
          onClick={() => router.push('/profile/add-store')}
        >
          <span className="text-[#FF5A36] text-xl font-bold mr-2">+</span>
          <span className="text-[#FF5A36] text-base font-bold">가게 추가</span>
        </button>
      </div>

      {/* 하단 적용 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-6">
        <Button
          onClick={handleApply}
          disabled={selected === null}
          fullWidth
          className={selected === null ? 'bg-[#FADCD2] hover:bg-[#FADCD2]' : ''}
        >
          적용
        </Button>
      </div>
    </div>
  )
}
