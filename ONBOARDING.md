# 우리동네가스 - 신규 개발자 온보딩

> 이 문서는 처음 합류하는 개발자가 **로컬 환경 세팅부터 앱 스토어 배포까지** 실행할 수 있도록 작성되었습니다.
> 코드/구조 분석은 [`PROJECT_ANALYSIS.md`](./PROJECT_ANALYSIS.md), 디자인 토큰은 [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md), 기존 리디자인 배경은 [`REDESIGN_PLAN.md`](./REDESIGN_PLAN.md) 참조.

---

## 0. 30초 요약

- **무엇**: 가스 서비스 예약/관리 앱. Next.js 정적 export → Capacitor 로 iOS/Android 빌드.
- **백엔드**: Supabase (Auth + Postgres + Edge Functions). 별도 API 서버 없음.
- **호스팅**: Vercel (`https://homegascare.vercel.app`).
- **현재 모드**: 네이티브 앱은 **Vercel URL을 라이브로 로드**(`capacitor.config.ts`의 `server.url`). 즉 웹 배포만으로 모바일 앱 화면도 즉시 갱신됨.

---

## 1. 사전 요구사항

| 도구 | 권장 버전 | 비고 |
|---|---|---|
| Node.js | 20 LTS+ | `nvm use` 권장 |
| npm | 10+ | yarn/pnpm 사용 안 함 |
| Xcode | 15+ | iOS 빌드용 (Mac only) |
| CocoaPods | 1.15+ | `sudo gem install cocoapods` |
| Android Studio | Hedgehog+ | Android 빌드용 |
| JDK | 17 | Android Gradle Plugin 8.x 호환 |
| Supabase CLI | latest | Edge Function 배포 시 |

---

## 2. 첫 세팅

```bash
# 1) 의존성
npm install

# 2) 환경변수 (값은 .env.local 참조 — 이미 커밋되어 있음)
cp .env.example .env.local

# 3) iOS pod (최초 1회 + Capacitor 플러그인 변경 시)
cd ios/App && pod install && cd ../..

# 4) 개발 서버
npm run dev    # http://localhost:3000
```

> **주의**: `.env.local`은 통상 .gitignore 대상이지만 이 레포는 운영 단순화를 위해 커밋되어 있습니다(개인 운영 프로젝트). 외부에 공개하지 마세요.

---

## 3. 환경변수 가이드

| 변수 | 용도 | 발급처 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 (RLS 적용 전제) | 동상 |
| `NEXT_PUBLIC_KAKAO_REST_API_KEY` | 카카오 주소 검색 (REST) | Kakao Developers |
| `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY` | 카카오 지도 SDK | Kakao Developers |
| `NEXT_PUBLIC_ADMIN_USER_ID` | 관리자 라우트 가드용 user id | Supabase auth.users |
| `NEXT_PUBLIC_DEMO_PHONE` / `_OTP` / `_EMAIL` / `_PASSWORD` | 앱 스토어/플레이스토어 심사 데모 계정 | 자체 발급 |

Edge Function용 시크릿(Solapi 등)은 Supabase Dashboard → Edge Functions → Secrets 에서 관리:

| 시크릿 | 용도 |
|---|---|
| `SOLAPI_API_KEY` | Solapi REST 인증 |
| `SOLAPI_API_SECRET` | Solapi HMAC 시크릿 |
| `SOLAPI_CALLING_NUMBER` | 발신 전화번호 (정규화는 함수 내부에서 처리) |

---

## 4. 자주 쓰는 명령

```bash
# 웹
npm run dev               # 개발 서버
npm run build             # 정적 export → out/
npm run lint

# 모바일 (반드시 build 후 sync)
npm run cap:sync          # build + sync (iOS+Android)
npm run cap:ios           # build + sync + Xcode 열기
npm run cap:android       # build + sync + Android Studio 열기
npm run cap:build:ios     # build + iOS sync 만
npm run cap:build:android # build + Android sync 만
```

> **TIP**: `capacitor.config.ts`의 `server.url`이 켜져 있으면 네이티브는 Vercel을 라이브로 봅니다. 이 경우 `cap:sync`는 native shell 변경시에만 필요하고, JS 변경은 `git push` → Vercel 배포만으로 반영됩니다.

---

## 5. Supabase Edge Functions 배포

```bash
# 최초 로그인 + 링크
supabase login
supabase link --project-ref keiciweliichfgwdzoyc

# 함수 배포
supabase functions deploy send-sms
supabase functions deploy send-notification-sms

# 시크릿 설정 (최초 1회)
supabase secrets set SOLAPI_API_KEY=... SOLAPI_API_SECRET=... SOLAPI_CALLING_NUMBER=...
```

함수 위치: `supabase/functions/{name}/index.ts`

- `send-sms`: 로그인/회원가입 OTP 발송
- `send-notification-sms`: 서비스 상태 변경 시 사용자에게 SMS 발송

전화번호 정규화는 함수 내부 `normalizePhone()`이 처리합니다(`+82`, `82`, `010` 어떤 형태든 `01012345678`로).

---

## 6. iOS 배포

```bash
npm run cap:ios   # Xcode 열림
```

Xcode 작업:
1. **Signing & Capabilities** → Team 선택 (Apple Developer 계정 필요)
2. **General → Identity → Version / Build** 증가
   - `MARKETING_VERSION` (현재 `1.2.0`)
   - `CURRENT_PROJECT_VERSION` (빌드 번호)
3. Product → Archive → Distribute App → App Store Connect

Bundle ID: `com.gasservice.app`

---

## 7. Android 배포

### 서명 키 (이미 커밋되어 있음)

| 항목 | 값 |
|---|---|
| Keystore | `android/app/release.keystore` |
| Alias | `gas-app-key` |
| Store Password | `gasservice2024` |
| Key Password | `gasservice2024` |

> **주의**: 키스토어가 분실되면 동일 패키지명으로 업데이트 발행이 영구히 불가합니다. 별도로 백업하세요.

### 버전 증가

`android/app/build.gradle`:
```gradle
versionCode 4    // ← 빌드마다 +1, 정수
versionName "1.2.1"  // ← 사용자 노출 버전
```

### AAB 빌드

```bash
npm run cap:build:android
cd android
./gradlew bundleRelease
# → android/app/build/outputs/bundle/release/app-release.aab
```

→ Play Console 업로드.

---

## 8. 데이터베이스 (Supabase)

| 테이블 | 용도 |
|---|---|
| `profiles` | 사용자 프로필 (phone, role, default_store_id) |
| `stores` | 사용자의 매장 (1 user : N stores, default 매장 1개) |
| `services` | 서비스 카탈로그 |
| `service_requests` | 서비스 요청 (status: 요청됨/진행중/완료/취소) |
| `request_details` | 요청의 key-value 메타 (방문일시, 결제수단 등) |
| `inquiries` | 고객 문의 |
| `notifications` | 사용자 알림 |

- **인증**: 사용자는 휴대폰 OTP, 관리자는 이메일+비밀번호
- **RLS**: 모든 테이블에 RLS 활성. `auth.uid() = user_id` 패턴이 기본
- **관리자 판별**: `profiles.role = 'admin'` 또는 `NEXT_PUBLIC_ADMIN_USER_ID`와 일치

---

## 9. 디렉토리 빠른 참조

```
app/                        # Next.js App Router 페이지
  (auth)/login, signup      # 로그인/회원가입
  (user)/                   # 사용자 영역 그룹
  admin/                    # 관리자 페이지
  service/{type}/           # 서비스 신청 페이지 (가스/버너/밸브/...)
  my-service/[id]/          # 내 서비스 상세
  profile/                  # 프로필/설정/매장
  notification/             # 알림함
  layout.tsx                # 루트 레이아웃
  globals.css               # 디자인 토큰 + Safe Area 변수

components/
  ui/                       # 공통 디자인 시스템 컴포넌트
  ServiceTemplate.tsx       # ★ 서비스 신청 3단계 폼 (가장 많이 수정됨)
  BottomTabBar.tsx          # 하단 탭 (사용자)
  AdminTabBar.tsx           # 하단 탭 (관리자)
  NotificationProvider.tsx  # 알림 Context

lib/
  supabase.ts               # Supabase 클라이언트 (브라우저)
  constants.ts              # 서비스 enum, 색상, 라우트
  utils.ts                  # cn() 등
  pushNotifications.ts      # Capacitor Push 등록/핸들러
  localNotifications.ts     # Capacitor Local 알림

supabase/functions/         # Edge Functions (Solapi SMS)
android/                    # Capacitor Android 프로젝트
ios/                        # Capacitor iOS 프로젝트
design/                     # 시안, 스크린샷, 스토어 에셋
```

---

## 10. 알아두면 좋은 함정

### 10.1 Capacitor 라이브 URL 모드
`capacitor.config.ts`의 `server.url = 'https://homegascare.vercel.app'`이 설정되어 있어 **네이티브 앱은 번들된 `out/`을 쓰지 않고 Vercel을 라이브로 로드**합니다.

- 장점: JS 변경이 앱 재빌드 없이 즉시 반영 (배포 = `git push`)
- 단점: 인터넷 없으면 앱이 안 뜸. 네이티브 플러그인 호출은 동일하게 동작
- 완전 오프라인/번들 모드로 가려면 `server.url`을 주석처리하고 `npm run cap:sync` 필요

### 10.2 정적 export 제약
`output: 'export'` 모드라 SSR/Server Actions/Route Handlers 사용 불가. 모든 동적 데이터는 Supabase 클라이언트 호출로 처리.

### 10.3 SMS 발신번호 정규화
Solapi는 발신번호를 등록된 형식과 정확히 일치시켜야 합니다. `send-sms`의 `normalizePhone()`이 `+82` / `82` / `010` 어떤 입력이든 `010xxxxxxxx`로 변환하므로, `SOLAPI_CALLING_NUMBER` 시크릿은 어떤 형태든 무관.

### 10.4 OTA 업데이트 (Capgo) 제거됨
이전에 `@capgo/capacitor-updater`가 있었지만 현재는 빠졌습니다. 그 자리를 `@capacitor/local-notifications`, `@capacitor/push-notifications`가 차지합니다. OTA 필요해지면 다시 도입 검토.

### 10.5 디자인 토큰
`app/globals.css` 상단의 CSS 변수 + `DESIGN_SYSTEM.md`가 단일 출처. 새 색/간격을 만들기 전 항상 토큰부터 확인.

### 10.6 8px 그리드
스페이싱은 4의 배수, 가급적 8의 배수. Tailwind의 임의 값(`p-[13px]`)은 금지에 가깝게.

### 10.7 `'use client'` 기본
거의 모든 페이지가 클라이언트 컴포넌트. Supabase 직접 호출 + `useState/useEffect` 패턴이 표준.

---

## 11. 자주 하는 작업 레시피

### 새 서비스 종류 추가
1. `lib/constants.ts`에 서비스 정의 추가
2. `app/service/{newType}/page.tsx` 생성 → `ServiceTemplate` 사용
3. Supabase `services` 테이블에 행 추가
4. `app/page.tsx`(홈)의 서비스 그리드에 카드 추가

### 새 알림 종류 추가
1. Supabase에서 `notifications` 행을 만드는 트리거/RPC 작성
2. (선택) `send-notification-sms` 호출로 SMS 동시 발송
3. `app/notification/page.tsx`의 `getTypeIcon`에 아이콘 매핑 추가

### 페이지 추가 시 체크리스트
- 헤더는 `app-header` 클래스 + `BottomTabBar`가 필요한지 확인
- Safe Area: `page-content` / `page-bottom` / `pb-safe` 유틸 활용
- 이미지: `next/image` 대신 일반 `<img>` (정적 export 호환)

---

## 12. 새 머신 / 새 사람 합류 체크리스트

이 레포만 클론해도 작동하는 것 ↔ 별도로 챙겨야 하는 것을 명확히 구분.

### git 클론만으로 즉시 가능
- [x] 웹 개발 / 빌드 (`.env.local` 포함)
- [x] Android 빌드 + 서명 (`release.keystore` + 비번)
- [x] iOS 프로젝트 열기 (`cap:ios`로 Xcode 열림)
- [x] Edge Function 코드 보기/수정

### 별도로 필요한 외부 자원

| 무엇 | 어떻게 |
|---|---|
| **Apple ID 로그인** | Xcode → Settings → Accounts. 자동 서명이 Distribution 인증서까지 발급 |
| **iOS .p12 백업 (선택)** | `~/Documents/ios-signing-backup-*` (포맷 전 별도 보관 필수, git 금지) |
| **Supabase 프로젝트 접근** | https://supabase.com/dashboard/project/keiciweliichfgwdzoyc — 본인 계정이 owner. 신규 합류 시 `Add member` |
| **Solapi 시크릿** | **git에 없음.** Supabase Dashboard → Edge Functions → Secrets에 `SOLAPI_API_KEY` / `SOLAPI_API_SECRET` / `SOLAPI_CALLING_NUMBER` 이미 설정되어 있음. 같은 Supabase 프로젝트를 계속 쓰면 신경 안 써도 됨. 새 Supabase 프로젝트로 마이그레이션할 때만 다시 입력 |
| **Vercel 프로젝트** | https://vercel.com → `homegascare`. 본인 계정 연결됨. main 브랜치 push 시 자동 배포 |
| **Apple Developer 콘솔** | https://developer.apple.com — 인증서 revoke/재발급 등 |
| **App Store Connect** | https://appstoreconnect.apple.com — 빌드 업로드, 메타데이터 |
| **Play Console** | https://play.google.com/console |
| **Kakao Developers** | https://developers.kakao.com — REST/JS 키는 .env.local에 이미 있어서 추가 작업 불필요 |

### 새 사람이 합류한다면
1. GitHub 레포 collaborator 추가
2. Supabase 프로젝트 멤버 추가 (Edge Function 배포·DB 권한)
3. Vercel 프로젝트 멤버 추가 (자동 배포 트리거 권한)
4. (앱 빌드까지 한다면) Apple Developer Program / Play Console 사용자 추가
5. **이 문서 + `PROJECT_ANALYSIS.md` 읽으라고 안내**

---

## 13. 알려진 이슈

### Fastlane Fastfile의 워크스페이스 경로 오류
`ios/App/fastlane/Fastfile`이 `workspace: "App.xcworkspace"`를 참조하는데, Capacitor 8은 SPM으로 전환되어 해당 워크스페이스가 존재하지 않습니다. Fastlane을 쓰려면 `workspace:` 라인을 `project: "App.xcodeproj"`로 변경해야 합니다.
현재 수동(Xcode → Archive → Distribute) 배포만 검증되어 있으며, Fastlane 배포는 동작하지 않는 상태입니다.

---

## 14. 도움이 필요하면

- 빌드/배포 관련: 본 문서 + `package.json` 스크립트
- 디자인: `DESIGN_SYSTEM.md`
- 도메인 로직/구조: `PROJECT_ANALYSIS.md`
- 리디자인 의도: `REDESIGN_PLAN.md`
- Supabase 콘솔: https://supabase.com/dashboard/project/keiciweliichfgwdzoyc
- Vercel 대시보드: https://vercel.com → `homegascare` 프로젝트
