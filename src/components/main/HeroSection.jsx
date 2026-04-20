import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroBackground from '../../assets/images/배경화면.png';

const CYCLING_WORDS = ['입지를 검증', '상권을 분석', '매출을 예측', '경쟁을 파악'];

export default function HeroSection() {
    const navigate = useNavigate();
    const [wordIndex, setWordIndex] = useState(0);
    const [phase, setPhase] = useState('in'); // 'in' | 'out'

    useEffect(() => {
        const interval = setInterval(() => {
            setPhase('out');
            setTimeout(() => {
                setWordIndex(i => (i + 1) % CYCLING_WORDS.length);
                setPhase('in');
            }, 350);
        }, 2600);
        return () => clearInterval(interval);
    }, []);

    const handleScrollDown = () => {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    };

    return (
        <section
            className="hero-section"
            style={{
                backgroundImage: `url(${heroBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div className="hero-overlay" aria-hidden="true" />

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
                <div className="hero-content">
                    <h1 className="hero-h1">
                        <span className="hero-h1-top">창업 전에 먼저</span>
                        <span className="hero-h1-bottom">
                            <span className="hero-cycle-clip">
                                <em key={wordIndex} className={`hero-word-cycle hero-word-cycle--${phase}`}>
                                    {CYCLING_WORDS[wordIndex]}
                                </em>
                            </span>
                            하세요
                        </span>
                    </h1>

                    <p className="hero-desc">
                        매출·유동인구·경쟁 밀도까지, 한눈에 파악하세요.<br />
                        감이 아닌 데이터로 검증된 입지에서 시작하세요.
                    </p>

                    <div className="hero-ctas">
                        <button className="hero-cta-primary" onClick={() => navigate('/analysis')}>
                            입지 분석 시작하기
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                                <path d="M2 7.5h11M8.5 3l4.5 4.5L8.5 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>

                </div>
            </div>

            <button className="hero-scroll-hint" onClick={handleScrollDown} aria-label="아래로 스크롤">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4v12M4 11l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </section>
    );
}
