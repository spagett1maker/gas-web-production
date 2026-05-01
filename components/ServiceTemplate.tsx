'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/utils/format'
import DateTimeSelector from '@/components/DateTimeSelector'
import PaymentMethodSelector from '@/components/PaymentMethodSelector'
import {
  ArrowLeft, Check, Calendar, CreditCard,
  Package, ChevronRight
} from 'lucide-react'

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

const STEP_TITLES = [
  { question: '어떤 서비스가\n필요하세요?', sub: '필요한 항목을 선택해주세요' },
  { question: '언제 방문하면\n좋을까요?', sub: '희망하시는 날짜와 시간을 알려주세요' },
  { question: '결제 방법을\n선택해주세요', sub: '서비스 완료 후 결제가 진행됩니다' },
]

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

  const selectedItems = items.filter((_, idx) => counts[idx] > 0)
  const selectedCount = counts.reduce((a, b) => a + b, 0)

  const handleSubmit = async () => {
    if (!anySelected) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
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

    const { data: service } = await supabase
      .from('services')
      .select('id')
      .eq('name', serviceKey)
      .single()

    if (!service?.id) {
      alert('서비스 정보를 불러올 수 없습니다.')
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

    const requestDetails: any[] = []

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

    if (showTextInput && textContent.trim()) {
      requestDetails.push({
        request_id: request.id,
        key: '문의내용',
        value: textContent.trim(),
      })
    }

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#EB5B37] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const stepTitle = STEP_TITLES[currentStep - 1]

  return (
    <div className="page-without-tabs bg-white">
      {/* 헤더 */}
      <header className="app-header">
        <div className="h-[52px] px-4 flex items-center justify-between">
          <button
            onClick={() => currentStep > 1 ? handlePrevStep() : router.back()}
            className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full active:bg-[#F5F5F7] transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-[#1A1A1A]" strokeWidth={1.8} />
          </button>
          <span className="text-[13px] font-medium text-[#8E8E93]">
            {currentStep} / 3
          </span>
          <div className="w-10" />
        </div>

        {/* 프로그레스 바 */}
        <div className="px-5 pb-1">
          <div className="h-[3px] bg-[#F2F2F7] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#EB5B37] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="page-content">
        {/* 스텝 타이틀 - 삼쩜삼 스타일 대형 질문 */}
        <div className="px-5 pt-6 pb-6" style={{ animation: 'fade-in-up 0.3s ease-out' }}>
          <h1 className="text-[26px] font-bold text-[#1A1A1A] tracking-[-0.6px] leading-[1.35] whitespace-pre-line">
            {stepTitle.question}
          </h1>
          <p className="text-[14px] text-[#8E8E93] tracking-[-0.2px] mt-2">
            {stepTitle.sub}
          </p>
        </div>

        {/* Step 1: 서비스 선택 */}
        {currentStep === 1 && (
          <div className="px-5 space-y-3" style={{ animation: 'fade-in-up 0.3s ease-out' }}>
            {/* 아이템 선택 */}
            {showItemSelection && items.length > 0 && (
              <>
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      counts[idx] > 0
                        ? 'border-[#EB5B37] bg-[#FEF2EE]/30'
                        : 'border-[#F2F2F7] bg-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-14 h-14 bg-[#F5F5F7] rounded-xl flex items-center justify-center mr-4">
                        <span className="text-3xl">{item.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[15px] font-semibold text-[#1A1A1A] tracking-[-0.3px]">
                          {item.name}
                        </p>
                        <p className="text-[14px] font-bold text-[#EB5B37] mt-0.5">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          className="w-9 h-9 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#8E8E93] active:scale-90 transition-transform disabled:opacity-40"
                          onClick={() => handleCount(idx, -1)}
                          disabled={counts[idx] === 0}
                        >
                          <span className="text-xl font-medium leading-none">−</span>
                        </button>
                        <span className="text-[17px] font-bold text-[#1A1A1A] w-6 text-center">
                          {counts[idx]}
                        </span>
                        <button
                          className="w-9 h-9 rounded-full bg-[#EB5B37] flex items-center justify-center text-white active:scale-90 transition-transform"
                          onClick={() => handleCount(idx, 1)}
                        >
                          <span className="text-xl font-medium leading-none">+</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* 텍스트 입력 */}
            {showTextInput && (
              <div>
                <div className="border border-[#F2F2F7] rounded-2xl p-4">
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder={textInputPlaceholder}
                    rows={6}
                    maxLength={1000}
                    className="w-full text-[15px] text-[#1A1A1A] placeholder:text-[#C7C7CC] resize-none outline-none"
                  />
                  <div className="flex justify-end mt-2">
                    <span className="text-[12px] text-[#8E8E93]">
                      {textContent.length}/1000
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 기본 안내 */}
            {!showItemSelection && !showTextInput && (
              <div className="p-6 rounded-2xl border border-[#F2F2F7] text-center">
                <div className="w-16 h-16 bg-[#FEF2EE] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-[#EB5B37]" />
                </div>
                <h3 className="text-[18px] font-bold text-[#1A1A1A] tracking-[-0.3px] mb-2">
                  {serviceTitle}
                </h3>
                <p className="text-[14px] text-[#8E8E93]">
                  전문 기사가 직접 방문하여 서비스를 제공합니다
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: 날짜/시간 선택 */}
        {currentStep === 2 && (
          <div className="px-5" style={{ animation: 'fade-in-up 0.3s ease-out' }}>
            <div className="border border-[#F2F2F7] rounded-2xl p-4">
              <DateTimeSelector
                onDateChange={setVisitDate}
                onTimeChange={setVisitTime}
                selectedDate={visitDate}
                selectedTime={visitTime}
              />
            </div>
          </div>
        )}

        {/* Step 3: 결제 방법 선택 */}
        {currentStep === 3 && (
          <div className="px-5" style={{ animation: 'fade-in-up 0.3s ease-out' }}>
            <div className="border border-[#F2F2F7] rounded-2xl p-4">
              <PaymentMethodSelector
                onPaymentMethodChange={setPaymentMethod}
                selectedMethod={paymentMethod}
              />
            </div>

            {/* 요약 정보 */}
            <div className="mt-5">
              <div className="h-[1px] bg-[#F2F2F7] mb-5" />
              <h4 className="text-[13px] font-medium text-[#8E8E93] tracking-[-0.2px] mb-3">신청 요약</h4>
              <div className="space-y-3">
                {showItemSelection && selectedItems.length > 0 && (
                  <div className="flex justify-between text-[15px]">
                    <span className="text-[#8E8E93]">서비스</span>
                    <span className="text-[#1A1A1A] font-medium">
                      {selectedItems.map(i => i.name).join(', ')} ({selectedCount}개)
                    </span>
                  </div>
                )}
                {visitDate && visitTime && (
                  <div className="flex justify-between text-[15px]">
                    <span className="text-[#8E8E93]">방문 일시</span>
                    <span className="text-[#1A1A1A] font-medium">{visitDate} {visitTime}</span>
                  </div>
                )}
                {total > 0 && (
                  <div className="flex justify-between text-[16px] pt-3 border-t border-[#F2F2F7]">
                    <span className="font-semibold text-[#1A1A1A]">예상 금액</span>
                    <span className="font-bold text-[#EB5B37]">{formatPrice(total)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="bottom-spacer" />
      </main>

      {/* 하단 버튼 - 삼쩜삼 스타일 이전/다음 */}
      <div className="page-bottom">
        {currentStep === 1 && showItemSelection && total > 0 && (
          <div className="flex justify-between items-center pb-3">
            <span className="text-[14px] text-[#8E8E93]">예상 금액</span>
            <span className="text-[18px] font-bold text-[#EB5B37]">{formatPrice(total)}</span>
          </div>
        )}
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={handlePrevStep}
              className="flex-1 h-[52px] rounded-xl text-[16px] font-semibold text-[#1A1A1A] border border-[#E5E5EA] active:bg-[#F5F5F7] transition-colors"
            >
              이전
            </button>
          )}
          <button
            onClick={currentStep < 3 ? handleNextStep : handleSubmit}
            disabled={(currentStep === 1 && !anySelected) || (currentStep === 3 && !paymentMethod) || loading}
            className={`${currentStep > 1 ? 'flex-[2]' : 'w-full'} h-[52px] rounded-xl text-[16px] font-semibold transition-all active:scale-[0.98] ${
              (currentStep === 1 && !anySelected) || (currentStep === 3 && !paymentMethod)
                ? 'bg-[#E5E5EA] text-[#8E8E93]'
                : 'bg-[#EB5B37] text-white'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                처리 중...
              </span>
            ) : currentStep < 3 ? (
              '다음'
            ) : (
              `${serviceTitle} 신청하기`
            )}
          </button>
        </div>
      </div>

      {/* 완료 화면 - 삼쩜삼 스타일 전체 화면 */}
      {showModal && (
        <div className="fixed inset-0 z-[70] bg-white flex flex-col" style={{ animation: 'fade-in-up 0.4s ease-out' }}>
          <div className="flex-1 flex flex-col items-center justify-center px-5">
            <div className="w-20 h-20 bg-[#EB5B37] rounded-full flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-[24px] font-bold text-[#1A1A1A] tracking-[-0.5px] mb-3 text-center">
              신청이 완료되었어요
            </h2>
            <p className="text-[15px] text-[#8E8E93] text-center leading-[1.6]">
              서비스 요청이 접수되었습니다.<br />
              담당자가 곧 연락드릴 예정이에요.
            </p>
          </div>
          <div className="px-5 pb-safe">
            <button
              onClick={() => {
                setShowModal(false)
                router.replace('/my-service')
              }}
              className="w-full h-[52px] bg-[#EB5B37] text-white rounded-xl text-[16px] font-semibold active:scale-[0.98] transition-transform mb-4"
            >
              신청 내역 확인하기
            </button>
          </div>
        </div>
      )}

      {/* 스타일 */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .pb-safe {
          padding-bottom: max(16px, env(safe-area-inset-bottom));
        }
      `}</style>
    </div>
  )
}
