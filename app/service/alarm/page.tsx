'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { FeedbackModal } from '@/components/ui/FeedbackModal'
import { Loading } from '@/components/ui/Loading'
import { ArrowLeft, X, Check, MapPin, Calendar, Clock, CreditCard } from 'lucide-react'

const OPTIONS = [
  'LPG 경보기',
  'LNG(도시가스) 경보기',
  '그 외',
]

const TIME_SLOTS = [
  { id: 'morning', label: '오전', time: '09:00 - 12:00' },
  { id: 'afternoon', label: '오후', time: '12:00 - 18:00' },
  { id: 'evening', label: '저녁', time: '18:00 - 21:00' },
]

const PAYMENT_METHODS = [
  { id: 'cash', label: '현금 결제', icon: '💵' },
  { id: 'card', label: '카드 결제', icon: '💳' },
  { id: 'transfer', label: '계좌 이체', icon: '🏦' },
  { id: 'later', label: '추후 협의', icon: '📞' },
]

export default function AlarmReplacePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selected, setSelected] = useState<number | null>(null)
  const [extra, setExtra] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [storeName, setStoreName] = useState<string | null>(null)
  const [storeAddress, setStoreAddress] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('default_store_id')
        .eq('id', session.user.id)
        .single()

      if (profile?.default_store_id) {
        const { data: store } = await supabase
          .from('stores')
          .select('name, address')
          .eq('id', profile.default_store_id)
          .single()

        if (store) {
          setStoreName(store.name)
          setStoreAddress(store.address)
        }
      }

      setAuthLoading(false)
    }

    checkAuth()
  }, [router])

  const getNextDays = () => {
    const days = []
    const today = new Date()
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      days.push(date)
    }
    return days
  }

  const formatDate = (date: Date) => {
    const days = ['일', '월', '화', '수', '목', '금', '토']
    return {
      month: date.getMonth() + 1,
      day: date.getDate(),
      weekday: days[date.getDay()],
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selected !== null
      case 2: return selectedDate && selectedTimeSlot
      case 3: return paymentMethod
      default: return true
    }
  }

  const handleNext = () => {
    if (!canProceed()) return
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
    else router.back()
  }

  const handleSubmit = async () => {
    if (selected === null) return
    setLoading(true)

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
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
      .eq('name', 'alarm')
      .single()

    if (serviceError || !service?.id) {
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

    const requestDetails: any[] = [
      {
        request_id: request.id,
        key: '경보기 종류',
        value: OPTIONS[selected],
      },
    ]

    if (extra.trim()) {
      requestDetails.push({
        request_id: request.id,
        key: '추가 요청사항',
        value: extra,
      })
    }

    if (selectedDate && selectedTimeSlot) {
      const dateInfo = formatDate(selectedDate)
      const timeSlot = TIME_SLOTS.find(t => t.id === selectedTimeSlot)
      requestDetails.push({
        request_id: request.id,
        key: '방문 희망 날짜',
        value: `${dateInfo.month}월 ${dateInfo.day}일 (${dateInfo.weekday})`,
      })
      requestDetails.push({
        request_id: request.id,
        key: '방문 희망 시간',
        value: timeSlot?.time || selectedTimeSlot,
      })
    }

    if (paymentMethod) {
      const method = PAYMENT_METHODS.find(m => m.id === paymentMethod)
      requestDetails.push({
        request_id: request.id,
        key: '결제 방법',
        value: method?.label || paymentMethod,
      })
    }

    const { error: detailError } = await supabase
      .from('request_details')
      .insert(requestDetails)

    setLoading(false)

    if (detailError) {
      alert(detailError.message)
    } else {
      setShowModal(true)
    }
  }

  if (authLoading) return <Loading />

  const stepTitles = ['경보기 선택', '방문 일정', '결제 방법', '신청 확인']

  return (
    <div className="page-without-tabs bg-[#F2F4F6]">
      {/* 헤더 */}
      <header className="app-header bg-white">
        <div className="h-[52px] px-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-[#F5F5F7] transition-colors -ml-1"
          >
            <ArrowLeft className="w-[22px] h-[22px] text-[#1A1A1A]" strokeWidth={2} />
          </button>

          <span className="text-[17px] font-semibold text-[#1A1A1A] tracking-[-0.3px]">
            {stepTitles[currentStep - 1]}
          </span>

          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-[#F5F5F7] transition-colors -mr-1"
          >
            <X className="w-[22px] h-[22px] text-[#8E8E93]" strokeWidth={2} />
          </button>
        </div>

        {/* 프로그레스 바 */}
        <div className="px-5 pb-3">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${
                  step <= currentStep ? 'bg-[#EB5B37]' : 'bg-[#E5E5EA]'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* 콘텐츠 */}
      <main className="page-content pb-28">
        {/* Step 1: 경보기 선택 */}
        {currentStep === 1 && (
          <div className="animate-fade-in-scale" style={{ animationDuration: '300ms' }}>
            <div className="bg-white px-5 pt-5 pb-6">
              <h2 className="text-[22px] font-bold text-[#1A1A1A] tracking-[-0.5px] leading-[1.35]">
                어떤 경보기를<br />교체하시겠어요?
              </h2>
              <p className="text-[14px] text-[#8E8E93] tracking-[-0.2px] mt-2">
                교체할 경보기 종류를 선택해주세요
              </p>
            </div>

            <div className="h-2" />

            {/* 옵션 리스트 */}
            <div className="bg-white px-5 py-4">
              <div className="space-y-2.5">
                {OPTIONS.map((opt, idx) => {
                  const isActive = selected === idx
                  return (
                    <button
                      key={opt}
                      onClick={() => setSelected(idx)}
                      className={`w-full flex items-center gap-3.5 p-4 rounded-2xl transition-all duration-200 ${
                        isActive
                          ? 'bg-white ring-[1.5px] ring-[#EB5B37] shadow-[0_2px_16px_rgba(235,91,55,0.08)]'
                          : 'bg-[#F8F8FA] active:bg-[#F0F0F2]'
                      }`}
                    >
                      <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isActive ? 'border-[#EB5B37] bg-[#EB5B37]' : 'border-[#D1D1D6]'
                      }`}>
                        {isActive && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <span className={`text-[15px] font-semibold tracking-[-0.3px] ${
                        isActive ? 'text-[#1A1A1A]' : 'text-[#3A3A3C]'
                      }`}>
                        {opt}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="h-2" />

            {/* 추가 요청사항 */}
            <div className="bg-white px-5 py-5">
              <p className="text-[13px] font-medium text-[#8E8E93] tracking-[-0.2px] mb-3">추가 요청사항 (선택)</p>
              <textarea
                className="w-full min-h-[100px] bg-[#F5F5F7] rounded-xl px-4 py-3.5 text-[15px] text-[#1A1A1A] tracking-[-0.2px] resize-none focus:outline-none focus:ring-1 focus:ring-[#EB5B37] placeholder:text-[#C7C7CC]"
                placeholder="추가 요청사항을 입력해주세요"
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 2: 방문 일정 */}
        {currentStep === 2 && (
          <div className="animate-fade-in-scale" style={{ animationDuration: '300ms' }}>
            <div className="bg-white px-5 pt-5 pb-6">
              <h2 className="text-[22px] font-bold text-[#1A1A1A] tracking-[-0.5px] leading-[1.35]">
                언제 방문하면<br />좋을까요?
              </h2>
              <p className="text-[14px] text-[#8E8E93] tracking-[-0.2px] mt-2">
                희망하시는 날짜와 시간대를 선택해주세요
              </p>
            </div>

            <div className="h-2" />

            <div className="bg-white px-5 py-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-[18px] h-[18px] text-[#EB5B37]" strokeWidth={2} />
                <h3 className="text-[15px] font-semibold text-[#1A1A1A] tracking-[-0.3px]">
                  날짜 선택
                </h3>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {getNextDays().map((date, idx) => {
                  const info = formatDate(date)
                  const isSelected = selectedDate?.toDateString() === date.toDateString()
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(date)}
                      className={`flex-shrink-0 w-[56px] py-2.5 rounded-xl border-[1.5px] transition-all text-center ${
                        isSelected
                          ? 'border-[#EB5B37] bg-[#EB5B37]'
                          : 'border-[#F0F0F2] bg-white active:bg-[#FAFAFA]'
                      }`}
                    >
                      <p className={`text-[11px] font-medium ${
                        isSelected ? 'text-white/80' : isWeekend ? 'text-[#FF3B30]' : 'text-[#8E8E93]'
                      }`}>
                        {info.weekday}
                      </p>
                      <p className={`text-[18px] font-bold mt-0.5 ${
                        isSelected ? 'text-white' : 'text-[#1A1A1A]'
                      }`}>
                        {info.day}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="h-2" />

            <div className="bg-white px-5 py-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-[18px] h-[18px] text-[#EB5B37]" strokeWidth={2} />
                <h3 className="text-[15px] font-semibold text-[#1A1A1A] tracking-[-0.3px]">
                  시간대 선택
                </h3>
              </div>

              <div className="space-y-2.5">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedTimeSlot === slot.id
                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedTimeSlot(slot.id)}
                      className={`w-full flex items-center gap-3.5 p-4 rounded-2xl transition-all duration-200 ${
                        isSelected
                          ? 'bg-white ring-[1.5px] ring-[#EB5B37] shadow-[0_2px_16px_rgba(235,91,55,0.08)]'
                          : 'bg-[#F8F8FA] active:bg-[#F0F0F2]'
                      }`}
                    >
                      <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected ? 'border-[#EB5B37] bg-[#EB5B37]' : 'border-[#D1D1D6]'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <div className="text-left">
                        <p className={`text-[15px] font-semibold tracking-[-0.3px] ${
                          isSelected ? 'text-[#1A1A1A]' : 'text-[#3A3A3C]'
                        }`}>
                          {slot.label}
                        </p>
                        <p className="text-[13px] text-[#8E8E93] mt-0.5">
                          {slot.time}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: 결제 방법 */}
        {currentStep === 3 && (
          <div className="animate-fade-in-scale" style={{ animationDuration: '300ms' }}>
            <div className="bg-white px-5 pt-5 pb-6">
              <h2 className="text-[22px] font-bold text-[#1A1A1A] tracking-[-0.5px] leading-[1.35]">
                결제는 어떻게<br />진행할까요?
              </h2>
              <p className="text-[14px] text-[#8E8E93] tracking-[-0.2px] mt-2">
                서비스 완료 후 현장에서 결제됩니다
              </p>
            </div>

            <div className="h-2" />

            <div className="bg-white px-5 py-5">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-[18px] h-[18px] text-[#EB5B37]" strokeWidth={2} />
                <h3 className="text-[15px] font-semibold text-[#1A1A1A] tracking-[-0.3px]">
                  결제 방법
                </h3>
              </div>

              <div className="space-y-2.5">
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = paymentMethod === method.id
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full flex items-center gap-3.5 p-4 rounded-2xl transition-all duration-200 ${
                        isSelected
                          ? 'bg-white ring-[1.5px] ring-[#EB5B37] shadow-[0_2px_16px_rgba(235,91,55,0.08)]'
                          : 'bg-[#F8F8FA] active:bg-[#F0F0F2]'
                      }`}
                    >
                      <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected ? 'border-[#EB5B37] bg-[#EB5B37]' : 'border-[#D1D1D6]'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <span className="text-[22px]">{method.icon}</span>
                      <span className={`text-[15px] font-semibold tracking-[-0.3px] ${
                        isSelected ? 'text-[#1A1A1A]' : 'text-[#3A3A3C]'
                      }`}>
                        {method.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: 최종 확인 */}
        {currentStep === 4 && (
          <div className="animate-fade-in-scale" style={{ animationDuration: '300ms' }}>
            <div className="bg-white px-5 pt-5 pb-6">
              <h2 className="text-[22px] font-bold text-[#1A1A1A] tracking-[-0.5px] leading-[1.35]">
                요청 내용을<br />확인해주세요
              </h2>
            </div>

            <div className="h-2" />

            {/* 서비스 정보 */}
            <div className="bg-white px-5 py-5">
              <p className="text-[13px] font-medium text-[#8E8E93] tracking-[-0.2px] mb-3">선택한 서비스</p>
              <p className="text-[15px] font-medium text-[#1A1A1A] tracking-[-0.2px]">
                {selected !== null && OPTIONS[selected]}
              </p>
              {extra.trim() && (
                <div className="mt-3 pt-3 border-t border-[#F0F0F2]">
                  <p className="text-[13px] text-[#8E8E93] mb-1">추가 요청사항</p>
                  <p className="text-[14px] text-[#1A1A1A] tracking-[-0.2px]">{extra}</p>
                </div>
              )}
            </div>

            <div className="h-[1px] bg-[#F0F0F2] mx-5" />

            {/* 방문 일정 */}
            <div className="bg-white px-5 py-5">
              <p className="text-[13px] font-medium text-[#8E8E93] tracking-[-0.2px] mb-3">방문 일정</p>
              {selectedDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#8E8E93]" />
                  <span className="text-[15px] text-[#1A1A1A] tracking-[-0.2px]">
                    {formatDate(selectedDate).month}월 {formatDate(selectedDate).day}일 ({formatDate(selectedDate).weekday}) · {TIME_SLOTS.find(t => t.id === selectedTimeSlot)?.label}
                  </span>
                </div>
              )}
            </div>

            <div className="h-[1px] bg-[#F0F0F2] mx-5" />

            {/* 방문 장소 */}
            <div className="bg-white px-5 py-5">
              <p className="text-[13px] font-medium text-[#8E8E93] tracking-[-0.2px] mb-3">방문 장소</p>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#EB5B37]" />
                <div>
                  <p className="text-[15px] font-medium text-[#1A1A1A] tracking-[-0.2px]">
                    {storeName || '가게 미등록'}
                  </p>
                  {storeAddress && (
                    <p className="text-[13px] text-[#8E8E93] mt-0.5">
                      {storeAddress}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-[#F0F0F2] mx-5" />

            {/* 결제 방법 */}
            <div className="bg-white px-5 py-5">
              <p className="text-[13px] font-medium text-[#8E8E93] tracking-[-0.2px] mb-3">결제 방법</p>
              <p className="text-[15px] text-[#1A1A1A] tracking-[-0.2px]">
                {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.icon}{' '}
                {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* 하단 CTA */}
      <div className="bottom-cta">
        {currentStep < 4 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            fullWidth
          >
            다음
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={loading}
            fullWidth
          >
            {loading ? '처리 중...' : '서비스 요청하기'}
          </Button>
        )}
      </div>

      {/* 완료 모달 */}
      <FeedbackModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type="success"
        title="요청이 완료되었어요"
        description="빠른 시일 내에 연락드릴게요"
        primaryLabel="나의 서비스 확인하기"
        primaryAction={() => {
          router.replace('/my-service')
        }}
      />
    </div>
  )
}
