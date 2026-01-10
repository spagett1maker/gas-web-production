'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactElement } from 'react'

interface TabItem {
  name: string
  href: string
  icon: (active: boolean) => ReactElement
}

const tabs: TabItem[] = [
  {
    name: '서비스',
    href: '/admin/service',
    icon: (active) => (
      <svg
        className={`w-6 h-6 transition-colors ${active ? 'text-primary' : 'text-tertiary'}`}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={active ? 0 : 2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
  },
  {
    name: '가게',
    href: '/admin/store',
    icon: (active) => (
      <svg
        className={`w-6 h-6 transition-colors ${active ? 'text-primary' : 'text-tertiary'}`}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={active ? 0 : 2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    name: '문의',
    href: '/admin/contact',
    icon: (active) => (
      <svg
        className={`w-6 h-6 transition-colors ${active ? 'text-primary' : 'text-tertiary'}`}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={active ? 0 : 2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
    ),
  },
]

export default function AdminTabBar() {
  const pathname = usePathname()

  // 관리자 페이지가 아니면 탭바 숨김
  if (!pathname.startsWith('/admin')) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)] z-50 shadow-lg">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center flex-1 h-full hover:bg-surface transition-colors"
            >
              {tab.icon(isActive)}
              <span
                className={`caption mt-1 transition-colors ${
                  isActive ? 'text-primary font-semibold' : 'text-tertiary'
                }`}
              >
                {tab.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
