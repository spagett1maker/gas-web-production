'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loading } from '@/components/ui/Loading'

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

export default function ContactPage() {
  const router = useRouter()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)

  const getStatusColor = (status: string) => {
    switch (status) {
      case '접수됨':
        return '#FF9500'
      case '처리중':
        return '#007AFF'
      case '완료':
        return '#34C759'
      case '보류':
        return '#FF3B30'
      default:
        return '#8E8E93'
    }
  }

  const fetchInquiries = async () => {
    setLoading(true)
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.warn('유저 정보 불러오기 실패:', userError.message)
      setLoading(false)
      return
    }

    const userId = userData.user?.id
    if (!userId) {
      console.warn('❗ 유저 ID 없음 — 로그인 상태 확인 필요')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        id,
        title,
        content,
        category,
        status,
        priority,
        created_at,
        updated_at,
        stores(name),
        inquiry_responses(id, content, created_at)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.warn('문의글 불러오기 실패:', error.message)
    } else {
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
      setAuthLoading(false)
      await fetchInquiries()
    }

    checkAuth()
  }, [router])

  const formatTime = (iso: string) => {
    const date = new Date(iso)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    return isToday
      ? date.toTimeString().slice(0, 5)
      : date.toISOString().slice(0, 10).replace(/-/g, '/')
  }

  if (authLoading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 상단 헤더 */}
      <header className="pt-6 pb-4 px-5 flex items-center justify-between sticky top-0 bg-white z-10 border-b border-gray-100">
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
        <h1 className="text-[22px] font-bold text-gray-800">문의하기</h1>
        <button
          onClick={() => router.push('/service/inquiry-create')}
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
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </header>

      {/* 문의 내역 리스트 */}
      {loading ? (
        <Loading />
      ) : inquiries.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {inquiries.map((item) => {
            const hasResponse =
              item.inquiry_responses && item.inquiry_responses.length > 0

            return (
              <button
                key={item.id}
                onClick={() =>
                  router.push(`/service/inquiry-detail?id=${item.id}`)
                }
                className="w-full px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 mr-3">
                    <h3 className="font-bold text-base text-gray-800 mb-1 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-[13px] mb-2 line-clamp-2">
                      {item.content}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className="px-2 py-1 rounded-full mb-1 text-[11px] font-medium"
                      style={{
                        backgroundColor: getStatusColor(item.status) + '20',
                        color: getStatusColor(item.status),
                      }}
                    >
                      {item.status}
                    </span>
                    <span className="text-gray-500 text-[11px]">
                      {formatTime(item.updated_at)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-500 text-xs">
                      {item.category}
                    </span>
                    {item.stores?.name && (
                      <span className="text-gray-500 text-xs">
                        {item.stores.name}
                      </span>
                    )}
                  </div>

                  {hasResponse && (
                    <div className="flex items-center space-x-1">
                      <svg
                        className="w-3.5 h-3.5 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span className="text-blue-500 text-xs">
                        답변 {item.inquiry_responses?.length || 0}개
                      </span>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-8 py-20">
          <svg
            className="w-16 h-16 text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500 text-base text-center mb-2">
            아직 문의 내역이 없습니다.
          </p>
          <p className="text-gray-400 text-sm text-center mb-6">
            우측 상단의 + 버튼을 눌러 새 문의를 작성해보세요.
          </p>
          <button
            onClick={() => router.push('/service/inquiry-create')}
            className="bg-[#EB5A36] text-white px-6 py-3 rounded-full font-medium hover:bg-[#FF5A36] transition-colors"
          >
            문의 작성하기
          </button>
        </div>
      )}
    </div>
  )
}
