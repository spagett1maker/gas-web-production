import Image from 'next/image'

export const metadata = {
  title: '고객 지원 - 우리동네가스',
  description: '우리동네가스 앱 고객 지원 페이지입니다.',
}

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-20 h-20">
              <Image
                src="/images/logo2.png"
                alt="우리동네가스 로고"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-900">
            고객 지원
          </h1>
          <p className="text-center text-gray-600 mt-2">
            우리동네가스 앱 이용에 도움이 필요하신가요?
          </p>
        </div>
      </header>

      {/* 본문 */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* 자주 묻는 질문 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">자주 묻는 질문</h2>

          <div className="space-y-4">
            <details className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                서비스 요청은 어떻게 하나요?
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                앱 홈 화면에서 원하시는 서비스(화구 교체, 밸브 교체, 경보기 교체 등)를 선택하신 후,
                필요한 수량과 방문 희망 일정을 입력하시면 서비스 요청이 완료됩니다.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                서비스 요청 후 취소가 가능한가요?
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                네, 가능합니다. &apos;나의 서비스&apos; 메뉴에서 해당 요청을 선택하신 후
                &apos;주문 취소&apos; 버튼을 눌러 취소하실 수 있습니다.
                단, 작업이 진행 중인 경우에는 취소가 어려울 수 있습니다.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                결제는 어떻게 진행되나요?
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                서비스 완료 후 현장에서 결제가 진행됩니다.
                카드 결제, 현금 결제, 계좌 이체 등 다양한 결제 방법을 지원합니다.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                가게 정보를 변경하고 싶어요.
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                프로필 메뉴에서 &apos;내 가게 정보&apos;를 선택하시면
                가게 이름, 주소 등의 정보를 수정하실 수 있습니다.
              </p>
            </details>

            <details className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                로그인이 안 돼요.
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                회원가입 시 등록하신 전화번호로 로그인해주세요.
                인증번호가 오지 않는 경우, 전화번호가 정확한지 확인하시고
                잠시 후 다시 시도해주세요. 문제가 지속되면 고객센터로 문의해주세요.
              </p>
            </details>
          </div>
        </section>

        {/* 문의하기 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">문의하기</h2>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">이메일 문의</h3>
                  <a href="mailto:support@gasservice.app" className="text-orange-600 hover:underline">
                    support@gasservice.app
                  </a>
                  <p className="text-sm text-gray-500 mt-1">
                    영업일 기준 24시간 이내 답변드립니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">전화 문의</h3>
                  <a href="tel:1588-0000" className="text-orange-600 hover:underline">
                    1588-0000
                  </a>
                  <p className="text-sm text-gray-500 mt-1">
                    평일 09:00 - 18:00 (점심시간 12:00 - 13:00)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">주소</h3>
                  <p className="text-gray-600">
                    서울특별시 강남구 테헤란로 123
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 앱 정보 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">앱 정보</h2>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">앱 이름</span>
                <span className="font-medium text-gray-900">우리동네가스</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">버전</span>
                <span className="font-medium text-gray-900">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">개발사</span>
                <span className="font-medium text-gray-900">우리동네가스</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 우리동네가스. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
              개인정보처리방침
            </a>
            <a href="/terms" className="text-sm text-gray-500 hover:text-gray-700">
              이용약관
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
