'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  ArrowLeft, Clock, CheckCircle, AlertCircle, PauseCircle,
  MessageSquare, Store, Tag, Flag, User
} from 'lucide-react'

interface InquiryResponse {
  id: string
  content: string
  created_at: string
  admin_id: string | null
  is_internal_note: boolean
}

interface InquiryDetail {
  id: string
  title: string
  content: string
  category: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  stores?: {
    name: string
  }
  inquiry_responses: InquiryResponse[]
}

const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string; gradientFrom: string; gradientTo: string; title: string; desc: string }> = {
  '접수됨': {
    icon: Clock,
    color: '#FF9500',
    bg: '#FFF4E6',
    gradientFrom: '#FFF4E6',
    gradientTo: '#FFE8CC',
    title: '문의 접수됨',
    desc: '관리자가 확인 후 답변드립니다.',
  },
  '처리중': {
    icon: AlertCircle,
    color: '#3B82F6',
    bg: '#EFF6FF',
    gradientFrom: '#EFF6FF',
    gradientTo: '#DBEAFE',
    title: '답변 준비중',
    desc: '관리자가 문의를 확인하고 있습니다.',
  },
  '완료': {
    icon: CheckCircle,
    color: '#22C55E',
    bg: '#F0FDF4',
    gradientFrom: '#F0FDF4',
    gradientTo: '#DCFCE7',
    title: '답변 완료',
    desc: '문의에 대한 답변이 등록되었습니다.',
  },
  '보류': {
    icon: PauseCircle,
    color: '#EF4444',
    bg: '#FEF2F2',
    gradientFrom: '#FEF2F2',
    gradientTo: '#FEE2E2',
    title: '처리 보류',
    desc: '문의 처리가 보류되었습니다.',
  },
}

const PRIORITY_CONFIG: Record<string, { color: string; bg: string }> = {
  '높음': { color: '#EF4444', bg: '#FEF2F2' },
  '보통': { color: '#FF9500', bg: '#FFF4E6' },
  '낮음': { color: '#22C55E', bg: '#F0FDF4' },
}

function DetailSkeleton() {
  return (
    <div className="page-without-tabs bg-[#f4f5f9]">
      <div className="app-header">
        <div className="h-[48px] px-5 flex items-center">
          <div className="skeleton w-6 h-6 rounded-lg" />
        </div>
      </div>
      <div className="page-content px-5 pt-3 space-y-3">
        <div className="skeleton w-full h-[100px] rounded-2xl" />
        <div className="skeleton w-full h-[200px] rounded-2xl" />
        <div className="skeleton w-full h-[160px] rounded-2xl" />
      </div>
    </div>
  )
}

function InquiryDetailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inquiry_id = searchParams.get('id')
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInquiryDetail = async () => {
      if (!inquiry_id) return

      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          id, title, content, category, status, priority,
          created_at, updated_at,
          stores(name),
          inquiry_responses(id, content, created_at, admin_id, is_internal_note)
        `)
        .eq('id', inquiry_id)
        .single()

      if (!error && data) {
        if (data.inquiry_responses) {
          data.inquiry_responses.sort(
            (a: InquiryResponse, b: InquiryResponse) =>
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
        }
        const formattedData = {
          ...data,
          stores: Array.isArray(data.stores) ? data.stores[0] : data.stores,
        }
        setInquiry(formattedData as InquiryDetail)
      }
      setLoading(false)
    }

    fetchInquiryDetail()
  }, [inquiry_id])

  const formatDateTime = (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}월 ${d.getDate()}일 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  if (loading) return <DetailSkeleton />

  if (!inquiry) {
    return (
      <div className="page-without-tabs bg-[#f4f5f9]">
        <header className="app-header">
          <div className="h-[48px] px-4 flex items-center">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center -ml-1 rounded-full active:bg-[#F5F5F7] transition-colors"
            >
              <ArrowLeft className="w-[22px] h-[22px] text-[#1A1A1A]" strokeWidth={1.8} />
            </button>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-7 h-7 text-[#C7C7CC]" strokeWidth={1.5} />
          </div>
          <p className="text-[15px] text-[#8E8E93]">문의를 찾을 수 없습니다.</p>
        </div>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[inquiry.status] || STATUS_CONFIG['접수됨']
  const StatusIcon = statusConfig.icon
  const priorityConfig = PRIORITY_CONFIG[inquiry.priority] || PRIORITY_CONFIG['보통']

  return (
    <div className="page-without-tabs bg-[#f4f5f9]">
      {/* 헤더 */}
      <header className="app-header">
        <div className="h-[48px] px-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center -ml-1 rounded-full active:bg-[#F5F5F7] transition-colors"
          >
            <ArrowLeft className="w-[22px] h-[22px] text-[#1A1A1A]" strokeWidth={1.8} />
          </button>
          <span className="text-[17px] font-semibold text-[#1A1A1A] tracking-[-0.3px]">
            문의 상세
          </span>
          <div className="w-10" />
        </div>
      </header>

      <main className="page-content">
        {/* 상태 배너 */}
        <section
          className="mx-5 mt-3 rounded-2xl p-5 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${statusConfig.gradientFrom} 0%, ${statusConfig.gradientTo} 100%)` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <StatusIcon
                  className="w-[18px] h-[18px]"
                  style={{ color: statusConfig.color }}
                  strokeWidth={2}
                />
                <span
                  className="text-[13px] font-bold tracking-[-0.2px]"
                  style={{ color: statusConfig.color }}
                >
                  {statusConfig.title}
                </span>
              </div>
              <p className="text-[14px] text-[#636366] tracking-[-0.2px] leading-[1.5]">
                {statusConfig.desc}
              </p>
              <p className="text-[12px] text-[#8E8E93] tracking-[-0.2px] mt-2">
                {formatDateTime(inquiry.created_at)}
              </p>
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center ml-4 flex-shrink-0"
              style={{ backgroundColor: `${statusConfig.color}15` }}
            >
              <MessageSquare
                className="w-7 h-7"
                style={{ color: statusConfig.color }}
                strokeWidth={1.5}
              />
            </div>
          </div>
        </section>

        {/* 문의 내용 카드 */}
        <section className="bg-white rounded-t-[28px] mt-4 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pt-1">
          {/* 메타 정보 */}
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="px-2.5 py-1 rounded-lg text-[12px] font-bold tracking-[-0.2px]"
                style={{ backgroundColor: priorityConfig.bg, color: priorityConfig.color }}
              >
                {inquiry.priority}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-[12px] font-medium text-[#636366] bg-[#F5F5F7] tracking-[-0.2px]">
                {inquiry.category}
              </span>
              {inquiry.stores?.name && (
                <span className="px-2.5 py-1 rounded-lg text-[12px] font-medium text-[#636366] bg-[#F5F5F7] tracking-[-0.2px] flex items-center gap-1">
                  <Store className="w-3 h-3" strokeWidth={2} />
                  {inquiry.stores.name}
                </span>
              )}
            </div>

            {/* 제목 */}
            <h2 className="text-[18px] font-bold text-[#1A1A1A] tracking-[-0.4px] mb-4 leading-[1.4]">
              {inquiry.title}
            </h2>

            {/* 문의 내용 */}
            <div className="bg-[#FAFAFA] rounded-2xl p-4">
              <p className="text-[15px] text-[#1A1A1A] tracking-[-0.2px] leading-[1.7] whitespace-pre-wrap">
                {inquiry.content}
              </p>
            </div>
          </div>

          {/* 구분선 */}
          <div className="h-2 bg-[#F5F5F7]" />

          {/* 답변 섹션 */}
          <div className="px-5 pt-5 pb-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-[16px] h-[16px] text-[#EB5B37]" strokeWidth={2} />
              <h3 className="text-[15px] font-bold text-[#1A1A1A] tracking-[-0.3px]">
                답변
              </h3>
              <span className="text-[13px] font-semibold text-[#EB5B37] tracking-[-0.2px]">
                {inquiry.inquiry_responses.length}
              </span>
            </div>

            {inquiry.inquiry_responses.length > 0 ? (
              <div className="space-y-3">
                {inquiry.inquiry_responses.map((response, index) => (
                  <div
                    key={response.id}
                    className="bg-[#FAFAFA] rounded-2xl p-4 animate-slide-up"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    {/* 관리자 헤더 */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#EB5B37] flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-[14px] font-bold text-[#EB5B37] tracking-[-0.2px]">
                          관리자
                        </span>
                      </div>
                      <span className="text-[12px] text-[#C7C7CC] tracking-[-0.2px]">
                        {formatDateTime(response.created_at)}
                      </span>
                    </div>
                    {/* 답변 내용 */}
                    <p className="text-[15px] text-[#1A1A1A] tracking-[-0.2px] leading-[1.7] whitespace-pre-wrap">
                      {response.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-7 h-7 text-[#C7C7CC]" strokeWidth={1.5} />
                </div>
                <p className="text-[15px] font-semibold text-[#1A1A1A] tracking-[-0.3px] mb-1">
                  아직 답변이 없어요
                </p>
                <p className="text-[13px] text-[#8E8E93] tracking-[-0.2px] text-center">
                  관리자 확인 후 답변이 등록됩니다
                </p>
              </div>
            )}
          </div>

          {/* 하단 여백 */}
          <div className="h-4" />
        </section>
      </main>
    </div>
  )
}

export default function InquiryDetailPage() {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <InquiryDetailContent />
    </Suspense>
  )
}
