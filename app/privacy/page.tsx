export const metadata = {
  title: '개인정보처리방침 - 우리동네가스',
  description: '우리동네가스 앱 개인정보처리방침입니다.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-center text-gray-900">
            개인정보처리방침
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. 개인정보의 수집 및 이용 목적</h2>
            <p className="text-gray-600 leading-relaxed">
              우리동네가스(이하 &quot;회사&quot;)는 다음의 목적을 위하여 개인정보를 처리합니다.
              처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
              이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc list-inside mt-4 text-gray-600 space-y-2">
              <li>회원 가입 및 관리: 회원제 서비스 이용에 따른 본인확인, 서비스 부정이용 방지</li>
              <li>서비스 제공: 가스 시설 관리 서비스 제공, 서비스 요청 처리</li>
              <li>고객 상담: 민원처리, 고지사항 전달</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. 수집하는 개인정보 항목</h2>
            <p className="text-gray-600 leading-relaxed">
              회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.
            </p>
            <ul className="list-disc list-inside mt-4 text-gray-600 space-y-2">
              <li>필수 항목: 휴대폰 번호, 가게명, 가게 주소</li>
              <li>선택 항목: 이메일 주소</li>
              <li>자동 수집 항목: 서비스 이용 기록, 접속 로그</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. 개인정보의 보유 및 이용 기간</h2>
            <p className="text-gray-600 leading-relaxed">
              회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에
              동의 받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.
            </p>
            <ul className="list-disc list-inside mt-4 text-gray-600 space-y-2">
              <li>회원 정보: 회원 탈퇴 시까지</li>
              <li>서비스 이용 기록: 3년</li>
              <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. 개인정보의 제3자 제공</h2>
            <p className="text-gray-600 leading-relaxed">
              회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
              다만, 다음의 경우에는 예외로 합니다.
            </p>
            <ul className="list-disc list-inside mt-4 text-gray-600 space-y-2">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. 개인정보의 파기</h2>
            <p className="text-gray-600 leading-relaxed">
              회사는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는
              지체 없이 해당 개인정보를 파기합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. 이용자의 권리</h2>
            <p className="text-gray-600 leading-relaxed">
              이용자는 언제든지 다음의 권리를 행사할 수 있습니다.
            </p>
            <ul className="list-disc list-inside mt-4 text-gray-600 space-y-2">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리 정지 요구</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. 개인정보 보호책임자</h2>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-600">
              <p>성명: 홍길동</p>
              <p>직책: 개인정보 보호책임자</p>
              <p>이메일: privacy@gasservice.app</p>
              <p>전화: 1588-0000</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. 개인정보처리방침 변경</h2>
            <p className="text-gray-600 leading-relaxed">
              이 개인정보처리방침은 2024년 1월 1일부터 적용됩니다.
              변경 사항이 있을 경우 앱 내 공지사항을 통해 고지할 예정입니다.
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
            <a href="/terms" className="text-sm text-gray-500 hover:text-gray-700">
              이용약관
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
