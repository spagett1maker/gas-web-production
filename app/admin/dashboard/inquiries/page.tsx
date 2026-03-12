'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import { Search, RefreshCw, Eye, MessageSquare } from 'lucide-react'

const CATEGORIES = ['전체', '접수됨', '처리중', '완료', '보류']

const STATUS_STYLE: Record<string, string> = {
  접수됨: 'bg-amber-50 text-amber-700',
  처리중: 'bg-blue-50 text-blue-700',
  완료: 'bg-emerald-50 text-emerald-700',
  보류: 'bg-red-50 text-red-700',
}

const PRIORITY_STYLE: Record<string, string> = {
  높음: 'text-red-600',
  보통: 'text-amber-600',
  낮음: 'text-gray-500',
}

interface Inquiry {
  id: string
  title: string
  content: string
  category: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  stores?: { name: string }
  profiles?: { phone: string }
}

function InquiriesContent() {
  const router = useRouter()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [filtered, setFiltered] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchInquiries = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        id, title, content, category, status, priority,
        created_at, updated_at,
        stores(name), profiles(phone)
      `)
      .order('updated_at', { ascending: false })

    if (!error && data) {
      const formatted = data.map((d: any) => ({
        ...d,
        stores: Array.isArray(d.stores) ? d.stores[0] : d.stores,
        profiles: Array.isArray(d.profiles) ? d.profiles[0] : d.profiles,
      }))
      setInquiries(formatted)
    }
    setLoading(false)
  }

  useEffect(() => { fetchInquiries() }, [])

  useEffect(() => {
    let result = inquiries
    if (selectedCategory !== '전체') {
      result = result.filter(i => i.status === selectedCategory)
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter(i =>
        i.title?.toLowerCase().includes(term) ||
        i.stores?.name?.toLowerCase().includes(term)
      )
    }
    setFiltered(result)
  }, [inquiries, selectedCategory, searchTerm])

  const counts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === '전체' ? inquiries.length : inquiries.filter(i => i.status === cat).length
    return acc
  }, {} as Record<string, number>)

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">문의 관리</h1>
            <p className="text-[14px] text-[#6B7280] mt-1">고객 문의를 확인하고 답변하세요.</p>
          </div>
          <button
            onClick={fetchInquiries}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#EB5B37] text-white text-[14px] font-medium rounded-lg hover:bg-[#D4502F] disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#EB5B37] text-white'
                    : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                }`}
              >
                {cat} ({counts[cat]})
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="제목 또는 가게명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full sm:w-80 border border-[#E5E7EB] rounded-lg text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#EB5B37]/20 focus:border-[#EB5B37]"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#EB5B37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#9CA3AF]">
            <MessageSquare className="h-10 w-10 mb-3" />
            <p className="text-[14px]">문의가 없습니다.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">제목</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">카테고리</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider hidden lg:table-cell">가게</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">상태</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider hidden sm:table-cell">우선순위</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">업데이트</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filtered.map((inquiry) => (
                    <tr
                      key={inquiry.id}
                      className="hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/inquiry-detail?id=${inquiry.id}`)}
                    >
                      <td className="px-4 py-3.5">
                        <p className="text-[14px] font-medium text-[#111827] line-clamp-1">{inquiry.title}</p>
                        <p className="text-[12px] text-[#9CA3AF] line-clamp-1 mt-0.5">{inquiry.content}</p>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="text-[13px] text-[#6B7280]">{inquiry.category}</span>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="text-[13px] text-[#6B7280]">{inquiry.stores?.name || '-'}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[12px] font-medium ${STATUS_STYLE[inquiry.status] || 'bg-gray-50 text-gray-600'}`}>
                          {inquiry.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className={`text-[13px] font-medium ${PRIORITY_STYLE[inquiry.priority] || 'text-gray-500'}`}>
                          {inquiry.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="text-[13px] text-[#9CA3AF]">
                          {new Date(inquiry.updated_at).toLocaleDateString('ko-KR')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button className="p-1.5 text-[#EB5B37] hover:bg-[#FEF2EE] rounded-lg transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-[#E5E7EB] bg-[#F9FAFB]">
              <p className="text-[13px] text-[#9CA3AF]">총 {filtered.length}건</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default function InquiriesPage() {
  return (
    <Suspense fallback={
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-6 h-6 border-2 border-[#EB5B37] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    }>
      <InquiriesContent />
    </Suspense>
  )
}
