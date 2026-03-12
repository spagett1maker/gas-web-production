'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatPhoneNumber } from '@/utils/format'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ChevronRight, Store, Trash2 } from 'lucide-react'

// 스켈레톤
function Skeleton() {
  return (
    <div className="page-with-tabs bg-white">
      <div className="app-header">
        <div className="h-[48px] px-5 flex items-center">
          <div className="skeleton w-32 h-5 rounded-lg" />
        </div>
      </div>
      <div className="px-5 pt-6">
        <div className="skeleton h-[72px] rounded-2xl mb-3" />
        <div className="skeleton h-[72px] rounded-2xl mb-8" />
        <div className="skeleton h-[48px] rounded mb-2" />
        <div className="skeleton h-[48px] rounded mb-2" />
        <div className="skeleton h-[48px] rounded" />
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [phone, setPhone] = useState('')
  const [store, setStore] = useState('')
  const [storeAddress, setStoreAddress] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchProfileAndStore = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        setUserId(user.id)

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
            .select('name, address')
            .eq('id', profile.default_store_id)
            .maybeSingle()
          if (storeData) {
            setStore(storeData.name)
            setStoreAddress(storeData.address || '')
          }
        }
        setLoading(false)
      } catch {
        router.push('/login')
      }
    }

    fetchProfileAndStore()
  }, [router])

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await supabase.auth.signOut()
      router.replace('/login')
    }
  }

  const handleDeleteAccount = async () => {
    if (!userId) return

    setIsDeleting(true)
    try {
      await supabase.from('services').delete().eq('user_id', userId)
      await supabase.from('inquiries').delete().eq('user_id', userId)
      await supabase.from('stores').delete().eq('owner_id', userId)
      await supabase.from('profiles').delete().eq('id', userId)

      const { error } = await supabase.rpc('delete_user')
      if (error) console.error('계정 삭제 오류:', error)

      await supabase.auth.signOut()
      router.replace('/login')
    } catch (error) {
      console.error('계정 삭제 중 오류:', error)
      alert('계정 삭제 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsDeleting(false)
      setDeleteConfirmModalVisible(false)
    }
  }

  if (loading) return <Skeleton />

  return (
    <div className="page-with-tabs bg-white">
      {/* 헤더 */}
      <header className="app-header">
        <div className="h-[48px] px-5 flex items-center">
          <span className="text-[17px] font-semibold tracking-[-0.3px] text-[#1A1A1A]">
            프로필
          </span>
        </div>
      </header>

      <main className="page-content">
        {/* 카드형 액션 영역 */}
        <section className="px-5 pt-4">
          {/* 나의 가게 카드 */}
          <button
            onClick={() => router.push('/profile/my-store')}
            className="w-full flex items-center py-4 border-b border-[#F2F2F7] active:bg-[#FAFAFA] transition-colors"
          >
            <div className="w-[52px] h-[52px] rounded-[14px] bg-[#1A1A1A] flex items-center justify-center mr-4 flex-shrink-0">
              <Store className="w-[22px] h-[22px] text-white" strokeWidth={1.8} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-[16px] font-bold text-[#1A1A1A] tracking-[-0.3px]">
                {store || '가게 등록하기'}
              </p>
              <p className="text-[13px] text-[#8E8E93] tracking-[-0.2px] mt-0.5 truncate">
                {storeAddress || '가게 정보를 등록해주세요'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#C7C7CC] flex-shrink-0 ml-2" />
          </button>

        </section>

        {/* 구분선 */}
        <div className="h-2 bg-[#F5F5F7]" />

        {/* 메뉴 리스트 */}
        <section className="px-5">
          <MenuItem label="고객센터" onPress={() => router.push('/contact')} />
          <MenuItem label="프로모션" onPress={() => {}} />
          <MenuItem label="이용약관" onPress={() => router.push('/terms')} isLast />
        </section>

        {/* 구분선 */}
        <div className="h-1 bg-[#F5F5F7]" />

        <section className="px-5">
          <MenuItem label="개인정보처리방침" onPress={() => router.push('/privacy')} />
          <MenuItem label="로그아웃" onPress={handleLogout} isLast />
        </section>

        {/* 구분선 */}
        <div className="h-1 bg-[#F5F5F7]" />

        <section className="px-5">
          <MenuItem
            label="계정 삭제"
            onPress={() => setDeleteModalVisible(true)}
            danger
            isLast
          />
        </section>

        {/* 앱 버전 */}
        <div className="py-8 text-center">
          <span className="text-[12px] text-[#C7C7CC] tracking-[-0.2px]">
            앱 버전 1.0.0
          </span>
        </div>
      </main>

      {/* 계정 삭제 1차 확인 모달 */}
      <Modal
        isOpen={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        title="계정 삭제"
      >
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-[var(--color-error-light)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-[var(--color-error)]" />
            </div>
            <p className="text-[16px] text-[var(--color-text-primary)] mb-2">
              정말 계정을 삭제하시겠습니까?
            </p>
            <p className="text-[14px] text-[var(--color-text-secondary)]">
              계정을 삭제하면 모든 데이터가<br />
              영구적으로 삭제됩니다.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setDeleteModalVisible(false)}
              variant="secondary"
              fullWidth
            >
              취소
            </Button>
            <Button
              onClick={() => {
                setDeleteModalVisible(false)
                setDeleteConfirmModalVisible(true)
              }}
              className="!bg-[var(--color-error)] hover:!bg-red-600"
              fullWidth
            >
              계속
            </Button>
          </div>
        </div>
      </Modal>

      {/* 계정 삭제 2차 확인 모달 */}
      <Modal
        isOpen={deleteConfirmModalVisible}
        onClose={() => !isDeleting && setDeleteConfirmModalVisible(false)}
        title="최종 확인"
      >
        <div className="space-y-4">
          <div className="py-4">
            <p className="text-[15px] font-semibold text-[var(--color-text-primary)] mb-3">
              삭제되는 정보:
            </p>
            <ul className="bg-[var(--color-gray-50)] rounded-xl p-4 space-y-2">
              {['가게 정보 및 프로필', '서비스 신청 내역', '문의 내역', '계정 정보'].map((item, idx) => (
                <li key={idx} className="flex items-center text-[14px] text-[var(--color-text-secondary)]">
                  <div className="w-5 h-5 rounded-full bg-[var(--color-error-light)] flex items-center justify-center mr-2">
                    <span className="text-[var(--color-error)] text-[10px]">✕</span>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-[var(--color-error)] text-[14px] mt-4 text-center font-medium">
              이 작업은 되돌릴 수 없습니다.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setDeleteConfirmModalVisible(false)}
              variant="secondary"
              fullWidth
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              onClick={handleDeleteAccount}
              className="!bg-[var(--color-error)] hover:!bg-red-600"
              fullWidth
              disabled={isDeleting}
            >
              {isDeleting ? '삭제 중...' : '영구 삭제'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// 메뉴 아이템 컴포넌트 - 아이콘 없이 텍스트 + 화살표만
function MenuItem({
  label,
  onPress,
  danger,
  isLast,
}: {
  label: string
  onPress?: () => void
  danger?: boolean
  isLast?: boolean
}) {
  return (
    <button
      className={`w-full flex items-center justify-between py-4 active:bg-[#FAFAFA] transition-colors ${
        !isLast ? 'border-b border-[#F2F2F7]' : ''
      }`}
      onClick={onPress}
    >
      <span className={`text-[16px] font-medium tracking-[-0.3px] ${danger ? 'text-[#FF3B30]' : 'text-[#1A1A1A]'}`}>
        {label}
      </span>
      <ChevronRight className={`w-5 h-5 ${danger ? 'text-[#FF3B30]/40' : 'text-[#C7C7CC]'}`} />
    </button>
  )
}
