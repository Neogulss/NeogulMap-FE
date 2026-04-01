import { useNavigate } from 'react-router-dom';

export default function MainNav() {
    const navigate = useNavigate();

    return (
        <nav className="main-nav">
            <a
                className="nav-logo"
                href="#"
                onClick={e => { e.preventDefault(); navigate('/'); }}
            >
                <div className="logo-mark">
                    <img src="/neoguri.svg" alt="입지너구리 로고 아이콘" />
                </div>
                <div className="logo-text-wrap">
                    <span className="logo-ko">입지너구리</span>
                    <span className="logo-en">AI 상권분석 서비스</span>
                </div>
            </a>

            <div className="nav-center">
                <a href="#" className="on" onClick={e => { e.preventDefault(); navigate('/analysis'); }}>상권분석</a>
                <a href="#" onClick={e => { e.preventDefault(); navigate('/community'); }}>커뮤니티</a>
                <a href="#" onClick={e => { e.preventDefault(); navigate('/notice'); }}>공지사항</a>
                <a href="#" onClick={e => { e.preventDefault(); navigate('/mypage'); }}>마이페이지</a>
                <a href="#" onClick={e => { e.preventDefault(); navigate('/chatbot'); }}>챗봇</a>
            </div>

            <div className="nav-right">
                <button className="nav-btn-ghost" onClick={() => navigate('/auth/signin')}>로그인</button>
                <button className="nav-btn-solid" onClick={() => navigate('/auth/signup')}>회원가입</button>
            </div>
        </nav>
    );
}
