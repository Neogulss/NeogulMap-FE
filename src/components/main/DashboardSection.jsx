import { useState, useEffect } from 'react';
import {
    fetchMyFavoriteList,
    fetchFloatingReport,
    fetchTopIndustries,
} from '../../api/api';

const YEAR_QUARTER = 20254;

/* ── 카드 공통 헤더 ─────────────────────────── */
function CardHeader({ title, accent, date, flipped }) {
    return (
        <div className="gc-header">
            <div className="gc-title-wrap">
                <span className={`gc-title${accent ? ' accent' : ''}`}>{title}</span>
                <span className="gc-date">기준년월 {date}</span>
            </div>
            <div className="gc-click">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {flipped
                        ? <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                        : <path d="M7 7h10v10M17 7L7 17" strokeLinecap="round" strokeLinejoin="round" />}
                </svg>
                <span>{flipped ? '돌아가기' : '클릭'}</span>
            </div>
        </div>
    );
}


/* ── 로딩 스켈레톤 ─── */
function ValSkeleton() {
    return <span style={{ display: 'inline-block', width: 80, height: 18, borderRadius: 4, background: '#e9ecef', verticalAlign: 'middle' }} />;
}

/* ── TOP5 뒷면 공통 컴포넌트 ─── */
function CardBack({ title, items, formatVal }) {
    if (!items || items.length === 0) {
        return (
            <div className="card-back">
                <div className="top5-title">{title}</div>
                <div className="top5-empty">즐겨찾기를 선택하면<br />데이터가 표시됩니다</div>
            </div>
        );
    }
    const maxVal = items[0]?.val ?? 1;
    return (
        <div className="card-back">
            <div className="top5-title">{title}</div>
            <div className="top5-list">
                {items.map((item, i) => {
                    const pct = maxVal > 0 ? Math.round(item.val / maxVal * 100) : 0;
                    return (
                        <div key={i} className="top5-item">
                            <span className={`top5-rank${i === 0 ? ' gold' : ''}`}>{i + 1}</span>
                            <div className="top5-info">
                                <div className="top5-row">
                                    <span className="top5-name">{item.name}</span>
                                    <span className="top5-val">{formatVal(item.val)}</span>
                                </div>
                                <div className="top5-bar">
                                    <div className="top5-bar-fill" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="card-back-hint">클릭하면 돌아갑니다</div>
        </div>
    );
}

export default function DashboardSection() {
    const userIdx = Number(localStorage.getItem('userIdx'));

    // 즐겨찾기 목록
    const [favorites, setFavorites]   = useState([]);
    const [favLoading, setFavLoading] = useState(false);

    // 선택된 즐겨찾기 + 리포트 데이터
    const [selectedFav, setSelectedFav]     = useState(null);
    const [reportData, setReportData]       = useState(null);
    const [reportLoading, setReportLoading] = useState(false);

    // 카드 플립 상태
    const [flippedCards, setFlippedCards] = useState({});

    const toggleFlip = (key) => {
        setFlippedCards(prev => ({ ...prev, [key]: !prev[key] }));
    };

    useEffect(() => {
        if (!userIdx) return;
        setFavLoading(true);
        fetchMyFavoriteList(userIdx)
            .then(res => setFavorites(res.data.data?.favorites ?? []))
            .catch(() => {})
            .finally(() => setFavLoading(false));
    }, [userIdx]);

    const handleFavSelect = async (e) => {
        const idx = Number(e.target.value);
        if (!idx) return;
        const fav = favorites.find(f => f.favoriteIdx === idx);
        if (!fav) return;

        setSelectedFav(fav);
        setReportData(null);
        setFlippedCards({});
        setReportLoading(true);

        try {
            // 유동인구 + 업종TOP5 병렬 호출
            const [floatingRes, topRes] = await Promise.all([
                fetchFloatingReport(fav.adminDongCode, YEAR_QUARTER),
                fetchTopIndustries(fav.adminDongCode, YEAR_QUARTER).catch(() => null),
            ]);
            const f = floatingRes.data.data;
            const dailyPop = Math.round(f.totalFloatingPopulation / 91);

            // 피크 시간대
            const TIME_SLOTS = [
                { label: '새벽', range: '0~6시',   val: f.time0006FloatingPopulation },
                { label: '오전', range: '6~11시',  val: f.time0611FloatingPopulation },
                { label: '낮',   range: '11~14시', val: f.time1114FloatingPopulation },
                { label: '오후', range: '14~17시', val: f.time1417FloatingPopulation },
                { label: '저녁', range: '17~21시', val: f.time1721FloatingPopulation },
                { label: '밤',   range: '21~24시', val: f.time2124FloatingPopulation },
            ];
            const peakSlot = TIME_SLOTS.reduce((a, b) => (b.val > a.val ? b : a));

            // 연령별 유동인구 순위 (카드3 뒷면)
            const ageRanking = [
                { name: '10대', val: f.age10FloatingPopulation },
                { name: '20대', val: f.age20FloatingPopulation },
                { name: '30대', val: f.age30FloatingPopulation },
                { name: '40대', val: f.age40FloatingPopulation },
                { name: '50대', val: f.age50FloatingPopulation },
                { name: '60대+', val: f.age60AboveFloatingPopulation },
            ].sort((a, b) => b.val - a.val).slice(0, 5);

            // 시간대별 유동인구 순위 (카드5 뒷면)
            const timeRanking = TIME_SLOTS
                .map(s => ({ name: s.range, val: s.val }))
                .sort((a, b) => b.val - a.val)
                .slice(0, 5);

            // 업종TOP5 가공
            const topIndustries = topRes?.data?.data ?? null;
            const salesTop5 = topIndustries?.salesTop5?.map(it => ({
                name: it.industryName,
                val: it.monthlySalesAmount,
            })) ?? [];
            const storeTop5 = topIndustries?.storeTop5?.map(it => ({
                name: it.industryName,
                val: it.storeCount,
            })) ?? [];

            // 행정동 전체 합산 (top5 기준)
            const totalSales = salesTop5.reduce((sum, it) => sum + it.val, 0);
            const totalStoreCount = storeTop5.reduce((sum, it) => sum + it.val, 0);

            setReportData({ dailyPop, storeCount: totalStoreCount, monthlySales: totalSales, peakSlot, ageRanking, timeRanking, salesTop5, storeTop5 });
        } catch (err) {
            console.error('대시보드 데이터 오류:', err);
        } finally {
            setReportLoading(false);
        }
    };

    const speechText = () => {
        if (!userIdx) return '로그인 후 이용하세요!';
        if (favLoading) return '불러오는 중...';
        if (favorites.length === 0) return '상권을 즐겨찾기해보세요!';
        if (reportLoading) return '데이터 불러오는 중...';
        if (selectedFav) return `${selectedFav.adminDongName} 데이터예요!`;
        return '어느 상권을 볼까요?';
    };

    const areaTitle = selectedFav
        ? `${selectedFav.districtName} ${selectedFav.adminDongName} 상권 정보`
        : '즐겨찾기 상권을 선택해주세요';

    const salesVal = reportLoading
        ? null
        : reportData?.monthlySales != null
            ? Math.round(reportData.monthlySales / 10000)
            : null;

    const storeCountVal = reportLoading
        ? null
        : reportData?.storeCount ?? null;

    const dailyPopVal = reportLoading
        ? null
        : reportData?.dailyPop ?? null;

    const peakSlot = reportLoading
        ? null
        : reportData?.peakSlot ?? null;

    // 뒷면 데이터
    const salesTop5  = reportData?.salesTop5  ?? [];
    const storeTop5  = reportData?.storeTop5  ?? [];
    const ageRanking = reportData?.ageRanking  ?? [];
    const timeRanking = reportData?.timeRanking ?? [];

    const topIndustryName = salesTop5[0]?.name ?? null;
    const topIndustrySalesVal = salesTop5[0]?.val != null
        ? Math.round(salesTop5[0].val / 10000)
        : null;

    return (
        <section className="dashboard-section">
            <div className="dashboard-inner">

                <div className="hero-dashboard-grid">
                    <div className="dashboard-header dashboard-sidekick">
                        <div className="fav-section">
                            <div className="fav-mascot-wrap">
                                <div className="fav-speech">{speechText()}</div>
                                <img src="/neoguri2.png" className="fav-neoguri" alt="AI 상권 분석 너구리 마스코트" />
                            </div>
                            <p className="dh-title">{areaTitle}</p>
                            <select
                                className="addr-dropdown"
                                value={selectedFav?.favoriteIdx ?? ''}
                                onChange={handleFavSelect}
                                disabled={!userIdx || favLoading || favorites.length === 0}
                            >
                                <option value="" disabled>
                                    {!userIdx ? '로그인이 필요합니다' : favorites.length === 0 ? '즐겨찾기가 없습니다' : '즐겨찾기 상권 선택'}
                                </option>
                                {favorites.map(fav => (
                                    <option key={fav.favoriteIdx} value={fav.favoriteIdx}>
                                        {fav.districtName} {fav.adminDongName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 카드 1 — 평균매출 */}
                    <div
                        className={`grid-card card-revenue${flippedCards.revenue ? ' is-flipped' : ''}`}
                        onClick={() => toggleFlip('revenue')}
                    >
                        <div className={`card-flip-inner${flippedCards.revenue ? ' flipped' : ''}`}>
                            <div className="card-front">
                                <CardHeader title="평균매출은?" accent date="2025년 12월" flipped={false} />
                                <div className="gc-illus">
                                    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                                        <line x1="20" y1="95" x2="100" y2="95" stroke="#1a1d20" strokeWidth="3" strokeLinecap="round" />
                                        <line x1="20" y1="25" x2="20"  y2="95" stroke="#1a1d20" strokeWidth="3" strokeLinecap="round" />
                                        <rect x="35" y="65" width="14" height="30" fill="#e8f5e8" stroke="#1a1d20" strokeWidth="2.5" rx="2" />
                                        <rect x="55" y="45" width="14" height="50" fill="#00C853" stroke="#1a1d20" strokeWidth="2.5" rx="2" />
                                        <rect x="75" y="25" width="14" height="70" fill="#D4AF37" stroke="#1a1d20" strokeWidth="2.5" rx="2" />
                                        <path d="M 25 55 L 50 35 L 70 45 L 95 15" fill="none" stroke="#1a1d20" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M 80 15 H 95 V 30" fill="none" stroke="#1a1d20" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="gc-val-wrap">
                                    <div className="gc-val-main">
                                        월 평균&nbsp;
                                        {salesVal != null
                                            ? <><strong>{salesVal.toLocaleString()}</strong>만원</>
                                            : <ValSkeleton />}
                                    </div>
                                </div>
                            </div>
                            <CardBack
                                title="업종별 월매출 TOP5"
                                items={salesTop5}
                                formatVal={v => `${Math.round(v / 10000).toLocaleString()}만`}
                            />
                        </div>
                    </div>

                    {/* 카드 2 — 업소 수 */}
                    <div
                        className={`grid-card card-store${flippedCards.store ? ' is-flipped' : ''}`}
                        onClick={() => toggleFlip('store')}
                    >
                        <div className={`card-flip-inner${flippedCards.store ? ' flipped' : ''}`}>
                            <div className="card-front">
                                <CardHeader title="업소 수는?" date="2025년 12월" flipped={false} />
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
                                    <div className="gc-val-main">
                                        {storeCountVal != null
                                            ? <><strong>{storeCountVal.toLocaleString()}</strong>개</>
                                            : <ValSkeleton />}
                                    </div>
                                </div>
                            </div>
                            <CardBack
                                title="업종별 점포수 TOP5"
                                items={storeTop5}
                                formatVal={v => `${v.toLocaleString()}개`}
                            />
                        </div>
                    </div>

                    {/* 카드 3 — 유동인구 */}
                    <div
                        className={`grid-card card-population${flippedCards.pop ? ' is-flipped' : ''}`}
                        onClick={() => toggleFlip('pop')}
                    >
                        <div className={`card-flip-inner${flippedCards.pop ? ' flipped' : ''}`}>
                            <div className="card-front">
                                <CardHeader title="유동인구는?" date="2025년 12월" flipped={false} />
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
                                    <div className="gc-val-main">
                                        일 평균&nbsp;
                                        {dailyPopVal != null
                                            ? <><strong>{dailyPopVal.toLocaleString()}</strong>명</>
                                            : <ValSkeleton />}
                                    </div>
                                </div>
                            </div>
                            <CardBack
                                title="연령대별 유동인구 TOP5"
                                items={ageRanking}
                                formatVal={v => `${Math.round(v / 10000).toLocaleString()}만명`}
                            />
                        </div>
                    </div>

                    {/* 카드 4 — 주요 업종 매출 */}
                    <div
                        className={`grid-card card-category-sales${flippedCards.catSales ? ' is-flipped' : ''}`}
                        onClick={() => toggleFlip('catSales')}
                    >
                        <div className={`card-flip-inner${flippedCards.catSales ? ' flipped' : ''}`}>
                            <div className="card-front">
                                <CardHeader title="주요 업종 매출은?" date="2025년 12월" flipped={false} />
                                <div className="gc-illus">
                                    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M 45 50 V 38 C 45 25 75 25 75 38 V 50" fill="none" stroke="#1a1d20" strokeWidth="3" strokeLinecap="round" />
                                        <path d="M 28 50 L 38 95 H 82 L 92 50 Z" fill="#ffffff" stroke="#1a1d20" strokeWidth="3" strokeLinejoin="round" />
                                        <line x1="33" y1="65" x2="87" y2="65" stroke="#1a1d20" strokeWidth="2" strokeLinecap="round" opacity="0.15" />
                                        <line x1="36" y1="80" x2="84" y2="80" stroke="#1a1d20" strokeWidth="2" strokeLinecap="round" opacity="0.15" />
                                        <rect x="50" y="65" width="20" height="14" fill="#D4AF37" rx="2" stroke="#1a1d20" strokeWidth="2.5" />
                                        <circle cx="60" cy="72" r="2.5" fill="#ffffff" />
                                    </svg>
                                </div>
                                <div className="gc-val-wrap">
                                    <div className="gc-val-main">
                                        월&nbsp;
                                        {topIndustrySalesVal != null
                                            ? <><strong>{topIndustrySalesVal.toLocaleString()}</strong>만원</>
                                            : (reportLoading ? <ValSkeleton /> : '—')}
                                    </div>
                                    <div className="gc-val-sub">
                                        {topIndustryName ?? (reportLoading ? <ValSkeleton /> : '즐겨찾기를 선택하세요')}
                                    </div>
                                </div>
                            </div>
                            <CardBack
                                title="업종별 월매출 TOP5"
                                items={salesTop5}
                                formatVal={v => `${Math.round(v / 10000).toLocaleString()}만`}
                            />
                        </div>
                    </div>

                    {/* 카드 5 — 피크 시간대 */}
                    <div
                        className={`grid-card card-delivery${flippedCards.peak ? ' is-flipped' : ''}`}
                        onClick={() => toggleFlip('peak')}
                    >
                        <div className={`card-flip-inner${flippedCards.peak ? ' flipped' : ''}`}>
                            <div className="card-front">
                                <CardHeader title="피크 시간대는?" date="2025년 12월" flipped={false} />
                                <div className="gc-illus">
                                    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="60" cy="60" r="38" fill="#ffffff" stroke="#1a1d20" strokeWidth="3" />
                                        <line x1="60" y1="60" x2="60" y2="30" stroke="#1a1d20" strokeWidth="3" strokeLinecap="round" />
                                        <line x1="60" y1="60" x2="82" y2="72" stroke="#D4AF37" strokeWidth="3.5" strokeLinecap="round" />
                                        <circle cx="60" cy="60" r="4" fill="#1a1d20" />
                                        <line x1="60" y1="24" x2="60" y2="20" stroke="#1a1d20" strokeWidth="2.5" strokeLinecap="round" />
                                        <line x1="96" y1="60" x2="100" y2="60" stroke="#1a1d20" strokeWidth="2.5" strokeLinecap="round" />
                                        <line x1="24" y1="60" x2="20" y2="60" stroke="#1a1d20" strokeWidth="2.5" strokeLinecap="round" />
                                        <line x1="60" y1="96" x2="60" y2="100" stroke="#1a1d20" strokeWidth="2.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div className="gc-val-wrap">
                                    <div className="gc-val-main">
                                        {peakSlot != null
                                            ? <><strong>{peakSlot.label}</strong>&nbsp;({peakSlot.range})</>
                                            : (reportLoading ? <ValSkeleton /> : '—')}
                                    </div>
                                    <div className="gc-val-sub">가장 붐비는 시간대</div>
                                </div>
                            </div>
                            <CardBack
                                title="시간대별 유동인구 TOP5"
                                items={timeRanking}
                                formatVal={v => `${Math.round(v / 10000).toLocaleString()}만명`}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
