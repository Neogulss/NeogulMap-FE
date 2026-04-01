/* ── 카드 공통 헤더 ─────────────────────────── */
function CardHeader({ title, accent, date }) {
    return (
        <div className="gc-header">
            <div className="gc-title-wrap">
                <span className={`gc-title${accent ? ' accent' : ''}`}>{title}</span>
                <span className="gc-date">기준년월 {date}</span>
            </div>
            <div className="gc-click">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 7h10v10M17 7L7 17" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>클릭</span>
            </div>
        </div>
    );
}

/* ── 카드 공통 헤더 (v3 화살표) ──────────────── */
function CardHeaderV3({ title, date }) {
    return (
        <div className="gc-header">
            <div className="gc-title-wrap">
                <span className="gc-title">{title}</span>
                <span className="gc-date">기준년월 {date}</span>
            </div>
            <div className="gc-click">
                <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
                <span>클릭</span>
            </div>
        </div>
    );
}

export default function DashboardSection() {
    return (
        <section className="dashboard-section">
            <div className="dashboard-inner">

                <div className="dashboard-header">
                    <h2 className="dh-title">서울특별시 마포구 서교동 상권 정보</h2>
                </div>

                <div className="hero-dashboard-grid">

                    {/* 카드 1 — 평균매출 */}
                    <div className="grid-card">
                        <CardHeader title="평균매출은?" accent date="2025년 12월" />
                        <div className="gc-illus">
                            <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                                <line x1="20" y1="95" x2="100" y2="95" stroke="#1a1d20" strokeWidth="3" strokeLinecap="round" />
                                <line x1="20" y1="25" x2="20"  y2="95" stroke="#1a1d20" strokeWidth="3" strokeLinecap="round" />
                                <rect x="35" y="65" width="14" height="30" fill="#e8f5e8" stroke="#1a1d20" strokeWidth="2.5" rx="2" />
                                <rect x="55" y="45" width="14" height="50" fill="#00C853" stroke="#1a1d20" strokeWidth="2.5" rx="2" />
                                <rect x="75" y="25" width="14" height="70" fill="#D4AF37" stroke="#1a1d20" strokeWidth="2.5" rx="2" />
                                <path d="M 25 55 L 50 35 L 70 45 L 95 15" fill="none" stroke="#1a1d20" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M 80 15 H 95 V 30"               fill="none" stroke="#1a1d20" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="gc-val-wrap">
                            <div className="gc-val-main">월 평균 <strong>6,240</strong>만원</div>
                            <div className="gc-val-sub">서울특별시 양천구 <strong>월 평균 10,075만원</strong></div>
                        </div>
                    </div>

                    {/* 카드 2 — 업소 수 */}
                    <div className="grid-card">
                        <CardHeader title="업소 수는?" date="2025년 12월" />
                        <div className="gc-illus">
                            <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                                <rect x="25" y="50" width="70" height="50" fill="#ffffff" stroke="#1a1d20" strokeWidth="3" rx="4" />
                                <path d="M 15 50 L 25 35 H 95 L 105 50 Z" fill="#D4AF37" stroke="#1a1d20" strokeWidth="3" strokeLinejoin="round" />
                                <line x1="40" y1="35" x2="35" y2="50" stroke="#1a1d20" strokeWidth="3" />
                                <line x1="60" y1="35" x2="60" y2="50" stroke="#1a1d20" strokeWidth="3" />
                                <line x1="80" y1="35" x2="85" y2="50" stroke="#1a1d20" strokeWidth="3" />
                                <rect x="45" y="65" width="30" height="35" fill="#e8f5e8" stroke="#1a1d20" strokeWidth="3" rx="2" />
                                <circle cx="68" cy="82" r="2" fill="#1a1d20" />
                                <path d="M 60 5 C 50 5 42 13 42 23 C 42 35 60 55 60 55 C 60 55 78 35 78 23 C 78 13 70 5 60 5 Z" fill="#00C853" stroke="#1a1d20" strokeWidth="3" strokeLinejoin="round" />
                                <circle cx="60" cy="22" r="5" fill="#ffffff" stroke="#1a1d20" strokeWidth="3" />
                            </svg>
                        </div>
                        <div className="gc-val-wrap">
                            <div className="gc-val-main"><strong>187</strong>개</div>
                            <div className="gc-val-sub">서울특별시 양천구 <strong>19,347 개</strong></div>
                        </div>
                    </div>

                    {/* 카드 3 — 유동인구 */}
                    <div className="grid-card">
                        <CardHeader title="유동인구는?" date="2025년 12월" />
                        <div className="gc-illus">
                            <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="35" cy="40" r="10" fill="#e8f5e8" stroke="#1a1d20" strokeWidth="3" />
                                <path d="M 15 95 V 70 C 15 60 25 55 35 55 C 45 55 55 60 55 70 V 95" fill="#e8f5e8" stroke="#1a1d20" strokeWidth="3" strokeLinejoin="round" />
                                <circle cx="85" cy="40" r="10" fill="#e8f5e8" stroke="#1a1d20" strokeWidth="3" />
                                <path d="M 65 95 V 70 C 65 60 75 55 85 55 C 95 55 105 60 105 70 V 95" fill="#e8f5e8" stroke="#1a1d20" strokeWidth="3" strokeLinejoin="round" />
                                <circle cx="60" cy="30" r="12" fill="#D4AF37" stroke="#1a1d20" strokeWidth="3" />
                                <path d="M 35 95 V 65 C 35 52 45 46 60 46 C 75 46 85 52 85 65 V 95" fill="#00C853" stroke="#1a1d20" strokeWidth="3" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="gc-val-wrap">
                            <div className="gc-val-main">일 평균 <strong>41,086</strong>명</div>
                            <div className="gc-val-sub">서울특별시 양천구 <strong>일 평균 1,311,318명</strong></div>
                        </div>
                    </div>

                    {/* 카드 4 — 주요 업종 매출 (style-v3) */}
                    <div className="grid-card style-v3">
                        <CardHeaderV3 title="주요 업종 매출은?" date="2026년 01월" />
                        <div className="gc-illus">
                            <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
                                <path d="M 60 50 V 35 C 60 20 100 20 100 35 V 50" fill="none" stroke="#1a1d20" strokeWidth="3" strokeLinecap="round" />
                                <path d="M 40 50 L 52 95 H 108 L 120 50 Z" fill="#ffffff" stroke="#1a1d20" strokeWidth="3" strokeLinejoin="round" />
                                <line x1="45" y1="65" x2="115" y2="65" stroke="#1a1d20" strokeWidth="2" strokeLinecap="round" opacity="0.15" />
                                <line x1="49" y1="80" x2="111" y2="80" stroke="#1a1d20" strokeWidth="2" strokeLinecap="round" opacity="0.15" />
                                <rect x="68" y="65" width="24" height="16" fill="#D4AF37" rx="2" stroke="#1a1d20" strokeWidth="2.5" />
                                <circle cx="80" cy="73" r="2.5" fill="#ffffff" />
                            </svg>
                        </div>
                        <div className="gc-footer-right">
                            <div className="gc-category">편의점</div>
                            <div className="gc-val-right">월 평균 <strong>4,180</strong>만원</div>
                        </div>
                    </div>

                    {/* 카드 5 — 배달 건수 (style-v3) */}
                    <div className="grid-card style-v3">
                        <CardHeaderV3 title="배달 건수는?" date="2026년 01월" />
                        <div className="gc-illus">
                            <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
                                <line x1="10" y1="50" x2="40" y2="50" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" />
                                <line x1="20" y1="70" x2="50" y2="70" stroke="#00C853" strokeWidth="3" strokeLinecap="round" />
                                <rect x="50" y="25" width="40" height="40" fill="#D4AF37" stroke="#1a1d20" strokeWidth="3" rx="4" strokeLinejoin="round" />
                                <line x1="50" y1="40" x2="90" y2="40" stroke="#1a1d20" strokeWidth="3" />
                                <path d="M 40 65 H 100"           fill="none" stroke="#1a1d20" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M 100 65 L 100 35 H 115" fill="none" stroke="#1a1d20" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="65"  cy="90" r="14" fill="#ffffff" stroke="#1a1d20" strokeWidth="3" />
                                <circle cx="65"  cy="90" r="4"  fill="#1a1d20" />
                                <circle cx="120" cy="90" r="14" fill="#ffffff" stroke="#1a1d20" strokeWidth="3" />
                                <circle cx="120" cy="90" r="4"  fill="#1a1d20" />
                            </svg>
                        </div>
                        <div className="gc-footer-right">
                            <div className="gc-category" style={{ color: '#6a6a6a' }}>패스트푸드</div>
                            <div className="gc-val-right">월 평균 <strong>1,550</strong>건</div>
                        </div>
                    </div>

                    {/* 카드 6 — 즐겨찾기 너구리 */}
                    <div className="fav-section">
                        <div className="fav-mascot-wrap">
                            <div className="fav-speech">어느 상권을 볼까요?</div>
                            <img src="/neoguri.png" className="fav-neoguri" alt="AI 상권 분석 너구리 마스코트" />
                        </div>
                        <select className="addr-dropdown" defaultValue="">
                            <option value="" disabled>즐겨찾기 주소 선택</option>
                            <option value="1">서울특별시 마포구 서교동 123-45</option>
                            <option value="2">서울특별시 강남구 역삼동 789-10</option>
                            <option value="3">경기도 성남시 분당구 456-78</option>
                        </select>
                    </div>

                </div>
            </div>
        </section>
    );
}
