'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SERVICE_NAME_MAP } from '@/lib/constants'
import { Loading } from '@/components/ui/Loading'
import { ADMIN_USER_ID } from '@/lib/constants'

const CATEGORIES = ['전체', '요청됨', '작업 시행 중', '서비스 완료', '서비스 취소됨']

const STATUS_KOR_TO_ENG: Record<string, string> = {
  요청됨: '요청됨',
  '작업 시행 중': '진행중',
  '서비스 완료': '완료',
  '서비스 취소됨': '취소',
}

const STATUS_CONFIG = {
  요청됨: { color: '#90CAF9', bg: '#E3F2FD', icon: '📍' },
  진행중: { color: '#FFD36F', bg: '#FFF7E0', icon: '⏸️' },
  완료: { color: '#4DD0A1', bg: '#E0F7EF', icon: '✅' },
  취소: { color: '#FF6B6B', bg: '#FFEAEA', icon: '❌' },
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

export default function AdminServicePage() {
  const [selected, setSelected] = useState('전체')
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchRequests = async () => {
    // 관리자 권한 체크
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== ADMIN_USER_ID) {
      router.push('/')
      return
    }

    const { data, error } = await supabase
      .from('service_requests')
      .select(`
        id,
        status,
        created_at,
        stores(name),
        services(name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('서비스 요청 로드 실패:', error.message)
    } else {
      setRequests(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const filtered = requests.filter((r) => {
    if (selected === '전체') return true
    return r.status === STATUS_KOR_TO_ENG[selected]
  })

  const grouped = filtered.reduce((acc, cur) => {
    const date = new Date(cur.created_at).toISOString().slice(0, 10)
    if (!acc[date]) acc[date] = []
    acc[date].push(cur)
    return acc
  }, {} as Record<string, typeof requests>)

  return (
    <div className="page-without-tabs bg-white">
      {/* 상단 헤더 */}
      <header className="app-header">
        <div className="h-[52px] px-5 flex items-center justify-between">
          <div className="w-7" />
          <h1 className="text-[22px] font-bold text-gray-800">서비스 관리</h1>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.replace('/login')
            }}
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </header>

      <div className="page-content">
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
          {Object.keys(grouped).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-500 text-base">서비스 요청이 없습니다.</p>
            </div>
          ) : (
            Object.keys(grouped).map((date) => (
              <div key={date} className="mb-2">
                <p className="text-gray-500 text-sm font-semibold px-6 mb-2 mt-2">
                  {date}
                </p>
                {grouped[date].map((service: any) => {
                  const statusConfig =
                    STATUS_CONFIG[service.status as keyof typeof STATUS_CONFIG]
                  const icon = SERVICE_ICONS[service.services?.name] || '📦'
                  const storeName = Array.isArray(service.stores)
                    ? service.stores[0]?.name
                    : service.stores?.name
                  const serviceName = Array.isArray(service.services)
                    ? service.services[0]?.name
                    : service.services?.name

                  return (
                    <button
                      key={service.id}
                      className="w-full flex items-center px-6 py-4 bg-white hover:bg-gray-50 transition-colors active:bg-gray-100"
                      onClick={() => router.push(`/admin/service/detail?id=${service.id}`)}
                    >
                      <div className="text-3xl mr-4">{icon}</div>
                      <span className="flex-1 text-left text-[17px] font-bold text-gray-800">
                        {`${storeName || '가게명 없음'} - ${
                          SERVICE_NAME_MAP[serviceName] || serviceName
                        }`}
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
      </div>
    </div>
  )
}
