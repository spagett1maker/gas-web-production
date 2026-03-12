'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  ChevronRight, Bell, MapPin, Clock, Phone,
} from 'lucide-react'
import {
  checkNotificationPermission,
  requestNotificationPermission,
  openNotificationSettings,
} from '@/lib/pushNotifications'

/* ─── 알림 설정 바텀시트 ─── */
function NotificationSheet({ onClose }: { onClose: () => void }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setShow(true))
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [])

  const handleAccept = useCallback(async () => {
    await requestNotificationPermission()
    setShow(false)
    setTimeout(onClose, 340)
  }, [onClose])

  const handleDismiss = useCallback(() => {
    localStorage.setItem('notification_dismissed', 'true')
    setShow(false)
    setTimeout(onClose, 340)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[60]">
      {/* 배경 딤 */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${show ? 'opacity-50' : 'opacity-0'}`}
        onClick={handleDismiss}
      />

      {/* 시트 */}
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

        <div className="px-6 pt-4 pb-5">
          {/* 타이틀 */}
          <h2 className="text-[22px] font-bold text-[#1A1A1A] tracking-[-0.6px] text-center leading-[1.35]">
            서비스 진행 상황을 받아보세요
          </h2>
          <p className="text-[14px] text-[#8E8E93] tracking-[-0.2px] text-center mt-2">
            기기 알림 설정을 확인해 주세요.
          </p>

          {/* 아이폰 + 알림 카드 */}
          <div className="relative mt-7 mb-7 mx-auto" style={{ width: '280px', height: '120px' }}>
            {/* 아이폰 상단 부분만 (하단 잘림) */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[200px] h-[120px]">
              {/* 프레임 */}
              <div
                className="absolute inset-0 rounded-[36px]"
                style={{
                  background: 'linear-gradient(160deg, #2C2C2E 0%, #1C1C1E 100%)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
                }}
              />
              {/* 스크린 */}
              <div className="absolute inset-[3.5px] rounded-[33px] overflow-hidden">
                {/* 월페이퍼 */}
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(170deg, #1A1A2E 0%, #16213E 40%, #0F3460 100%)' }}
                />
                {/* 다이나믹 아일랜드 */}
                <div className="absolute top-[9px] left-1/2 -translate-x-1/2 w-[64px] h-[20px] bg-black rounded-full z-10" />
                {/* 상태바 */}
                <div className="relative z-10 flex items-center justify-between px-5 pt-[12px]">
                  <span className="text-[10px] font-semibold text-white/90">9:41</span>
                  <div className="flex items-center gap-[3px]">
                    <svg width="12" height="9" viewBox="0 0 14 10" fill="none">
                      <rect x="0" y="6" width="2.5" height="4" rx="0.5" fill="white" fillOpacity="0.85"/>
                      <rect x="3.8" y="4" width="2.5" height="6" rx="0.5" fill="white" fillOpacity="0.85"/>
                      <rect x="7.6" y="2" width="2.5" height="8" rx="0.5" fill="white" fillOpacity="0.85"/>
                      <rect x="11.4" y="0" width="2.5" height="10" rx="0.5" fill="white" fillOpacity="0.85"/>
                    </svg>
                    <svg width="11" height="9" viewBox="0 0 13 10" fill="none">
                      <path d="M6.5 9.5a1 1 0 100-2 1 1 0 000 2z" fill="white" fillOpacity="0.85"/>
                      <path d="M3.8 7.2a3.8 3.8 0 015.4 0" stroke="white" strokeOpacity="0.85" strokeWidth="1.2" strokeLinecap="round"/>
                      <path d="M1.5 4.9a7 7 0 0110 0" stroke="white" strokeOpacity="0.85" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    <svg width="20" height="9" viewBox="0 0 22 10" fill="none">
                      <rect x="0.5" y="0.5" width="19" height="9" rx="2" stroke="white" strokeOpacity="0.4"/>
                      <rect x="20.5" y="3" width="1.5" height="4" rx="0.5" fill="white" fillOpacity="0.4"/>
                      <rect x="1.5" y="1.5" width="17" height="7" rx="1.2" fill="white" fillOpacity="0.85"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* 알림 카드 - 폰 위에 떠서 튀어나옴 */}
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[290px] z-10 bg-white rounded-[18px] pr-4 pl-2.5 py-3.5"
              style={{
                boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              <div className="flex items-start gap-3">
                <img
                  src="/images/icon.png"
                  alt="앱 아이콘"
                  className="w-[40px] h-[40px] rounded-[10px] flex-shrink-0"
                  draggable={false}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[13px] font-bold text-[#1A1A1A]">화구교체 서비스가 접수되었어요</span>
                  </div>
                  <p className="text-[12px] text-[#8E8E93] leading-[1.45]">
                    담당자 배정 후 안내드릴게요.
                  </p>
                </div>
                <span className="text-[11px] text-[#EB5B37] font-semibold flex-shrink-0 mt-0.5">지금</span>
              </div>
            </div>
          </div>

          {/* 안내 텍스트 */}
          <div className="bg-[#F5F5F7] rounded-2xl px-4 py-3.5 mb-6">
            <p className="text-[12.5px] text-[#6E6E73] tracking-[-0.2px] leading-[1.65] text-center">
              <span className="font-semibold text-[#1A1A1A]">허용하고 알림 받기</span> 선택 →
              환경설정에서 <span className="inline-flex items-center align-middle mx-0.5 w-[18px] h-[18px] bg-[#EB5B37] rounded-[5px] justify-center"><Bell className="w-[10px] h-[10px] text-white" strokeWidth={2.5} /></span> <span className="font-semibold text-[#1A1A1A]">알림 설정</span> 선택
              → <span className="inline-flex items-center align-middle mx-0.5 w-[18px] h-[18px] bg-[#34C759] rounded-[5px] justify-center"><span className="text-white text-[10px] font-bold">✓</span></span> <span className="font-semibold text-[#1A1A1A]">알림 허용</span> 버튼 선택
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={handleAccept}
            className="w-full h-[54px] bg-[#1A1A1A] rounded-[14px] text-white text-[16px] font-semibold tracking-[-0.3px] active:bg-[#333] transition-colors"
          >
            허용하고 알림 받기
          </button>

          {/* 거절 */}
          <button
            onClick={handleDismiss}
            className="w-full mt-3 py-2.5 text-[14px] text-[#AEAEB2] tracking-[-0.2px] active:text-[#8E8E93] transition-colors"
          >
            알림 받지 않기
          </button>
        </div>
      </div>
    </div>
  )
}

const SERVICES = [
  { key: 'burner', label: '화구 교체', image: '/main/화구교체_bright.png', desc: '중화 · 버너 · 화구' },
  { key: 'clean', label: '청소', image: '/main/cleaning_tight.png', desc: '가게 청소' },
  { key: 'valve', label: '밸브 교체', image: '/main/밸브_bright.png', desc: '가스 밸브 · 공기조절기' },
  { key: 'alarm', label: '경보기 교체', image: '/main/경보기_bright.png', desc: '경보기 · 감지기' },
  { key: 'gas', label: '가스 점검', image: '/main/가스누출_bright.png', desc: '정기 · 수시 검사' },
  { key: 'pipe', label: '배관 시공 및 철거', image: '/main/배관_bright.png', desc: '가스 배관 · 시공' },
  { key: 'quote', label: '시공견적 문의', image: '/main/시공견적_bright.png', desc: '무료 · 현장 견적' },
  { key: 'contract', label: '정기계약 이용권', image: '/main/정기계약_bright.png', desc: '연간 · 월간 계약' },
  { key: 'center', label: '고객센터', image: '/main/고객센터_bright.png', desc: '1:1 상담 · 문의' },

]

/* ─── 프로모션 배너 캐러셀 ─── */
function PromotionBanners({ onNavigate }: { onNavigate: (path: string) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => {
      const scrollLeft = el.scrollLeft
      const width = el.offsetWidth
      const index = Math.round(scrollLeft / width)
      setActiveIndex(index)
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  // 자동 슬라이드
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const timer = setInterval(() => {
      const next = (activeIndex + 1) % 2
      el.scrollTo({ left: next * el.offsetWidth, behavior: 'smooth' })
    }, 4000)
    return () => clearInterval(timer)
  }, [activeIndex])

  return (
    <section className="pt-5 bg-[#f4f5f9] pb-6">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {/* Banner 1: 웰컴 혜택 */}
        <button
          onClick={() => onNavigate('/contact')}
          className="w-full flex-shrink-0 snap-center px-5 active:scale-[0.98] transition-transform"
        >
          <div className="relative rounded-2xl overflow-hidden h-[120px] px-5 flex items-center"
            style={{ background: 'linear-gradient(135deg, #FFF0EB 0%, #FFE0D6 50%, #FFD0C0 100%)' }}
          >
            <div className="flex-1 pr-3 text-left">
              <span className="inline-block px-2.5 py-0.5 bg-[#EB5B37]/10 rounded-full text-[11px] font-semibold text-[#EB5B37] tracking-[-0.2px] mb-2">
                우리동네가스 웰컴 혜택
              </span>
              <h3 className="text-[18px] font-bold text-[#1A1A1A] tracking-[-0.5px] leading-[1.35] pt-1 pl-1">
                첫 방문 점검<br />무료 서비스
              </h3>
            </div>
            <div className="w-[88px] h-[88px] flex-shrink-0">
              <img
                src="/icon/banner_icon_welcome.png"
                alt="웰컴 혜택"
                className="w-full h-full object-contain drop-shadow-lg"
                draggable={false}
              />
            </div>
          </div>
        </button>

        {/* Banner 2: 가스 누출 검사 */}
        <button
          onClick={() => onNavigate('/service/gas')}
          className="w-full flex-shrink-0 snap-center px-5 active:scale-[0.98] transition-transform"
        >
          <div className="relative rounded-2xl overflow-hidden h-[120px] px-5 flex items-center"
            style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 60%, #DC4A0A 100%)' }}
          >
            <div className="flex-1 pr-3 text-left">
              <span className="inline-block px-2.5 py-0.5 bg-white/20 rounded-full text-[11px] font-semibold text-white tracking-[-0.2px] mb-2">
                우리 가게 안전은 기본!
              </span>
              <h3 className="text-[18px] font-bold text-white tracking-[-0.5px] leading-[1.35] pt-1 pl-1">
                가스 누출 검사<br />지금 바로 신청
              </h3>
            </div>
            <div className="w-[88px] h-[88px] flex-shrink-0">
              <img
                src="/main/가스누출_bright.png"
                alt="가스 누출 검사"
                className="w-full h-full object-contain drop-shadow-lg"
                draggable={false}
              />
            </div>
          </div>
        </button>
      </div>

      {/* Dot Indicators */}
      {/* <div className="flex justify-center gap-1.5 mt-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              activeIndex === i
                ? 'w-[18px] h-[6px] bg-[#EB5B37]'
                : 'w-[6px] h-[6px] bg-[#E0E0E0]'
            }`}
          />
        ))}
      </div> */}
    </section>
  )
}

function Skeleton() {
  return (
    <div className="page-with-tabs bg-white">
      <div className="app-header">
        <div className="h-[48px] px-5 flex items-center justify-between">
          <div className="skeleton w-28 h-5 rounded-lg" />
          <div className="skeleton w-9 h-9 rounded-full" />
        </div>
      </div>
      <div className="px-5 pt-4">
        <div className="skeleton w-52 h-7 rounded-lg mb-2" />
        <div className="skeleton w-40 h-7 rounded-lg mb-3" />
        <div className="skeleton w-64 h-4 rounded-lg mb-1" />
        <div className="skeleton w-56 h-4 rounded-lg" />
      </div>
      <div className="px-5 pt-7">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="skeleton w-full aspect-square rounded-2xl" />
              <div className="skeleton w-12 h-3.5 rounded" />
              <div className="skeleton w-16 h-2.5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [storeName, setStoreName] = useState<string | null>(null)
  const [storeAddress, setStoreAddress] = useState<string | null>(null)
  const [recentServices, setRecentServices] = useState<any[]>([])
  const [showNotification, setShowNotification] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        // 실제 세션이 없을 때만 데모 모드 적용
        if (!session) {
          const isDemo = localStorage.getItem('demo_mode') === 'true'
          if (isDemo) {
            setStoreName('데모 가게')
            setStoreAddress('서울시 강남구 역삼동')
            setRecentServices([])
            setLoading(false)
            const demoPermStatus = await checkNotificationPermission()
            const dismissed = localStorage.getItem('notification_dismissed') === 'true'
            if (demoPermStatus === 'prompt' && !dismissed) {
              setTimeout(() => setShowNotification(true), 800)
            }
            return
          }
          router.replace('/login')
          return
        }

        // 실제 세션이 있으면 데모 모드 해제
        localStorage.removeItem('demo_mode')

        const { data: profile } = await supabase
          .from('profiles')
          .select('default_store_id')
          .eq('id', session.user.id)
          .single()

        if (profile?.default_store_id) {
          const { data: store } = await supabase
            .from('stores')
            .select('name, address')
            .eq('id', profile.default_store_id)
            .single()
          if (store) {
            setStoreName(store.name)
            setStoreAddress(store.address)
          }
        }

        const { data: requests } = await supabase
          .from('service_requests')
          .select('id, status, created_at, services(name)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(3)

        if (requests) setRecentServices(requests)
        setLoading(false)

        // 알림 권한 상태 확인 후 바텀시트 표시
        const permStatus = await checkNotificationPermission()
        const dismissed = localStorage.getItem('notification_dismissed') === 'true'
        if (permStatus === 'prompt' && !dismissed) {
          setTimeout(() => setShowNotification(true), 800)
        }
      } catch {
        router.replace('/login')
      }
    }
    init()
  }, [router])

  const go = (key: string) => {
    router.push(key === 'center' ? '/contact' : `/service/${key}`)
  }

  const getServiceLabel = (name: string) => {
    const service = SERVICES.find(s => s.key === name)
    return service?.label || name
  }

  if (loading) return <Skeleton />

  const activeService = recentServices.find(s => s.status === '요청됨' || s.status === '진행중')

  return (
    <div className="page-with-tabs bg-white/ bg-[#f4f5f9]">
      {/* Header */}
      <header className="app-header">
        <div className="h-[48px] px-5 flex items-center justify-between">
          <button
            onClick={() => router.push('/profile/my-store')}
            className="flex items-center gap-1.5 active:opacity-70 transition-opacity"
          >
            <MapPin className="w-[18px] h-[18px] text-[#EB5B37]" strokeWidth={2.5} />
            <span className="text-[15px] font-semibold text-[#1A1A1A] tracking-[-0.3px] max-w-[200px] truncate">
              {storeName || '가게 등록'}
            </span>
          </button>
          <button
            onClick={() => router.push('/notification')}
            className="w-9 h-9 flex items-center justify-center rounded-full active:bg-[#F5F5F7] transition-colors"
          >
            <Bell className="w-[21px] h-[21px] text-[#1A1A1A]" strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <main className="page-content">
        {/* Promotion Banners */}
        <PromotionBanners onNavigate={(path) => router.push(path)} />

        <section className="bg-white rounded-t-4xl pt-5 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] border-t border-gray-100/50">

        {/* Title */}
        <section className="px-5 pt-3">
          <h1 className="text-[24px] font-bold text-[#1A1A1A] tracking-[-0.6px] leading-[1.35]">
            어떤 서비스가{'\n'}
            필요하세요?
          </h1>
          <p className="mt-2.5 text-[14px] text-[#8E8E93] leading-[1.5] tracking-[-0.2px]">
            수량은 상관 없어요.<br />
            자세한 요청은 다음 단계에서 받을게요.
          </p>
        </section>

        {/* Service Grid */}
        <section className="px-5 pt-7 pb-6">
          <div className="grid grid-cols-3 gap-x-4 gap-y-5">
            {SERVICES.map((service) => (
              <button
                key={service.key}
                onClick={() => go(service.key)}
                className="flex flex-col items-center active:scale-[0.96] transition-transform"
              >
                <div className="w-full aspect-square rounded-2xl bg-[#F5F5F7] flex items-center justify-center p-2 mb-2 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.label}
                    className="w-full h-full object-contain"
                    draggable={false}
                  />
                </div>
                <span className="text-[14px] font-bold text-[#1A1A1A] tracking-[-0.3px] whitespace-pre-line">
                  {service.label}
                </span>
                <span className="text-[11px] text-[#8E8E93] tracking-[-0.2px] mt-0.5">
                  {service.desc}
                </span>
              </button>
            ))}
          </div>
        </section>
        </section>
      </main>

      {/* 알림 설정 바텀시트 */}
      {showNotification && (
        <NotificationSheet onClose={() => setShowNotification(false)} />
      )}
    </div>
  )
}
