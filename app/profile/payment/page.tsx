'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ArrowLeft } from 'lucide-react'

const PAYMENT_METHODS = [
  { id: 'cash', label: '현금', icon: '💵' },
  { id: 'bank', label: '계좌이체', icon: '🏦' },
  { id: 'card', label: '카드', icon: '💳' },
]

export default function PaymentPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

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
          <span className="text-[17px] font-semibold text-[#1A1A1A] tracking-[-0.3px]">결제</span>
          <div className="w-10" />
        </div>
      </header>

      {/* 결제수단 리스트 */}
      <div className="px-5 pt-4 page-content">
        <div className="space-y-3">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              className="w-full flex items-center bg-white rounded-2xl border border-gray-200 px-4 py-4 justify-between hover:border-[#EB5B37] transition-colors"
              onClick={() => setSelected(method.id)}
            >
              <div className="flex items-center">
                <span className="text-3xl mr-3">{method.icon}</span>
                <span className="text-base font-bold text-gray-800">
                  {method.label}
                </span>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selected === method.id ? 'border-[#EB5B37]' : 'border-gray-300'
                }`}
              >
                {selected === method.id && (
                  <div className="w-3.5 h-3.5 rounded-full bg-[#EB5B37]" />
                )}
              </div>
            </button>
          ))}

          {/* Add New Card */}
          <button className="w-full bg-[#FFF2EE] rounded-2xl py-4 flex items-center justify-center mt-2 hover:bg-[#FFE5DD] transition-colors">
            <span className="text-[#EB5B37] text-xl font-bold mr-2">+</span>
            <span className="text-[#EB5B37] text-base font-bold">
              새 카드 추가
            </span>
          </button>
        </div>

        <div className="bottom-spacer-with-tabs" />
      </div>

      {/* 하단 결제 버튼 */}
      <div className="page-bottom-with-tabs">
        <Button
          onClick={() => setShowModal(true)}
          disabled={!selected}
          fullWidth
          className={!selected ? 'bg-[#FDDED5] hover:bg-[#FDDED5]' : ''}
        >
          결제
        </Button>
      </div>

      {/* 결제 성공 모달 */}
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
              router.push('/my-service')
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
