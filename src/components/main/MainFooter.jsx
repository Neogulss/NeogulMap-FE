export default function MainFooter() {
    return (
        <footer className="main-footer">
            <div className="footer-inner">
                <div className="footer-top">
                    <div className="footer-brand">
                        <div className="footer-brand-title">
                            <div className="logo-mark">
                                <img src="/neoguri.svg" alt="Ipji Neoguri Footer Icon" />
                            </div>
                            입지너구리
                        </div>
                        <p className="footer-company-info">
                            (주)입지너구리 | 대표: 김너굴<br />
                            사업자등록번호: 123-45-67890 | 통신판매업신고: 제2026-서울마포-0000호<br />
                            서울특별시 마포구 합정동 123-45, 너구리빌딩 6층
                        </p>
                    </div>

                    <div className="footer-cs">
                        <div className="footer-cs-title">고객센터</div>
                        <div className="footer-cs-phone">1588-0000</div>
                        <p className="footer-cs-time">
                            평일 09:00 - 18:00 (점심시간 12:00 - 13:00)<br />
                            주말 및 공휴일 휴무
                        </p>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-links">
                        <a href="#">회사소개</a>
                        <a href="#">이용약관</a>
                        <a href="#" className="bold">개인정보처리방침</a>
                        <a href="#">제휴문의</a>
                        <a href="#">고객센터</a>
                    </div>
                    <div className="footer-copy">© 2026 IPJI-NEOGURI Inc. All rights reserved.</div>
                </div>
            </div>
        </footer>
    );
}
