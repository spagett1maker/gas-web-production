'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Wrench,
  Store,
  Users,
  MessageSquare,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { ADMIN_USER_ID } from '@/lib/constants'

interface AdminLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: '대시보드', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: '서비스 관리', href: '/admin/dashboard/services', icon: Wrench },
  { name: '가게 관리', href: '/admin/dashboard/stores', icon: Store },
  { name: '사용자 관리', href: '/admin/dashboard/users', icon: Users },
  { name: '문의 관리', href: '/admin/dashboard/inquiries', icon: MessageSquare },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

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

  const handleSignOut = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await supabase.auth.signOut()
      router.push('/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#EB5B37] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const currentNav = navigation.find(n =>
    pathname === n.href || pathname.startsWith(n.href + '/')
  )

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-[#E5E7EB] flex flex-col transition-transform duration-200 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#E5E7EB]">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#EB5B37] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">G</span>
            </div>
            <span className="text-[15px] font-bold text-[#111827]">우리동네가스</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-[#6B7280] hover:bg-[#F3F4F6]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors",
                  isActive
                    ? "bg-[#FEF2EE] text-[#EB5B37]"
                    : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={cn(
                  "h-[18px] w-[18px] flex-shrink-0",
                  isActive ? "text-[#EB5B37]" : "text-[#9CA3AF]"
                )} strokeWidth={1.8} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-[#E5E7EB]">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-[#6B7280] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-[260px]">
        {/* Top header */}
        <header className="h-16 bg-white border-b border-[#E5E7EB] sticky top-0 z-30 flex items-center px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] mr-3"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[13px]">
            <span className="text-[#9CA3AF]">관리자</span>
            {currentNav && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-[#D1D5DB]" />
                <span className="text-[#111827] font-medium">{currentNav.name}</span>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main>{children}</main>
      </div>
    </div>
  )
}
