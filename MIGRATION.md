# 컴퓨터 이전 가이드

> 이 프로젝트의 **운영자 본인이 새 컴퓨터로 옮길 때** 챙겨야 하는 것들.
> 신규 합류자용 셋업은 [`ONBOARDING.md`](./ONBOARDING.md) 참조.

이 레포만 클론하면 자동으로 따라오는 것과, **레포 밖에서 별도로 옮겨야 하는 것**을 명확히 구분합니다.

---

## 0. 한 줄 요약

| 옮길 것 | 어디서 | 분실 시 |
|---|---|---|
| `release.keystore` | `android/app/release.keystore` (gitignore됨) | **Play Store 업데이트 영구 불가** |
| iOS 인증서 `.p12` + 개인키 | 키체인 → export | 재발급 가능 (다른 머신 영향 있음) |
| iOS 프로비저닝 프로파일 | `~/Library/Developer/Xcode/UserData/Provisioning Profiles/` | Xcode가 자동 재다운로드 |
| App Store Connect API Key `.p8` | 발급 시 1회만 다운로드 가능 | **재다운로드 불가** → 새 키 발급 |
| `.env.local` | 레포 루트 (이 레포는 커밋됨) | 깃에 있어서 안전 |
| 콘솔 로그인 (Supabase/Apple/Google/Solapi/Kakao/Vercel) | 1Password 등 비밀번호 관리자 | 각 콘솔에서 비번 재설정 |

---

## 1. 깃에 이미 있는 것 (= 자동으로 따라옴)

`git clone` 만으로 가져오는 것:

- 소스 코드 전체
- `.env.local` / `.env.example` (이 레포는 개인 운영이라 의도적으로 커밋됨)
- Android keystore 비밀번호 (`android/app/build.gradle`에 평문)
- Capacitor 설정, Fastfile, ONBOARDING.md, 디자인 토큰 등

> ⚠️ **보안 메모**: keystore 비밀번호와 `.env.local`이 깃에 평문으로 있는 건 운영 단순화를 위한 의도적 선택입니다. 외부 공개·협업 확대 시 [Gradle 환경변수 분리](https://developer.android.com/build/build-variants#signing) + Vercel/Supabase Vault로 옮기는 걸 권장.

---

## 2. 깃 밖에서 옮겨야 할 파일 (★ 핵심)

### 2.1 Android `release.keystore`

```
경로:  android/app/release.keystore
크기:  ~2.7 KB
별칭:  gas-app-key
비번:  android/app/build.gradle:11 참조 (현재 'gasservice2024')
```

**이게 가장 중요합니다.** 분실 시 동일 패키지명(`com.gasservice.app`)으로는 Play Store 업데이트를 영구히 발행 못 합니다.

복사 방법:
```bash
cp android/app/release.keystore /Volumes/<백업매체>/gas-web-2-migration/android/
# 새 컴퓨터에서:
cp /Volumes/<백업매체>/gas-web-2-migration/android/release.keystore <repo>/android/app/
```

### 2.2 Android `debug.keystore` (선택)

```
경로:  ~/.android/debug.keystore
```

없어도 첫 빌드 시 자동 생성되지만, 새로 만들면 디바이스의 "이 컴퓨터를 신뢰함" 기록이 리셋되어 USB 디버깅 시 재승인이 필요합니다.

### 2.3 iOS 코드 서명 인증서 (`.p12`)

**키체인 접근** 앱에서 GUI로만 export 가능 (CLI 불가):

1. `키체인 접근` 열기 → 왼쪽 "기본 키체인" → **로그인**
2. 카테고리 → **내 인증서** (그냥 "인증서"가 아니라 개인키가 붙은 것)
3. `Apple Development: <이름> (...)` 항목 우클릭 → **"내보내기..."**
4. 포맷: `개인 정보 교환(.p12)` → 비번 설정 → 저장
5. **(있으면)** `Apple Distribution: <이름> (...)`도 같은 방법으로 export

> 현재 머신에는 `Apple Development` 인증서 1개만 있습니다 (`security find-identity -v` 확인). 라이브 URL 모드로 운영 중이라 Distribution 인증서를 별도로 안 만들고 Xcode 자동 서명에 맡기는 패턴.

### 2.4 iOS 프로비저닝 프로파일

```
경로:  ~/Library/Developer/Xcode/UserData/Provisioning Profiles/
파일:  *.mobileprovision (현재 2개)
```

Xcode 16+에서 위 경로로 이동됨 (이전엔 `~/Library/MobileDevice/Provisioning Profiles/`).

새 컴퓨터에서는 Xcode에 Apple ID 로그인 후 **Settings → Accounts → Download Manual Profiles**로 자동 재다운로드도 가능하지만, 백업해 두면 즉시 빌드 가능.

### 2.5 App Store Connect API Key (`.p8`)

```
파일명: AuthKey_FZKJ4FC887.p8  (Key ID: FZKJ4FC887)
용도:   Fastlane으로 TestFlight/App Store 자동 업로드
참조:   ios/App/fastlane/Fastfile 의 APP_STORE_CONNECT_API_KEY_ID/ISSUER_ID/KEY 환경변수
```

**중요**: 이 파일은 App Store Connect에서 발급 시 **1회만 다운로드 가능**합니다. 분실 시 키를 새로 발급해야 합니다.

발급 위치: https://appstoreconnect.apple.com → Users and Access → Integrations → App Store Connect API

### 2.6 `.env.local` (안전망)

레포에 커밋되어 있지만, 만에 하나 실수로 누가 삭제·재작성할 가능성에 대비해 별도 사본을 챙겨두면 안전합니다.

```
경로: .env.local
포함: Supabase URL/anon key, Kakao 키, Admin user ID, 데모 계정 정보
```

---

## 3. 콘솔 로그인 정보 체크리스트 (1Password 등에 저장 필수)

| 서비스 | URL | 비고 |
|---|---|---|
| **Apple Developer** | https://developer.apple.com/account | 인증서/프로파일 관리, 팀 ID `72B5VAHKRZ` |
| **App Store Connect** | https://appstoreconnect.apple.com | 빌드 업로드, TestFlight, 심사 |
| **Google Play Console** | https://play.google.com/console | AAB 업로드, 출시 트랙 |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/keiciweliichfgwdzoyc | DB, Auth, Edge Functions Secrets |
| **Vercel** | https://vercel.com/dashboard | `homegascare` 프로젝트, 자동 배포 |
| **GitHub** | https://github.com/spagett1maker/gas-web-production | 소스 레포 |
| **Solapi** | https://console.solapi.com | SMS 발신 (API 키는 Supabase Secrets에 저장됨) |
| **Kakao Developers** | https://developers.kakao.com | 주소/지도 SDK 키 (`.env.local`에 있음) |

---

## 4. 외부 시스템에 저장된 시크릿 (옮길 게 없음, 로그인만)

같은 Supabase 프로젝트를 계속 쓰면 다시 입력할 필요 없는 것들:

- **Supabase Edge Functions Secrets**: `SOLAPI_API_KEY`, `SOLAPI_API_SECRET`, `SOLAPI_CALLING_NUMBER`
  - Supabase Dashboard → Project → Edge Functions → Secrets
- **Vercel Environment Variables**: 현재는 모든 변수가 `NEXT_PUBLIC_*`이라 `.env.local`로 충분
- **Apple Push Notification Service (APNs) 키**: Capacitor Push 사용 시 Apple Developer Console에 등록되어 있음

---

## 5. 표준 백업 절차 (이 레포 기준)

외장하드/안전한 위치에 다음 구조로 백업:

```
/Volumes/<백업매체>/gas-web-2-migration-YYYY-MM-DD/
├── android/
│   ├── release.keystore          ← 필수
│   └── debug.keystore            ← 선택
├── ios/
│   ├── cert/
│   │   ├── apple-development-cert.p12
│   │   ├── apple-distribution-cert.p12  (있으면)
│   │   └── P12_PASSWORD.txt
│   ├── profiles/
│   │   └── *.mobileprovision
│   └── appstoreconnect/
│       └── AuthKey_FZKJ4FC887.p8
└── env/
    ├── .env.local
    └── .env.example
```

복사 명령 (한 번에):

```bash
DEST="/Volumes/T7/gas-web-2-migration-$(date +%Y-%m-%d)"
mkdir -p "$DEST"/{android,ios/cert,ios/profiles,ios/appstoreconnect,env}

# Android
cp android/app/release.keystore "$DEST/android/"
cp ~/.android/debug.keystore "$DEST/android/" 2>/dev/null

# iOS profiles + AuthKey
cp ~/Library/Developer/Xcode/UserData/Provisioning\ Profiles/*.mobileprovision "$DEST/ios/profiles/"
cp ~/Downloads/AuthKey_*.p8 "$DEST/ios/appstoreconnect/" 2>/dev/null

# env
cp .env.local .env.example "$DEST/env/"

# iOS p12는 키체인 접근 앱에서 GUI로 export → $DEST/ios/cert/ 에 저장
```

---

## 6. 새 컴퓨터에서 복원 순서

### 6.1 기본 환경

```bash
# Xcode (App Store), Android Studio, Node 20 LTS, JDK 17, CocoaPods, Supabase CLI
# 자세한 사전 요구사항은 ONBOARDING.md 1번 참조
```

### 6.2 레포 클론

```bash
git clone https://github.com/spagett1maker/gas-web-production.git
cd gas-web-production
npm install
```

### 6.3 Android keystore 복원

```bash
cp /Volumes/<백업매체>/gas-web-2-migration-*/android/release.keystore android/app/
cp /Volumes/<백업매체>/gas-web-2-migration-*/android/debug.keystore ~/.android/ 2>/dev/null
```

검증:
```bash
keytool -list -keystore android/app/release.keystore -alias gas-app-key
# (비번은 build.gradle 참조)
```

### 6.4 iOS 인증서 복원

```bash
# 1) p12를 더블클릭 → 키체인에 import (비번 입력)
open /Volumes/<백업매체>/gas-web-2-migration-*/ios/cert/apple-development-cert.p12

# 2) 프로파일 복사
mkdir -p ~/Library/Developer/Xcode/UserData/Provisioning\ Profiles/
cp /Volumes/<백업매체>/gas-web-2-migration-*/ios/profiles/*.mobileprovision \
   ~/Library/Developer/Xcode/UserData/Provisioning\ Profiles/

# 3) AuthKey (Fastlane용)
cp /Volumes/<백업매체>/gas-web-2-migration-*/ios/appstoreconnect/AuthKey_*.p8 ~/Downloads/
# 또는 Fastfile이 읽는 경로로 (현재는 환경변수로 base64 전달)
```

검증:
```bash
security find-identity -v -p codesigning
# "Apple Development: ..." 가 보여야 함
```

### 6.5 iOS pod + 빌드 테스트

```bash
cd ios/App && pod install && cd ../..
npm run cap:ios   # Xcode 열림 → Signing & Capabilities에 Team 정상 노출 확인
```

### 6.6 Android 빌드 테스트

```bash
npm run cap:build:android
cd android && ./gradlew bundleRelease
# → android/app/build/outputs/bundle/release/app-release.aab 생성되면 성공
```

### 6.7 콘솔 로그인

- Supabase CLI: `supabase login` → `supabase link --project-ref keiciweliichfgwdzoyc`
- Xcode: Settings → Accounts → Apple ID 로그인 → "Download Manual Profiles"
- Vercel: `vercel login` (선택, CLI 사용 시)
- 나머지는 브라우저에서 비밀번호 관리자로 로그인

---

## 7. 검증 체크리스트

복원 후 한 번씩 돌려보고 다 통과하면 마이그레이션 완료:

- [ ] `npm run dev` → http://localhost:3000 정상 동작
- [ ] `npm run build` → `out/` 생성, 에러 없음
- [ ] `npm run cap:ios` → Xcode 열림, Team/Signing 자동 인식
- [ ] Xcode → Product → Build → 시뮬레이터 빌드 성공
- [ ] `npm run cap:build:android` → 에러 없음
- [ ] `./gradlew bundleRelease` → AAB 생성됨
- [ ] Supabase CLI: `supabase functions list` 동작
- [ ] 브라우저에서 https://homegascare.vercel.app 접속 → 데모 계정 로그인 동작

---

## 8. 옮긴 후 구 컴퓨터에서 할 일 (보안)

새 머신 검증이 끝났다면 구 머신에서:

1. **키체인의 인증서 개인키** 삭제 (분실 시 악용 방지)
2. `release.keystore`, `AuthKey_*.p8` 등 민감 파일 삭제
3. SSH 키 / Supabase / Vercel / GitHub 토큰 revoke 후 새 발급 (선택, 보안 강화)
4. 디스크 암호화 상태 확인 후 초기화 (FileVault 켜져 있으면 데이터 복구 어려움)

---

## 9. 트러블슈팅

### "키체인에서 p12 import 후에도 인증서가 안 보임"
- `security find-identity -v -p codesigning` 결과가 비어 있으면, p12에 개인키가 같이 안 들어간 것
- 다시 export 시 "내 인증서" 카테고리에서 선택했는지 확인 (그냥 "인증서"에선 공개키만 나옴)

### "Xcode가 프로파일을 못 찾음"
- `~/Library/Developer/Xcode/UserData/Provisioning Profiles/` 경로 맞는지 확인
- Xcode → Settings → Accounts → Download Manual Profiles 한 번 클릭

### "release.keystore로 서명한 AAB가 Play Console에서 거부됨"
- 키 alias 또는 비밀번호 오타: `build.gradle`의 `keyAlias`, `storePassword`, `keyPassword` 확인
- keystore SHA-1 확인: `keytool -list -v -keystore release.keystore`

### "Fastlane이 App Store Connect 인증 실패"
- 환경변수 `APP_STORE_CONNECT_API_KEY_ID` (= 파일명 FZKJ4FC887 부분), `APP_STORE_CONNECT_ISSUER_ID`, `APP_STORE_CONNECT_API_KEY` (.p8 파일 내용 그대로) 설정 확인
- API Key 파일 권한: `chmod 600 AuthKey_*.p8`
