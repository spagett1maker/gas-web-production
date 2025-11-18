'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { SERVICE_NAME_MAP } from '@/lib/constants'
import { Loading } from '@/components/ui/Loading'
import { Modal } from '@/components/ui/Modal'

// 가격 정보 (가격이 있는 서비스만)
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

// 서비스별 이미지 맵핑
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

const STATUS_CONFIG = {
  요청됨: {
    bgColor: '#EFF6FF',
    title: '서비스 요청됨',
    desc: '요청하신 서비스를 확인하고 있습니다.',
  },
  진행중: {
    bgColor: '#FEF3C7',
    title: '작업 시행 중',
    desc: '서비스가 현재 진행 중입니다.',
  },
  완료: {
    bgColor: '#D1FAE5',
    title: '서비스 완료',
    desc: '서비스가 성공적으로 완료되었습니다.',
  },
  취소: {
    bgColor: '#FEE2E2',
    title: '서비스 취소됨',
    desc: '요청하신 서비스가 취소되었습니다.',
  },
}

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [request, setRequest] = useState<any>(null)
  const [service, setService] = useState<any>(null)
  const [details, setDetails] = useState<any[]>([])
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }

      if (!params.id) return

      // 서비스 요청 정보 가져오기
      const { data: requestData } = await supabase
        .from('service_requests')
        .select('*, services(name)')
        .eq('id', params.id)
        .single()

      // 요청 상세 정보 가져오기
      const { data: detailData } = await supabase
        .from('request_details')
        .select('key, value')
        .eq('request_id', params.id)

      // 가게 정보 가져오기
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
  }, [params.id, router])

  const rawSteps = [
    { label: '요청됨', timestamp: request?.created_at },
    { label: '작업 시행 중', timestamp: request?.working_at },
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
      date: dateTime
        ? dateTime.toISOString().slice(5, 10).replace('-', '/')
        : '',
      time: dateTime ? dateTime.toTimeString().slice(0, 5) : '',
      inactive: idx > currentStepIndex,
      isActive: idx === currentStepIndex,
    }
  })

  if (loading) {
    return <Loading />
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="body text-secondary">서비스를 찾을 수 없습니다.</p>
      </div>
    )
  }

  const statusConfig =
    STATUS_CONFIG[request?.status as keyof typeof STATUS_CONFIG] ||
    STATUS_CONFIG['요청됨']

  // 전체 가격 계산
  const total = details.reduce((sum, d) => {
    const key = d.key || ''

    // 가격이 없는 필드들은 제외
    const nonPriceFields = ['추가 요청사항', '경보기 종류', '시공 종류']
    if (nonPriceFields.includes(key)) {
      return sum
    }

    const count = parseInt(d.value.replace(/[^0-9]/g, '')) || 1
    const unitPrice = PRICE_MAP[key] ?? 0
    return sum + count * unitPrice
  }, 0)

  const getStatusTime = () => {
    if (!request) return ''
    let rawTime: string | null | undefined = null

    switch (request.status) {
      case '요청됨':
        rawTime = request.created_at
        break
      case '진행중':
        rawTime = request.working_at
        break
      case '완료':
        rawTime = request.completed_at
        break
      case '취소':
        rawTime = request.canceled_at
        break
      default:
        return ''
    }

    if (!rawTime) return ''
    const dateObj = new Date(rawTime)
    const date = dateObj.toISOString().slice(0, 10).replace(/-/g, '/')
    const time = dateObj.toTimeString().slice(0, 5)
    return `${date}, ${time}`
  }

  // 아이템 이미지 가져오기
  const getItemImage = (key: string) => {
    const serviceName = service?.name || ''
    return SERVICE_IMAGES[serviceName]?.[key] || null
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 상단 헤더 */}
      <header className="pt-6 pb-4 px-6 flex items-center justify-between bg-background border-b border-[var(--color-border)] sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg
            className="w-7 h-7 text-primary"
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
        <h1 className="heading-2 text-primary">세부정보</h1>
        <div className="w-7" />
      </header>

      <div className="px-6 py-6 space-y-4">
        {/* 상태 안내 */}
        <div
          className="p-5 flex items-center rounded-2xl shadow-sm"
          style={{ backgroundColor: statusConfig.bgColor }}
        >
          <div className="flex-1">
            <p className="heading-3 text-primary mb-1">
              {statusConfig.title}
            </p>
            <p className="body-sm text-secondary">{statusConfig.desc}</p>
          </div>
          <div className="w-18 h-18 relative flex-shrink-0 ml-4">
            <Image
              src="/images/star.png"
              alt="star"
              width={72}
              height={72}
              className="object-contain"
            />
          </div>
        </div>

        {/* 가게 정보 */}
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
          <p className="body font-semibold text-primary mb-2">
            {store?.name || '가게 정보 없음'}
          </p>
          <div className="flex items-center text-secondary body-sm">
            <svg
              className="w-4 h-4 text-primary mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{store?.address || '주소 정보 없음'}</span>
          </div>
        </div>

        {/* 상태 정보 */}
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-secondary mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="body-sm text-primary">
                {statusConfig.title} : {getStatusTime()}
              </span>
            </div>
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* 요청 항목 */}
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
          <p className="heading-3 text-primary mb-4">
            {SERVICE_NAME_MAP[service?.name] || service?.name || '서비스'}
          </p>
          <div className="space-y-3 mb-4">
            {details
              .filter((item) => !['방문 희망 날짜', '방문 희망 시간', '결제 방법'].includes(item.key))
              .map((item, idx) => {
                const itemImage = getItemImage(item.key)
                const isExtraRequest = item.key === '추가 요청사항'
                const isSelectionField = ['경보기 종류', '시공 종류'].includes(item.key)

                return (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      {itemImage && (
                        <div className="w-12 h-12 bg-surface rounded-lg mr-3 flex-shrink-0 relative overflow-hidden">
                          <Image
                            src={itemImage}
                            alt={item.key}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <span className="body text-secondary">{item.key}</span>
                        {isExtraRequest && (
                          <p className="body-sm text-tertiary mt-1">{item.value}</p>
                        )}
                        {isSelectionField && (
                          <p className="body-sm font-medium text-primary mt-1">{item.value}</p>
                        )}
                      </div>
                    </div>
                    {!isExtraRequest && !isSelectionField && (
                      <span className="bg-primary-light rounded-full px-3 py-1 text-primary caption font-bold ml-2">
                        {item.value}
                      </span>
                    )}
                  </div>
                )
              })}
          </div>
        </div>

        {/* 방문 정보 */}
        {(details.find((d) => d.key === '방문 희망 날짜') ||
          details.find((d) => d.key === '방문 희망 시간')) && (
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center mb-3">
              <svg
                className="w-5 h-5 text-primary mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="body font-bold text-primary">방문 일정</p>
            </div>
            <div className="space-y-2">
              {details
                .filter((d) =>
                  ['방문 희망 날짜', '방문 희망 시간'].includes(d.key)
                )
                .map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="body-sm text-secondary">{item.key}</span>
                    <span className="body-sm font-semibold text-primary">
                      {item.value}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 결제 방법 */}
        {details.find((d) => d.key === '결제 방법') && (
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center mb-3">
              <svg
                className="w-5 h-5 text-primary mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <p className="body font-bold text-primary">결제 방법</p>
            </div>
            <p className="body font-semibold text-primary">
              {details.find((d) => d.key === '결제 방법')?.value}
            </p>
          </div>
        )}

        {/* 전체 요청 금액 */}
        {total > 0 && (
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <p className="body font-bold text-primary">전체 요청</p>
            <p className="heading-3 text-primary">
              {total.toLocaleString()}원
            </p>
          </div>
        )}
      </div>

      {/* 타임라인 모달 */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="요청 처리 기록">
        <div className="py-2">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-[var(--color-border)]">
            <p className="body-sm text-secondary">서비스 처리 ID</p>
            <p className="body font-bold text-primary">
              {request?.id?.slice(0, 4)}-{request?.id?.slice(-4)}
            </p>
          </div>

          <div className="space-y-0">
            {stepList.map((step, idx) => {
              const isLast = idx === stepList.length - 1
              return (
                <div key={idx} className="flex items-start">
                  {/* 날짜/시간 */}
                  <div className="w-12 text-right mr-3">
                    <p className="body-sm font-medium text-primary">
                      {step.date}
                    </p>
                    <p className="caption text-tertiary">{step.time}</p>
                  </div>

                  {/* 타임라인 */}
                  <div className="flex flex-col items-center mr-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        step.isActive ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    />
                    {!isLast && <div className="w-0.5 h-16 bg-[var(--color-border)]" />}
                  </div>

                  {/* 상태 박스 */}
                  <div className="flex-1 rounded-xl px-4 py-3 bg-surface -mt-1">
                    <p
                      className={`body-sm ${
                        step.isActive ? 'text-primary font-bold' : 'text-secondary'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Modal>
    </div>
  )
}
