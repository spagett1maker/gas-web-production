'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Wrench,
  Users,
  MessageCircle,
  Menu,
  X,
  LogOut,
  User,
  Store
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { ADMIN_USER_ID } from '@/lib/constants'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationBanner, NotificationStatus } from './NotificationBanner'

interface AdminLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: '대시보드', href: '/admin/dashboard', icon: Home },
  { name: '서비스 관리', href: '/admin/dashboard/services', icon: Wrench },
  { name: '가게 관리', href: '/admin/dashboard/stores', icon: Store },
  { name: '사용자 관리', href: '/admin/dashboard/users', icon: Users },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  // 알림 시스템
  const {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    listenToServiceRequests,
  } = useNotifications()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser || authUser.id !== ADMIN_USER_ID) {
        router.push('/login')
        return
      }

      setUser(authUser)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  // 새 서비스 요청 리스닝
  useEffect(() => {
    if (permission !== 'granted' || !user) return

    const unsubscribe = listenToServiceRequests(async (payload) => {
      const newRequest = payload.new

      // 가게 정보 가져오기
      const { data: storeData } = await supabase
        .from('stores')
        .select('name')
        .eq('id', newRequest.store_id)
        .single()

      // 서비스 정보 가져오기
      const { data: serviceData } = await supabase
        .from('services')
        .select('name')
        .eq('id', newRequest.service_id)
        .single()

      // 알림 표시
      await showNotification('새로운 서비스 요청', {
        body: `${storeData?.name || '가게'}에서 ${serviceData?.name || '서비스'}를 요청했습니다.`,
        data: { url: `/admin/dashboard/services/${newRequest.id}` }
      })
    })

    return unsubscribe
  }, [permission, user, listenToServiceRequests, showNotification])

  const handleSignOut = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await supabase.auth.signOut()
      router.push('/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 모바일 사이드바 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">우리동네가스</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-orange-50 text-orange-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive ? "text-orange-500" : "text-gray-400 group-hover:text-gray-500"
                  )} />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* 사이드바 하단 정보 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-2" />
            <span className="truncate">{user.email}</span>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="lg:pl-64">
        {/* 상단 헤더 */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex-1 lg:flex-none">
              <h2 className="text-xl font-bold text-gray-900 lg:hidden">
                관리자 대시보드
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {/* 알림 상태 표시 */}
              <NotificationStatus permission={permission} />

              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </div>
          </div>
        </header>

        {/* 알림 권한 요청 배너 */}
        <NotificationBanner
          isSupported={isSupported}
          permission={permission}
          onRequestPermission={requestPermission}
        />

        {/* 페이지 콘텐츠 */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
