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
    name: '홈',
    href: '/',
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
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    name: '나의 서비스',
    href: '/my-service',
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
    name: '문의',
    href: '/contact',
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
  {
    name: '프로필',
    href: '/profile',
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
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
]

export default function BottomTabBar() {
  const pathname = usePathname()

  // 인증 페이지나 서비스 상세 페이지에서는 탭바 숨김
  if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/service/') || pathname.startsWith('/admin')) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)] z-50 md:hidden shadow-lg">
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
