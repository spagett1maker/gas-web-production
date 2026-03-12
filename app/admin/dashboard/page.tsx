'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SERVICE_NAME_MAP } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import { Clock, Wrench, CheckCircle, Store, ChevronRight } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface DashboardStats {
  totalRequests: number
  pendingRequests: number
  inProgressRequests: number
  completedToday: number
  totalStores: number
  totalUsers: number
}

interface RecentRequest {
  id: string
  status: string
  created_at: string
  stores?: { name: string } | null
  services?: { name: string } | null
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    inProgressRequests: 0,
    completedToday: 0,
    totalStores: 0,
    totalUsers: 0,
  })
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Stats queries (parallel)
        const [
          { count: totalRequests },
          { count: pendingRequests },
          { count: inProgressRequests },
          completedResult,
          { count: totalStores },
          { count: totalUsers },
          recentResult,
        ] = await Promise.all([
          supabase
            .from('service_requests')
            .select('*', { count: 'exact', head: true }),
          supabase
            .from('service_requests')
            .select('*', { count: 'exact', head: true })
            .eq('status', '요청됨'),
          supabase
            .from('service_requests')
            .select('*', { count: 'exact', head: true })
            .eq('status', '진행중'),
          supabase
            .from('service_requests')
            .select('*', { count: 'exact', head: true })
            .eq('status', '완료')
            .gte('completed_at', `${new Date().toISOString().split('T')[0]}T00:00:00.000Z`),
          supabase
            .from('stores')
            .select('*', { count: 'exact', head: true }),
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true }),
          supabase
            .from('service_requests')
            .select('id, status, created_at, stores(name), services(name)')
            .order('created_at', { ascending: false })
            .limit(5),
        ])

        setStats({
          totalRequests: totalRequests || 0,
          pendingRequests: pendingRequests || 0,
          inProgressRequests: inProgressRequests || 0,
          completedToday: completedResult.count || 0,
          totalStores: totalStores || 0,
          totalUsers: totalUsers || 0,
        })

        if (recentResult.data) {
          const normalized = recentResult.data.map((r: any) => ({
            ...r,
            stores: Array.isArray(r.stores) ? r.stores[0] : r.stores,
            services: Array.isArray(r.services) ? r.services[0] : r.services,
          }))
          setRecentRequests(normalized)
        }
      } catch (error) {
        console.error('통계 데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const statCards = [
    {
      title: '대기 중 요청',
      value: stats.pendingRequests,
      icon: Clock,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      href: '/admin/dashboard/services?status=요청됨',
    },
    {
      title: '진행 중 작업',
      value: stats.inProgressRequests,
      icon: Wrench,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      href: '/admin/dashboard/services?status=진행중',
    },
    {
      title: '오늘 완료',
      value: stats.completedToday,
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      href: '/admin/dashboard/services?status=완료',
    },
    {
      title: '등록된 가게',
      value: stats.totalStores,
      icon: Store,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      href: '/admin/dashboard/stores',
    },
  ]

  return (
    <AdminLayout>
      <div className="p-4 lg:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">대시보드</h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">서비스 요청 및 운영 현황</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, index) => {
            const Icon = card.icon
            return (
              <Link key={index} href={card.href}>
                <div className="border border-[#E5E7EB] rounded-xl p-5 bg-white hover:shadow-sm transition-shadow">
                  <div className={`w-10 h-10 ${card.iconBg} rounded-full flex items-center justify-center mb-3`}>
                    <Icon className={`h-5 w-5 ${card.iconColor}`} strokeWidth={2} />
                  </div>
                  <p className="text-[13px] font-medium text-[#6B7280]">{card.title}</p>
                  <p className="text-[28px] font-bold text-[#111827] mt-0.5 leading-tight">
                    {loading ? '--' : card.value.toLocaleString()}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Recent requests */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold text-[#111827]">최근 요청</h2>
            <Link
              href="/admin/dashboard/services"
              className="text-[13px] font-medium text-[#EB5B37] hover:underline flex items-center gap-0.5"
            >
              전체보기
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="border border-[#E5E7EB] rounded-xl bg-white overflow-hidden">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-[1fr_1fr_120px_100px_40px] gap-4 px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wide">
              <span>가게</span>
              <span>서비스</span>
              <span>요청일</span>
              <span>상태</span>
              <span />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-[#EB5B37] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recentRequests.length === 0 ? (
              <div className="text-center py-12 text-[14px] text-[#9CA3AF]">
                요청 내역이 없습니다
              </div>
            ) : (
              <div className="divide-y divide-[#F3F4F6]">
                {recentRequests.map((req) => {
                  const serviceName = req.services?.name
                    ? SERVICE_NAME_MAP[req.services.name] || req.services.name
                    : '-'
                  const storeName = req.stores?.name || '-'

                  return (
                    <Link
                      key={req.id}
                      href={`/admin/dashboard/services/detail?id=${req.id}`}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_120px_100px_40px] gap-1 sm:gap-4 items-center px-5 py-3.5 hover:bg-[#F9FAFB] transition-colors"
                    >
                      {/* Mobile layout */}
                      <div className="sm:hidden flex items-center justify-between">
                        <div>
                          <p className="text-[14px] font-medium text-[#111827]">{storeName}</p>
                          <p className="text-[13px] text-[#6B7280]">{serviceName} · {formatDate(req.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={req.status} showIcon={false} />
                          <ChevronRight className="h-4 w-4 text-[#D1D5DB]" />
                        </div>
                      </div>

                      {/* Desktop layout */}
                      <span className="hidden sm:block text-[14px] font-medium text-[#111827] truncate">{storeName}</span>
                      <span className="hidden sm:block text-[14px] text-[#374151]">{serviceName}</span>
                      <span className="hidden sm:block text-[13px] text-[#6B7280]">{formatDate(req.created_at)}</span>
                      <span className="hidden sm:block">
                        <StatusBadge status={req.status} showIcon={false} />
                      </span>
                      <span className="hidden sm:flex justify-end">
                        <ChevronRight className="h-4 w-4 text-[#D1D5DB]" />
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
