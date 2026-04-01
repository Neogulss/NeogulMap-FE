import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const X_LABELS = ['2024년 4분기', '2025년 1분기', '2025년 2분기', '2025년 3분기', '2025년 4분기'];

export default function RightPanel({
    isShow,
    isCollapsed,
    onToggle,
    onClose,
    selectedData,
    selectedSubCategory,
    isReportUnlocked,
    onUnlock,
}) {
    const innerRef = useRef(null);

    const chartStoresHistoryRef    = useRef(null);
    const chartStoresCurrentRef    = useRef(null);
    const chartSurvivalHistoryRef  = useRef(null);
    const chartOperatingCompareRef = useRef(null);
    const chartIndustryPieRef      = useRef(null);
    const chartIndustryHistoryRef  = useRef(null);
    const chartSalesHistoryRef     = useRef(null);
    const chartSalesHourlyRef      = useRef(null);

    const chartInstancesRef = useRef({});

    const destroyCharts = () => {
        Object.values(chartInstancesRef.current).forEach(inst => inst.destroy());
        chartInstancesRef.current = {};
    };

    useEffect(() => {
        if (!selectedData) {
            destroyCharts();
            return;
        }

        destroyCharts();

        const d = selectedData;
        const dOp = d.historyData.operating;
        const dInd = d.compareData.industry;

        chartInstancesRef.current.storesHistory = new Chart(
            chartStoresHistoryRef.current.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: X_LABELS,
                    datasets: [{ data: d.historyData.stores, backgroundColor: '#adb5bd', borderRadius: 4, hoverBackgroundColor: '#00B34A' }],
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

        chartInstancesRef.current.storesCurrent = new Chart(
            chartStoresCurrentRef.current.getContext('2d'), {
                type: 'radar',
                data: {
                    labels: ['선택상권', '자치구', '서울시'],
                    datasets: [{
                        data: d.compareData.storesCompare,
                        backgroundColor: 'rgba(0, 200, 83, 0.15)',
                        borderColor: '#00B34A', borderWidth: 2,
                        pointRadius: 4, pointBackgroundColor: '#fff', pointBorderColor: '#00B34A',
                    }],
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { r: { display: false, beginAtZero: true, grid: { display: true }, angleLines: { display: true } } },
                },
            }
        );

        chartInstancesRef.current.survivalHistory = new Chart(
            chartSurvivalHistoryRef.current.getContext('2d'), {
                type: 'line',
                data: {
                    labels: X_LABELS,
                    datasets: [{
                        data: d.historyData.survival,
                        borderColor: '#1a73e8', backgroundColor: 'rgba(26, 115, 232, 0.08)',
                        fill: true, tension: 0.4, borderWidth: 3,
                        pointRadius: 5, pointBackgroundColor: '#fff', pointBorderColor: '#1a73e8',
                    }],
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

        chartInstancesRef.current.operatingCompare = new Chart(
            chartOperatingCompareRef.current.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['선택상권', '행정동', '자치구', '서울시'],
                    datasets: [{
                        data: [dOp.selected, dOp.dong, dOp.district, dOp.seoul],
                        backgroundColor: ['#1a73e8', '#adb5bd', '#adb5bd', '#adb5bd'],
                        borderRadius: 6,
                    }],
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { display: false, beginAtZero: true },
                        x: { grid: { display: false }, ticks: { font: { size: 11, family: 'Pretendard', weight: '600' } } },
                    },
                },
            }
        );

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

        chartInstancesRef.current.industryHistory = new Chart(
            chartIndustryHistoryRef.current.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: X_LABELS,
                    datasets: [
                        { label: '외식업',  data: [0.5, -0.3, -0.1, 0.1, -0.3], backgroundColor: '#1a73e8', borderRadius: 4 },
                        { label: '서비스업', data: [0.3, -0.2,  0.2, -0.2,  0.1], backgroundColor: '#e91e63', borderRadius: 4 },
                        { label: '소매업',  data: [0.1,  0.1,  0.1,  0.1,  0.2], backgroundColor: '#f5a623', borderRadius: 4 },
                    ],
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { grid: { display: true }, ticks: { font: { size: 10 } } },
                        x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#868e96' } },
                    },
                },
            }
        );

        chartInstancesRef.current.salesHistory = new Chart(
            chartSalesHistoryRef.current.getContext('2d'), {
                type: 'line',
                data: {
                    labels: X_LABELS,
                    datasets: [
                        { label: '선택상권', data: d.historyData.sales,         borderColor: '#1a73e8', tension: 0.1, borderWidth: 3, pointRadius: 6, pointBackgroundColor: '#fff' },
                        { label: '자치구',   data: d.compareData.salesDistrict, borderColor: '#adb5bd', tension: 0.1, borderWidth: 2, pointRadius: 0, borderDash: [5, 5] },
                        { label: '서울시',   data: d.compareData.salesSeoul,    borderColor: '#868e96', tension: 0.1, borderWidth: 2, pointRadius: 0, borderDash: [2, 2] },
                    ],
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { display: false, beginAtZero: false },
                        x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#868e96' } },
                    },
                },
            }
        );

        chartInstancesRef.current.salesHourly = new Chart(
            chartSalesHourlyRef.current.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['00~06시', '06~11시', '11~14시', '14~17시', '17~21시', '21~24시'],
                    datasets: [{
                        data: d.historyData.salesHourly,
                        borderColor: '#1a73e8', backgroundColor: 'rgba(26, 115, 232, 0.1)',
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

        if (innerRef.current) innerRef.current.scrollTop = 0;

        return () => { destroyCharts(); };
    }, [selectedData]);

    const panelClass = [
        'right-panel',
        isShow ? 'show' : '',
        isCollapsed ? 'collapsed' : '',
    ].filter(Boolean).join(' ');

    const blurClass = [
        'report-content-blur',
        !isReportUnlocked ? 'locked' : '',
    ].filter(Boolean).join(' ');

    if (!selectedData) {
        return <aside className="right-panel" id="right-panel" />;
    }

    const { statSummary: ss, swot } = selectedData;

    return (
        <aside className={panelClass} id="right-panel">
            <button
                className="panel-toggle right-toggle"
                id="right-toggle-btn"
                onClick={onToggle}
            >
                {isCollapsed ? '❮' : '❯'}
            </button>

            <div className="right-panel-inner" ref={innerRef}>
                <button className="rh-close" onClick={onClose}>×</button>

                <div className="report-header">
                    <span className="rh-tag" id="detail-tag">매칭률 {selectedData.score}%</span>
                    <h2 className="rh-title" id="detail-title">서울시 마포구 {selectedData.name}</h2>
                </div>

                <div className="report-wrapper">
                    <div id="login-overlay" className={`login-overlay${isReportUnlocked ? ' hidden' : ''}`}>
                        <h3>상세 분석 리포트 보기</h3>
                        <button onClick={onUnlock}>로그인</button>
                    </div>

                    <div id="blur-content" className={blurClass}>
                        <div className="report-content">

                            {/* 종합 평가 */}
                            <div className="report-section">
                                <div className="total-score-box">
                                    <div className="ts-label">AI 상권 종합 평가</div>
                                    <div className="ts-score" id="detail-score">
                                        {selectedData.score}<span>점</span>
                                    </div>
                                    <div className="ts-grade" id="detail-grade">{selectedData.grade}</div>
                                </div>
                                <div className="advice-summary" id="detail-summary-list">
                                    <ul>
                                        {selectedData.summaryComments.map((comment, i) => (
                                            <li key={i} dangerouslySetInnerHTML={{ __html: comment }} />
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* 핵심 지표 요약 */}
                            <div className="report-section">
                                <h3 className="rs-title">핵심 지표 요약</h3>
                                <div className="stat-summary-grid">
                                    <div className="stat-sum-item">
                                        <div className="ss-label">점포수</div>
                                        <div className={`ss-diff-box ${ss.stores.diffType}`} id="sum-diff-stores">
                                            <div className="ss-diff-label">{ss.stores.diffLabel}</div>
                                            <div className="ss-diff-val">{ss.stores.diffVal}</div>
                                        </div>
                                        <div className="ss-main-box">
                                            <div className="ss-main-label">현재 점포수</div>
                                            <div className="ss-main-val" id="sum-stores">{ss.stores.current}<em>개</em></div>
                                        </div>
                                        <div className="ss-rank">자치구 내 행정동 <strong id="sum-rank-stores">{ss.stores.rank}위</strong>/16개</div>
                                    </div>
                                    <div className="stat-sum-item">
                                        <div className="ss-label">매출액 (월평균)</div>
                                        <div className={`ss-diff-box ${ss.sales.diffType}`} id="sum-diff-sales">
                                            <div className="ss-diff-label">{ss.sales.diffLabel}</div>
                                            <div className="ss-diff-val">{ss.sales.diffVal}</div>
                                        </div>
                                        <div className="ss-main-box">
                                            <div className="ss-main-label">평균 매출액</div>
                                            <div className="ss-main-val" id="sum-sales">{ss.sales.current.toLocaleString()}<em>만원</em></div>
                                        </div>
                                        <div className="ss-rank">자치구 내 행정동 <strong id="sum-rank-sales">{ss.sales.rank}위</strong>/15개</div>
                                    </div>
                                    <div className="stat-sum-item">
                                        <div className="ss-label">유동인구 (일평균)</div>
                                        <div className={`ss-diff-box ${ss.pop.diffType}`} id="sum-diff-pop">
                                            <div className="ss-diff-label">{ss.pop.diffLabel}</div>
                                            <div className="ss-diff-val">{ss.pop.diffVal}</div>
                                        </div>
                                        <div className="ss-main-box">
                                            <div className="ss-main-label">평균 유동인구</div>
                                            <div className="ss-main-val" id="sum-pop">{ss.pop.current.toLocaleString()}<em>명</em></div>
                                        </div>
                                        <div className="ss-rank">자치구 내 행정동 <strong id="sum-rank-pop">{ss.pop.rank}위</strong>/16개</div>
                                    </div>
                                </div>
                            </div>

                            {/* 점포수 및 경쟁 현황 */}
                            <div className="report-section">
                                <h3 className="rs-title">점포수 및 경쟁 현황</h3>
                                <p className="rs-summary-card" id="advice-stores">
                                    선택상권의 <strong id="selected-subcat-1">{selectedSubCategory}</strong> 점포수가 전년동기에 비해 증가하고 있습니다. 상권이 발달하는 시기인 경우 입지선정에 신중하셔야 합니다.
                                </p>
                                <div className="grid-2viz">
                                    <div className="viz-box">
                                        <div className="viz-header">
                                            <div className="viz-title">점포수 추이</div>
                                            <div className="viz-meta">단위 : 개 / 2025년 4분기 기준</div>
                                        </div>
                                        <div className="chart-container">
                                            <canvas ref={chartStoresHistoryRef} id="chart-stores-history" />
                                        </div>
                                    </div>
                                    <div className="viz-box">
                                        <div className="viz-header">
                                            <div className="viz-title">점포수 현황 비교</div>
                                            <div className="viz-meta">대상상권 vs 자치구 vs 서울시</div>
                                        </div>
                                        <div className="chart-container">
                                            <canvas ref={chartStoresCurrentRef} id="chart-stores-current" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 생존율 및 영업기간 */}
                            <div className="report-section">
                                <h3 className="rs-title">생존율 및 영업기간</h3>
                                <p className="rs-summary-card">선택업종의 3년생존율이 증가하고 있습니다. 3년생존율이 높을수록 좋은 상권입니다. 상권내 해당업종의 경쟁력이 양호한 편입니다.</p>
                                <div className="grid-2viz">
                                    <div className="viz-box">
                                        <div className="viz-header">
                                            <div className="viz-title">신생기업 생존율 추이 (3년)</div>
                                            <div className="viz-meta">단위 : %</div>
                                        </div>
                                        <div className="chart-container">
                                            <canvas ref={chartSurvivalHistoryRef} id="chart-survival-history" />
                                        </div>
                                    </div>
                                    <div className="viz-box">
                                        <div className="viz-header">
                                            <div className="viz-title">평균 영업기간 비교</div>
                                            <div className="viz-meta">단위 : 년</div>
                                        </div>
                                        <div className="chart-container">
                                            <canvas ref={chartOperatingCompareRef} id="chart-operating-compare" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 업종분포 */}
                            <div className="report-section">
                                <h3 className="rs-title">업종분포</h3>
                                <p className="rs-summary-card">선택상권은 <strong>서비스업(이)</strong>의 증가추세가 가장 심합니다. 서비스업종 변동폭이 가장 큽니다. 추가로 원인을 파악해보시기 바랍니다.</p>
                                <div className="grid-2viz">
                                    <div className="viz-box">
                                        <div className="viz-header"><div className="viz-title">업종분포</div></div>
                                        <div className="chart-container">
                                            <canvas ref={chartIndustryPieRef} id="chart-industry-pie" />
                                        </div>
                                    </div>
                                    <div className="viz-box">
                                        <div className="viz-header">
                                            <div className="viz-title">업종분포 추이</div>
                                            <div className="viz-meta">단위 : %</div>
                                        </div>
                                        <div className="chart-container">
                                            <canvas ref={chartIndustryHistoryRef} id="chart-industry-history" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 매출액 분석 */}
                            <div className="report-section">
                                <h3 className="rs-title">매출액 분석</h3>
                                <p className="rs-summary-card">
                                    선택상권의 <strong id="selected-subcat-2">{selectedSubCategory}</strong> 매출액이 전년대비 감소 추세입니다. 매출감소 원인을 파악하시기 바랍니다. 창업전이라면 창업을 재검토하시고 창업자이시면 자신의 점포에 영향이 있는지 파악하세요.
                                </p>
                                <div className="grid-2viz">
                                    <div className="viz-box">
                                        <div className="viz-header">
                                            <div className="viz-title">매출액 추이</div>
                                            <div className="viz-meta">단위 : 만원 / 점포당 평균 월 매출</div>
                                        </div>
                                        <div className="chart-container">
                                            <canvas ref={chartSalesHistoryRef} id="chart-sales-history" />
                                        </div>
                                    </div>
                                    <div className="viz-box">
                                        <div className="viz-header">
                                            <div className="viz-title">시간대별 매출 현황</div>
                                            <div className="viz-meta">단위 : 시간대별 매출 비율(%)</div>
                                        </div>
                                        <div className="chart-container">
                                            <canvas ref={chartSalesHourlyRef} id="chart-sales-hourly" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SWOT */}
                            <div className="report-section">
                                <h3 className="rs-title">AI 상권 SWOT 분석</h3>
                                <div className="swot-grid">
                                    <div className="swot-item swot-s">
                                        <div className="swot-head">강점 (Strength)</div>
                                        {swot.s}
                                    </div>
                                    <div className="swot-item swot-w">
                                        <div className="swot-head">약점 (Weakness)</div>
                                        {swot.w}
                                    </div>
                                    <div className="swot-item swot-o">
                                        <div className="swot-head">기회 (Opportunity)</div>
                                        {swot.o}
                                    </div>
                                    <div className="swot-item swot-t">
                                        <div className="swot-head">위협 (Threat)</div>
                                        {swot.t}
                                    </div>
                                </div>
                            </div>

                            {/* 최종 조언 */}
                            <div className="report-section">
                                <div className="ai-advice">
                                    <div className="ai-advice-title">💡 입지너구리의 최종 코멘트</div>
                                    <div className="ai-advice-desc" id="detail-advice">
                                        {selectedData.advice}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
