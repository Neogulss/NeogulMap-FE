export default function HeroSection() {
    return (
        <section className="hero-section">
            <div className="hero-grid" />
            <div className="hero-glow" />

            <div className="hero-inner">
                <div className="hero-top">
                    <div className="hero-text">
                        <div className="hero-eyebrow">
                            <span className="eyebrow-line" />
                            <span className="eyebrow-text">AI Commercial Analysis Platform</span>
                        </div>
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
                            onClick={() => alert('맞춤형 입지 분석 페이지로 이동합니다.')}
                        >
                            AI 리포트 작성하러 가기
                        </button>
                    </div>
                </div>

                <div className="hero-map-container">
                    <svg
                        className="city-svg"
                        viewBox="0 0 1300 400"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="xMinYMax slice"
                    >
                        <g stroke="#1a1d20" strokeWidth="2" fill="#ffffff" strokeLinejoin="round" strokeLinecap="round">

                            <path d="M 750 90 Q 760 80 770 90 Q 785 85 790 100 Q 800 110 785 115 H 755 Q 740 110 750 90" />

                            <path d="M 570 360 V 90 L 610 60 V 360 Z" />
                            <line x1="610" y1="60" x2="630" y2="90" />
                            <line x1="630" y1="90" x2="630" y2="360" />
                            <line x1="590" y1="120" x2="590" y2="360" />
                            <line x1="570" y1="150" x2="630" y2="150" />
                            <line x1="570" y1="200" x2="630" y2="200" />
                            <line x1="570" y1="250" x2="630" y2="250" />
                            <line x1="570" y1="300" x2="630" y2="300" />

                            <rect x="650" y="180" width="60" height="180" />
                            <line x1="650" y1="190" x2="710" y2="190" />
                            <line x1="650" y1="210" x2="710" y2="210" />
                            <line x1="650" y1="230" x2="710" y2="230" />
                            <line x1="650" y1="250" x2="710" y2="250" />
                            <line x1="650" y1="270" x2="710" y2="270" />
                            <line x1="650" y1="290" x2="710" y2="290" />
                            <line x1="650" y1="310" x2="710" y2="310" />
                            <line x1="650" y1="330" x2="710" y2="330" />
                            <line x1="650" y1="350" x2="710" y2="350" />

                            <path d="M 730 360 V 160 L 780 200 V 360 Z" />
                            <line x1="740" y1="180" x2="740" y2="360" />
                            <line x1="755" y1="190" x2="755" y2="360" />
                            <line x1="770" y1="200" x2="770" y2="360" />

                            <rect x="800" y="240" width="50" height="120" />
                            <rect x="810" y="255" width="10" height="15" />
                            <rect x="830" y="255" width="10" height="15" />
                            <rect x="810" y="285" width="10" height="15" />
                            <rect x="830" y="285" width="10" height="15" />
                            <rect x="810" y="315" width="10" height="15" />
                            <rect x="830" y="315" width="10" height="15" />

                            <rect x="870" y="120" width="70" height="240" />
                            <rect x="885" y="140" width="10" height="20" />
                            <rect x="915" y="140" width="10" height="20" />
                            <rect x="885" y="180" width="10" height="20" />
                            <rect x="915" y="180" width="10" height="20" />
                            <rect x="885" y="220" width="10" height="20" />
                            <rect x="915" y="220" width="10" height="20" />
                            <rect x="885" y="260" width="10" height="20" />
                            <rect x="915" y="260" width="10" height="20" />
                            <rect x="885" y="300" width="10" height="20" />
                            <rect x="915" y="300" width="10" height="20" />
                            <rect x="885" y="340" width="10" height="20" />
                            <rect x="915" y="340" width="10" height="20" />

                            <rect x="960" y="180" width="60" height="180" />
                            <line x1="975" y1="180" x2="975" y2="360" />
                            <line x1="1005" y1="180" x2="1005" y2="360" />

                            <path d="M 1040 360 V 100 L 1090 140 V 360 Z" />
                            <line x1="1040" y1="150" x2="1080" y2="150" />
                            <line x1="1040" y1="190" x2="1090" y2="190" />
                            <line x1="1040" y1="230" x2="1090" y2="230" />
                            <line x1="1040" y1="270" x2="1090" y2="270" />
                            <line x1="1040" y1="310" x2="1090" y2="310" />

                            <rect x="1110" y="220" width="80" height="140" />
                            <rect x="1125" y="240" width="50" height="100" />
                            <line x1="1125" y1="260" x2="1175" y2="260" />
                            <line x1="1125" y1="280" x2="1175" y2="280" />
                            <line x1="1125" y1="300" x2="1175" y2="300" />
                            <line x1="1125" y1="320" x2="1175" y2="320" />

                            <rect x="1210" y="150" width="60" height="210" />
                            <line x1="1210" y1="170" x2="1270" y2="170" />
                            <line x1="1210" y1="190" x2="1270" y2="190" />
                            <line x1="1210" y1="210" x2="1270" y2="210" />
                            <line x1="1210" y1="230" x2="1270" y2="230" />
                            <line x1="1210" y1="250" x2="1270" y2="250" />
                            <line x1="1210" y1="270" x2="1270" y2="270" />
                            <line x1="1210" y1="290" x2="1270" y2="290" />
                            <line x1="1210" y1="310" x2="1270" y2="310" />
                            <line x1="1210" y1="330" x2="1270" y2="330" />
                            <line x1="1210" y1="350" x2="1270" y2="350" />

                            <circle cx="390" cy="335" r="10" fill="#fff" />
                            <line x1="390" y1="345" x2="390" y2="360" />
                            <circle cx="700" cy="340" r="8" fill="#fff" />
                            <line x1="700" y1="348" x2="700" y2="360" />
                            <circle cx="930" cy="330" r="12" fill="#fff" />
                            <line x1="930" y1="342" x2="930" y2="360" />

                            <rect x="0" y="360" width="1300" height="40" fill="#ffffff" stroke="none" />
                            <line x1="0" y1="360" x2="1300" y2="360" strokeWidth="2" />
                            <line x1="0" y1="375" x2="1300" y2="375" strokeDasharray="16 16" strokeWidth="2" />
                            <line x1="0" y1="390" x2="1300" y2="390" strokeWidth="2" />
                        </g>

                        {/* 자동차 1 */}
                        <g transform="translate(0, 368)">
                            <g className="car-anim-1">
                                <path d="M -15 -10 L -5 -20 H 15 L 25 -10 H 30 A 2 2 0 0 1 30 0 H -20 A 2 2 0 0 1 -20 -10 Z" fill="#ffffff" stroke="#1a1d20" strokeWidth="2" strokeLinejoin="round" />
                                <line x1="0" y1="-20" x2="0" y2="-10" stroke="#1a1d20" strokeWidth="2" />
                                <circle cx="-10" cy="0" r="4.5" fill="#ffffff" stroke="#1a1d20" strokeWidth="2" />
                                <circle cx="20" cy="0" r="4.5" fill="#ffffff" stroke="#1a1d20" strokeWidth="2" />
                            </g>
                        </g>

                        {/* 자동차 2 */}
                        <g transform="translate(0, 383)">
                            <g className="car-anim-2">
                                <path d="M -25 -25 H 5 V -10 H 20 L 25 -5 V 0 H -25 Z" fill="#ffffff" stroke="#1a1d20" strokeWidth="2" strokeLinejoin="round" />
                                <line x1="5" y1="-25" x2="5" y2="0" stroke="#1a1d20" strokeWidth="2" />
                                <circle cx="-12" cy="0" r="4.5" fill="#ffffff" stroke="#1a1d20" strokeWidth="2" />
                                <circle cx="12" cy="0" r="4.5" fill="#ffffff" stroke="#1a1d20" strokeWidth="2" />
                            </g>
                        </g>

                        {/* 자동차 3 */}
                        <g transform="translate(0, 368)">
                            <g className="car-anim-3">
                                <path d="M -15 -10 L -10 -20 H 5 Q 15 -20 20 -10 H 25 A 2 2 0 0 1 25 0 H -20 A 2 2 0 0 1 -20 -10 Z" fill="#ffffff" stroke="#1a1d20" strokeWidth="2" strokeLinejoin="round" />
                                <circle cx="-10" cy="0" r="4.5" fill="#ffffff" stroke="#1a1d20" strokeWidth="2" />
                                <circle cx="15" cy="0" r="4.5" fill="#ffffff" stroke="#1a1d20" strokeWidth="2" />
                            </g>
                        </g>
                    </svg>
                </div>
            </div>
        </section>
    );
}
