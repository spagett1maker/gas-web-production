'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Toast } from '@/components/ui/Toast'
import {
  ArrowLeft, Store, Info, Check
} from 'lucide-react'

interface StoreItem {
  id: string
  name: string
}

const CATEGORIES = ['일반문의', '기술지원', '서비스문의', '기타']
const PRIORITIES = [
  { label: '낮음', color: '#22C55E' },
  { label: '보통', color: '#FF9500' },
  { label: '높음', color: '#EF4444' },
]

export default function InquiryCreatePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('일반문의')
  const [priority, setPriority] = useState('보통')
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [stores, setStores] = useState<StoreItem[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' })

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user?.id) {
      router.push('/login')
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single()

    const { data: storesData } = await supabase
      .from('stores')
      .select('id, name')
      .eq('user_id', userData.user.id)

    setStores(storesData || [])

    if (profileData?.default_store_id) {
      setSelectedStore(profileData.default_store_id)
    } else if (storesData && storesData.length > 0) {
      setSelectedStore(storesData[0].id)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      setToast({ show: true, message: '제목을 입력해주세요.', type: 'error' })
      return
    }
    if (!content.trim()) {
      setToast({ show: true, message: '문의 내용을 입력해주세요.', type: 'error' })
      return
    }

    setLoading(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user?.id) {
        setToast({ show: true, message: '로그인이 필요합니다.', type: 'error' })
        return
      }

      const { error } = await supabase
        .from('inquiries')
        .insert({
          user_id: userData.user.id,
          store_id: selectedStore,
          title: title.trim(),
          content: content.trim(),
          category,
          priority,
        })
        .select()
        .single()

      if (error) {
        setToast({ show: true, message: '문의 등록에 실패했습니다.', type: 'error' })
        return
      }

      setToast({ show: true, message: '문의가 등록되었습니다.', type: 'success' })
      setTimeout(() => router.back(), 800)
    } catch {
      setToast({ show: true, message: '오류가 발생했습니다.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const isValid = title.trim().length > 0 && content.trim().length > 0

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
            문의 작성
          </span>
          <div className="w-10" />
        </div>
      </header>

      <main className="page-content">
        {/* 제목 입력 섹션 */}
        <section className="bg-white mt-2 px-5 py-5">
          <label className="text-[13px] font-medium text-[#8E8E93] tracking-[-0.2px] mb-2.5 block">
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="문의 제목을 입력해주세요"
            maxLength={100}
            className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3.5 text-[15px] text-[#1A1A1A] tracking-[-0.3px] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#EB5B37]/20 focus:bg-white transition-all"
          />
          <div className="flex justify-end mt-1.5">
            <span className="text-[12px] text-[#C7C7CC] tracking-[-0.2px]">{title.length}/100</span>
          </div>
        </section>

        {/* 카테고리 */}
        <section className="bg-white mt-2 px-5 py-5">
          <label className="text-[13px] font-medium text-[#8E8E93] tracking-[-0.2px] mb-3 block">
            카테고리
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-[14px] font-semibold tracking-[-0.2px] transition-all active:scale-[0.96] ${
                  category === cat
                    ? 'bg-[#1A1A1A] text-white'
                    : 'bg-[#F5F5F7] text-[#636366] active:bg-[#E5E5EA]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* 우선순위 */}
        <section className="bg-white mt-2 px-5 py-5">
          <label className="text-[13px] font-medium text-[#8E8E93] tracking-[-0.2px] mb-3 block">
            우선순위
          </label>
          <div className="flex gap-2">
            {PRIORITIES.map((pri) => (
              <button
                key={pri.label}
                onClick={() => setPriority(pri.label)}
                className={`flex-1 py-2.5 rounded-xl text-[14px] font-semibold tracking-[-0.2px] transition-all active:scale-[0.96] ${
                  priority === pri.label
                    ? 'text-white'
                    : 'bg-[#F5F5F7] text-[#636366] active:bg-[#E5E5EA]'
                }`}
                style={priority === pri.label ? { backgroundColor: pri.color } : undefined}
              >
                {pri.label}
              </button>
            ))}
          </div>
        </section>

        {/* 매장 선택 */}
        {stores.length > 0 && (
          <section className="bg-white mt-2 px-5 py-5">
            <label className="text-[13px] font-medium text-[#8E8E93] tracking-[-0.2px] mb-3 block">
              매장 선택
            </label>
            <div className="space-y-2">
              {stores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => setSelectedStore(store.id)}
                  className={`w-full flex items-center p-3.5 rounded-xl transition-all active:scale-[0.98] ${
                    selectedStore === store.id
                      ? 'bg-[#FEF2EE] ring-1 ring-[#EB5B37]/20'
                      : 'bg-[#F5F5F7] active:bg-[#E5E5EA]'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 flex-shrink-0"
                    style={{
                      backgroundColor: selectedStore === store.id ? '#EB5B37' : '#E5E5EA',
                    }}
                  >
                    <Store
                      className="w-[18px] h-[18px]"
                      style={{ color: selectedStore === store.id ? '#FFFFFF' : '#8E8E93' }}
                      strokeWidth={1.8}
                    />
                  </div>
                  <span
                    className={`flex-1 text-left text-[15px] font-semibold tracking-[-0.3px] ${
                      selectedStore === store.id ? 'text-[#EB5B37]' : 'text-[#1A1A1A]'
                    }`}
                  >
                    {store.name}
                  </span>
                  {selectedStore === store.id && (
                    <div className="w-6 h-6 rounded-full bg-[#EB5B37] flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 내용 입력 */}
        <section className="bg-white mt-2 px-5 py-5">
          <label className="text-[13px] font-medium text-[#8E8E93] tracking-[-0.2px] mb-2.5 block">
            문의 내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="문의하실 내용을 자세히 작성해주세요"
            rows={6}
            maxLength={1000}
            className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3.5 text-[15px] text-[#1A1A1A] tracking-[-0.3px] placeholder:text-[#C7C7CC] resize-none focus:outline-none focus:ring-2 focus:ring-[#EB5B37]/20 focus:bg-white transition-all leading-[1.6]"
          />
          <div className="flex justify-end mt-1.5">
            <span className="text-[12px] text-[#C7C7CC] tracking-[-0.2px]">{content.length}/1000</span>
          </div>
        </section>

        {/* 안내 */}
        <section className="px-5 py-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-[#C7C7CC] mt-0.5 flex-shrink-0" strokeWidth={1.8} />
            <p className="text-[13px] text-[#C7C7CC] tracking-[-0.2px] leading-[1.6]">
              관리자 확인 후 1~2일 내 답변이 등록됩니다.
              긴급한 문의는 우선순위를 '높음'으로 설정해 주세요.
            </p>
          </div>
        </section>

        {/* 하단 여백 (CTA 버튼 공간) */}
        <div className="h-[100px]" />
      </main>

      {/* 하단 CTA */}
      <div className="page-bottom">
        <button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className={`w-full h-[52px] rounded-2xl text-[16px] font-semibold tracking-[-0.3px] transition-all active:scale-[0.98] ${
            isValid && !loading
              ? 'bg-[#EB5B37] text-white active:bg-[#D9482A]'
              : 'bg-[#E5E5EA] text-[#C7C7CC]'
          }`}
        >
          {loading ? '등록 중...' : '문의 등록하기'}
        </button>
      </div>

      {/* 토스트 */}
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
