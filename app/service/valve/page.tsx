'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Loading } from '@/components/ui/Loading'
import { Input } from '@/components/ui/Input'
import { formatPrice } from '@/utils/format'

const ITEMS = [
  { id: 1, name: '8미리 밸브교체', price: 15000, image: '/images/valve/1.jpg' },
  { id: 2, name: '공기조절기 교체', price: 15000, image: '/images/valve/air.png' },
]

export default function ValveReplacePage() {
  const [counts, setCounts] = useState(Array(ITEMS.length).fill(0))
  const [extra, setExtra] = useState('')
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }
      setAuthLoading(false)
    }

    checkAuth()
  }, [router])

  const handleCount = (idx: number, diff: number) => {
    setCounts((prev) =>
      prev.map((c, i) => (i === idx ? Math.max(0, c + diff) : c))
    )
  }

  const total = counts.reduce((sum, c, i) => sum + c * ITEMS[i].price, 0)
  const anySelected = counts.some((c) => c > 0)

  const handleSubmit = async () => {
    if (!anySelected) return
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('로그인 정보를 확인할 수 없습니다.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('default_store_id')
      .eq('id', user.id)
      .single()

    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id')
      .eq('name', 'valve')
      .single()

    if (serviceError || !service?.id) {
      alert('서비스 정보를 불러오지 못했습니다.')
      setLoading(false)
      return
    }

    const now = new Date().toISOString()

    const { data: request, error: requestError } = await supabase
      .from('service_requests')
      .insert({
        user_id: user.id,
        store_id: profile?.default_store_id || null,
        service_id: service.id,
        status: '요청됨',
        created_at: now,
        updated_at: now,
      })
      .select('id')
      .single()

    if (requestError || !request) {
      alert(requestError?.message || '요청을 생성할 수 없습니다.')
      setLoading(false)
      return
    }

    const details = ITEMS.map((item, idx) => {
      const count = counts[idx]
      if (count > 0) {
        return {
          request_id: request.id,
          key: item.name,
          value: `${count}개`,
        }
      }
      return null
    }).filter(Boolean)

    // 추가 요청사항 추가
    if (extra !== '') {
      details.push({
        request_id: request.id,
        key: '추가 요청사항',
        value: extra,
      })
    }

    const { error: detailError } = await supabase
      .from('request_details')
      .insert(details)

    setLoading(false)

    if (detailError) {
      alert(detailError.message)
    } else {
      setShowModal(true)
    }
  }

  if (authLoading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-white pb-20">
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
        <h1 className="text-[22px] font-bold text-gray-800">밸브 교체</h1>
        <button
          onClick={() => router.push('/notification')}
          className="p-2 -mr-2"
        >
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
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>
      </header>

      {/* 아이템 리스트 */}
      <div className="px-5 pb-4 pt-4">
        {ITEMS.map((item, idx) => (
          <div
            key={item.id}
            className="flex items-center bg-white rounded-2xl border border-gray-200 px-4 py-3 mb-3 hover:border-[#EB5A36] transition-colors"
          >
            {/* 이미지 */}
            <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center mr-4 relative overflow-hidden">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-contain p-1"
              />
            </div>
            {/* 정보 */}
            <div className="flex-1">
              <p className="text-[15px] font-bold text-gray-800 mb-2">
                {item.name}
              </p>
              <div className="flex items-center">
                <button
                  className="w-7 h-7 rounded-full bg-[#FADCD2] flex items-center justify-center mr-2 hover:bg-[#F5C9BF] transition-colors active:scale-95"
                  onClick={() => handleCount(idx, -1)}
                >
                  <span className="text-[#EB5A36] text-xl font-bold leading-none">
                    -
                  </span>
                </button>
                <span className="text-base font-bold text-gray-800 w-6 text-center">
                  {counts[idx]}
                </span>
                <button
                  className="w-7 h-7 rounded-full bg-[#FADCD2] flex items-center justify-center ml-2 hover:bg-[#F5C9BF] transition-colors active:scale-95"
                  onClick={() => handleCount(idx, 1)}
                >
                  <span className="text-[#EB5A36] text-xl font-bold leading-none">
                    +
                  </span>
                </button>
              </div>
            </div>
            {/* 가격 */}
            <p className="text-[15px] font-bold text-gray-800 ml-2">
              {formatPrice(item.price)}
            </p>
          </div>
        ))}

        {/* 추가 요청사항 */}
        <div className="mt-4">
          <textarea
            className="w-full min-h-[120px] bg-[#F6F7FB] rounded-2xl px-4 py-4 text-[15px] text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-[#EB5A36]"
            placeholder="추가 요청사항을 입력해주세요."
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
          />
        </div>
      </div>

      {/* 전체 합계 및 신청 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-600 text-[15px]">전체</span>
          <span className="text-lg font-bold text-[#EB5A36]">
            {formatPrice(total)}
          </span>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!anySelected || loading}
          fullWidth
          className={!anySelected ? 'bg-[#FADCD2] hover:bg-[#FADCD2]' : ''}
        >
          {loading ? '신청 중...' : '밸브 교체 신청'}
        </Button>
      </div>

      {/* 완료 모달 */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center py-6">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">감사합니다.</h3>
          <p className="text-[15px] text-gray-600 mb-6">
            서비스가 성공적으로 접수되었습니다.
          </p>
          <Button
            onClick={() => {
              setShowModal(false)
              router.replace('/my-service')
            }}
            fullWidth
          >
            나의 서비스 확인하기
          </Button>
        </div>
      </Modal>
    </div>
  )
}
