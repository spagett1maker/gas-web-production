# 우리동네가스 (gas-web-2)

가스 서비스 예약/관리 하이브리드 모바일 앱.
**Next.js 16 (정적 export) + Supabase + Capacitor 8 + Tailwind 4**

| 플랫폼 | 상태 |
|---|---|
| Web | https://homegascare.vercel.app |
| iOS | App Store (`com.gasservice.app`) |
| Android | Play Store (`com.gasservice.app`) |

---

## 빠른 시작

```bash
npm install
cp .env.example .env.local   # .env.local 값 채우기
npm run dev                  # http://localhost:3000
```

모바일 빌드:
```bash
npm run cap:ios       # Xcode 열림
npm run cap:android   # Android Studio 열림
```

---

## 문서

| 파일 | 내용 |
|---|---|
| [`ONBOARDING.md`](./ONBOARDING.md) | **신규 합류 시 가장 먼저 읽기.** 환경 세팅, 빌드, iOS/Android 배포, 함정 |
| [`PROJECT_ANALYSIS.md`](./PROJECT_ANALYSIS.md) | 기술 스택, 디렉토리, DB 스키마, 인증 흐름 |
| [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) | 컬러/타이포/스페이싱 토큰, 컴포넌트 가이드 |
| [`REDESIGN_PLAN.md`](./REDESIGN_PLAN.md) | UX 리디자인 배경/벤치마킹 |
