'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { formatPrice } from '@/utils/format'

interface ServiceItem {
  id: number
  name: string
  price: number
  icon: string
}

interface ServiceTemplateProps {
  serviceName: string
  serviceKey: string
  serviceTitle: string
  items?: ServiceItem[]
  showItemSelection?: boolean
  showTextInput?: boolean
  textInputPlaceholder?: string
}

export default function ServiceTemplate({
  serviceName,
  serviceKey,
  serviceTitle,
  items = [],
  showItemSelection = false,
  showTextInput = false,
  textInputPlaceholder = '문의 내용을 입력해주세요',
}: ServiceTemplateProps) {
  const [counts, setCounts] = useState(Array(items.length).fill(0))
  const [textContent, setTextContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  const handleCount = (idx: number, diff: number) => {
    setCounts((prev) =>
      prev.map((c, i) => (i === idx ? Math.max(0, c + diff) : c))
    )
  }

  const total = items.length > 0
    ? counts.reduce((sum, c, i) => sum + c * items[i].price, 0)
    : 0
  const anySelected = showItemSelection
    ? counts.some((c) => c > 0)
    : showTextInput
    ? textContent.trim().length > 0
    : true

  const handleSubmit = async () => {
    if (!anySelected) return
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      alert('유저 정보를 불러올 수 없습니다.')
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
      .eq('name', serviceKey)
      .single()

    if (!service?.id) {
      alert('기본 가게 또는 서비스 정보를 불러올 수 없습니다.')
      setLoading(false)
      return
    }

    const { data: request, error: requestError } = await supabase
      .from('service_requests')
      .insert({
        user_id: user.id,
        store_id: profile?.default_store_id,
        service_id: service.id,
        status: '요청됨',
      })
      .select('id')
      .single()

    if (requestError || !request) {
      alert(requestError?.message || '요청 생성 실패')
      setLoading(false)
      return
    }

    // 상세 정보 저장
    if (showItemSelection && items.length > 0) {
      const requestDetails = items
        .map((item, idx) => {
          const count = counts[idx]
          if (count > 0) {
            return {
              request_id: request.id,
              key: item.name,
              value: `${count}개`,
            }
          }
          return null
        })
        .filter(Boolean)

      if (requestDetails.length > 0) {
        await supabase.from('request_details').insert(requestDetails)
      }
    } else if (showTextInput && textContent.trim()) {
      await supabase.from('request_details').insert([
        {
          request_id: request.id,
          key: '문의내용',
          value: textContent.trim(),
        },
      ])
    }

    setLoading(false)
    setShowModal(true)
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
        <h1 className="text-[22px] font-bold text-gray-800">{serviceTitle}</h1>
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

      {/* 컨텐츠 */}
      <div className="px-5 pb-24 pt-4">
        {/* 아이템 선택 */}
        {showItemSelection && items.length > 0 && (
          <>
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center bg-white rounded-2xl border border-gray-200 px-4 py-3 mb-3 hover:border-[#EB5A36] transition-colors"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-3xl">{item.icon}</span>
                </div>
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
                <p className="text-[15px] font-bold text-gray-800 ml-2">
                  {formatPrice(item.price)}
                </p>
              </div>
            ))}
          </>
        )}

        {/* 텍스트 입력 */}
        {showTextInput && (
          <div className="mb-6">
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder={textInputPlaceholder}
              rows={8}
              maxLength={1000}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-[#EB5A36] focus:border-transparent"
            />
            <p className="text-gray-500 text-xs mt-1 text-right">
              {textContent.length}/1000
            </p>
          </div>
        )}

        {/* 기본 안내 */}
        {!showItemSelection && !showTextInput && (
          <div className="bg-gray-50 p-6 rounded-2xl text-center">
            <div className="text-6xl mb-4">📞</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {serviceTitle} 서비스
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              서비스 신청을 하시겠습니까?
            </p>
          </div>
        )}
      </div>

      {/* 전체 합계 및 신청 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-6 md:relative md:border-0">
        {showItemSelection && total > 0 && (
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600 text-[15px]">전체</span>
            <span className="text-lg font-bold text-[#EB5A36]">
              {formatPrice(total)}
            </span>
          </div>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!anySelected || loading}
          fullWidth
          className={!anySelected ? 'bg-[#FADCD2] hover:bg-[#FADCD2]' : ''}
        >
          {loading ? '처리 중...' : `${serviceTitle} 신청`}
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
