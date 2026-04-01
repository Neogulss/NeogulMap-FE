export default function AuthFooter() {
  return (
    <footer className="auth-footer">
      <div className="auth-footer-inner">
        <div className="auth-footer-top">
          <div className="auth-footer-brand">
            <div className="auth-footer-brand-title">
              <div className="auth-footer-logo-mark">
                <svg viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                  <ellipse cx="11" cy="14" rx="7" ry="6" fill="rgba(0,200,83,.15)" />
                  <circle cx="7" cy="7.5" r="3" fill="#00B34A" />
                  <circle cx="15" cy="7.5" r="3" fill="#00B34A" />
                  <circle cx="11" cy="14" r="5" fill="#fff" />
                  <circle cx="9" cy="13" r="1" fill="#1a1d20" />
                  <circle cx="13" cy="13" r="1" fill="#1a1d20" />
                </svg>
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
