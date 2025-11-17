'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SERVICE_NAME_MAP } from '@/lib/constants'
import { Loading } from '@/components/ui/Loading'

const CATEGORIES = ['전체', '화구 교체', '경보기 교체', '배관 철거', '가스누출 검사', '밸브 교체']

const STATUS_CONFIG = {
  '요청됨': { color: '#90CAF9', bg: '#E3F2FD', icon: '📍' },
  '진행중': { color: '#FFD36F', bg: '#FFF7E0', icon: '⏸️' },
  '완료': { color: '#4DD0A1', bg: '#E0F7EF', icon: '✅' },
  '취소': { color: '#FF6B6B', bg: '#FFEAEA', icon: '❌' },
}

const SERVICE_ICONS: Record<string, string> = {
  burner: '🔥',
  valve: '🔧',
  gas: '⚠️',
  pipe: '🔩',
  alarm: '🚨',
  quote: '📋',
  contract: '📝',
  center: '☎️',
}

export default function MyServicePage() {
  const [selected, setSelected] = useState('전체')
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const loadRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('service_requests')
      .select(`id, status, created_at, services(name)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('요청 불러오기 실패:', error.message)
    } else {
      setRequests(data || [])
    }
    setLoading(false)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadRequests()
    setRefreshing(false)
  }

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }
      await loadRequests()
    }

    checkAuth()
  }, [])

  const filtered = requests.filter((r) => {
    const koreanName = SERVICE_NAME_MAP[r.services.name]
    if (selected === '전체') return true
    return koreanName?.includes(selected)
  })

  const grouped = filtered.reduce((acc, cur) => {
    const date = new Date(cur.created_at).toISOString().slice(0, 10)
    if (!acc[date]) acc[date] = []
    acc[date].push(cur)
    return acc
  }, {} as Record<string, typeof requests>)

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
        <h1 className="text-[22px] font-bold text-gray-800">나의 서비스</h1>
        <div className="w-7" />
      </header>

      {/* 카테고리 필터 */}
      <div className="overflow-x-auto px-3 py-4 mb-2">
        <div className="flex space-x-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-1.5 rounded-2xl whitespace-nowrap transition-colors ${
                selected === cat
                  ? 'bg-[#FF5A36] text-white'
                  : 'bg-[#F3F3F3] text-gray-800'
              }`}
              onClick={() => setSelected(cat)}
            >
              <span className="text-[15px] font-medium">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 서비스 리스트 */}
      {loading ? (
        <Loading />
      ) : (
        <div className="pb-4">
          {refreshing && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FF5A36]"></div>
            </div>
          )}

          {Object.keys(grouped).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-500 text-base">서비스 요청 내역이 없습니다.</p>
            </div>
          ) : (
            Object.keys(grouped).map((date) => (
              <div key={date} className="mb-2">
                <p className="text-gray-500 text-sm font-semibold px-6 mb-2 mt-2">
                  {date}
                </p>
                {grouped[date].map((service: any) => {
                  const statusConfig = STATUS_CONFIG[service.status as keyof typeof STATUS_CONFIG]
                  const icon = SERVICE_ICONS[service.services.name] || '📦'

                  return (
                    <button
                      key={service.id}
                      className="w-full flex items-center px-6 py-4 bg-white hover:bg-gray-50 transition-colors active:bg-gray-100"
                      onClick={() => router.push(`/my-service/${service.id}`)}
                    >
                      <div className="text-3xl mr-4">{icon}</div>
                      <span className="flex-1 text-left text-[17px] font-bold text-gray-800">
                        {SERVICE_NAME_MAP[service.services.name] || service.services.name}
                      </span>
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-lg"
                        style={{ backgroundColor: statusConfig?.bg }}
                      >
                        {statusConfig?.icon}
                      </div>
                    </button>
                  )
                })}
                <div className="h-px bg-gray-100 mx-4" />
              </div>
            ))
          )}
        </div>
      )}

      {/* Pull to refresh 버튼 (모바일 웹용) */}
      {!loading && (
        <div className="fixed bottom-24 right-6">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="bg-[#FF5A36] text-white p-4 rounded-full shadow-lg hover:bg-[#EB5A36] transition-colors disabled:opacity-50"
          >
            <svg
              className={`w-6 h-6 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
