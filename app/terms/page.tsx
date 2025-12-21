export const metadata = {
  title: '이용약관 - 우리동네가스',
  description: '우리동네가스 앱 이용약관입니다.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-center text-gray-900">
            이용약관
          </h1>
          <p className="text-center text-gray-600 mt-2">
            시행일: 2024년 1월 1일
          </p>
        </div>
      </header>

      {/* 본문 */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">제1조 (목적)</h2>
            <p className="text-gray-600 leading-relaxed">
              이 약관은 우리동네가스(이하 &quot;회사&quot;)가 제공하는 가스 시설 관리 서비스(이하 &quot;서비스&quot;)의
              이용 조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">제2조 (정의)</h2>
            <ul className="list-decimal list-inside text-gray-600 space-y-2">
              <li>&quot;서비스&quot;란 회사가 제공하는 가스 시설 관리 관련 모든 서비스를 의미합니다.</li>
              <li>&quot;회원&quot;이란 이 약관에 동의하고 서비스를 이용하는 자를 의미합니다.</li>
              <li>&quot;가게&quot;란 회원이 등록한 사업장 정보를 의미합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">제3조 (약관의 효력 및 변경)</h2>
            <ul className="list-decimal list-inside text-gray-600 space-y-2">
              <li>이 약관은 서비스를 이용하고자 하는 모든 회원에게 적용됩니다.</li>
              <li>회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해 공지합니다.</li>
              <li>회원이 변경된 약관에 동의하지 않는 경우, 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">제4조 (회원가입)</h2>
            <ul className="list-decimal list-inside text-gray-600 space-y-2">
              <li>서비스 이용을 원하는 자는 회사가 정한 절차에 따라 회원가입을 신청합니다.</li>
              <li>회사는 다음 각 호에 해당하는 경우 회원가입을 거절할 수 있습니다.
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>실명이 아니거나 타인의 정보를 이용한 경우</li>
                  <li>허위 정보를 기재한 경우</li>
                  <li>기타 회사가 정한 이용신청 요건을 충족하지 못한 경우</li>
                </ul>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">제5조 (서비스의 제공)</h2>
            <p className="text-gray-600 leading-relaxed">
              회사는 다음과 같은 서비스를 제공합니다.
            </p>
            <ul className="list-disc list-inside mt-4 text-gray-600 space-y-2">
              <li>화구 교체 서비스</li>
              <li>밸브 교체 서비스</li>
              <li>경보기 교체 서비스</li>
              <li>배관 시공 및 철거 서비스</li>
              <li>가스누출 검사 서비스</li>
              <li>시공견적 문의 서비스</li>
              <li>기타 회사가 정하는 서비스</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">제6조 (서비스 이용료 및 결제)</h2>
            <ul className="list-decimal list-inside text-gray-600 space-y-2">
              <li>서비스 이용료는 앱 내에 명시된 가격을 기준으로 합니다.</li>
              <li>결제는 서비스 완료 후 현장에서 진행됩니다.</li>
              <li>회사는 서비스 이용료를 변경할 수 있으며, 변경 시 사전에 공지합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">제7조 (회원의 의무)</h2>
            <p className="text-gray-600 leading-relaxed">
              회원은 다음 행위를 하여서는 안 됩니다.
            </p>
            <ul className="list-disc list-inside mt-4 text-gray-600 space-y-2">
              <li>허위 정보 등록</li>
              <li>타인의 정보 도용</li>
              <li>회사의 서비스 운영을 방해하는 행위</li>
              <li>기타 법령 및 본 약관에 위반되는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">제8조 (서비스 이용 제한)</h2>
            <p className="text-gray-600 leading-relaxed">
              회사는 회원이 본 약관을 위반하거나 서비스의 정상적인 운영을 방해한 경우,
              서비스 이용을 제한하거나 회원 자격을 상실시킬 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">제9조 (면책조항)</h2>
            <ul className="list-decimal list-inside text-gray-600 space-y-2">
              <li>회사는 천재지변, 시스템 장애 등 불가항력적인 사유로 서비스를 제공할 수 없는 경우 책임이 면제됩니다.</li>
              <li>회사는 회원의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">제10조 (분쟁해결)</h2>
            <p className="text-gray-600 leading-relaxed">
              서비스 이용과 관련하여 분쟁이 발생한 경우, 회사와 회원은 상호 협의하여 해결합니다.
              협의가 이루어지지 않을 경우, 관할 법원에 소송을 제기할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">부칙</h2>
            <p className="text-gray-600 leading-relaxed">
              이 약관은 2024년 1월 1일부터 시행합니다.
            </p>
          </section>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 우리동네가스. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="/support" className="text-sm text-gray-500 hover:text-gray-700">
              고객 지원
            </a>
            <a href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
              개인정보처리방침
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
