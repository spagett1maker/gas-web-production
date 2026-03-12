'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { SERVICE_NAME_MAP } from '@/lib/constants'
import { Toast } from '@/components/ui/Toast'
import DateTimeSelector from '@/components/DateTimeSelector'
import {
  ArrowLeft, Clock, Loader2, CheckCircle, XCircle,
  MapPin, Calendar, CreditCard, ChevronRight,
  Package, Minus, Plus, Pencil, X, AlertCircle,
  Flame, Wrench, AlertTriangle, Gauge, Construction,
  FileText, FileCheck, Headphones,
} from 'lucide-react'

/* ─── 데이터 ─── */

const PRICE_MAP: Record<string, number> = {
  '(일반화구) 1열 1구': 19000,
  '(일반화구) 2열 2구': 33000,
  '(일반화구) 3열 3구': 75000,
  '(시그마버너) 1열 1구': 27000,
  '(시그마버너) 2열 2구': 40000,
  '(시그마버너) 3열 3구': 140000,
  '8미리 밸브교체': 15000,
  '공기조절기 교체': 15000,
  '배관 철거': 15000,
  '가스누출점검(기본출장비)': 30000,
}

const SERVICE_ITEMS: Record<string, Array<{ name: string; price: number; image: string }>> = {
  burner: [
    { name: '(일반화구) 1열 1구', price: 19000, image: '/images/burner/1.png' },
    { name: '(일반화구) 2열 2구', price: 33000, image: '/images/burner/2.png' },
    { name: '(일반화구) 3열 3구', price: 75000, image: '/images/burner/3.png' },
    { name: '(시그마버너) 1열 1구', price: 27000, image: '/images/burner/4.png' },
    { name: '(시그마버너) 2열 2구', price: 40000, image: '/images/burner/5.png' },
    { name: '(시그마버너) 3열 3구', price: 140000, image: '/images/burner/6.jpg' },
  ],
  valve: [
    { name: '8미리 밸브교체', price: 15000, image: '/images/valve/1.jpg' },
    { name: '공기조절기 교체', price: 15000, image: '/images/valve/air.png' },
  ],
}

const SERVICE_IMAGES: Record<string, Record<string, string>> = {
  burner: {
    '(일반화구) 1열 1구': '/images/burner/1.png',
    '(일반화구) 2열 2구': '/images/burner/2.png',
    '(일반화구) 3열 3구': '/images/burner/3.png',
    '(시그마버너) 1열 1구': '/images/burner/4.png',
    '(시그마버너) 2열 2구': '/images/burner/5.png',
    '(시그마버너) 3열 3구': '/images/burner/6.jpg',
  },
  valve: {
    '8미리 밸브교체': '/images/valve/1.jpg',
    '공기조절기 교체': '/images/valve/air.png',
  },
}

const STATUS_CONFIG: Record<string, {
  icon: any
  color: string
  bg: string
  gradientFrom: string
  gradientTo: string
  title: string
  desc: string
  animate?: boolean
}> = {
  요청됨: {
    icon: Clock,
    color: '#EB5B37',
    bg: '#FEF2EE',
    gradientFrom: '#FEF2EE',
    gradientTo: '#FDDED5',
    title: '서비스 요청됨',
    desc: '요청하신 서비스를 확인하고 있습니다.',
  },
  진행중: {
    icon: Loader2,
    color: '#3B82F6',
    bg: '#EFF6FF',
    gradientFrom: '#EFF6FF',
    gradientTo: '#DBEAFE',
    title: '서비스 진행중',
    desc: '서비스가 현재 진행 중입니다.',
    animate: true,
  },
  완료: {
    icon: CheckCircle,
    color: '#22C55E',
    bg: '#F0FDF4',
    gradientFrom: '#F0FDF4',
    gradientTo: '#DCFCE7',
    title: '서비스 완료',
    desc: '서비스가 성공적으로 완료되었습니다.',
  },
  취소: {
    icon: XCircle,
    color: '#EF4444',
    bg: '#FEF2F2',
    gradientFrom: '#FEF2F2',
    gradientTo: '#FEE2E2',
    title: '서비스 취소됨',
    desc: '요청하신 서비스가 취소되었습니다.',
  },
}

const SERVICE_ICON_MAP: Record<string, any> = {
  burner: Flame,
  valve: Wrench,
  alarm: AlertTriangle,
  gas: Gauge,
  pipe: Construction,
  quote: FileText,
  contract: FileCheck,
  center: Headphones,
}

const NON_PRICE_FIELDS = ['추가 요청사항', '경보기 종류', '시공 종류', '방문 희망 날짜', '방문 희망 시간', '결제 방법', '가스 종류', '문의내용']

/* ─── 스켈레톤 ─── */

function DetailSkeleton() {
  return (
    <div className="page-with-tabs bg-white">
      <div className="app-header">
        <div className="h-[48px] px-4 flex items-center">
          <div className="skeleton w-6 h-6 rounded-lg" />
        </div>
      </div>
      <div className="page-content">
        <div className="px-5 py-5">
          <div className="skeleton w-32 h-5 rounded-md mb-2" />
          <div className="skeleton w-48 h-4 rounded-md mb-1" />
          <div className="skeleton w-36 h-3 rounded-md" />
        </div>
        <div className="h-2 bg-[#F5F5F7]" />
        <div className="px-5 py-4">
          <div className="skeleton w-full h-[52px] rounded-xl" />
        </div>
        <div className="h-2 bg-[#F5F5F7]" />
        <div className="px-5 py-4 space-y-3">
          <div className="skeleton w-24 h-4 rounded-md" />
          <div className="skeleton w-full h-[48px] rounded-xl" />
          <div className="skeleton w-full h-[48px] rounded-xl" />
        </div>
        <div className="h-2 bg-[#F5F5F7]" />
        <div className="px-5 py-4 space-y-3">
          <div className="skeleton w-20 h-4 rounded-md" />
          <div className="skeleton w-full h-[40px] rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/* ─── 메인 컴포넌트 ─── */

export default function ServiceDetailClient({ id }: { id: string }) {
  const router = useRouter()
  const [request, setRequest] = useState<any>(null)
  const [service, setService] = useState<any>(null)
  const [details, setDetails] = useState<any[]>([])
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showTimeline, setShowTimeline] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [editedDate, setEditedDate] = useState('')
  const [editedTime, setEditedTime] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' })
  const [editedItemCounts, setEditedItemCounts] = useState<Record<string, number>>({})
  const [editedExtraRequest, setEditedExtraRequest] = useState('')
  const [editedAlarmType, setEditedAlarmType] = useState('')
  const [editedQuoteType, setEditedQuoteType] = useState('')
  const [editedPipeType, setEditedPipeType] = useState('')

  /* ─── 데이터 로드 ─── */

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }
      if (!id) return

      const { data: requestData } = await supabase
        .from('service_requests')
        .select('*, services(name)')
        .eq('id', id)
        .single()

      const { data: detailData } = await supabase
        .from('request_details')
        .select('key, value')
        .eq('request_id', id)

      if (requestData?.store_id) {
        const { data: storeData } = await supabase
          .from('stores')
          .select('name, address')
          .eq('id', requestData.store_id)
          .single()
        setStore(storeData)
      }

      setRequest(requestData)
      setService(requestData?.services)
      setDetails(detailData || [])
      setLoading(false)
    }
    fetchData()
  }, [id, router])

  /* ─── 타임라인 스텝 ─── */

  const rawSteps = [
    { label: '서비스 요청', timestamp: request?.created_at },
    { label: '작업 진행', timestamp: request?.working_at },
    { label: '서비스 완료', timestamp: request?.completed_at },
    { label: '취소됨', timestamp: request?.canceled_at },
  ]

  useEffect(() => {
    if (!request) return
    if (request.status === '취소') {
      setCurrentStepIndex(3)
    } else {
      setCurrentStepIndex(rawSteps.findLastIndex((step) => !!step.timestamp))
    }
  }, [request])

  const stepList = rawSteps.map((step, idx) => {
    const dateTime = step.timestamp ? new Date(step.timestamp) : null
    return {
      label: step.label,
      date: dateTime ? `${dateTime.getMonth() + 1}/${dateTime.getDate()}` : '',
      time: dateTime ? dateTime.toTimeString().slice(0, 5) : '',
      inactive: idx > currentStepIndex,
      isActive: idx === currentStepIndex,
    }
  })

  /* ─── 가격 계산 ─── */

  const total = isEditing
    ? Object.entries(editedItemCounts).reduce((sum, [itemName, count]) => {
        return sum + count * (PRICE_MAP[itemName] ?? 0)
      }, 0)
    : details.reduce((sum, d) => {
        if (NON_PRICE_FIELDS.includes(d.key)) return sum
        const count = parseInt(d.value.replace(/[^0-9]/g, '')) || 1
        return sum + count * (PRICE_MAP[d.key] ?? 0)
      }, 0)

  /* ─── 유틸 ─── */

  const getStatusTime = () => {
    if (!request) return ''
    const timeMap: Record<string, string | undefined> = {
      '요청됨': request.created_at,
      '진행중': request.working_at,
      '완료': request.completed_at,
      '취소': request.canceled_at,
    }
    const rawTime = timeMap[request.status]
    if (!rawTime) return ''
    const d = new Date(rawTime)
    return `${d.getMonth() + 1}월 ${d.getDate()}일 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const getItemImage = (key: string) => {
    return SERVICE_IMAGES[service?.name || '']?.[key] || null
  }

  const ServiceIcon = SERVICE_ICON_MAP[service?.name || ''] || Package

  /* ─── 수정 로직 ─── */

  const startEditing = () => {
    const dateDetail = details.find((d) => d.key === '방문 희망 날짜')
    const timeDetail = details.find((d) => d.key === '방문 희망 시간')
    const extraDetail = details.find((d) => d.key === '추가 요청사항')
    const alarmDetail = details.find((d) => d.key === '경보기 종류')
    const quoteDetail = details.find((d) => d.key === '시공 종류')
    const pipeDetail = details.find((d) => d.key === '가스 종류')

    setEditedDate(dateDetail?.value || '')
    setEditedTime(timeDetail?.value || '')
    setEditedExtraRequest(extraDetail?.value || '')
    setEditedAlarmType(alarmDetail?.value || '')
    setEditedQuoteType(quoteDetail?.value || '')
    setEditedPipeType(pipeDetail?.value || '')

    const counts: Record<string, number> = {}
    details
      .filter((d) => !NON_PRICE_FIELDS.includes(d.key))
      .forEach((d) => {
        counts[d.key] = parseInt(d.value.replace(/[^0-9]/g, '')) || 1
      })
    setEditedItemCounts(counts)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditedItemCounts({})
    setEditedExtraRequest('')
    setEditedAlarmType('')
    setEditedQuoteType('')
    setEditedPipeType('')
  }

  const handleItemCount = (itemName: string, diff: number) => {
    setEditedItemCounts((prev) => {
      const newCount = Math.max(0, (prev[itemName] || 0) + diff)
      if (newCount === 0) {
        const { [itemName]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [itemName]: newCount }
    })
  }

  const saveChanges = async () => {
    try {
      const serviceName = service?.name || ''
      const availableItems = SERVICE_ITEMS[serviceName] || []
      if (availableItems.length > 0) {
        if (!Object.values(editedItemCounts).some(count => count > 0)) {
          setToast({ show: true, message: '최소 1개 이상의 품목을 선택해주세요.', type: 'error' })
          return
        }
      }

      if (!editedDate || !editedTime) {
        setToast({ show: true, message: '방문 날짜와 시간을 선택해주세요.', type: 'error' })
        return
      }

      // 날짜/시간 업데이트
      if (details.find((d) => d.key === '방문 희망 날짜')) {
        await supabase.from('request_details').update({ value: editedDate }).eq('request_id', id).eq('key', '방문 희망 날짜')
      }
      if (details.find((d) => d.key === '방문 희망 시간')) {
        await supabase.from('request_details').update({ value: editedTime }).eq('request_id', id).eq('key', '방문 희망 시간')
      }

      // 기존 아이템 삭제 후 재삽입
      const itemKeysToDelete = details
        .filter((d) => !NON_PRICE_FIELDS.includes(d.key))
        .map((d) => d.key)

      if (itemKeysToDelete.length > 0) {
        await supabase.from('request_details').delete().eq('request_id', id).in('key', itemKeysToDelete)
      }

      const newItems = Object.entries(editedItemCounts)
        .filter(([_, count]) => count > 0)
        .map(([itemName, count]) => ({ request_id: id, key: itemName, value: `${count}개` }))

      if (newItems.length > 0) {
        await supabase.from('request_details').insert(newItems)
      }

      // 추가 필드 업데이트
      const fieldUpdates = [
        { key: '추가 요청사항', value: editedExtraRequest },
        { key: '경보기 종류', value: editedAlarmType },
        { key: '시공 종류', value: editedQuoteType },
        { key: '가스 종류', value: editedPipeType },
      ]
      for (const { key, value } of fieldUpdates) {
        if (details.find((d) => d.key === key) && value) {
          await supabase.from('request_details').update({ value }).eq('request_id', id).eq('key', key)
        }
      }

      const { data: detailData } = await supabase.from('request_details').select('key, value').eq('request_id', id)
      setDetails(detailData || [])
      setIsEditing(false)
      setEditedItemCounts({})
      setEditedExtraRequest('')
      setEditedAlarmType('')
      setEditedQuoteType('')
      setEditedPipeType('')
      setToast({ show: true, message: '변경사항이 저장되었습니다.', type: 'success' })
    } catch (error) {
      console.error('저장 실패:', error)
      setToast({ show: true, message: '저장에 실패했습니다.', type: 'error' })
    }
  }

  const cancelOrder = async () => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: '취소', canceled_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error

      const { data: requestData } = await supabase
        .from('service_requests')
        .select('*, services(name)')
        .eq('id', id)
        .single()

      setRequest(requestData)
      setShowCancelModal(false)
      setToast({ show: true, message: '서비스가 취소되었습니다.', type: 'success' })
    } catch (error) {
      console.error('취소 실패:', error)
      setToast({ show: true, message: '취소에 실패했습니다.', type: 'error' })
    }
  }

  /* ─── 로딩 / 에러 ─── */

  if (loading) return <DetailSkeleton />

  if (!request) {
    return (
      <div className="page-with-tabs bg-white">
        <div className="flex flex-col items-center justify-center flex-1 min-h-screen">
          <div className="w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center mb-4">
            <Package className="w-7 h-7 text-[#C7C7CC]" strokeWidth={1.5} />
          </div>
          <p className="text-[15px] text-[#8E8E93]">서비스를 찾을 수 없습니다.</p>
        </div>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[request.status] || STATUS_CONFIG['요청됨']
  const StatusIcon = statusConfig.icon

  const itemDetails = details.filter((d) => !NON_PRICE_FIELDS.includes(d.key) && !['방문 희망 날짜', '방문 희망 시간', '결제 방법'].includes(d.key))
  const dateDetail = details.find((d) => d.key === '방문 희망 날짜')
  const timeDetail = details.find((d) => d.key === '방문 희망 시간')
  const paymentDetail = details.find((d) => d.key === '결제 방법')

  /* ─── 렌더 ─── */

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
            서비스 상세
          </span>
          {request.status === '요청됨' && !isEditing ? (
            <button
              onClick={startEditing}
              className="w-10 h-10 flex items-center justify-center -mr-1 rounded-full active:bg-[#F5F5F7] transition-colors"
            >
              <Pencil className="w-[18px] h-[18px] text-[#8E8E93]" strokeWidth={1.8} />
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>
      </header>

      <main className="page-content">
        {/* 상태 배너 */}
        <section className="px-5 py-5" style={{ backgroundColor: statusConfig.bg }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <StatusIcon
                  className={`w-[18px] h-[18px] ${statusConfig.animate ? 'animate-spin' : ''}`}
                  style={{ color: statusConfig.color }}
                  strokeWidth={2}
                />
                <span
                  className="text-[15px] font-bold tracking-[-0.3px]"
                  style={{ color: statusConfig.color }}
                >
                  {statusConfig.title}
                </span>
              </div>
              <p className="text-[14px] text-[#636366] tracking-[-0.2px] leading-[1.5] mt-1">
                {statusConfig.desc}
              </p>
              <p className="text-[12px] text-[#8E8E93] tracking-[-0.2px] mt-1.5">
                {getStatusTime()}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center ml-4 flex-shrink-0"
              style={{ backgroundColor: `${statusConfig.color}12` }}
            >
              <ServiceIcon
                className="w-6 h-6"
                style={{ color: statusConfig.color }}
                strokeWidth={1.5}
              />
            </div>
          </div>
        </section>

        <div className="h-2 bg-[#F5F5F7]" />

        {/* 가게 정보 + 타임라인 */}
        <section>
          <div className="px-5 py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-[12px] bg-[#F5F5F7] flex items-center justify-center mr-3 flex-shrink-0">
                <MapPin className="w-[18px] h-[18px] text-[#8E8E93]" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-[#1A1A1A] tracking-[-0.3px]">
                  {store?.name || '가게 정보 없음'}
                </p>
                <p className="text-[13px] text-[#8E8E93] tracking-[-0.2px] truncate">
                  {store?.address || '주소 정보 없음'}
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#F2F2F7] mx-5" />

          {/* 타임라인 버튼 */}
          <button
            onClick={() => setShowTimeline(true)}
            className="w-full px-5 py-3.5 flex items-center justify-between active:bg-[#F9F9F9] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-[16px] h-[16px] text-[#8E8E93]" strokeWidth={1.8} />
              <span className="text-[14px] text-[#636366] tracking-[-0.2px]">처리 기록 보기</span>
            </div>
            <ChevronRight className="w-[16px] h-[16px] text-[#D1D1D6]" strokeWidth={2} />
          </button>
        </section>

        <div className="h-2 bg-[#F5F5F7]" />

        {/* 서비스 항목 */}
        <section className="px-5 pt-5 pb-2">
          <h3 className="text-[15px] font-bold text-[#1A1A1A] tracking-[-0.3px] mb-4">
            {SERVICE_NAME_MAP[service?.name] || service?.name || '서비스'}
          </h3>

            {isEditing ? (
              /* 수정 모드 */
              <div className="space-y-2.5">
                <div className="bg-[#EFF6FF] rounded-xl px-3.5 py-3 flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-[#3B82F6] flex-shrink-0" strokeWidth={2} />
                  <p className="text-[13px] text-[#3B82F6] tracking-[-0.2px] font-medium">품목을 새로 선택하세요</p>
                </div>

                {(SERVICE_ITEMS[service?.name || ''] || []).map((item) => {
                  const count = editedItemCounts[item.name] || 0
                  return (
                    <div
                      key={item.name}
                      className={`rounded-2xl p-3.5 transition-all ${
                        count > 0
                          ? 'bg-[#FEF2EE] ring-1 ring-[#EB5B37]/20'
                          : 'bg-[#FAFAFA]'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-white rounded-xl mr-3 flex-shrink-0 relative overflow-hidden">
                          <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-[#1A1A1A] tracking-[-0.3px]">{item.name}</p>
                          <p className="text-[13px] font-bold text-[#EB5B37] mt-0.5">{item.price.toLocaleString()}원</p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => handleItemCount(item.name, -1)}
                            disabled={count === 0}
                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
                          >
                            <Minus className="w-4 h-4 text-[#8E8E93]" strokeWidth={2} />
                          </button>
                          <span className="text-[16px] font-bold text-[#1A1A1A] w-5 text-center">{count}</span>
                          <button
                            onClick={() => handleItemCount(item.name, 1)}
                            className="w-8 h-8 rounded-full bg-[#EB5B37] flex items-center justify-center text-white active:scale-90 transition-transform"
                          >
                            <Plus className="w-4 h-4" strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* 보기 모드 */
              <div className="space-y-0">
                {itemDetails.map((item, idx) => {
                  const itemImage = getItemImage(item.key)
                  return (
                    <div
                      key={idx}
                      className={`flex items-center py-3 ${idx < itemDetails.length - 1 ? 'border-b border-[#F5F5F7]' : ''}`}
                    >
                      {itemImage && (
                        <div className="w-11 h-11 bg-[#F5F5F7] rounded-xl mr-3 flex-shrink-0 relative overflow-hidden">
                          <Image src={itemImage} alt={item.key} fill className="object-contain p-1" />
                        </div>
                      )}
                      <span className="flex-1 text-[14px] text-[#636366] tracking-[-0.2px]">{item.key}</span>
                      <span className="text-[14px] font-bold text-[#1A1A1A] tracking-[-0.2px] ml-2">{item.value}</span>
                    </div>
                  )
                })}

                {/* 추가 요청사항 등 텍스트 필드 */}
                {details
                  .filter((d) => ['추가 요청사항', '경보기 종류', '시공 종류', '가스 종류', '문의내용'].includes(d.key))
                  .map((item, idx) => (
                    <div key={idx} className="flex items-center py-3 border-t border-[#F5F5F7]">
                      <span className="text-[14px] text-[#636366] tracking-[-0.2px]">{item.key}</span>
                      <span className="flex-1 text-[14px] text-[#1A1A1A] tracking-[-0.2px] text-right ml-4">{item.value}</span>
                    </div>
                  ))}
              </div>
            )}
        </section>

        <div className="h-2 bg-[#F5F5F7]" />

        {/* 방문 일정 */}
        {(dateDetail || timeDetail) && (
          <>
            <section className="px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-[16px] h-[16px] text-[#EB5B37]" strokeWidth={2} />
                <h4 className="text-[14px] font-bold text-[#1A1A1A] tracking-[-0.3px]">방문 일정</h4>
              </div>
              {isEditing ? (
                <DateTimeSelector
                  selectedDate={editedDate}
                  selectedTime={editedTime}
                  onDateChange={setEditedDate}
                  onTimeChange={setEditedTime}
                />
              ) : (
                <div className="space-y-0">
                  {dateDetail && (
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-[14px] text-[#8E8E93] tracking-[-0.2px]">날짜</span>
                      <span className="text-[14px] font-semibold text-[#1A1A1A] tracking-[-0.2px]">{dateDetail.value}</span>
                    </div>
                  )}
                  {dateDetail && timeDetail && <div className="h-px bg-[#F5F5F7]" />}
                  {timeDetail && (
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-[14px] text-[#8E8E93] tracking-[-0.2px]">시간</span>
                      <span className="text-[14px] font-semibold text-[#1A1A1A] tracking-[-0.2px]">{timeDetail.value}</span>
                    </div>
                  )}
                </div>
              )}
            </section>
            <div className="h-2 bg-[#F5F5F7]" />
          </>
        )}

        {/* 결제 방법 */}
        {paymentDetail && (
          <>
            <section className="px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-[16px] h-[16px] text-[#EB5B37]" strokeWidth={2} />
                <h4 className="text-[14px] font-bold text-[#1A1A1A] tracking-[-0.3px]">결제 방법</h4>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[14px] text-[#8E8E93] tracking-[-0.2px]">결제 수단</span>
                <span className="text-[14px] font-semibold text-[#1A1A1A] tracking-[-0.2px]">{paymentDetail.value}</span>
              </div>
            </section>
            <div className="h-2 bg-[#F5F5F7]" />
          </>
        )}

        {/* 합계 금액 */}
        {total > 0 && (
          <>
            <section className="px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold text-[#1A1A1A] tracking-[-0.3px]">예상 금액</span>
                <span className="text-[20px] font-bold text-[#EB5B37] tracking-[-0.5px]">{total.toLocaleString()}원</span>
              </div>
            </section>
            <div className="h-2 bg-[#F5F5F7]" />
          </>
        )}

        {/* 하단 액션 버튼 */}
        {request.status === '요청됨' && !isEditing && (
          <section className="px-5 py-5">
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full h-[48px] rounded-xl bg-[#F5F5F7] text-[15px] font-semibold text-[#8E8E93] tracking-[-0.3px] active:bg-[#EBEBED] active:scale-[0.98] transition-all"
            >
              서비스 취소하기
            </button>
          </section>
        )}

        {isEditing && (
          <section className="px-5 py-5 flex gap-3">
            <button
              onClick={cancelEditing}
              className="flex-1 h-[48px] rounded-xl bg-[#F5F5F7] text-[15px] font-semibold text-[#636366] tracking-[-0.3px] active:bg-[#EBEBED] active:scale-[0.98] transition-all"
            >
              취소
            </button>
            <button
              onClick={saveChanges}
              className="flex-1 h-[48px] rounded-xl bg-[#EB5B37] text-[15px] font-semibold text-white tracking-[-0.3px] active:bg-[#D9482A] active:scale-[0.98] transition-all"
            >
              저장하기
            </button>
          </section>
        )}

        {/* 하단 여백 */}
        <div className="h-4" />
      </main>

      {/* ─── 타임라인 바텀시트 ─── */}
      {showTimeline && (
        <TimelineSheet
          stepList={stepList}
          requestId={request.id}
          statusColor={statusConfig.color}
          onClose={() => setShowTimeline(false)}
        />
      )}

      {/* ─── 취소 확인 바텀시트 ─── */}
      {showCancelModal && (
        <CancelSheet
          onCancel={cancelOrder}
          onClose={() => setShowCancelModal(false)}
        />
      )}

      {/* ─── 토스트 ─── */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  )
}

/* ─── 타임라인 바텀시트 ─── */

function TimelineSheet({
  stepList,
  requestId,
  statusColor,
  onClose,
}: {
  stepList: Array<{ label: string; date: string; time: string; inactive: boolean; isActive: boolean }>
  requestId: string
  statusColor: string
  onClose: () => void
}) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setShow(true))
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [])

  const handleClose = () => {
    setShow(false)
    setTimeout(onClose, 300)
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${show ? 'opacity-50' : 'opacity-0'}`}
        onClick={handleClose}
      />
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] transition-transform duration-[340ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
          show ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'var(--safe-area-bottom, 0px)' }}
      >
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 bg-[#E0E0E0] rounded-full" />
        </div>

        <div className="px-5 pt-3 pb-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[17px] font-bold text-[#1A1A1A] tracking-[-0.3px]">처리 기록</h3>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full active:bg-[#F5F5F7] transition-colors"
            >
              <X className="w-5 h-5 text-[#8E8E93]" strokeWidth={2} />
            </button>
          </div>

          {/* ID */}
          <div className="bg-[#FAFAFA] rounded-xl px-4 py-3 mb-5 flex items-center justify-between">
            <span className="text-[13px] text-[#8E8E93] tracking-[-0.2px]">서비스 ID</span>
            <span className="text-[13px] font-bold text-[#1A1A1A] tracking-[-0.2px] font-mono">
              {requestId.slice(0, 4)}-{requestId.slice(-4)}
            </span>
          </div>

          {/* 타임라인 */}
          <div className="space-y-0">
            {stepList.map((step, idx) => {
              const isLast = idx === stepList.length - 1
              return (
                <div key={idx} className="flex items-start">
                  {/* 도트 + 라인 */}
                  <div className="flex flex-col items-center mr-4 pt-1.5">
                    <div
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        step.isActive ? '' : step.inactive ? 'bg-[#E5E5EA]' : 'bg-[#C7C7CC]'
                      }`}
                      style={step.isActive ? { backgroundColor: statusColor } : undefined}
                    />
                    {!isLast && (
                      <div className={`w-px h-12 ${step.inactive ? 'bg-[#F2F2F7]' : 'bg-[#E5E5EA]'}`} />
                    )}
                  </div>

                  {/* 콘텐츠 */}
                  <div className={`flex-1 pb-4 ${isLast ? '' : ''}`}>
                    <p className={`text-[14px] tracking-[-0.2px] ${
                      step.isActive ? 'font-bold text-[#1A1A1A]' : step.inactive ? 'text-[#C7C7CC]' : 'text-[#8E8E93]'
                    }`}>
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-[12px] text-[#C7C7CC] tracking-[-0.2px] mt-0.5">
                        {step.date} {step.time}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── 취소 확인 바텀시트 ─── */

function CancelSheet({
  onCancel,
  onClose,
}: {
  onCancel: () => void
  onClose: () => void
}) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setShow(true))
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [])

  const handleClose = () => {
    setShow(false)
    setTimeout(onClose, 300)
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${show ? 'opacity-50' : 'opacity-0'}`}
        onClick={handleClose}
      />
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] transition-transform duration-[340ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
          show ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'var(--safe-area-bottom, 0px)' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 bg-[#E0E0E0] rounded-full" />
        </div>

        <div className="px-6 pt-4 pb-5">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-[#FEF2F2] rounded-full flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-7 h-7 text-[#EF4444]" strokeWidth={1.5} />
            </div>
            <h3 className="text-[18px] font-bold text-[#1A1A1A] tracking-[-0.4px] mb-1">
              서비스를 취소할까요?
            </h3>
            <p className="text-[14px] text-[#8E8E93] tracking-[-0.2px]">
              취소 후에는 되돌릴 수 없습니다.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 h-[52px] rounded-xl bg-[#F5F5F7] text-[16px] font-semibold text-[#636366] tracking-[-0.3px] active:bg-[#EBEBED] active:scale-[0.98] transition-all"
            >
              돌아가기
            </button>
            <button
              onClick={onCancel}
              className="flex-1 h-[52px] rounded-xl bg-[#EF4444] text-[16px] font-semibold text-white tracking-[-0.3px] active:bg-[#DC2626] active:scale-[0.98] transition-all"
            >
              취소하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
