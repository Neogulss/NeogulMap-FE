import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
    const navigate = useNavigate();

    const handleScrollDown = () => {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    };

    return (
        <section className="hero-section">
            <div className="hero-grid" />
            <div className="hero-glow" />
            <div className="hero-planes" aria-hidden="true">
                <div className="hero-plane plane-a">
                    <span className="hero-plane-trail" />
                    <svg viewBox="0 0 64 64" className="hero-plane-icon" fill="none">
                        <path d="M55.5 31.2c1.7-.5 2.5-2.5 1.7-4.1-.4-.8-1.1-1.3-1.9-1.5l-18.8-4.7L27.9 7.6c-.7-1.1-2-1.6-3.3-1.3-1.7.4-2.8 2.1-2.4 3.8L25.9 24l-10.4 2.6-5.7-4.2c-.7-.6-1.6-.8-2.5-.6-1.7.4-2.8 2.1-2.4 3.8.1.5.4 1 .8 1.4l5.5 5.1c.8.8 2 1.1 3.1.8l11-2.8 8.6 13.8c.7 1.1 2 1.6 3.3 1.3 1.7-.4 2.8-2.1 2.4-3.8L36 28.6l19.5 2.6Z" fill="currentColor" />
                    </svg>
                </div>
                <div className="hero-plane plane-b">
                    <span className="hero-plane-trail" />
                    <svg viewBox="0 0 64 64" className="hero-plane-icon" fill="none">
                        <path d="M55.5 31.2c1.7-.5 2.5-2.5 1.7-4.1-.4-.8-1.1-1.3-1.9-1.5l-18.8-4.7L27.9 7.6c-.7-1.1-2-1.6-3.3-1.3-1.7.4-2.8 2.1-2.4 3.8L25.9 24l-10.4 2.6-5.7-4.2c-.7-.6-1.6-.8-2.5-.6-1.7.4-2.8 2.1-2.4 3.8.1.5.4 1 .8 1.4l5.5 5.1c.8.8 2 1.1 3.1.8l11-2.8 8.6 13.8c.7 1.1 2 1.6 3.3 1.3 1.7-.4 2.8-2.1 2.4-3.8L36 28.6l19.5 2.6Z" fill="currentColor" />
                    </svg>
                </div>
            </div>

            <div className="hero-inner">
                <div className="hero-top">
                    <div className="hero-text">
                        <div className="hero-headline">
                            <span className="ph-title-light">데이터로 검증한 입지,</span>
                            <span className="ph-title-bold">지금 확인하세요</span>
                        </div>
                        <p className="hero-desc">
                            전국 상권의 유동인구·매출·경쟁 현황을 AI가 실시간으로 분석합니다.
                            감에 의존하지 말고 숫자로 먼저 검증하세요.
                        </p>
                        <button
                            className="btn-action"
                            onClick={() => navigate('/analysis')}
                        >
                            AI 리포트 작성하러 가기
                        </button>
                    </div>
                </div>
            </div>

            <div className="hero-map-container">
                <img src="/hero-cityscape.png" alt="도시 전경" className="hero-cityscape-img" />
            </div>

            <div className="hero-bottom-blur" />
            <div className="hero-bottom-fade" />

            <div className="hero-scroll-hint">
                <button className="scroll-down-text" onClick={handleScrollDown}>
                    <span>아래로 스크롤</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 3v10M3 9l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </section>
    );
}
