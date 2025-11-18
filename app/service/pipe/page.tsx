'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Loading } from '@/components/ui/Loading'
import DateTimeSelector from '@/components/DateTimeSelector'
import PaymentMethodSelector from '@/components/PaymentMethodSelector'

const OPTIONS = [
  'LPG',
  'LNG(도시가스)'
]

export default function PipeRemovalPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selected, setSelected] = useState<number | null>(null)
  const [extra, setExtra] = useState('')
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

  const handleNextStep = () => {
    if (currentStep === 1 && (selected === null || extra === '')) {
      alert('가스 종류를 선택하고 요청사항을 입력해주세요.')
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
        return '배관 철거'
      case 2:
        return '방문 날짜/시간 선택'
      case 3:
        return '결제 방법 선택'
      default:
        return '배관 철거'
    }
  }

  const handleSubmit = async () => {
    if (selected === null) return

    if (extra === '') return

    setLoading(true)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

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
      .eq('name', 'pipe')
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

    const requestDetails: any[] = [
      {
        request_id: request.id,
        key: '가스 종류',
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

  if (authLoading) {
    return <Loading />
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
        {/* Step 1: 가스 종류 선택 */}
        {currentStep === 1 && (
          <>
            {OPTIONS.map((opt, idx) => {
              const isActive = selected === idx
              return (
                <button
                  key={opt}
                  onClick={() => setSelected(idx)}
                  className={`w-full flex items-center rounded-2xl px-4 py-5 mb-4 border transition-colors ${
                    isActive ? 'border-[#EB5A36]' : 'border-gray-200'
                  }`}
                >
                  <div className="mr-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isActive ? 'border-[#EB5A36]' : 'border-gray-300'
                      }`}
                    >
                      {isActive && <div className="w-3.5 h-3.5 rounded-full bg-[#EB5A36]" />}
                    </div>
                  </div>
                  <span className="text-[17px] text-gray-800">{opt}</span>
                </button>
              )
            })}
            {/* 추가 요청사항 */}
            <textarea
              className="w-full min-h-[120px] bg-[#F6F7FB] rounded-2xl px-4 py-4 text-[15px] text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-[#EB5A36]"
              placeholder="추가 요청사항을 입력해주세요."
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
            />
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

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 px-5 py-6 bg-white border-t border-gray-200 md:relative md:border-0">
        {currentStep < 3 ? (
          <Button
            onClick={handleNextStep}
            disabled={currentStep === 1 && (selected === null || extra === '')}
            fullWidth
            className={currentStep === 1 && (selected === null || extra === '') ? 'bg-[#FADCD2] hover:bg-[#FADCD2]' : ''}
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
            {loading ? '신청 중...' : '배관 철거 신청'}
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
