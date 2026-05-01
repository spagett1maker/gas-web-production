# 우리동네가스 - 프로젝트 분석 문서

> 가스 서비스 예약/관리 모바일 앱 (Web + iOS + Android)

---

## 1. 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | 우리동네가스 (gas-web-2) |
| **앱 ID** | `com.gasservice.app` |
| **버전** | 0.1.0 |
| **설명** | 가스 관련 서비스(배관, 밸브, 경보기, 가스점검 등)를 예약하고 관리하는 하이브리드 모바일 앱 |
| **대상 플랫폼** | Web, iOS, Android |
| **언어** | 한국어 |

---

## 2. 기술 스택

### Core
| 기술 | 버전 | 용도 |
|------|------|------|
| **Next.js** | 16.1.0 | React 풀스택 프레임워크 |
| **React** | 19.2.0 | UI 라이브러리 |
| **TypeScript** | 5.x | 타입 안전성 |
| **Tailwind CSS** | 4.x | 유틸리티 기반 스타일링 |

### Backend / DB
| 기술 | 버전 | 용도 |
|------|------|------|
| **Supabase** | 2.81.1 | PostgreSQL DB + Auth + Realtime |
| **Supabase SSR** | 0.7.0 | 서버 사이드 렌더링 지원 |

### Mobile
| 기술 | 버전 | 용도 |
|------|------|------|
| **Capacitor** | 8.0.0 | 웹→네이티브 브릿지 |
| **Capgo Updater** | 8.4.2 | OTA(Over-the-Air) 업데이트 |

### 유틸리티
| 기술 | 용도 |
|------|------|
| **Lucide React** | 아이콘 라이브러리 |
| **clsx** | 조건부 className |
| **tailwind-merge** | Tailwind 클래스 병합 |

---

## 3. 프로젝트 구조

```
gas-web-2/
├── app/                          # Next.js App Router (페이지)
│   ├── (auth)/                   # 인증 페이지 그룹
│   │   ├── login/                #   로그인 (휴대폰 OTP)
│   │   └── signup/               #   회원가입
│   ├── admin/                    # 관리자 페이지
│   │   ├── dashboard/            #   대시보드 (통계)
│   │   ├── service/[id]/         #   서비스 관리
│   │   ├── store/[id]/           #   매장 관리
│   │   ├── contact/              #   문의 관리
│   │   └── inquiry-detail/       #   문의 상세
│   ├── service/                  # 서비스 신청 페이지
│   │   ├── gas/                  #   가스점검
│   │   ├── burner/               #   버너 교체
│   │   ├── valve/                #   밸브 교체
│   │   ├── alarm/                #   경보기 교체
│   │   ├── pipe/                 #   배관 공사
│   │   ├── quote/                #   견적 문의
│   │   ├── contract/             #   계약 서비스
│   │   └── inquiry-create/       #   문의 작성
│   ├── my-service/[id]/          # 내 서비스 내역
│   ├── profile/                  # 프로필/설정
│   │   ├── add-store/            #   매장 등록
│   │   ├── my-store/             #   내 매장 관리
│   │   └── payment/              #   결제 설정
│   ├── notification/             # 알림
│   ├── contact/                  # 고객 문의
│   ├── support/                  # 고객 지원
│   ├── privacy/                  # 개인정보 처리방침
│   ├── terms/                    # 이용약관
│   ├── layout.tsx                # 루트 레이아웃
│   ├── page.tsx                  # 홈 페이지
│   └── globals.css               # 글로벌 스타일 + 디자인 토큰
│
├── components/                   # 재사용 컴포넌트
│   ├── ui/                       # 공통 UI 컴포넌트
│   │   ├── Button.tsx            #   버튼
│   │   ├── Input.tsx             #   입력 필드
│   │   ├── Card.tsx              #   카드
│   │   ├── Modal.tsx             #   모달
│   │   ├── Loading.tsx           #   로딩 스피너
│   │   ├── StatusBadge.tsx       #   상태 뱃지
│   │   ├── Badge.tsx             #   태그/뱃지
│   │   ├── Toast.tsx             #   토스트 알림
│   │   ├── BottomSheet.tsx       #   바텀 시트
│   │   ├── BottomCTA.tsx         #   하단 고정 CTA
│   │   ├── FeedbackModal.tsx     #   피드백 모달
│   │   ├── ListRow.tsx           #   리스트 아이템
│   │   ├── PageTransition.tsx    #   페이지 전환 애니메이션
│   │   ├── ProgressBar.tsx       #   프로그레스 바
│   │   ├── StepHeader.tsx        #   단계 헤더
│   │   ├── StepIndicator.tsx     #   단계 표시기
│   │   └── index.ts              #   통합 export
│   ├── admin/
│   │   └── AdminLayout.tsx       #   관리자 레이아웃
│   ├── BottomTabBar.tsx          # 하단 탭 바 (사용자)
│   ├── AdminTabBar.tsx           # 하단 탭 바 (관리자)
│   ├── AnnouncementBar.tsx       # 상단 공지 배너
│   ├── ServiceTemplate.tsx       # 서비스 신청 템플릿 (다단계 폼)
│   ├── DateTimeSelector.tsx      # 날짜/시간 선택기
│   ├── PaymentMethodSelector.tsx # 결제 수단 선택
│   └── ScrollPicker.tsx          # 스크롤 피커
│
├── lib/                          # 핵심 유틸리티
│   ├── supabase.ts               #   Supabase 클라이언트
│   ├── constants.ts              #   상수/enum 정의
│   └── utils.ts                  #   유틸리티 함수 (cn)
│
├── hooks/                        # 커스텀 훅
│   └── useNotifications.ts       #   알림 훅
│
├── types/                        # TypeScript 타입 정의
│   └── index.ts                  #   핵심 타입
│
├── android/                      # Android 네이티브 프로젝트
├── ios/                          # iOS 네이티브 프로젝트
├── public/                       # 정적 자산 (이미지 등)
└── design/                       # 디자인 시안 (PNG)
```

---

## 4. 주요 기능

### 4.1 사용자(고객) 기능

| 기능 | 설명 |
|------|------|
| **휴대폰 OTP 로그인** | 전화번호 기반 OTP 인증으로 로그인/회원가입 |
| **서비스 신청** | 8가지 가스 서비스를 다단계 폼으로 신청 |
| **내 서비스 내역** | 신청한 서비스의 상태(요청됨/진행중/완료/취소) 추적 |
| **매장 관리** | 매장 등록, 기본 매장 설정, 주소 관리 |
| **알림** | 서비스 상태 변경 등 알림 수신 |
| **문의하기** | 카테고리별 고객 문의 작성 |
| **프로필** | 계정 정보 확인, 알림 설정, 로그아웃, 계정 삭제 |

### 4.2 관리자 기능

| 기능 | 설명 |
|------|------|
| **대시보드** | 대기/진행/완료 건수, 등록 매장수, 사용자수 통계 |
| **서비스 관리** | 전체 서비스 요청 목록 조회/필터/상세 관리 |
| **매장 관리** | 전체 등록 매장 조회/관리 |
| **문의 관리** | 고객 문의 조회/답변 |

### 4.3 서비스 신청 흐름 (ServiceTemplate)

```
항목 선택 → 날짜/시간 선택 → 결제 수단 선택 → 신청 완료
   Step 1         Step 2            Step 3          Submit
```

### 4.4 서비스 종류

| 서비스 | 경로 | 설명 |
|--------|------|------|
| 가스점검 | `/service/gas` | 정기 가스 안전 점검 |
| 버너 교체 | `/service/burner` | 가스 버너 교체 |
| 밸브 교체 | `/service/valve` | 가스 밸브 교체 |
| 경보기 교체 | `/service/alarm` | 가스 경보기 교체 |
| 배관 공사 | `/service/pipe` | 가스 배관 시공 |
| 견적 문의 | `/service/quote` | 견적 요청 |
| 계약 서비스 | `/service/contract` | 정기 계약 서비스 |
| 고객 지원 | `/support` | 일반 지원 문의 |

---

## 5. 데이터 모델

### DB 테이블 구조

```
profiles          stores              services
┌──────────┐      ┌──────────┐        ┌──────────┐
│ id (PK)  │      │ id (PK)  │        │ id (PK)  │
│ phone    │      │ user_id  │──┐     │ name     │
│ role     │◄──┐  │ name     │  │     │ ...      │
│ default_ │   │  │ address  │  │     └──────────┘
│ store_id │   │  │ latitude │  │          │
│ created  │   │  │ longitude│  │          │
│ updated  │   │  │ created  │  │          │
└──────────┘   │  │ updated  │  │          │
               │  └──────────┘  │          │
               │                │          │
               │  service_requests         │
               │  ┌──────────────┐         │
               │  │ id (PK)     │         │
               └──│ user_id(FK) │         │
                  │ store_id(FK)│─────────┘
                  │ service_id  │──────────┘
                  │ status      │  요청됨/진행중/완료/취소
                  │ created_at  │
                  │ updated_at  │
                  └──────────────┘
                        │
                  request_details
                  ┌──────────────┐
                  │ id (PK)     │
                  │ request_id  │
                  │ key         │  예: "방문 희망 날짜"
                  │ value       │  예: "2025-02-15"
                  └──────────────┘

inquiries                    notifications
┌──────────────┐             ┌──────────────┐
│ id (PK)     │             │ id (PK)     │
│ user_id(FK) │             │ user_id(FK) │
│ title       │             │ title       │
│ content     │             │ message     │
│ category    │             │ is_read     │
│ priority    │             │ created_at  │
│ status      │             └──────────────┘
│ created_at  │
└──────────────┘
```

### TypeScript 핵심 타입

```typescript
interface Profile {
  id: string;
  phone: string;
  role?: 'user' | 'admin';
  default_store_id?: string;
}

interface Store {
  id: string;
  user_id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

interface ServiceRequest {
  id: string;
  user_id: string;
  store_id: string;
  service_id: string;
  status: '요청됨' | '진행중' | '완료' | '취소';
  created_at: string;
  updated_at: string;
  services?: Service;
  stores?: Store;
  request_details?: RequestDetail[];
}

interface RequestDetail {
  id: string;
  request_id: string;
  key: string;
  value: string;
}
```

---

## 6. 인증 흐름

### 사용자 로그인 (Phone OTP)

```
전화번호 입력 → profiles 테이블 확인 → OTP 발송 → OTP 인증 → 세션 생성
                  │                                              │
                  ├─ 미등록 → 에러 표시                          ├─ 매장 있음 → 홈
                  └─ 등록됨 → 진행                               └─ 매장 없음 → 매장 등록
```

### 회원가입

```
전화번호 입력 → 중복 확인 → OTP 발송 → OTP 인증 → profiles 레코드 생성 → 매장 등록
```

### 관리자 로그인

```
이메일 입력 → role 확인 → 비밀번호 입력 → 이메일+비밀번호 인증 → 관리자 대시보드
```

---

## 7. 디자인 시스템

### 컬러 팔레트

| 용도 | 색상 | HEX |
|------|------|-----|
| Primary | 코랄 오렌지 | `#EB5B37` |
| Primary Hover | 진한 코랄 | `#D9482A` |
| Primary Light BG | 연한 코랄 | `#FEF2EE` |
| Text Primary | 검정 | `#1A1A1A` |
| Text Secondary | 회색 | `#636366` |
| Text Tertiary | 연회색 | `#8E8E93` |
| Surface | 배경 회색 | `#F5F5F7` |
| Success | 초록 | `#22C55E` |
| Error | 빨강 | `#EF4444` |
| Info | 파랑 | `#3B82F6` |
| Warning | 노랑 | `#EAB308` |

### 타이포그래피

| 스타일 | 크기 | 굵기 | 용도 |
|--------|------|------|------|
| Display | 28px | Bold | 주요 숫자 |
| Title | 22px | Bold | 페이지 타이틀 |
| Heading | 17px | Semibold | 섹션 제목 |
| Body | 15px | Regular | 본문 텍스트 |
| Caption | 13px | Regular | 설명 텍스트 |
| Small | 12px | Medium | 뱃지/태그 |

### 디자인 특징
- **토스(Toss) 스타일** 영감의 깔끔한 UI
- 8px 그리드 기반 스페이싱
- Safe Area 대응 (노치/홈 인디케이터)
- 모바일 퍼스트 반응형 디자인
- 커스텀 애니메이션 (fade-in, slide-up)

---

## 8. 빌드 & 배포

### NPM 스크립트

```bash
npm run dev              # 개발 서버 실행
npm run build            # 프로덕션 빌드 (정적 export → out/)
npm run lint             # ESLint 실행

npm run cap:sync         # 빌드 + Capacitor 동기화
npm run cap:ios          # 빌드 + iOS 시뮬레이터 실행
npm run cap:android      # 빌드 + Android 에뮬레이터 실행
npm run cap:build:ios    # 빌드 + iOS 동기화만
npm run cap:build:android # 빌드 + Android 동기화만
```

### 환경 변수

```env
NEXT_PUBLIC_SUPABASE_URL=         # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase 공개 키
NEXT_PUBLIC_KAKAO_REST_API_KEY=   # 카카오 REST API 키 (주소 검색)
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY= # 카카오 JS 키
NEXT_PUBLIC_ADMIN_USER_ID=        # 관리자 사용자 ID
```

### 빌드 설정
- **Output**: Static Export (`output: "export"`)
- **이미지 최적화**: 비활성화 (Capacitor 호환)
- **Trailing Slash**: 활성화 (정적 파일 호환)

---

## 9. 아키텍처 패턴

### 상태 관리
- **React useState/useEffect** - 로컬 상태 관리
- **Context API** - NotificationProvider로 전역 알림 관리
- **Supabase 실시간 구독** - DB 변경 실시간 반영

### 라우팅
- **Next.js App Router** - 파일 기반 라우팅
- **동적 라우트** - `[id]` 패턴
- **레이아웃 그룹** - `(auth)` 그룹화
- **Client Components** - `'use client'` 지시문

### API 패턴
- Supabase JS SDK를 통한 직접 DB 접근
- `.select()`, `.insert()`, `.update()`, `.delete()` 체이닝
- Join 쿼리로 관계 데이터 fetch
- 서버리스 아키텍처 (별도 API 서버 없음)

### 모바일 최적화
- Capacitor를 통한 웹→네이티브 변환
- Capgo를 통한 OTA 업데이트
- Safe Area 패딩 (노치 대응)
- 터치 친화적 버튼 크기 (44px+)
- 고정 하단 탭 바 + CTA 패턴

---

## 10. 주요 컴포넌트 API

### Button
```tsx
<Button variant="primary" | "secondary" | "ghost"
        size="sm" | "md" | "lg"
        fullWidth loading disabled>
```

### ServiceTemplate (다단계 서비스 폼)
```tsx
<ServiceTemplate
  title="서비스명"
  items={[{ label, value }]}
  onSubmit={(data) => void}
/>
// 내부 Step: 항목 선택 → 날짜/시간 → 결제 수단
```

### Modal
```tsx
<Modal isOpen onClose title maxWidth>
  {children}
</Modal>
```

### StatusBadge
```tsx
<StatusBadge status="요청됨" | "진행중" | "완료" | "취소" size="sm" | "md" />
```
