import { useState, useEffect } from 'react';
import {
    MdPointOfSale,
    MdStorefront,
    MdGroups,
    MdBusinessCenter,
    MdAccessTimeFilled,
} from 'react-icons/md';
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

                <div className="dashboard-section-header" data-reveal data-delay="0">
                    <h2 className="dashboard-section-title">이 상권, 지금 어떨까요?</h2>
                    <p className="dashboard-section-desc">즐겨찾기 상권을 선택하면 매출·유동인구·경쟁 현황을 한눈에 확인할 수 있습니다.</p>
                </div>

                <div className="dashboard-control" data-reveal data-delay="0.15">
                    <div className="dashboard-mascot" aria-hidden="true">
                        <div className="dashboard-mascot-bubble">관심 상권을 골라봐요</div>
                        <img src="/neoguri2.png" className="dashboard-mascot-img" alt="" />
                    </div>
                    <div className="dc-select-wrap">
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

                <div className="hero-dashboard-grid">

                    {/* 카드 1 — 평균매출 */}
                    <div
                        className={`grid-card card-revenue${flippedCards.revenue ? ' is-flipped' : ''}`}
                        onClick={() => toggleFlip('revenue')}
                        data-reveal data-delay="0.1"
                    >
                        <div className={`card-flip-inner${flippedCards.revenue ? ' flipped' : ''}`}>
                            <div className="card-front">
                                <CardHeader title="평균매출은?" accent date="2025년 12월" flipped={false} />
                                <div className="gc-illus">
                                    <MdPointOfSale className="gc-illus-icon gc-illus-icon--revenue" aria-hidden="true" />
                                </div>
                                <div className="gc-val-wrap">
                                    <div className="gc-val-main">
                                        월 평균&nbsp;
                                        {salesVal != null
                                            ? <><strong>{salesVal.toLocaleString()}</strong>만원</>
                                            : <ValSkeleton />}
                                    </div>
                                    <div className="gc-meta">선택 상권 평균 매출 기준</div>
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
                        data-reveal data-delay="0.2"
                    >
                        <div className={`card-flip-inner${flippedCards.store ? ' flipped' : ''}`}>
                            <div className="card-front">
                                <CardHeader title="업소 수는?" date="2025년 12월" flipped={false} />
                                <div className="gc-illus">
                                    <MdStorefront className="gc-illus-icon gc-illus-icon--store" aria-hidden="true" />
                                </div>
                                <div className="gc-val-wrap">
                                    <div className="gc-val-main">
                                        {storeCountVal != null
                                            ? <><strong>{storeCountVal.toLocaleString()}</strong>개</>
                                            : <ValSkeleton />}
                                    </div>
                                    <div className="gc-meta">현재 업종 분포 합산 기준</div>
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
                        data-reveal data-delay="0.3"
                    >
                        <div className={`card-flip-inner${flippedCards.pop ? ' flipped' : ''}`}>
                            <div className="card-front">
                                <CardHeader title="유동인구는?" date="2025년 12월" flipped={false} />
                                <div className="gc-illus">
                                    <MdGroups className="gc-illus-icon gc-illus-icon--population" aria-hidden="true" />
                                </div>
                                <div className="gc-val-wrap">
                                    <div className="gc-val-main">
                                        일 평균&nbsp;
                                        {dailyPopVal != null
                                            ? <><strong>{dailyPopVal.toLocaleString()}</strong>명</>
                                            : <ValSkeleton />}
                                    </div>
                                    <div className="gc-meta">일 평균 유입 인구 추정치</div>
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
                        data-reveal data-delay="0.4"
                    >
                        <div className={`card-flip-inner${flippedCards.catSales ? ' flipped' : ''}`}>
                            <div className="card-front">
                                <CardHeader title="주요 업종 매출은?" date="2025년 12월" flipped={false} />
                                <div className="gc-illus">
                                    <MdBusinessCenter className="gc-illus-icon gc-illus-icon--category" aria-hidden="true" />
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
                                    <div className="gc-meta">상위 업종 대표 매출 기준</div>
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
                        data-reveal data-delay="0.5"
                    >
                        <div className={`card-flip-inner${flippedCards.peak ? ' flipped' : ''}`}>
                            <div className="card-front">
                                <CardHeader title="피크 시간대는?" date="2025년 12월" flipped={false} />
                                <div className="gc-illus">
                                    <MdAccessTimeFilled className="gc-illus-icon gc-illus-icon--peak" aria-hidden="true" />
                                </div>
                                <div className="gc-val-wrap">
                                    <div className="gc-val-main">
                                        {peakSlot != null
                                            ? <><strong>{peakSlot.label}</strong>&nbsp;({peakSlot.range})</>
                                            : (reportLoading ? <ValSkeleton /> : '—')}
                                    </div>
                                    <div className="gc-val-sub">가장 붐비는 시간대</div>
                                    <div className="gc-meta">유입량이 가장 높은 시간 구간</div>
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
