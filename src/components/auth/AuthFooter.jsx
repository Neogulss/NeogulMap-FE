export default function AuthFooter() {
  return (
    <footer className="auth-footer">
      <div className="auth-footer-inner">
        <div className="auth-footer-top">
          <div className="auth-footer-brand">
            <div className="auth-footer-brand-title">
              <div className="auth-footer-logo-mark">
                <img src="/neoguri.svg" alt="입지너구리 로고" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              입지너구리
            </div>
            <p className="auth-footer-company-info">
              (주)입지너구리 | 대표: 김너굴<br />
              사업자등록번호: 123-45-67890 | 통신판매업신고: 제2026-서울마포-0000호<br />
              서울특별시 마포구 합정동 123-45, 너구리빌딩 6층
            </p>
          </div>
          <div className="auth-footer-cs">
            <div className="auth-footer-cs-title">고객센터</div>
            <div className="auth-footer-cs-phone">1588-0000</div>
            <p className="auth-footer-cs-time">
              평일 09:00 - 18:00 (점심시간 12:00 - 13:00)<br />
              주말 및 공휴일 휴무
            </p>
          </div>
        </div>
        <div className="auth-footer-bottom">
          <div className="auth-footer-links">
            <a href="#">회사소개</a>
            <a href="#">이용약관</a>
            <a href="#" className="bold">개인정보처리방침</a>
            <a href="#">제휴문의</a>
            <a href="#">고객센터</a>
          </div>
          <div className="auth-footer-copy">© 2026 IPJI-NEOGURI Inc. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
