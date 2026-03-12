'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  ArrowLeft, Plus, Clock, CheckCircle,
  AlertCircle, PauseCircle, ChevronRight, FileText, MessagesSquare
} from 'lucide-react'

interface Inquiry {
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
  } | null
  inquiry_responses?: {
    id: string
    content: string
    created_at: string
  }[]
}

const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  '접수됨': { icon: Clock, color: '#FF9500', bg: '#FFF4E6', label: '접수됨' },
  '처리중': { icon: AlertCircle, color: '#3B82F6', bg: '#EFF6FF', label: '처리중' },
  '완료': { icon: CheckCircle, color: '#22C55E', bg: '#F0FDF4', label: '완료' },
  '보류': { icon: PauseCircle, color: '#EF4444', bg: '#FEF2F2', label: '보류' },
}

const FILTERS = ['전체', '접수됨', '처리중', '완료', '보류']

function SkeletonLoader() {
  return (
    <div className="page-with-tabs bg-white">
      <div className="app-header">
        <div className="h-[48px] px-5 flex items-center justify-between">
          <div className="skeleton w-6 h-6 rounded-lg" />
          <div className="skeleton w-16 h-5 rounded-lg" />
          <div className="skeleton w-9 h-9 rounded-full" />
        </div>
      </div>
      <div className="page-content">
        <div className="px-5 py-5">
          <div className="flex justify-around">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="skeleton w-10 h-7 rounded-lg" />
                <div className="skeleton w-12 h-3 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="h-2 bg-[#F5F5F7]" />
        <div className="px-5 py-3">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton w-16 h-8 rounded-full" />
            ))}
          </div>
        </div>
        <div className="px-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton w-full h-[80px] mb-px" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ContactPage() {
  const router = useRouter()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState('전체')

  const fetchInquiries = async () => {
    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user?.id) {
      router.replace('/login')
      return
    }

    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        id, title, content, category, status, priority,
        created_at, updated_at,
        stores(name),
        inquiry_responses(id, content, created_at)
      `)
      .eq('user_id', userData.user.id)
      .order('updated_at', { ascending: false })

    if (!error) {
      const formattedData = (data || []).map((item) => ({
        ...item,
        stores: Array.isArray(item.stores) ? item.stores[0] : item.stores,
      }))
      setInquiries(formattedData as Inquiry[])
    }
    setLoading(false)
  }

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }
      await fetchInquiries()
    }
    checkAuth()
  }, [router])

  const filtered = selectedFilter === '전체'
    ? inquiries
    : inquiries.filter(i => i.status === selectedFilter)

  const formatTime = (iso: string) => {
    const date = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHour = Math.floor(diffMs / 3600000)
    const diffDay = Math.floor(diffMs / 86400000)

    if (diffMin < 1) return '방금'
    if (diffMin < 60) return `${diffMin}분 전`
    if (diffHour < 24) return `${diffHour}시간 전`
    if (diffDay < 7) return `${diffDay}일 전`
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  // 요약 통계
  const pendingCount = inquiries.filter(i => i.status === '접수됨' || i.status === '처리중').length
  const completedCount = inquiries.filter(i => i.status === '완료').length

  if (loading) return <SkeletonLoader />

  return (
    <div className="page-with-tabs bg-white">
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
            문의하기
          </span>
          <button
            onClick={() => router.push('/service/inquiry-create')}
            className="w-10 h-10 flex items-center justify-center -mr-1 rounded-full active:bg-[#F5F5F7] transition-colors"
          >
            <Plus className="w-[22px] h-[22px] text-[#1A1A1A]" strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <main className="page-content">
        {/* 요약 통계 - 인라인 */}
        {inquiries.length > 0 && (
          <>
            <section className="px-5 py-5">
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <p className="text-[24px] font-bold text-[#EB5B37] tracking-[-0.5px]">
                    {pendingCount}
                  </p>
                  <p className="text-[13px] text-[#8E8E93] tracking-[-0.2px] mt-1">처리 대기</p>
                </div>
                <div className="w-px h-10 bg-[#F2F2F7]" />
                <div className="text-center">
                  <p className="text-[24px] font-bold text-[#22C55E] tracking-[-0.5px]">
                    {completedCount}
                  </p>
                  <p className="text-[13px] text-[#8E8E93] tracking-[-0.2px] mt-1">답변 완료</p>
                </div>
                <div className="w-px h-10 bg-[#F2F2F7]" />
                <div className="text-center">
                  <p className="text-[24px] font-bold text-[#1A1A1A] tracking-[-0.5px]">
                    {inquiries.length}
                  </p>
                  <p className="text-[13px] text-[#8E8E93] tracking-[-0.2px] mt-1">전체 문의</p>
                </div>
              </div>
            </section>
            <div className="h-2 bg-[#F5F5F7]" />
          </>
        )}

        {/* 필터 칩 */}
        <section className="px-5 pt-4 pb-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-[13px] font-semibold tracking-[-0.2px] transition-all active:scale-[0.96] ${
                  selectedFilter === filter
                    ? 'bg-[#1A1A1A] text-white'
                    : 'bg-[#F5F5F7] text-[#8E8E93] active:bg-[#E5E5EA]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* 문의 리스트 */}
        {filtered.length > 0 ? (
          <section>
            {filtered.map((item, index) => {
              const status = STATUS_CONFIG[item.status] || STATUS_CONFIG['접수됨']
              const StatusIcon = status.icon
              const hasResponse = item.inquiry_responses && item.inquiry_responses.length > 0
              const isLast = index === filtered.length - 1

              return (
                <button
                  key={item.id}
                  onClick={() => router.push(`/service/inquiry-detail?id=${item.id}`)}
                  className={`w-full px-5 py-4 active:bg-[#F9F9F9] transition-colors text-left ${
                    !isLast ? 'border-b border-[#F2F2F7]' : ''
                  }`}
                >
                  {/* 상단: 제목 + 상태 */}
                  <div className="flex items-start justify-between mb-1.5">
                    <h3 className="text-[15px] font-semibold text-[#1A1A1A] tracking-[-0.3px] line-clamp-1 flex-1 mr-3">
                      {item.title}
                    </h3>
                    <div
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: status.bg }}
                    >
                      <StatusIcon
                        className="w-3 h-3"
                        style={{ color: status.color }}
                        strokeWidth={2.5}
                      />
                      <span
                        className="text-[11px] font-bold tracking-[-0.2px]"
                        style={{ color: status.color }}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* 내용 미리보기 */}
                  <p className="text-[13px] text-[#8E8E93] tracking-[-0.2px] line-clamp-1 mb-2.5">
                    {item.content}
                  </p>

                  {/* 하단: 메타 정보 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-[#C7C7CC] tracking-[-0.2px] bg-[#F5F5F7] px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                      {item.stores?.name && (
                        <span className="text-[12px] text-[#C7C7CC] tracking-[-0.2px]">
                          {item.stores.name}
                        </span>
                      )}
                      <span className="text-[12px] text-[#D1D1D6] tracking-[-0.2px]">
                        {formatTime(item.updated_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasResponse && (
                        <div className="flex items-center gap-1">
                          <MessagesSquare className="w-3.5 h-3.5 text-[#3B82F6]" strokeWidth={2} />
                          <span className="text-[12px] font-medium text-[#3B82F6] tracking-[-0.2px]">
                            {item.inquiry_responses?.length}
                          </span>
                        </div>
                      )}
                      <ChevronRight className="w-4 h-4 text-[#D1D1D6]" strokeWidth={2} />
                    </div>
                  </div>
                </button>
              )
            })}
          </section>
        ) : (
          /* 빈 상태 */
          <div className="flex flex-col items-center justify-center pt-16 pb-20">
            <div className="w-20 h-20 bg-[#F5F5F7] rounded-full flex items-center justify-center mb-5">
              <FileText className="w-9 h-9 text-[#C7C7CC]" strokeWidth={1.5} />
            </div>
            <p className="text-[17px] font-bold text-[#1A1A1A] tracking-[-0.3px] mb-1.5">
              {selectedFilter !== '전체' ? `${selectedFilter} 문의가 없습니다` : '아직 문의 내역이 없어요'}
            </p>
            <p className="text-[14px] text-[#8E8E93] tracking-[-0.2px] mb-7">
              궁금한 점이 있다면 문의해 주세요
            </p>
            <button
              onClick={() => router.push('/service/inquiry-create')}
              className="h-[44px] px-6 bg-[#EB5B37] text-white text-[15px] font-semibold rounded-xl active:bg-[#D9482A] active:scale-[0.98] transition-all"
            >
              문의 작성하기
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
