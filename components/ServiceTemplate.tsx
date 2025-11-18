'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Loading } from '@/components/ui/Loading'
import { formatPrice } from '@/utils/format'
import DateTimeSelector from '@/components/DateTimeSelector'
import PaymentMethodSelector from '@/components/PaymentMethodSelector'

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
  const [currentStep, setCurrentStep] = useState(1)
  const [counts, setCounts] = useState(Array(items.length).fill(0))
  const [textContent, setTextContent] = useState('')
  const [visitDate, setVisitDate] = useState('')
  const [visitTime, setVisitTime] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
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
    const requestDetails: any[] = []

    // 아이템 정보
    if (showItemSelection && items.length > 0) {
      items.forEach((item, idx) => {
        const count = counts[idx]
        if (count > 0) {
          requestDetails.push({
            request_id: request.id,
            key: item.name,
            value: `${count}개`,
          })
        }
      })
    }

    // 텍스트 입력
    if (showTextInput && textContent.trim()) {
      requestDetails.push({
        request_id: request.id,
        key: '문의내용',
        value: textContent.trim(),
      })
    }

    // 방문 날짜/시간
    if (visitDate && visitTime) {
      requestDetails.push({
        request_id: request.id,
        key: '방문 희망 날짜',
        value: visitDate,
      })
      requestDetails.push({
        request_id: request.id,
        key: '방문 희망 시간',
        value: visitTime,
      })
    }

    // 결제 방법
    if (paymentMethod) {
      const paymentMethodName = {
        cash: '현금 결제',
        card: '카드 결제',
        transfer: '계좌 이체',
        later: '추후 협의',
      }[paymentMethod] || paymentMethod

      requestDetails.push({
        request_id: request.id,
        key: '결제 방법',
        value: paymentMethodName,
      })
    }

    if (requestDetails.length > 0) {
      await supabase.from('request_details').insert(requestDetails)
    }

    setLoading(false)
    setShowModal(true)
  }

  if (authLoading) {
    return <Loading />
  }

  const handleNextStep = () => {
    if (currentStep === 1 && !anySelected) {
      alert('서비스를 선택해주세요.')
      return
    }
    if (currentStep === 2 && (!visitDate || !visitTime)) {
      alert('방문 희망 날짜와 시간을 선택해주세요.')
      return
    }
    if (currentStep === 3 && !paymentMethod) {
      alert('결제 방법을 선택해주세요.')
      return
    }
    setCurrentStep((prev) => prev + 1)
  }

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return serviceTitle
      case 2:
        return '방문 날짜/시간 선택'
      case 3:
        return '결제 방법 선택'
      default:
        return serviceTitle
    }
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 상단 헤더 */}
      <header className="pt-6 pb-2 px-5 flex items-center justify-between sticky top-0 bg-white z-10">
        <button
          onClick={() => {
            if (currentStep > 1) {
              handlePrevStep()
            } else {
              router.back()
            }
          }}
          className="p-2 -ml-2"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-[22px] font-bold text-gray-800">{getStepTitle()}</h1>
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

      {/* 단계 표시 */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-2 flex-1 rounded-full transition-all ${
                step <= currentStep ? 'bg-[#EB5A36]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          {currentStep}/3 단계
        </p>
      </div>

      {/* 컨텐츠 */}
      <div className="px-5 pb-24 pt-4">
        {/* Step 1: 서비스 선택 */}
        {currentStep === 1 && (
          <>
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
          </>
        )}

        {/* Step 2: 날짜/시간 선택 */}
        {currentStep === 2 && (
          <DateTimeSelector
            onDateChange={setVisitDate}
            onTimeChange={setVisitTime}
            selectedDate={visitDate}
            selectedTime={visitTime}
          />
        )}

        {/* Step 3: 결제 방법 선택 */}
        {currentStep === 3 && (
          <PaymentMethodSelector
            onPaymentMethodChange={setPaymentMethod}
            selectedMethod={paymentMethod}
          />
        )}
      </div>

      {/* 전체 합계 및 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-6 md:relative md:border-0">
        {currentStep === 1 && showItemSelection && total > 0 && (
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600 text-[15px]">전체</span>
            <span className="text-lg font-bold text-[#EB5A36]">
              {formatPrice(total)}
            </span>
          </div>
        )}
        {currentStep < 3 ? (
          <Button
            onClick={handleNextStep}
            disabled={currentStep === 1 && !anySelected}
            fullWidth
            className={currentStep === 1 && !anySelected ? 'bg-[#FADCD2] hover:bg-[#FADCD2]' : ''}
          >
            다음
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!paymentMethod || loading}
            fullWidth
            className={!paymentMethod ? 'bg-[#FADCD2] hover:bg-[#FADCD2]' : ''}
          >
            {loading ? '처리 중...' : `${serviceTitle} 신청`}
          </Button>
        )}
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
