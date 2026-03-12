'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/utils/format'
import DateTimeSelector from '@/components/DateTimeSelector'
import PaymentMethodSelector from '@/components/PaymentMethodSelector'
import {
  ArrowLeft, Check, Calendar, CreditCard,
  Package, ChevronRight, Sparkles, Clock
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

// 스텝 정보
const STEPS = [
  { id: 1, label: '서비스 선택', icon: Package },
  { id: 2, label: '방문 일시', icon: Calendar },
  { id: 3, label: '결제 방법', icon: CreditCard },
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
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#EB5B37] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="page-without-tabs bg-[#F5F5F7]">
      {/* 헤더 */}
      <header className="app-header bg-white">
        <div className="h-[52px] px-4 flex items-center justify-between">
          <button
            onClick={() => currentStep > 1 ? handlePrevStep() : router.back()}
            className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full active:bg-[#F5F5F7] transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-[#1A1A1A]" strokeWidth={1.8} />
          </button>
          <h1 className="text-[17px] font-semibold text-[#1A1A1A] tracking-[-0.3px]">
            {serviceTitle}
          </h1>
          <div className="w-10" />
        </div>

        {/* 스텝 인디케이터 */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((step, idx) => {
              const Icon = step.icon
              const isActive = currentStep >= step.id
              const isCurrent = currentStep === step.id
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? 'bg-[#EB5B37] text-white'
                          : 'bg-[#E5E5EA] text-[#8E8E93]'
                      } ${isCurrent ? 'ring-4 ring-[#FEF2EE]' : ''}`}
                    >
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5" strokeWidth={2.5} />
                      ) : (
                        <Icon className="w-5 h-5" strokeWidth={1.8} />
                      )}
                    </div>
                    <span className={`text-[11px] mt-1.5 font-medium ${isActive ? 'text-[#EB5B37]' : 'text-[#8E8E93]'}`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 mt-[-18px] rounded-full transition-colors ${
                      currentStep > step.id ? 'bg-[#EB5B37]' : 'bg-[#E5E5EA]'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="page-content px-5 pt-4">
        {/* Step 1: 서비스 선택 */}
        {currentStep === 1 && (
          <div className="space-y-3" style={{ animation: 'fade-in-up 0.3s ease-out' }}>
            {/* 아이템 선택 */}
            {showItemSelection && items.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-[#EB5B37]" />
                  <span className="text-[14px] font-medium text-[#1A1A1A]">서비스를 선택해주세요</span>
                </div>
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl bg-white transition-all ${
                      counts[idx] > 0
                        ? 'ring-2 ring-[#EB5B37] shadow-lg shadow-orange-100'
                        : 'shadow-[0_1px_4px_rgba(0,0,0,0.04)]'
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
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-[#EB5B37]" />
                  <span className="text-[14px] font-medium text-[#1A1A1A]">문의 내용을 입력해주세요</span>
                </div>
                <div className="p-4 rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
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
              <div className="p-6 rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] text-center">
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
          <div style={{ animation: 'fade-in-up 0.3s ease-out' }}>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-[#EB5B37]" />
              <span className="text-[14px] font-medium text-[#1A1A1A]">방문 희망 일시를 선택해주세요</span>
            </div>
            <div className="p-4 rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
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
          <div style={{ animation: 'fade-in-up 0.3s ease-out' }}>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-[#EB5B37]" />
              <span className="text-[14px] font-medium text-[#1A1A1A]">결제 방법을 선택해주세요</span>
            </div>
            <div className="p-4 rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <PaymentMethodSelector
                onPaymentMethodChange={setPaymentMethod}
                selectedMethod={paymentMethod}
              />
            </div>

            {/* 요약 정보 */}
            <div className="mt-4 p-4 rounded-2xl bg-[#FEF2EE]">
              <h4 className="text-[14px] font-semibold text-[#EB5B37] mb-3">신청 요약</h4>
              <div className="space-y-2">
                {showItemSelection && selectedItems.length > 0 && (
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#8E8E93]">서비스</span>
                    <span className="text-[#1A1A1A] font-medium">
                      {selectedItems.map(i => i.name).join(', ')} ({selectedCount}개)
                    </span>
                  </div>
                )}
                {visitDate && visitTime && (
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#8E8E93]">방문 일시</span>
                    <span className="text-[#1A1A1A] font-medium">{visitDate} {visitTime}</span>
                  </div>
                )}
                {total > 0 && (
                  <div className="flex justify-between text-[15px] pt-2 border-t border-[#FDDED5] mt-2">
                    <span className="font-medium text-[#1A1A1A]">예상 금액</span>
                    <span className="font-bold text-[#EB5B37]">{formatPrice(total)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="bottom-spacer" />
      </main>

      {/* 하단 버튼 */}
      <div className="page-bottom">
        {currentStep === 1 && showItemSelection && total > 0 && (
          <div className="flex justify-between items-center pb-3">
            <span className="text-[14px] text-[#8E8E93]">예상 금액</span>
            <span className="text-[18px] font-bold text-[#EB5B37]">{formatPrice(total)}</span>
          </div>
        )}
        <button
          onClick={currentStep < 3 ? handleNextStep : handleSubmit}
          disabled={(currentStep === 1 && !anySelected) || (currentStep === 3 && !paymentMethod) || loading}
          className={`w-full h-[52px] rounded-xl text-[16px] font-semibold transition-all active:scale-[0.98] ${
            (currentStep === 1 && !anySelected) || (currentStep === 3 && !paymentMethod)
              ? 'bg-[#E5E5EA] text-[#8E8E93]'
              : 'bg-[#EB5B37] text-white shadow-lg shadow-orange-200/50'
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

      {/* 완료 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div
            className="relative bg-white rounded-3xl p-6 mx-5 w-full max-w-sm"
            style={{ animation: 'modal-pop 0.3s ease-out' }}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-[#ECFDF5] rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-[#10B981]" strokeWidth={2.5} />
              </div>
              <h3 className="text-[20px] font-bold text-[#1A1A1A] tracking-[-0.4px] mb-2">
                신청 완료!
              </h3>
              <p className="text-[15px] text-[#8E8E93] mb-6">
                서비스 요청이 접수되었습니다.<br />
                담당자가 곧 연락드릴 예정입니다.
              </p>
              <button
                onClick={() => {
                  setShowModal(false)
                  router.replace('/my-service')
                }}
                className="w-full h-[52px] bg-[#EB5B37] text-white rounded-xl text-[16px] font-semibold active:scale-[0.98] transition-transform"
              >
                신청 내역 확인하기
              </button>
            </div>
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

        @keyframes modal-pop {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .pb-safe {
          padding-bottom: max(16px, env(safe-area-inset-bottom));
        }
      `}</style>
    </div>
  )
}
