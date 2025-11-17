'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'

interface Store {
  id: string
  name: string
}

export default function InquiryCreatePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('일반문의')
  const [priority, setPriority] = useState('보통')
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)

  const categories = ['일반문의', '기술지원', '서비스문의', '기타']
  const priorities = ['낮음', '보통', '높음']

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user?.id) {
      router.push('/login')
      return
    }

    // 프로필 정보 가져오기
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single()

    // 사용자의 매장 목록 가져오기
    const { data: storesData } = await supabase
      .from('stores')
      .select('id, name')
      .eq('user_id', userData.user.id)

    setStores(storesData || [])

    // 기본 매장 설정
    if (profileData?.default_store_id) {
      setSelectedStore(profileData.default_store_id)
    } else if (storesData && storesData.length > 0) {
      setSelectedStore(storesData[0].id)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }

    if (!content.trim()) {
      alert('문의 내용을 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user?.id) {
        alert('로그인이 필요합니다.')
        return
      }

      const { data, error } = await supabase
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
        console.error('문의글 작성 실패:', error)
        alert('문의글 작성에 실패했습니다.')
        return
      }

      alert('문의글이 성공적으로 등록되었습니다.')
      router.back()
    } catch (error) {
      console.error('문의글 작성 중 오류:', error)
      alert('문의글 작성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 헤더 */}
      <header className="pt-6 pb-4 px-5 flex items-center justify-between border-b border-gray-200 sticky top-0 bg-white z-10">
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
        <h1 className="text-xl font-bold text-gray-800">문의 작성</h1>
        <button
          onClick={handleSubmit}
          disabled={loading || !title.trim() || !content.trim()}
          className={`px-4 py-2 rounded-full ${
            loading || !title.trim() || !content.trim()
              ? 'bg-gray-300 text-gray-500'
              : 'bg-[#EB5A36] text-white hover:bg-[#FF5A36]'
          } transition-colors`}
        >
          <span className="font-medium text-sm">
            {loading ? '등록중...' : '등록'}
          </span>
        </button>
      </header>

      <div className="px-5 py-4">
        {/* 제목 입력 */}
        <div className="mb-6">
          <label className="block text-base font-medium text-gray-800 mb-3">
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="문의 제목을 입력해주세요"
            maxLength={100}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#EB5A36] focus:border-transparent"
          />
          <p className="text-gray-500 text-xs mt-1 text-right">
            {title.length}/100
          </p>
        </div>

        {/* 카테고리 선택 */}
        <div className="mb-6">
          <label className="block text-base font-medium text-gray-800 mb-3">
            카테고리
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full border transition-colors ${
                  category === cat
                    ? 'bg-[#EB5A36] border-[#EB5A36] text-white'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-[#EB5A36]'
                }`}
              >
                <span className="text-sm">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 우선순위 선택 */}
        <div className="mb-6">
          <label className="block text-base font-medium text-gray-800 mb-3">
            우선순위
          </label>
          <div className="flex gap-3">
            {priorities.map((pri) => (
              <button
                key={pri}
                onClick={() => setPriority(pri)}
                className={`px-4 py-2 rounded-full border transition-colors ${
                  priority === pri
                    ? 'bg-[#EB5A36] border-[#EB5A36] text-white'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-[#EB5A36]'
                }`}
              >
                <span className="text-sm">{pri}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 매장 선택 */}
        <div className="mb-6">
          <label className="block text-base font-medium text-gray-800 mb-3">
            매장 선택
          </label>
          {stores.length > 0 ? (
            <div className="space-y-2">
              {stores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => setSelectedStore(store.id)}
                  className={`w-full flex items-center p-3 rounded-lg border transition-colors ${
                    selectedStore === store.id
                      ? 'bg-[#EB5A36] border-[#EB5A36]'
                      : 'bg-white border-gray-300 hover:border-[#EB5A36]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedStore === store.id
                        ? 'border-white'
                        : 'border-gray-400'
                    }`}
                  >
                    {selectedStore === store.id && (
                      <div className="w-3 h-3 rounded-full bg-white" />
                    )}
                  </div>
                  <span
                    className={`ml-3 text-sm ${
                      selectedStore === store.id
                        ? 'text-white font-medium'
                        : 'text-gray-600'
                    }`}
                  >
                    {store.name}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">등록된 매장이 없습니다.</p>
          )}
        </div>

        {/* 내용 입력 */}
        <div className="mb-6">
          <label className="block text-base font-medium text-gray-800 mb-3">
            문의 내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="문의하실 내용을 자세히 작성해주세요"
            rows={8}
            maxLength={1000}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-[#EB5A36] focus:border-transparent"
          />
          <p className="text-gray-500 text-xs mt-1 text-right">
            {content.length}/1000
          </p>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="ml-3 flex-1">
              <p className="text-gray-600 text-sm leading-relaxed">
                • 문의 내용은 관리자가 확인 후 답변드립니다.
                <br />
                • 긴급한 문의는 우선순위를 &apos;높음&apos;으로 설정해주세요.
                <br />• 답변은 보통 1-2일 내에 등록됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
