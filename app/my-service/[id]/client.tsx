'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { SERVICE_NAME_MAP } from '@/lib/constants'
import { Loading } from '@/components/ui/Loading'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'
import DateTimeSelector from '@/components/DateTimeSelector'

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

const SERVICE_ITEMS: Record<string, Array<{ name: string, price: number, image: string }>> = {
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

export default function ServiceDetailClient({ id }: { id: string }) {
  const router = useRouter()
  const [request, setRequest] = useState<any>(null)
  const [service, setService] = useState<any>(null)
  const [details, setDetails] = useState<any[]>([])
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [editedDetails, setEditedDetails] = useState<any[]>([])
  const [editedDate, setEditedDate] = useState('')
  const [editedTime, setEditedTime] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' })
  const [editedItemCounts, setEditedItemCounts] = useState<Record<string, number>>({})
  const [editedExtraRequest, setEditedExtraRequest] = useState('')
  const [editedAlarmType, setEditedAlarmType] = useState('')
  const [editedQuoteType, setEditedQuoteType] = useState('')
  const [editedPipeType, setEditedPipeType] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }

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

  const total = isEditing
    ? Object.entries(editedItemCounts).reduce((sum, [itemName, count]) => {
        const unitPrice = PRICE_MAP[itemName] ?? 0
        return sum + count * unitPrice
      }, 0)
    : details.reduce((sum, d) => {
        const key = d.key || ''
        const nonPriceFields = ['추가 요청사항', '경보기 종류', '시공 종류', '방문 희망 날짜', '방문 희망 시간', '결제 방법']
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

  const getItemImage = (key: string) => {
    const serviceName = service?.name || ''
    return SERVICE_IMAGES[serviceName]?.[key] || null
  }

  const startEditing = () => {
    setEditedDetails([...details])
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
      .filter((d) => !['방문 희망 날짜', '방문 희망 시간', '결제 방법', '추가 요청사항', '경보기 종류', '시공 종류', '가스 종류'].includes(d.key))
      .forEach((d) => {
        const count = parseInt(d.value.replace(/[^0-9]/g, '')) || 1
        counts[d.key] = count
      })
    setEditedItemCounts(counts)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditedDetails([])
    setEditedDate('')
    setEditedTime('')
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
        const hasSelectedItems = Object.values(editedItemCounts).some(count => count > 0)
        if (!hasSelectedItems) {
          setToast({ show: true, message: '최소 1개 이상의 품목을 선택해주세요.', type: 'error' })
          return
        }
      }

      if (!editedDate || !editedTime) {
        setToast({ show: true, message: '방문 날짜와 시간을 선택해주세요.', type: 'error' })
        return
      }

      const dateDetail = details.find((d) => d.key === '방문 희망 날짜')
      const timeDetail = details.find((d) => d.key === '방문 희망 시간')

      if (dateDetail) {
        await supabase
          .from('request_details')
          .update({ value: editedDate })
          .eq('request_id', id)
          .eq('key', '방문 희망 날짜')
      }

      if (timeDetail) {
        await supabase
          .from('request_details')
          .update({ value: editedTime })
          .eq('request_id', id)
          .eq('key', '방문 희망 시간')
      }

      const itemKeysToDelete = details
        .filter((d) => !['방문 희망 날짜', '방문 희망 시간', '결제 방법', '추가 요청사항', '경보기 종류', '시공 종류', '가스 종류'].includes(d.key))
        .map((d) => d.key)

      if (itemKeysToDelete.length > 0) {
        await supabase
          .from('request_details')
          .delete()
          .eq('request_id', id)
          .in('key', itemKeysToDelete)
      }

      const newItems = Object.entries(editedItemCounts)
        .filter(([_, count]) => count > 0)
        .map(([itemName, count]) => ({
          request_id: id,
          key: itemName,
          value: `${count}개`
        }))

      if (newItems.length > 0) {
        await supabase
          .from('request_details')
          .insert(newItems)
      }

      const extraDetail = details.find((d) => d.key === '추가 요청사항')
      if (extraDetail) {
        await supabase
          .from('request_details')
          .update({ value: editedExtraRequest })
          .eq('request_id', id)
          .eq('key', '추가 요청사항')
      }

      const alarmDetail = details.find((d) => d.key === '경보기 종류')
      if (alarmDetail && editedAlarmType) {
        await supabase
          .from('request_details')
          .update({ value: editedAlarmType })
          .eq('request_id', id)
          .eq('key', '경보기 종류')
      }

      const quoteDetail = details.find((d) => d.key === '시공 종류')
      if (quoteDetail && editedQuoteType) {
        await supabase
          .from('request_details')
          .update({ value: editedQuoteType })
          .eq('request_id', id)
          .eq('key', '시공 종류')
      }

      const pipeDetail = details.find((d) => d.key === '가스 종류')
      if (pipeDetail && editedPipeType) {
        await supabase
          .from('request_details')
          .update({ value: editedPipeType })
          .eq('request_id', id)
          .eq('key', '가스 종류')
      }

      const { data: detailData } = await supabase
        .from('request_details')
        .select('key, value')
        .eq('request_id', id)

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
        .update({
          status: '취소',
          canceled_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      const { data: requestData } = await supabase
        .from('service_requests')
        .select('*, services(name)')
        .eq('id', id)
        .single()

      setRequest(requestData)
      setShowCancelModal(false)
      setToast({ show: true, message: '주문이 취소되었습니다.', type: 'success' })
    } catch (error) {
      console.error('취소 실패:', error)
      setToast({ show: true, message: '취소에 실패했습니다.', type: 'error' })
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="pt-6 pb-4 px-6 flex items-center justify-between bg-background border-b border-[var(--color-border)] sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="heading-2 text-primary">세부정보</h1>
        <div className="w-7" />
      </header>

      <div className="px-6 py-6 space-y-4">
        <div className="p-5 flex items-center rounded-2xl shadow-sm" style={{ backgroundColor: statusConfig.bgColor }}>
          <div className="flex-1">
            <p className="heading-3 text-primary mb-1">{statusConfig.title}</p>
            <p className="body-sm text-secondary">{statusConfig.desc}</p>
          </div>
          <div className="w-18 h-18 relative flex-shrink-0 ml-4">
            <Image src="/images/star.png" alt="star" width={72} height={72} className="object-contain" />
          </div>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
          <p className="body font-semibold text-primary mb-2">{store?.name || '가게 정보 없음'}</p>
          <div className="flex items-center text-secondary body-sm">
            <svg className="w-4 h-4 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{store?.address || '주소 정보 없음'}</span>
          </div>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
          <button onClick={() => setShowModal(true)} className="w-full flex items-center justify-between hover:opacity-80 transition-opacity">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-secondary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="body-sm text-primary">{statusConfig.title} : {getStatusTime()}</span>
            </div>
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
          <p className="heading-3 text-primary mb-4">{SERVICE_NAME_MAP[service?.name] || service?.name || '서비스'}</p>

          {isEditing ? (
            <div className="space-y-3 mb-4">
              {(() => {
                const serviceName = service?.name || ''
                const availableItems = SERVICE_ITEMS[serviceName] || []

                if (availableItems.length > 0) {
                  return (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
                        <p className="body-sm text-blue-800">품목을 새로 선택하세요.</p>
                      </div>
                      {availableItems.map((item) => {
                        const count = editedItemCounts[item.name] || 0
                        return (
                          <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-[var(--color-border)]">
                            <div className="flex items-center flex-1">
                              <div className="w-12 h-12 bg-white rounded-lg mr-3 flex-shrink-0 relative overflow-hidden">
                                <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                              </div>
                              <div className="flex-1">
                                <span className="body text-primary font-medium">{item.name}</span>
                                <p className="body-sm text-secondary">{item.price.toLocaleString()}원</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleItemCount(item.name, -1)} className="w-8 h-8 rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center" disabled={count === 0}>
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="bg-primary-light rounded-full px-3 py-1 text-primary caption font-bold min-w-[50px] text-center">{count}개</span>
                              <button onClick={() => handleItemCount(item.name, 1)} className="w-8 h-8 rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center">
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </>
                  )
                }
                return null
              })()}
            </div>
          ) : (
            <div className="space-y-3 mb-4">
              {details
                .filter((item) => !['방문 희망 날짜', '방문 희망 시간', '결제 방법'].includes(item.key))
                .map((item, idx) => {
                  const itemImage = getItemImage(item.key)
                  return (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        {itemImage && (
                          <div className="w-12 h-12 bg-surface rounded-lg mr-3 flex-shrink-0 relative overflow-hidden">
                            <Image src={itemImage} alt={item.key} fill className="object-contain p-1" />
                          </div>
                        )}
                        <span className="body text-secondary">{item.key}</span>
                      </div>
                      <span className="bg-primary-light rounded-full px-3 py-1 text-primary caption font-bold ml-2">{item.value}</span>
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        {(details.find((d) => d.key === '방문 희망 날짜') || details.find((d) => d.key === '방문 희망 시간')) && (
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="body font-bold text-primary">방문 일정</p>
            </div>
            {isEditing ? (
              <DateTimeSelector selectedDate={editedDate} selectedTime={editedTime} onDateChange={setEditedDate} onTimeChange={setEditedTime} />
            ) : (
              <div className="space-y-2">
                {details.filter((d) => ['방문 희망 날짜', '방문 희망 시간'].includes(d.key)).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="body-sm text-secondary">{item.key}</span>
                    <span className="body-sm font-semibold text-primary">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {details.find((d) => d.key === '결제 방법') && (
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <p className="body font-bold text-primary">결제 방법</p>
            </div>
            <p className="body font-semibold text-primary">{details.find((d) => d.key === '결제 방법')?.value}</p>
          </div>
        )}

        {total > 0 && (
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <p className="body font-bold text-primary">전체 요청</p>
            <p className="heading-3 text-primary">{total.toLocaleString()}원</p>
          </div>
        )}

        {request?.status === '요청됨' && !isEditing && (
          <div className="flex gap-3">
            <button onClick={() => setShowCancelModal(true)} className="flex-1 bg-white border-2 border-[var(--color-border)] text-secondary font-semibold py-3 rounded-2xl">주문 취소</button>
            <button onClick={startEditing} className="flex-1 bg-primary text-white font-semibold py-3 rounded-2xl">수정하기</button>
          </div>
        )}

        {isEditing && (
          <div className="flex gap-3">
            <button onClick={cancelEditing} className="flex-1 bg-white border-2 border-[var(--color-border)] text-secondary font-semibold py-3 rounded-2xl">취소</button>
            <button onClick={saveChanges} className="flex-1 bg-primary text-white font-semibold py-3 rounded-2xl">저장하기</button>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="요청 처리 기록">
        <div className="py-2">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-[var(--color-border)]">
            <p className="body-sm text-secondary">서비스 처리 ID</p>
            <p className="body font-bold text-primary">{request?.id?.slice(0, 4)}-{request?.id?.slice(-4)}</p>
          </div>
          <div className="space-y-0">
            {stepList.map((step, idx) => {
              const isLast = idx === stepList.length - 1
              return (
                <div key={idx} className="flex items-start">
                  <div className="w-12 text-right mr-3">
                    <p className="body-sm font-medium text-primary">{step.date}</p>
                    <p className="caption text-tertiary">{step.time}</p>
                  </div>
                  <div className="flex flex-col items-center mr-3">
                    <div className={`w-3 h-3 rounded-full ${step.isActive ? 'bg-primary' : 'bg-gray-300'}`} />
                    {!isLast && <div className="w-0.5 h-16 bg-[var(--color-border)]" />}
                  </div>
                  <div className="flex-1 rounded-xl px-4 py-3 bg-surface -mt-1">
                    <p className={`body-sm ${step.isActive ? 'text-primary font-bold' : 'text-secondary'}`}>{step.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Modal>

      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="주문 취소">
        <div className="py-2">
          <p className="body text-secondary mb-6">정말로 이 주문을 취소하시겠습니까?</p>
          <div className="flex gap-3">
            <button onClick={() => setShowCancelModal(false)} className="flex-1 bg-white border-2 border-[var(--color-border)] text-secondary font-semibold py-3 rounded-2xl">아니오</button>
            <button onClick={cancelOrder} className="flex-1 bg-red-500 text-white font-semibold py-3 rounded-2xl">예, 취소합니다</button>
          </div>
        </div>
      </Modal>

      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
    </div>
  )
}
