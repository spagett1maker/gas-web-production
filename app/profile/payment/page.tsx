'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

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
    <div className="min-h-screen bg-white pb-24">
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
        <h1 className="text-[22px] font-bold text-gray-800">결제</h1>
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

      {/* 결제수단 리스트 */}
      <div className="px-5 pt-4 pb-24">
        <div className="space-y-3">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              className="w-full flex items-center bg-white rounded-2xl border border-gray-200 px-4 py-4 justify-between hover:border-[#EB5A36] transition-colors"
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
                  selected === method.id ? 'border-[#EB5A36]' : 'border-gray-300'
                }`}
              >
                {selected === method.id && (
                  <div className="w-3.5 h-3.5 rounded-full bg-[#EB5A36]" />
                )}
              </div>
            </button>
          ))}

          {/* Add New Card */}
          <button className="w-full bg-[#FFF2EE] rounded-2xl py-4 flex items-center justify-center mt-2 hover:bg-[#FFE5DD] transition-colors">
            <span className="text-[#EB5A36] text-xl font-bold mr-2">+</span>
            <span className="text-[#EB5A36] text-base font-bold">
              새 카드 추가
            </span>
          </button>
        </div>
      </div>

      {/* 하단 결제 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-6">
        <Button
          onClick={() => setShowModal(true)}
          disabled={!selected}
          fullWidth
          className={!selected ? 'bg-[#FADCD2] hover:bg-[#FADCD2]' : ''}
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
