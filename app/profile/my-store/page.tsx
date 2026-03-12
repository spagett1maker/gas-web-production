'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loading } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'

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
      let defaultId: string | null = null
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
    <div className="page-with-tabs bg-white">
      {/* 상단 헤더 */}
      <header className="app-header">
        <div className="h-[48px] px-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center -ml-1 rounded-full active:bg-[#F5F5F7] transition-colors"
          >
            <ArrowLeft className="w-[22px] h-[22px] text-[#1A1A1A]" strokeWidth={1.8} />
          </button>
          <span className="text-[17px] font-semibold text-[#1A1A1A] tracking-[-0.3px]">나의 가게</span>
          <div className="w-10" />
        </div>
      </header>

      {/* 가게 리스트 */}
      <div className="px-5 page-content">
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
                className="w-full bg-white rounded-2xl border border-gray-200 px-4 py-3 flex items-center justify-between hover:border-[#EB5B37] transition-colors"
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
                      : 'border-[#FDDED5]'
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

        <div className="bottom-spacer-with-tabs" />
      </div>

      {/* 하단 적용 버튼 */}
      <div className="page-bottom-with-tabs">
        <Button
          onClick={handleApply}
          disabled={selected === null}
          fullWidth
          className={selected === null ? 'bg-[#FDDED5] hover:bg-[#FDDED5]' : ''}
        >
          적용
        </Button>
      </div>
    </div>
  )
}
