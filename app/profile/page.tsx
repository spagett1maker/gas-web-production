'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatPhoneNumber } from '@/utils/format'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ProfilePage() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [phone, setPhone] = useState('010-9876-5432')
  const [store, setStore] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchProfileAndStore = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('default_store_id, phone')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.phone) {
        const formattedPhone = formatPhoneNumber(profile.phone)
        setPhone(formattedPhone)
      }

      if (profile?.default_store_id) {
        const { data: storeData } = await supabase
          .from('stores')
          .select('name')
          .eq('id', profile.default_store_id)
          .maybeSingle()
        if (storeData) {
          setStore(storeData.name)
        }
      }
    }

    fetchProfileAndStore()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 상단 헤더 */}
      <header className="pt-6 pb-5 px-5 flex items-center justify-between bg-white">
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
        <h1 className="text-xl font-bold text-gray-800">프로필</h1>
        <div className="w-7" />
      </header>

      {/* 프로필 정보 */}
      <div className="px-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[#FF5A36] text-lg font-bold mb-1">
              {store ? `${store} 고객님` : '가게명을 불러오는 중...'}
            </h2>
            <div className="flex items-center mb-0.5">
              <svg
                className="w-4 h-4 text-gray-500 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span className="text-gray-600 text-sm">{phone}</span>
            </div>
          </div>
          <button
            className="bg-[#FF5A36] w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#EB5A36] transition-colors"
            onClick={() => setModalVisible(true)}
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 로그아웃 버튼 */}
      <div className="px-6 mb-4">
        <button
          className="w-full bg-[#FFF2EE] rounded-2xl py-3 flex items-center justify-center hover:bg-[#FFE5DD] transition-colors"
          onClick={handleLogout}
        >
          <svg
            className="w-5 h-5 text-[#FF5A36] mr-2"
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
          <span className="text-[#FF5A36] text-base font-bold">로그아웃</span>
        </button>
      </div>

      {/* 메뉴 리스트 */}
      <div className="px-6">
        <MenuItem
          icon={
            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          label="나의 가게(위치)"
          onPress={() => router.push('/profile/my-store')}
        />
        <MenuItem
          icon={
            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          }
          label="프로모션"
        />
        <MenuItem
          icon={
            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
          label="결제 수단"
          onPress={() => router.push('/profile/payment')}
        />
        <MenuItem
          icon={
            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="고객센터"
          onPress={() => router.push('/contact')}
        />
      </div>

      {/* 알림 받기 스위치 */}
      <div className="flex items-center justify-between px-6 mt-6">
        <span className="text-base text-gray-800">알림 받기</span>
        <button
          onClick={() => setIsEnabled(!isEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isEnabled ? 'bg-[#FF5A36]' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* 가게 정보 변경 모달 */}
      <Modal
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        title="가게 정보 변경"
      >
        <div className="space-y-4">
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="전화번호"
            fullWidth
          />
          <Input
            type="text"
            value={store}
            onChange={(e) => setStore(e.target.value)}
            placeholder="가게명"
            fullWidth
          />
          <div className="flex space-x-3 pt-2">
            <Button
              onClick={() => setModalVisible(false)}
              fullWidth
            >
              저장
            </Button>
            <Button
              onClick={() => setModalVisible(false)}
              variant="secondary"
              fullWidth
            >
              취소
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// 메뉴 아이템 컴포넌트
function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode
  label: string
  onPress?: () => void
}) {
  return (
    <button
      className="w-full flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
      onClick={onPress}
    >
      <div className="flex items-center">
        {icon}
        <span className="ml-3 text-base text-gray-800">{label}</span>
      </div>
      <svg
        className="w-5 h-5 text-gray-400"
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
  )
}
