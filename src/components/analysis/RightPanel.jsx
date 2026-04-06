import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const X_LABELS = ['24년 4Q', '25년 1Q', '25년 2Q', '25년 3Q', '25년 4Q'];
const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const TIME_LABELS = ['00~06시', '06~11시', '11~14시', '14~17시', '17~21시', '21~24시'];

/** null-safe 숫자 포맷 */
const n = (v, suffix = '') => (v != null ? `${Number(v).toLocaleString()}${suffix}` : '-');

/** 비율 계산 (소수점 1자리) */
const pct = (part, total) => (total > 0 ? Math.round((part / total) * 1000) / 10 : 0);

function NullSection({ title }) {
    return (
        <div className="report-section">
            <h3 className="rs-title">{title}</h3>
            <div className="null-data-card">
                <div className="null-data-icon">⏳</div>
                <div className="null-data-label">데이터 준비 중</div>
                <div className="null-data-desc">해당 데이터 API가 곧 제공될 예정입니다.</div>
            </div>
        </div>
    );
}

function EmptyChart() {
    return (
        <div className="empty-chart"><span>데이터 없음</span></div>
    );
}

export default function RightPanel({
    isShow, isCollapsed, onToggle, onClose,
    selectedData, selectedSubCategory,
    isReportUnlocked, onUnlock,
}) {
    const innerRef = useRef(null);

    const chartStoresHistoryRef    = useRef(null);
    const chartFranchisePieRef     = useRef(null);
    const chartOperatingCompareRef = useRef(null);
    const chartIndustryPieRef      = useRef(null);
    const chartIndustryTrendRef    = useRef(null);
    const chartFloatingTimeRef     = useRef(null);
    const chartFloatingDayRef      = useRef(null);
    const chartFloatingAgeRef      = useRef(null);
    const chartResidentAgeRef      = useRef(null);
    const chartConsumptionRef      = useRef(null);

    const chartInstancesRef = useRef({});

    const destroyCharts = () => {
        Object.values(chartInstancesRef.current).forEach(inst => inst.destroy());
        chartInstancesRef.current = {};
    };

    useEffect(() => {
        if (!selectedData?.historyData || !selectedData?.compareData) {
            destroyCharts();
            return;
        }

        destroyCharts();

        const d   = selectedData;
        const s   = d.storeRaw;
        const f   = d.floatingRaw;
        const res = d.resident;
        const inc = d.income;
        const dOp = d.historyData.operating;
        const dInd = d.compareData.industry;

        // ── 점포수 추이 ──
        const storeHistory = d.historyData.stores ?? [];
        const hasStoreHistory = storeHistory.some(v => v != null);
        if (chartStoresHistoryRef.current && hasStoreHistory) {
            chartInstancesRef.current.storesHistory = new Chart(
                chartStoresHistoryRef.current.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: X_LABELS,
                        datasets: [{ data: storeHistory, backgroundColor: storeHistory.map((_, i) => i === storeHistory.length - 1 ? '#1a73e8' : '#adb5bd'), borderRadius: 4 }],
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { display: false, beginAtZero: true },
                            x: { grid: { display: false }, ticks: { font: { size: 10, family: 'Pretendard', weight: '500' }, color: '#868e96' } },
                        },
                    },
                }
            );
        }

        // ── 프랜차이즈 비율 ──
        if (chartFranchisePieRef.current && s?.franchiseRatio != null) {
            chartInstancesRef.current.franchisePie = new Chart(
                chartFranchisePieRef.current.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: ['프랜차이즈', '일반점포'],
                        datasets: [{
                            data: [s.franchiseRatio, s.generalRatio ?? (100 - s.franchiseRatio)],
                            backgroundColor: ['#1a73e8', '#e9ecef'],
                            borderWidth: 2, borderColor: '#fff',
                        }],
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 12, padding: 14, font: { size: 11 } } } },
                    },
                }
            );
        }

        // ── 평균영업기간 비교 ──
        if (chartOperatingCompareRef.current) {
            const opData   = [dOp.selected, dOp.dong, dOp.district, dOp.seoul].map(v => v ?? 0);
            const opColors = opData.map((_, i) => i === 0 ? '#1a73e8' : '#adb5bd');
            chartInstancesRef.current.operatingCompare = new Chart(
                chartOperatingCompareRef.current.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: ['선택상권', '행정동', '자치구', '서울시'],
                        datasets: [{ data: opData, backgroundColor: opColors, borderRadius: 6 }],
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.parsed.y}년` } } },
                        scales: {
                            y: { display: false, beginAtZero: true },
                            x: { grid: { display: false }, ticks: { font: { size: 11, family: 'Pretendard', weight: '600' } } },
                        },
                    },
                }
            );
        }

        // ── 업종분포 파이 ──
        if (chartIndustryPieRef.current) {
            chartInstancesRef.current.industryPie = new Chart(
                chartIndustryPieRef.current.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: ['외식업', '서비스업', '소매업'],
                        datasets: [{
                            data: [dInd.food, dInd.service, dInd.retail],
                            backgroundColor: ['#1a73e8', '#e91e63', '#f5a623'],
                            borderWidth: 2, borderColor: '#fff',
                        }],
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 12, padding: 16, font: { size: 11 } } } },
                    },
                }
            );
        }

        // ── 업종분포 추이 (placeholder) ──
        if (chartIndustryTrendRef.current) {
            chartInstancesRef.current.industryTrend = new Chart(
                chartIndustryTrendRef.current.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: X_LABELS,
                        datasets: [
                            { label: '외식업',  data: [-2.4, -2.5, 0.0, 0.7, -2.7], backgroundColor: '#1a73e8', borderRadius: 4 },
                            { label: '서비스업', data: [-1.4, -7.2, -0.5, 1.1, -2.2], backgroundColor: '#e91e63', borderRadius: 4 },
                            { label: '소매업',  data: [-2.0, -2.6, 0.0, 0.5, 0.5],  backgroundColor: '#f5a623', borderRadius: 4 },
                        ],
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 10 } } } },
                        scales: {
                            y: { grid: { display: true }, ticks: { font: { size: 10 } } },
                            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#868e96' } },
                        },
                    },
                }
            );
        }

        // ── 유동인구 시간대별 ──
        if (chartFloatingTimeRef.current && (d.historyData.salesHourly?.length ?? 0) > 0) {
            chartInstancesRef.current.floatingTime = new Chart(
                chartFloatingTimeRef.current.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: TIME_LABELS,
                        datasets: [{
                            data: d.historyData.salesHourly,
                            borderColor: '#1a73e8', backgroundColor: 'rgba(26,115,232,0.1)',
                            fill: true, tension: 0.4, borderWidth: 3,
                            pointRadius: 6, pointBackgroundColor: '#fff', pointBorderColor: '#1a73e8',
                        }],
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { display: false, beginAtZero: true },
                            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#868e96' } },
                        },
                    },
                }
            );
        }

        // ── 유동인구 요일별 ──  (실제 필드명: mondayFloatingPopulation ~ sundayFloatingPopulation)
        const dayVals = f ? [
            f.mondayFloatingPopulation, f.tuesdayFloatingPopulation, f.wednesdayFloatingPopulation,
            f.thursdayFloatingPopulation, f.fridayFloatingPopulation,
            f.saturdayFloatingPopulation, f.sundayFloatingPopulation,
        ] : [];
        const dayTotal = dayVals.reduce((a, b) => a + (b ?? 0), 0);
        if (chartFloatingDayRef.current && dayTotal > 0) {
            const dayRatios = dayVals.map(v => pct(v ?? 0, dayTotal));
            const maxDay    = Math.max(...dayRatios);
            chartInstancesRef.current.floatingDay = new Chart(
                chartFloatingDayRef.current.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: DAY_LABELS,
                        datasets: [{
                            data: dayRatios,
                            backgroundColor: dayRatios.map(v => v === maxDay ? '#1a73e8' : '#adb5bd'),
                            borderRadius: 4,
                        }],
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.parsed.y}%` } } },
                        scales: {
                            y: { display: false, beginAtZero: true },
                            x: { grid: { display: false }, ticks: { font: { size: 11, family: 'Pretendard', weight: '600' } } },
                        },
                    },
                }
            );
        }

        // ── 유동인구 연령별 ── (age10 ~ age60Above)
        if (chartFloatingAgeRef.current && f) {
            const ageLabels = ['10대', '20대', '30대', '40대', '50대', '60대+'];
            const ageVals   = [
                f.age10FloatingPopulation, f.age20FloatingPopulation,
                f.age30FloatingPopulation, f.age40FloatingPopulation,
                f.age50FloatingPopulation, f.age60AboveFloatingPopulation,
            ].map(v => v ?? 0);
            chartInstancesRef.current.floatingAge = new Chart(
                chartFloatingAgeRef.current.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: ageLabels,
                        datasets: [{
                            data: ageVals,
                            backgroundColor: '#adb5bd',
                            hoverBackgroundColor: '#1a73e8',
                            borderRadius: 4,
                        }],
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.parsed.y.toLocaleString()}명` } } },
                        scales: {
                            y: { display: false, beginAtZero: true },
                            x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                        },
                    },
                }
            );
        }

        // ── 주거인구 연령별 ──
        if (chartResidentAgeRef.current && res) {
            const rAgeLabels = ['10대', '20대', '30대', '40대', '50대', '60대+'];
            const maleAges   = [
                res.maleAge10ResidentPopulation, res.maleAge20ResidentPopulation,
                res.maleAge30ResidentPopulation, res.maleAge40ResidentPopulation,
                res.maleAge50ResidentPopulation, res.maleAge60AboveResidentPopulation,
            ].map(v => v ?? 0);
            const femaleAges = [
                res.femaleAge10ResidentPopulation, res.femaleAge20ResidentPopulation,
                res.femaleAge30ResidentPopulation, res.femaleAge40ResidentPopulation,
                res.femaleAge50ResidentPopulation, res.femaleAge60AboveResidentPopulation,
            ].map(v => v ?? 0);
            chartInstancesRef.current.residentAge = new Chart(
                chartResidentAgeRef.current.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: rAgeLabels,
                        datasets: [
                            { label: '남성', data: maleAges,   backgroundColor: '#1a73e8', borderRadius: 3 },
                            { label: '여성', data: femaleAges, backgroundColor: '#e91e63', borderRadius: 3 },
                        ],
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 10 } } } },
                        scales: {
                            y: { display: false, beginAtZero: true },
                            x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                        },
                    },
                }
            );
        }

        // ── 소비트렌드 ──  (금액 → 비율 계산)
        if (chartConsumptionRef.current && inc) {
            const totalExp = inc.totalExpenditureAmount ?? 0;
            const consumptionData = [
                inc.foodServiceExpenditureAmount, // 음식 (외식)
                inc.clothingShoesExpenditureAmount,
                inc.householdGoodsExpenditureAmount,
                inc.medicalExpenditureAmount,
                inc.transportExpenditureAmount,
                inc.leisureCultureExpenditureAmount,
                inc.educationExpenditureAmount,
                inc.entertainmentExpenditureAmount,
                inc.etcExpenditureAmount,
            ].map(v => pct(v ?? 0, totalExp));

            chartInstancesRef.current.consumption = new Chart(
                chartConsumptionRef.current.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: ['음식(외식)', '의류·신발', '생활용품', '의료비', '교통', '여가·문화', '교육', '유흥', '기타'],
                        datasets: [{
                            data: consumptionData,
                            backgroundColor: ['#1a73e8','#e91e63','#f5a623','#00b34a','#9c27b0','#ff5722','#607d8b','#795548','#bdbdbd'],
                            borderWidth: 2, borderColor: '#fff',
                        }],
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { display: true, position: 'right', labels: { boxWidth: 10, padding: 8, font: { size: 10 } } } },
                    },
                }
            );
        }

        if (innerRef.current) innerRef.current.scrollTop = 0;
        return () => { destroyCharts(); };
    }, [selectedData]);

    const panelClass = ['right-panel', isShow ? 'show' : '', isCollapsed ? 'collapsed' : ''].filter(Boolean).join(' ');
    const blurClass  = ['report-content-blur', !isReportUnlocked ? 'locked' : ''].filter(Boolean).join(' ');

    if (!selectedData) return <aside className="right-panel" id="right-panel" />;

    const hasReport = !!(selectedData.statSummary && selectedData.historyData && selectedData.compareData);
    const ss   = selectedData.statSummary;
    const swot = selectedData.swot;
    const s    = selectedData.storeRaw;
    const f    = selectedData.floatingRaw;
    const com  = selectedData.commercialRaw;
    const res  = selectedData.resident;
    const hh   = selectedData.household;
    const fac  = selectedData.facility;
    const inc  = selectedData.income;

    // ── 유동인구 파생값 ──
    const fTotal = f?.totalFloatingPopulation ?? 0;
    const malePct   = fTotal > 0 ? pct(f.maleFloatingPopulation ?? 0, fTotal) : null;
    const femalePct = fTotal > 0 ? pct(f.femaleFloatingPopulation ?? 0, fTotal) : null;

    const dayVals  = f ? [
        f.mondayFloatingPopulation, f.tuesdayFloatingPopulation, f.wednesdayFloatingPopulation,
        f.thursdayFloatingPopulation, f.fridayFloatingPopulation,
        f.saturdayFloatingPopulation, f.sundayFloatingPopulation,
    ] : [];
    const dayTotal   = dayVals.reduce((a, b) => a + (b ?? 0), 0);
    const hasDayData = dayTotal > 0;
    const dayRatios  = hasDayData ? dayVals.map(v => pct(v ?? 0, dayTotal)) : [];
    const maxDayIdx  = hasDayData ? dayRatios.indexOf(Math.max(...dayRatios)) : -1;

    const timeRatios = selectedData.historyData?.salesHourly ?? [];
    const maxTimeIdx = timeRatios.length ? timeRatios.indexOf(Math.max(...timeRatios)) : -1;

    // ── 주거인구 파생값 ──
    const resTotal   = res?.totalResidentPopulation ?? 0;
    const resMalePct = resTotal > 0 ? pct(res.maleResidentPopulation ?? 0, resTotal) : null;
    const resFemPct  = resTotal > 0 ? pct(res.femaleResidentPopulation ?? 0, resTotal) : null;

    // ── 소비트렌드 비율 ──
    const totalExp = inc?.totalExpenditureAmount ?? 0;
    const consumptionRows = inc ? [
        ['음식(외식)', inc.foodServiceExpenditureAmount],
        ['의류·신발',  inc.clothingShoesExpenditureAmount],
        ['생활용품',   inc.householdGoodsExpenditureAmount],
        ['의료비',     inc.medicalExpenditureAmount],
        ['교통',       inc.transportExpenditureAmount],
        ['여가·문화',  inc.leisureCultureExpenditureAmount],
        ['교육',       inc.educationExpenditureAmount],
        ['유흥',       inc.entertainmentExpenditureAmount],
        ['기타',       inc.etcExpenditureAmount],
    ].map(([label, val]) => [label, pct(val ?? 0, totalExp)]) : [];

    return (
        <aside className={panelClass} id="right-panel">
            <button className="panel-toggle right-toggle" id="right-toggle-btn" onClick={onToggle}>
                {isCollapsed ? '❮' : '❯'}
            </button>

            <div className="right-panel-inner" ref={innerRef}>
                <button className="rh-close" onClick={onClose}>×</button>

                <div className="report-header">
                    <span className="rh-tag">{selectedData.score != null ? `매칭률 ${selectedData.score}%` : '상권 분석'}</span>
                    <h2 className="rh-title">서울시 {selectedData.districtName} {selectedData.name}</h2>
                    <div className="rh-meta">기준: 2025년 4분기 · {selectedSubCategory || selectedData.serviceIndustryCodeName || '-'}</div>
                </div>

                <div className="report-wrapper">
                    <div id="login-overlay" className={`login-overlay${isReportUnlocked ? ' hidden' : ''}`}>
                        <h3>상세 분석 리포트 보기</h3>
                        <button onClick={onUnlock}>로그인</button>
                    </div>

                    <div id="blur-content" className={blurClass}>
                        {!hasReport && (
                            <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)', fontSize: '14px' }}>
                                리포트 데이터를 불러오는 중...
                            </p>
                        )}
                        <div className="report-content" style={{ display: hasReport ? undefined : 'none' }}>

                            {/* ── 1. 종합 평가 ── */}
                            <div className="report-section">
                                <div className="total-score-box">
                                    <div className="ts-label">AI 상권 종합 평가</div>
                                    <div className="ts-score">
                                        {selectedData.score != null ? <>{selectedData.score}<span>점</span></> : '-'}
                                    </div>
                                    <div className="ts-grade">{selectedData.grade ?? '분석 중'}</div>
                                </div>
                                <div className="advice-summary">
                                    <ul>
                                        {selectedData.summaryComments.map((c, i) => (
                                            <li key={i} dangerouslySetInnerHTML={{ __html: c }} />
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* ── 2. 핵심 지표 요약 ── */}
                            <div className="report-section">
                                <h3 className="rs-title">핵심 지표 요약</h3>
                                <div className="stat-summary-grid">
                                    {ss?.stores && (
                                        <div className="stat-sum-item">
                                            <div className="ss-label">점포수</div>
                                            <div className={`ss-diff-box ${ss.stores.diffType}`}>
                                                <div className="ss-diff-label">{ss.stores.diffLabel}</div>
                                                <div className="ss-diff-val">{ss.stores.diffVal}</div>
                                            </div>
                                            <div className="ss-main-box">
                                                <div className="ss-main-label">현재 점포수</div>
                                                <div className="ss-main-val">{ss.stores.current}<em>개</em></div>
                                            </div>
                                            <div className="ss-rank">자치구 내 <strong>{ss.stores.rank}위</strong>/{ss.stores.totalDongCount ?? '-'}개</div>
                                        </div>
                                    )}
                                    <div className="stat-sum-item null-stat">
                                        <div className="ss-label">매출액 (월평균)</div>
                                        <div className="ss-diff-box neutral">
                                            <div className="ss-diff-label">전분기 대비</div>
                                            <div className="ss-diff-val">-</div>
                                        </div>
                                        <div className="ss-main-box">
                                            <div className="ss-main-label">평균 매출액</div>
                                            <div className="ss-main-val ss-null">준비 중</div>
                                        </div>
                                        <div className="ss-rank">매출 API 연동 예정</div>
                                    </div>
                                    {ss?.pop && (
                                        <div className="stat-sum-item">
                                            <div className="ss-label">유동인구 (일평균)</div>
                                            <div className={`ss-diff-box ${ss.pop.diffType}`}>
                                                <div className="ss-diff-label">{ss.pop.diffLabel}</div>
                                                <div className="ss-diff-val">{ss.pop.diffVal}</div>
                                            </div>
                                            <div className="ss-main-box">
                                                <div className="ss-main-label">평균 유동인구</div>
                                                <div className="ss-main-val">{ss.pop.current.toLocaleString()}<em>명</em></div>
                                            </div>
                                            <div className="ss-rank">자치구 내 <strong>{ss.pop.rank}위</strong>/{ss.pop.totalDongCount ?? '-'}개</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── 3. 점포수 현황 ── */}
                            <div className="report-section">
                                <h3 className="rs-title">점포수 현황</h3>
                                {s && (
                                    <div className="store-summary-row">
                                        <div className="ssrow-item">
                                            <span className="ssrow-label">현재 점포수</span>
                                            <span className="ssrow-val">{n(s.storeCount, '개')}</span>
                                        </div>
                                        <div className="ssrow-item">
                                            <span className="ssrow-label">전분기 대비</span>
                                            <span className={`ssrow-val ${(s.prevQuarterDiff ?? 0) >= 0 ? 'up' : 'down'}`}>
                                                {s.prevQuarterDiff != null ? `${s.prevQuarterDiff >= 0 ? '+' : ''}${s.prevQuarterDiff}개` : '-'}
                                            </span>
                                        </div>
                                        <div className="ssrow-item">
                                            <span className="ssrow-label">전년동기 대비</span>
                                            <span className={`ssrow-val ${(s.prevYearDiff ?? 0) >= 0 ? 'up' : 'down'}`}>
                                                {s.prevYearDiff != null ? `${s.prevYearDiff >= 0 ? '+' : ''}${s.prevYearDiff}개` : '-'}
                                            </span>
                                        </div>
                                        <div className="ssrow-item">
                                            <span className="ssrow-label">자치구 내 순위</span>
                                            <span className="ssrow-val">{s.rank != null ? `${s.rank}위/${s.totalDongCount ?? '-'}` : '-'}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="grid-2viz">
                                    <div className="viz-box">
                                        <div className="viz-header">
                                            <div className="viz-title">점포수 추이</div>
                                            <div className="viz-meta">단위: 개 / 분기별</div>
                                        </div>
                                        <div className="chart-container">
                                            {(selectedData.historyData?.stores ?? []).some(v => v != null)
                                                ? <canvas ref={chartStoresHistoryRef} />
                                                : <EmptyChart />
                                            }
                                        </div>
                                    </div>
                                    <div className="viz-box">
                                        <div className="viz-header">
                                            <div className="viz-title">프랜차이즈 비율</div>
                                            <div className="viz-meta">단위: %</div>
                                        </div>
                                        {s?.franchiseRatio != null ? (
                                            <>
                                                <div className="franchise-stats">
                                                    <div className="fr-item fr-franchise">
                                                        <span>프랜차이즈</span>
                                                        <strong>{s.franchiseRatio.toFixed(1)}%</strong>
                                                    </div>
                                                    <div className="fr-item fr-general">
                                                        <span>일반점포</span>
                                                        <strong>{(s.generalRatio ?? (100 - s.franchiseRatio)).toFixed(1)}%</strong>
                                                    </div>
                                                </div>
                                                <div className="chart-container" style={{ height: '180px' }}>
                                                    <canvas ref={chartFranchisePieRef} />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="chart-container"><EmptyChart /></div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ── 4. 개업 / 폐업 현황 ── */}
                            <div className="report-section">
                                <h3 className="rs-title">개업 / 폐업 현황</h3>
                                <div className="open-close-grid">
                                    <div className="oc-card oc-open">
                                        <div className="oc-label">개업</div>
                                        <div className="oc-val">{n(s?.openingStoreCount, '개')}</div>
                                        <div className="oc-diff">
                                            전분기 {s?.openingPrevQuarterDiff != null
                                                ? `${s.openingPrevQuarterDiff >= 0 ? '+' : ''}${s.openingPrevQuarterDiff}개`
                                                : '-'}
                                        </div>
                                    </div>
                                    <div className="oc-card oc-close">
                                        <div className="oc-label">폐업</div>
                                        <div className="oc-val">{n(s?.closureStoreCount, '개')}</div>
                                        <div className="oc-diff">
                                            전분기 {s?.closurePrevQuarterDiff != null
                                                ? `${s.closurePrevQuarterDiff >= 0 ? '+' : ''}${s.closurePrevQuarterDiff}개`
                                                : '-'}
                                        </div>
                                    </div>
                                    <div className="oc-card oc-survival">
                                        <div className="oc-label">신생기업 생존율</div>
                                        <div className="oc-val">-</div>
                                        <div className="oc-diff">API 준비 중</div>
                                    </div>
                                    <div className="oc-card oc-operating">
                                        <div className="oc-label">평균 영업기간</div>
                                        <div className="oc-val">{n(s?.avgOperatingYears, '년')}</div>
                                        <div className="oc-diff">
                                            서울시 평균 {com?.seoulOperatingBusinessMonthAvg != null
                                                ? `${(com.seoulOperatingBusinessMonthAvg / 12).toFixed(1)}년`
                                                : '-'}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid-2viz">
                                    <div className="viz-box">
                                        <div className="viz-header">
                                            <div className="viz-title">신생기업 생존율 추이 (3년)</div>
                                            <div className="viz-meta">단위: %</div>
                                        </div>
                                        <div className="chart-container"><EmptyChart /></div>
                                    </div>
                                    <div className="viz-box">
                                        <div className="viz-header">
                                            <div className="viz-title">평균 영업기간 비교</div>
                                            <div className="viz-meta">단위: 년</div>
                                        </div>
                                        <div className="chart-container">
                                            <canvas ref={chartOperatingCompareRef} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── 5. 업종분포 ── */}
                            <div className="report-section">
                                <h3 className="rs-title">업종분포</h3>
                                {s && (
                                    <div className="industry-ratio-row">
                                        {[
                                            { label: '외식업',  ratio: s.foodRatio,    count: s.foodCount,    color: '#1a73e8' },
                                            { label: '서비스업', ratio: s.serviceRatio, count: s.serviceCount, color: '#e91e63' },
                                            { label: '소매업',  ratio: s.retailRatio,  count: s.retailCount,  color: '#f5a623' },
                                        ].map(({ label, ratio, count, color }) => (
                                            <div className="ir-item" key={label}>
                                                <span className="ir-label">{label}</span>
                                                <div className="ir-bar-wrap">
                                                    <div className="ir-bar" style={{ width: `${ratio ?? 0}%`, background: color }} />
                                                </div>
                                                <span className="ir-pct">{ratio != null ? `${ratio}%` : '-'}</span>
                                                <span className="ir-count">{n(count, '개')}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="grid-2viz">
                                    <div className="viz-box">
                                        <div className="viz-header"><div className="viz-title">업종 비율</div></div>
                                        <div className="chart-container">
                                            <canvas ref={chartIndustryPieRef} />
                                        </div>
                                    </div>
                                    <div className="viz-box">
                                        <div className="viz-header">
                                            <div className="viz-title">업종분포 추이</div>
                                            <div className="viz-meta">단위: % (전분기 대비)</div>
                                        </div>
                                        <div className="chart-container">
                                            <canvas ref={chartIndustryTrendRef} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── 6. 매출액 분석 (NULL) ── */}
                            <NullSection title="매출액 분석" />

                            {/* ── 7. 유동인구 분석 ── */}
                            <div className="report-section">
                                <h3 className="rs-title">유동인구 분석</h3>
                                {f && (
                                    <div className="store-summary-row">
                                        <div className="ssrow-item">
                                            <span className="ssrow-label">일평균 유동인구</span>
                                            <span className="ssrow-val">{n(Math.round(fTotal / 91), '명')}</span>
                                        </div>
                                        <div className="ssrow-item">
                                            <span className="ssrow-label">전분기 대비</span>
                                            <span className={`ssrow-val ${(f.prevQuarterDiff ?? 0) >= 0 ? 'up' : 'down'}`}>
                                                {f.prevQuarterDiff != null
                                                    ? `${f.prevQuarterDiff >= 0 ? '+' : ''}${Math.round(f.prevQuarterDiff / 91).toLocaleString()}명`
                                                    : '-'}
                                            </span>
                                        </div>
                                        <div className="ssrow-item">
                                            <span className="ssrow-label">전년동기 대비</span>
                                            <span className={`ssrow-val ${(f.prevYearDiff ?? 0) >= 0 ? 'up' : 'down'}`}>
                                                {f.prevYearDiff != null
                                                    ? `${f.prevYearDiff >= 0 ? '+' : ''}${Math.round(f.prevYearDiff / 91).toLocaleString()}명`
                                                    : '-'}
                                            </span>
                                        </div>
                                        <div className="ssrow-item">
                                            <span className="ssrow-label">피크 시간대</span>
                                            <span className="ssrow-val">{maxTimeIdx >= 0 ? TIME_LABELS[maxTimeIdx] : '-'}</span>
                                        </div>
                                    </div>
                                )}

                                {/* 성별 바 */}
                                {malePct != null && (
                                    <div className="gender-bar-wrap">
                                        <div className="gb-label-row">
                                            <span>남성 {malePct}%</span>
                                            <span>여성 {femalePct}%</span>
                                        </div>
                                        <div className="gender-bar">
                                            <div className="gb-male"   style={{ width: `${malePct}%` }} />
                                            <div className="gb-female" style={{ width: `${femalePct}%` }} />
                                        </div>
                                    </div>
                                )}

                                <div className="grid-2viz">
                                    <div className="viz-box">
                                        <div className="viz-header">
                                            <div className="viz-title">시간대별 유동인구</div>
                                            <div className="viz-meta">단위: 비율(%)</div>
                                        </div>
                                        <div className="chart-container">
                                            {timeRatios.length > 0
                                                ? <canvas ref={chartFloatingTimeRef} />
                                                : <EmptyChart />
                                            }
                                        </div>
                                    </div>
                                    <div className="viz-box">
                                        <div className="viz-header">
                                            <div className="viz-title">요일별 유동인구</div>
                                            <div className="viz-meta">단위: 비율(%)</div>
                                        </div>
                                        <div className="chart-container">
                                            {hasDayData
                                                ? <canvas ref={chartFloatingDayRef} />
                                                : <EmptyChart />
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="viz-box">
                                    <div className="viz-header">
                                        <div className="viz-title">연령별 유동인구</div>
                                        <div className="viz-meta">단위: 명</div>
                                    </div>
                                    <div className="chart-container">
                                        {f ? <canvas ref={chartFloatingAgeRef} /> : <EmptyChart />}
                                    </div>
                                </div>

                                {hasDayData && (
                                    <div className="rs-summary-card">
                                        <strong>{DAY_LABELS[maxDayIdx]}요일({dayRatios[maxDayIdx]?.toFixed(2)}%)</strong> 유동인구가 가장 많습니다.
                                        {maxDayIdx < 5 ? ' 평일 고객이 중요한 상권입니다.' : ' 주말 유동인구가 활발한 상권입니다.'}
                                    </div>
                                )}
                            </div>

                            {/* ── 8. 주거인구 ── */}
                            {res ? (
                                <div className="report-section">
                                    <h3 className="rs-title">주거인구</h3>
                                    <div className="store-summary-row">
                                        <div className="ssrow-item">
                                            <span className="ssrow-label">총 주거인구</span>
                                            <span className="ssrow-val">{n(res.totalResidentPopulation, '명')}</span>
                                        </div>
                                        <div className="ssrow-item">
                                            <span className="ssrow-label">남성</span>
                                            <span className="ssrow-val">{n(res.maleResidentPopulation, '명')}</span>
                                        </div>
                                        <div className="ssrow-item">
                                            <span className="ssrow-label">여성</span>
                                            <span className="ssrow-val">{n(res.femaleResidentPopulation, '명')}</span>
                                        </div>
                                        <div className="ssrow-item">
                                            <span className="ssrow-label">전분기 대비</span>
                                            <span className="ssrow-val">
                                                {res.prevQuarterDiff != null
                                                    ? `${res.prevQuarterDiff >= 0 ? '+' : ''}${res.prevQuarterDiff}명`
                                                    : '-'}
                                            </span>
                                        </div>
                                    </div>
                                    {resMalePct != null && (
                                        <div className="gender-bar-wrap">
                                            <div className="gb-label-row">
                                                <span>남성 {resMalePct}%</span>
                                                <span>여성 {resFemPct}%</span>
                                            </div>
                                            <div className="gender-bar">
                                                <div className="gb-male"   style={{ width: `${resMalePct}%` }} />
                                                <div className="gb-female" style={{ width: `${resFemPct}%` }} />
                                            </div>
                                        </div>
                                    )}
                                    <div className="viz-box">
                                        <div className="viz-header">
                                            <div className="viz-title">성별·연령별 주거인구</div>
                                            <div className="viz-meta">단위: 명</div>
                                        </div>
                                        <div className="chart-container">
                                            <canvas ref={chartResidentAgeRef} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <NullSection title="주거인구" />
                            )}

                            {/* ── 9. 직장인구 (NULL) ── */}
                            <NullSection title="직장인구" />

                            {/* ── 10. 가구세대 수 ── */}
                            {hh ? (
                                <div className="report-section">
                                    <h3 className="rs-title">가구세대 수</h3>
                                    <div className="store-summary-row">
                                        <div className="ssrow-item">
                                            <span className="ssrow-label">총 가구수</span>
                                            <span className="ssrow-val">{n(hh.totalHouseholdCount, '가구')}</span>
                                        </div>
                                        <div className="ssrow-item">
                                            <span className="ssrow-label">아파트 단지수</span>
                                            <span className="ssrow-val">{n(hh.apartmentComplexCount, '개')}</span>
                                        </div>
                                        <div className="ssrow-item">
                                            <span className="ssrow-label">아파트 평균면적</span>
                                            <span className="ssrow-val">{n(hh.apartmentAvgArea, '㎡')}</span>
                                        </div>
                                        <div className="ssrow-item">
                                            <span className="ssrow-label">아파트 평균가격</span>
                                            <span className="ssrow-val">
                                                {hh.apartmentAvgPrice != null
                                                    ? `${(hh.apartmentAvgPrice / 100000000).toFixed(1)}억`
                                                    : '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <NullSection title="가구세대 수" />
                            )}

                            {/* ── 11. 집객시설 현황 ── */}
                            {fac ? (
                                <div className="report-section">
                                    <h3 className="rs-title">주요 집객시설 현황</h3>
                                    <div className="rs-summary-card" style={{ marginBottom: 0 }}>
                                        총 집객시설 <strong>{n(fac.totalVisitorFacilityCount, '개')}</strong>
                                    </div>
                                    <div className="facility-grid">
                                        {[
                                            { label: '관공서',   val: fac.governmentOfficeCount },
                                            { label: '금융기관', val: fac.bankCount },
                                            { label: '병원',     val: (fac.generalHospitalCount ?? 0) + (fac.hospitalCount ?? 0) },
                                            { label: '약국',     val: fac.pharmacyCount },
                                            { label: '학교',     val: (fac.kindergartenCount ?? 0) + (fac.elementarySchoolCount ?? 0) + (fac.middleSchoolCount ?? 0) + (fac.highSchoolCount ?? 0) + (fac.universityCount ?? 0) },
                                            { label: '대학교',   val: fac.universityCount },
                                            { label: '대형마트', val: (fac.departmentStoreCount ?? 0) + (fac.supermarketCount ?? 0) },
                                            { label: '극장',     val: fac.theaterCount },
                                            { label: '숙박시설', val: fac.accommodationCount },
                                            { label: '지하철',   val: fac.subwayStationCount },
                                            { label: '버스정류장', val: fac.busStopCount },
                                            { label: '철도역',   val: fac.railwayStationCount },
                                        ].map(({ label, val }) => (
                                            <div className="fac-item" key={label}>
                                                <span className="fac-label">{label}</span>
                                                <span className="fac-val">{n(val, '개')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <NullSection title="주요 집객시설 현황" />
                            )}

                            {/* ── 12. 소득수준 & 소비트렌드 ── */}
                            {inc ? (
                                <div className="report-section">
                                    <h3 className="rs-title">소득수준 & 소비트렌드</h3>
                                    <div className="income-summary">
                                        <div className="income-level-card">
                                            <div className="il-label">소득 분위</div>
                                            <div className="il-val">{inc.incomeRangeCode ?? '-'}<span>분위</span></div>
                                            <div className="il-range">
                                                월평균 소득<br />
                                                {inc.monthlyAvgIncomeAmount != null
                                                    ? `${Math.round(inc.monthlyAvgIncomeAmount / 10000).toLocaleString()}만원`
                                                    : '-'}
                                            </div>
                                        </div>
                                        <div className="consumption-chart-wrap">
                                            <div className="viz-header" style={{ marginBottom: '12px' }}>
                                                <div className="viz-title">소비트렌드 구성</div>
                                                <div className="viz-meta">단위: % (지출 기준)</div>
                                            </div>
                                            <div className="chart-container" style={{ height: '220px' }}>
                                                <canvas ref={chartConsumptionRef} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="consumption-table">
                                        {consumptionRows.map(([label, val]) => (
                                            <div className="ct-row" key={label}>
                                                <span className="ct-label">{label}</span>
                                                <div className="ct-bar-wrap">
                                                    <div className="ct-bar" style={{ width: `${Math.min(val, 100)}%` }} />
                                                </div>
                                                <span className="ct-val">{val > 0 ? `${val}%` : '-'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <NullSection title="소득수준 & 소비트렌드" />
                            )}

                            {/* ── 13. 임대시세 (NULL) ── */}
                            <NullSection title="임대시세" />

                            {/* ── 14. AI SWOT ── */}
                            {swot && (
                                <div className="report-section">
                                    <h3 className="rs-title">AI 상권 SWOT 분석</h3>
                                    <div className="swot-grid">
                                        <div className="swot-item swot-s"><div className="swot-head">강점 (Strength)</div>{swot.s}</div>
                                        <div className="swot-item swot-w"><div className="swot-head">약점 (Weakness)</div>{swot.w}</div>
                                        <div className="swot-item swot-o"><div className="swot-head">기회 (Opportunity)</div>{swot.o}</div>
                                        <div className="swot-item swot-t"><div className="swot-head">위협 (Threat)</div>{swot.t}</div>
                                    </div>
                                </div>
                            )}

                            {/* ── 15. AI 최종 코멘트 ── */}
                            {selectedData.advice && (
                                <div className="report-section">
                                    <div className="ai-advice">
                                        <div className="ai-advice-title">💡 입지너구리의 최종 코멘트</div>
                                        <div className="ai-advice-desc">{selectedData.advice}</div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
