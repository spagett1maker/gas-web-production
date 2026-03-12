'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// 커스텀 탭 아이콘 - outline/filled 모두 지원
function IconHome({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#1A1A1A" stroke="none">
        <path d="M12.707 2.293a1 1 0 00-1.414 0l-9 9A1 1 0 003 13h1v7a2 2 0 002 2h4v-5a2 2 0 012-2h0a2 2 0 012 2v5h4a2 2 0 002-2v-7h1a1 1 0 00.707-1.707l-9-9z" />
      </svg>
    )
  }
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5E6166" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}

function IconService({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#1A1A1A" stroke="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M5 2a2 2 0 00-2 2v16a2 2 0 002 2h14a2 2 0 002-2V4a2 2 0 00-2-2H5zm2 5a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" />
      </svg>
    )
  }
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5E6166" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="11" x2="16" y2="11" />
      <line x1="8" y1="15" x2="12" y2="15" />
    </svg>
  )
}

function IconChat({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#1A1A1A" stroke="none">
        <path d="M12 2C6.477 2 2 5.813 2 10.5c0 2.51 1.324 4.756 3.4 6.298-.2 1.477-.862 2.742-1.94 3.762a.5.5 0 00.34.86c2.1-.06 3.92-.76 5.28-1.62.6.13 1.22.2 1.87.2h.05c5.523 0 10-3.813 10-8.5S17.523 2 12 2z" />
      </svg>
    )
  }
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5E6166" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  )
}

function IconProfile({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#1A1A1A" stroke="none">
        <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.523 0-8 2.686-8 5a1 1 0 001 1h14a1 1 0 001-1c0-2.314-2.477-5-8-5z" />
      </svg>
    )
  }
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5E6166" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c0-3 3.5-5 7-5s7 2 7 5" />
    </svg>
  )
}

const tabs = [
  { name: '홈', href: '/home', Icon: IconHome },
  { name: '나의 서비스', href: '/my-service', Icon: IconService },
  { name: '문의', href: '/contact', Icon: IconChat },
  { name: '프로필', href: '/profile', Icon: IconProfile },
]

export default function BottomTabBar() {
  const pathname = usePathname()

  // 스플래시, 인증, 서비스 상세, 가게등록, 관리자 페이지에서는 탭바 숨김
  const hideTabBar =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/service/') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/profile/add-store')

  if (hideTabBar) {
    return null
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t-[0.5px] border-[#E5E5EA] z-50"
      style={{ paddingBottom: 'var(--safe-area-bottom, 0px)' }}
    >
      <div className="flex justify-around items-center h-[62px]">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            pathname.startsWith(tab.href + '/')

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center flex-1 h-full"
            >
              <div className="mb-[3px]">
                <tab.Icon active={isActive} />
              </div>
              <span
                className={`text-[11px] tracking-[-0.2px] ${
                  isActive
                    ? 'text-[#1A1A1A] font-bold'
                    : 'text-[#5E6166] font-medium'
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
