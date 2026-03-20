'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SERVICE_NAME_MAP } from '@/lib/constants'
import {
  Clock, CheckCircle, XCircle, Loader2, ChevronRight, RefreshCw,
  Calendar
} from 'lucide-react'

const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string; text: string; animate?: boolean }> = {
  '요청됨': { icon: Clock, color: '#EB5B37', bg: '#FEF2EE', text: '요청됨' },
  '진행중': { icon: Loader2, color: '#3B82F6', bg: '#EFF6FF', text: '진행중', animate: true },
  '완료': { icon: CheckCircle, color: '#22C55E', bg: '#F0FDF4', text: '완료' },
  '취소': { icon: XCircle, color: '#EF4444', bg: '#FEF2F2', text: '취소' },
}

const SERVICE_IMAGES: Record<string, string> = {
  'burner': '/main/화구교체_bright.png',
  'valve': '/main/밸브_bright.png',
  'alarm': '/main/경보기_bright.png',
  'gas': '/main/가스누출_bright.png',
  'pipe': '/main/배관_bright.png',
  'quote': '/main/시공견적_bright.png',
  'contract': '/main/정기계약_bright.png',
  'center': '/main/고객센터_bright.png',
  'clean': '/main/cleaning_tight.png',
}

const getServiceImage = (serviceName: string) => {
  for (const [key, image] of Object.entries(SERVICE_IMAGES)) {
    if (serviceName.includes(key)) return image
  }
  return null
}

function SkeletonLoader() {
  return (
    <div className="page-with-tabs bg-white">
      <div className="app-header">
        <div className="h-[48px] px-5 flex items-center justify-between">
          <div className="skeleton w-24 h-5 rounded-lg" />
          <div className="skeleton w-9 h-9 rounded-full" />
        </div>
      </div>
      <div className="page-content">
        {/* 요약 */}
        <div className="px-5 py-5">
          <div className="flex justify-around">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="skeleton w-10 h-7 rounded-lg" />
                <div className="skeleton w-10 h-3 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="h-2 bg-[#F5F5F7]" />
        {/* 필터 */}
        <div className="px-5 py-3">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton w-16 h-8 rounded-full" />
            ))}
          </div>
        </div>
        {/* 리스트 */}
        <div className="px-5 space-y-0">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton w-full h-[72px] rounded-none" style={{ borderRadius: 0 }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MyServicePage() {
  const [activeTab, setActiveTab] = useState<'진행중' | '완료'>('진행중')
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

  const inProgress = requests.filter(r => r.status === '요청됨' || r.status === '진행중')
  const completed = requests.filter(r => r.status === '완료' || r.status === '취소')

  const displayList = activeTab === '진행중' ? inProgress : completed

  if (loading) return <SkeletonLoader />

  return (
    <div className="page-with-tabs bg-white">
      {/* 헤더 */}
      <header className="app-header">
        <div className="h-[48px] px-5 flex items-center justify-between">
          <span className="text-[17px] font-semibold tracking-[-0.3px] text-[#1A1A1A]">
            나의 서비스
          </span>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="w-9 h-9 flex items-center justify-center rounded-full active:bg-[#F5F5F7] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-[20px] h-[20px] text-[#1A1A1A] ${refreshing ? 'animate-spin' : ''}`} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <main className="page-content">
        {/* 탭 네비게이션 - 세탁특공대 스타일 */}
        <div className="flex border-b border-[#F2F2F7]">
          {(['진행중', '완료'] as const).map((tab) => {
            const count = tab === '진행중' ? inProgress.length : completed.length
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3.5 text-center text-[16px] font-bold tracking-[-0.3px] transition-colors relative ${
                  activeTab === tab ? 'text-[#1A1A1A]' : 'text-[#C7C7CC]'
                }`}
              >
                {tab === '진행중' ? '진행중인 서비스' : '지난 서비스'}
                {count > 0 && (
                  <span className={`ml-1 text-[14px] ${activeTab === tab ? 'text-[#EB5B37]' : 'text-[#C7C7CC]'}`}>
                    {count}
                  </span>
                )}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#1A1A1A] rounded-full" />
                )}
              </button>
            )
          })}
        </div>

        {/* 서비스 리스트 */}
        {displayList.length === 0 ? (
          /* 빈 상태 */
          <div className="flex flex-col items-center justify-center pt-20 pb-20">
            <div className="w-20 h-20 bg-[#F5F5F7] rounded-full flex items-center justify-center mb-5">
              <Calendar className="w-9 h-9 text-[#C7C7CC]" strokeWidth={1.5} />
            </div>
            <p className="text-[17px] font-bold text-[#1A1A1A] tracking-[-0.3px] mb-1.5">
              {activeTab === '진행중' ? '진행중인 서비스가 없습니다' : '지난 서비스가 없습니다'}
            </p>
            <p className="text-[14px] text-[#8E8E93] tracking-[-0.2px] mb-7">
              {activeTab === '진행중' ? '서비스를 신청해보세요' : '완료된 서비스가 여기에 표시됩니다'}
            </p>
            {activeTab === '진행중' && (
              <button
                onClick={() => router.push('/home')}
                className="h-[44px] px-6 bg-[#1A1A1A] text-white text-[15px] font-semibold rounded-xl active:bg-[#333] active:scale-[0.98] transition-all"
              >
                서비스 신청하기
              </button>
            )}
          </div>
        ) : (
          <div>
            {displayList.map((service: any, index: number) => (
              <ServiceRow
                key={service.id}
                service={service}
                index={index}
                dimmed={activeTab === '완료'}
                isLast={index === displayList.length - 1}
                onClick={() => router.push(`/my-service/detail?id=${service.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

/* ─── 서비스 로우 (flat list item) ─── */
function ServiceRow({
  service,
  index,
  dimmed,
  isLast,
  onClick,
}: {
  service: any
  index: number
  dimmed: boolean
  isLast: boolean
  onClick: () => void
}) {
  const statusConfig = STATUS_CONFIG[service.status]
  const StatusIcon = statusConfig?.icon || Clock
  const serviceImage = getServiceImage(service.services.name)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${month}월 ${day}일 ${hours}:${minutes}`
  }

  return (
    <button
      className={`w-full flex items-center px-5 py-3.5 active:bg-[#F9F9F9] transition-colors ${
        !isLast ? 'border-b border-[#F2F2F7]' : ''
      }`}
      onClick={onClick}
    >
      {/* 서비스 이미지 */}
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-3.5 flex-shrink-0 overflow-hidden bg-[#F5F5F7] ${
          dimmed ? 'opacity-40 grayscale' : ''
        }`}
      >
        {serviceImage ? (
          <img
            src={serviceImage}
            alt=""
            className="w-full h-full object-contain p-1"
            draggable={false}
          />
        ) : (
          <Calendar className="w-5 h-5 text-[#8E8E93]" strokeWidth={1.8} />
        )}
      </div>

      {/* 서비스 정보 */}
      <div className="flex-1 text-left min-w-0">
        <h3 className={`text-[15px] font-semibold tracking-[-0.3px] mb-0.5 ${
          dimmed ? 'text-[#8E8E93]' : 'text-[#1A1A1A]'
        }`}>
          {SERVICE_NAME_MAP[service.services.name] || service.services.name}
        </h3>
        <p className={`text-[13px] tracking-[-0.2px] ${
          dimmed ? 'text-[#C7C7CC]' : 'text-[#8E8E93]'
        }`}>
          {formatDate(service.created_at)}
        </p>
      </div>

      {/* 상태 뱃지 */}
      <div
        className="flex items-center gap-1 px-2.5 py-1 rounded-full mr-1.5 flex-shrink-0"
        style={{ backgroundColor: statusConfig?.bg }}
      >
        <StatusIcon
          className={`w-3 h-3 ${statusConfig?.animate ? 'animate-spin' : ''}`}
          style={{ color: statusConfig?.color }}
          strokeWidth={2.5}
        />
        <span
          className="text-[11px] font-bold tracking-[-0.2px]"
          style={{ color: statusConfig?.color }}
        >
          {statusConfig?.text}
        </span>
      </div>

      <ChevronRight className="w-4.5 h-4.5 text-[#D1D1D6] flex-shrink-0" strokeWidth={2} />
    </button>
  )
}
