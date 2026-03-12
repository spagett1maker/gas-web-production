'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, X } from 'lucide-react'

export default function ContractPage() {
  const router = useRouter()

  return (
    <div className="page-without-tabs bg-[#F2F4F6]">
      {/* 헤더 */}
      <header className="app-header bg-white">
        <div className="h-[52px] px-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-[#F5F5F7] transition-colors -ml-1"
          >
            <ArrowLeft className="w-[22px] h-[22px] text-[#1A1A1A]" strokeWidth={2} />
          </button>

          <span className="text-[17px] font-semibold text-[#1A1A1A] tracking-[-0.3px]">
            정기계약 이용권
          </span>

          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-[#F5F5F7] transition-colors -mr-1"
          >
            <X className="w-[22px] h-[22px] text-[#8E8E93]" strokeWidth={2} />
          </button>
        </div>
      </header>

      <div className="flex items-center justify-center" style={{ marginTop: '13rem' }}>
        <p className="text-[16px] text-[#8E8E93] text-center tracking-[-0.2px]">서비스 준비 중입니다</p>
      </div>
    </div>
  )
}
