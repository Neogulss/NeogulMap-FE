import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/main.css';
import '../styles/analysis.css';
import MainNav from '../components/main/MainNav';
import LeftPanel from '../components/analysis/LeftPanel';
import MapPanel from '../components/analysis/MapPanel';
import RightPanel from '../components/analysis/RightPanel';
import { categoryData } from '../data/analysisData';
import {
    fetchDistrictRecommendList,
    fetchStoreReport,
    fetchFloatingReport,
    fetchCommercialReport,
    fetchResidentReport,
    fetchHouseholdReport,
    fetchFacilityReport,
    fetchIncomeReport,
} from '../api/api';

const CATEGORY_CODES = {
    '외식업': 'MC1',
    '서비스업': 'MC2',
    '소매업': 'MC3',
};

const YEAR_QUARTER = 20254;
const HISTORY_QUARTERS = [20244, 20251, 20252, 20253, 20254];

function getCategoryCode(selectedCategory, subCategory) {
    if (selectedCategory !== '전체') return CATEGORY_CODES[selectedCategory] ?? null;
    for (const [cat, items] of Object.entries(categoryData)) {
        if (cat !== '전체' && items.includes(subCategory)) return CATEGORY_CODES[cat] ?? null;
    }
    return null;
}

function findCategoryForSub(subCategory) {
    for (const [cat, items] of Object.entries(categoryData)) {
        if (cat !== '전체' && items.includes(subCategory)) return cat;
    }
    return '전체';
}

export default function AnalysisPage() {
    const location = useLocation();

    const [selectedCategory, setSelectedCategory]       = useState('전체');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [budgetMin, setBudgetMin]     = useState(5000);
    const [budgetMax, setBudgetMax]     = useState(15000);
    const [resultList, setResultList]   = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedData, setSelectedData]     = useState(null);
    const [activeCardId, setActiveCardId]     = useState(null);
    const isLoggedIn = !!localStorage.getItem('userIdx');
    const [isLeftCollapsed, setIsLeftCollapsed]   = useState(false);
    const [isRightShow, setIsRightShow]           = useState(false);
    const [isRightCollapsed, setIsRightCollapsed] = useState(false);

    const mapRef             = useRef(null);
    const clusterOverlaysRef = useRef([]);
    const pinOverlaysRef     = useRef([]);
    const handleSelectRef    = useRef(null);
    const activeDataRef      = useRef(null);
    const pendingDongRef     = useRef(null); // 즐겨찾기에서 자동 선택할 adminDongCode
    const runAnalysisRef     = useRef(null); // 항상 최신 runAnalysis를 가리키는 ref

    useEffect(() => { activeDataRef.current = selectedData; }, [selectedData]);

    useEffect(() => {
        document.body.classList.add('analysis-active');
        const root = document.getElementById('root');
        if (root) root.classList.add('analysis-fullwidth');
        return () => {
            document.body.classList.remove('analysis-active');
            if (root) root.classList.remove('analysis-fullwidth');
        };
    }, []);

    const scatterPins = useCallback((centerLat, centerLng, count) => {
        if (!mapRef.current) return;
        pinOverlaysRef.current.forEach(p => p.setMap(null));
        pinOverlaysRef.current = [];

        const displayCount = Math.min(count, 12);
        const radius = 0.0025;
        for (let i = 0; i < displayCount; i++) {
            const angle = i * (Math.PI * 2 / displayCount);
            const lat   = centerLat + radius * Math.cos(angle);
            const lng   = centerLng + radius * Math.sin(angle) * 1.3;
            const delay = (i * 0.06).toFixed(2);

            const pin = document.createElement('div');
            pin.className = 'detail-pin';
            pin.style.animationDelay = `${delay}s`;
            pin.title = '추천 매물';

            const overlay = new window.kakao.maps.CustomOverlay({
                position: new window.kakao.maps.LatLng(lat, lng),
                content: pin,
                xAnchor: 0.5,
                yAnchor: 1,
                zIndex: 2,
            });
            overlay.setMap(mapRef.current);
            pinOverlaysRef.current.push(overlay);
        }
    }, []);

    const fetchReportData = useCallback(async (data) => {
        try {
            const [storeRes, floatingRes, commercialRes, residentRes, householdRes, facilityRes, incomeRes, ...storeHistoryRes] = await Promise.all([
                fetchStoreReport(data.adminDongCode, data.serviceIndustryCode, YEAR_QUARTER),
                fetchFloatingReport(data.adminDongCode, YEAR_QUARTER),
                fetchCommercialReport(data.adminDongCode, YEAR_QUARTER),
                fetchResidentReport(data.adminDongCode, YEAR_QUARTER).catch(() => null),
                fetchHouseholdReport(data.adminDongCode, YEAR_QUARTER).catch(() => null),
                fetchFacilityReport(data.adminDongCode, YEAR_QUARTER).catch(() => null),
                fetchIncomeReport(data.adminDongCode, YEAR_QUARTER).catch(() => null),
                ...HISTORY_QUARTERS.map(q =>
                    fetchStoreReport(data.adminDongCode, data.serviceIndustryCode, q).catch(() => null)
                ),
            ]);

            const s   = storeRes.data.data;
            const storeCountHistory = storeHistoryRes.map(r => r?.data?.data?.storeCount ?? null);
            const f   = floatingRes.data.data;
            const com = commercialRes.data.data;
            const res = residentRes?.data?.data ?? null;
            const hh  = householdRes?.data?.data ?? null;
            const fac = facilityRes?.data?.data ?? null;
            const inc = incomeRes?.data?.data ?? null;

            const fmt = (v, unit) => `${v >= 0 ? '+' : ''}${v.toLocaleString()}${unit}`;

            const timeVals = [
                f.time0006FloatingPopulation, f.time0611FloatingPopulation,
                f.time1114FloatingPopulation, f.time1417FloatingPopulation,
                f.time1721FloatingPopulation, f.time2124FloatingPopulation,
            ];
            const timeSum = timeVals.reduce((a, b) => a + b, 0);
            const tRatio  = v => timeSum > 0 ? Math.round(v / timeSum * 1000) / 10 : 0;

            const dailyPop     = Math.round(f.totalFloatingPopulation / 91);
            const dailyPopDiff = Math.round((f.prevQuarterDiff ?? 0) / 91);

            setResultList(prev => prev.map(item =>
                item.id === data.id ? { ...item, count: s.storeCount } : item
            ));

            setSelectedData(prev => {
                if (!prev || prev.id !== data.id) return prev;
                return {
                    ...prev,
                    count:  s.storeCount,
                    grade:  com.commercialChangeIndicatorName,
                    summaryComments: [
                        `선택 상권의 상권변화지표가 <strong>${com.commercialChangeIndicatorName}</strong> 상태입니다.`,
                        `평균 영업기간은 <strong>${s.avgOperatingYears}년</strong>으로 서울시 평균(${(com.seoulOperatingBusinessMonthAvg / 12).toFixed(1)}년)과 비교됩니다.`,
                    ],
                    statSummary: {
                        stores: {
                            current:        s.storeCount,
                            diffLabel:      '전분기 대비',
                            diffVal:        fmt(s.prevQuarterDiff ?? 0, '개'),
                            diffType:       (s.prevQuarterDiff ?? 0) >= 0 ? 'up' : 'down',
                            rank:           s.rank,
                            totalDongCount: s.totalDongCount,
                        },
                        pop: {
                            current:        dailyPop,
                            diffLabel:      '전분기 대비',
                            diffVal:        fmt(dailyPopDiff, '명'),
                            diffType:       dailyPopDiff >= 0 ? 'up' : 'down',
                            rank:           f.rank,
                            totalDongCount: f.totalDongCount,
                        },
                        sales: null,
                    },
                    historyData: {
                        stores:   storeCountHistory,
                        survival: [],
                        operating: {
                            selected: s.avgOperatingYears,
                            dong:     null,
                            district: null,
                            seoul:    Math.round(com.seoulOperatingBusinessMonthAvg / 12 * 10) / 10,
                        },
                        sales:       [],
                        salesHourly: timeVals.map(tRatio),
                    },
                    compareData: {
                        storesCompare: [],
                        industry: {
                            food:    s.foodRatio,
                            service: s.serviceRatio,
                            retail:  s.retailRatio,
                        },
                        salesDistrict: [],
                        salesSeoul:    [],
                    },
                    // 원본 API 데이터 (RightPanel에서 직접 접근)
                    storeRaw:    s,
                    floatingRaw: f,
                    commercialRaw: com,
                    resident:  res,
                    household: hh,
                    facility:  fac,
                    income:    inc,
                };
            });

            setTimeout(() => scatterPins(data.lat, data.lng, s.storeCount), 700);
        } catch (err) {
            console.error('리포트 API 오류:', err);
            setTimeout(() => scatterPins(data.lat, data.lng, 0), 700);
        }
    }, [scatterPins]);

    const handleSelectData = useCallback(async (data) => {
        setActiveCardId(data.id);
        setSelectedData(data);
        setIsRightShow(true);
        setIsRightCollapsed(false);

        if (mapRef.current) {
            mapRef.current.panTo(new window.kakao.maps.LatLng(data.lat, data.lng));
            setTimeout(() => { mapRef.current.setLevel(5); mapRef.current.relayout(); }, 400);
        }

        fetchReportData(data);
    }, [fetchReportData]);

    useEffect(() => { handleSelectRef.current = handleSelectData; }, [handleSelectData]);

    // resultList 갱신 후 pendingDong 자동 선택
    useEffect(() => {
        if (!pendingDongRef.current || resultList.length === 0) return;
        const target = resultList.find(item => item.adminDongCode === pendingDongRef.current);
        if (target) {
            pendingDongRef.current = null;
            handleSelectData(target);
        }
    }, [resultList, handleSelectData]);

    const runAnalysis = useCallback(async () => {
        if (!selectedSubCategory) { alert('상세 업종을 선택해주세요.'); return; }
        if (!budgetMin || !budgetMax) { alert('최소 및 최대 자본금을 입력해주세요.'); return; }
        if (Number(budgetMin) >= Number(budgetMax)) { alert('최대 자본금이 최소 자본금보다 커야 합니다.'); return; }

        const mainCategoryCode = getCategoryCode(selectedCategory, selectedSubCategory);
        if (!mainCategoryCode) { alert('해당 업종은 현재 지원되지 않습니다. (외식업·서비스업·소매업만 가능)'); return; }

        clusterOverlaysRef.current.forEach(o => o.setMap(null));
        pinOverlaysRef.current.forEach(p => p.setMap(null));
        clusterOverlaysRef.current = [];
        pinOverlaysRef.current = [];

        setResultList([]);
        setIsAnalyzing(true);

        try {
            const res = await fetchDistrictRecommendList(mainCategoryCode, selectedSubCategory);
            const seen = new Set();
            const items = res.data.data.districtRecommendLists
                .filter(item => {
                    if (seen.has(item.adminDongCode)) return false;
                    seen.add(item.adminDongCode);
                    return true;
                })
                .map((item) => ({
                    id: item.adminDongCode,
                    name: item.adminDongName,
                    districtName: item.districtName,
                    lat: item.latitude,
                    lng: item.longitude,
                    adminDongCode: item.adminDongCode,
                    serviceIndustryCode: item.serviceIndustryCode,
                    serviceIndustryCodeName: item.serviceIndustryCodeName,
                    score: null,
                    grade: null,
                    desc: `${item.districtName} 추천 상권`,
                    count: 0,
                    summaryComments: [],
                    statSummary:  null,
                    historyData:  null,
                    compareData:  null,
                    storeRaw:     null,
                    floatingRaw:  null,
                    commercialRaw: null,
                    resident:  null,
                    household: null,
                    facility:  null,
                    income:    null,
                    swot:   null,
                    advice: null,
                }));

            setResultList(items);
            setIsAnalyzing(false);

            if (mapRef.current) {
                items.forEach((data) => {
                    const el = document.createElement('div');
                    el.className = 'dong-cluster';
                    el.innerHTML = `<span class="d-name">${data.name}</span>`;
                    el.onclick = () => handleSelectRef.current(data);

                    const overlay = new window.kakao.maps.CustomOverlay({
                        position: new window.kakao.maps.LatLng(data.lat, data.lng),
                        content: el,
                        zIndex: 3,
                    });
                    overlay.setMap(mapRef.current);
                    clusterOverlaysRef.current.push(overlay);
                });
                mapRef.current.panTo(new window.kakao.maps.LatLng(37.5665, 126.9780));
            }
        } catch (err) {
            console.error('분석 API 오류:', err);
            alert('분석 중 오류가 발생했습니다.');
            setIsAnalyzing(false);
        }
    }, [selectedCategory, selectedSubCategory, budgetMin, budgetMax]);

    // runAnalysis ref 동기화 (항상 최신 버전 유지)
    useEffect(() => { runAnalysisRef.current = runAnalysis; }, [runAnalysis]);

    // 즐겨찾기에서 넘어온 경우: 조건 복원 후 자동 분석
    useEffect(() => {
        const state = location.state;
        if (!state?.serviceCategoryName) return;
        const { adminDongCode, serviceCategoryName, budgetMin: min, budgetMax: max } = state;
        if (min != null) setBudgetMin(Number(min));
        if (max != null) setBudgetMax(Number(max));
        setSelectedCategory(findCategoryForSub(serviceCategoryName));
        setSelectedSubCategory(serviceCategoryName);
        if (adminDongCode) pendingDongRef.current = Number(adminDongCode);
        // React 상태 업데이트 후 최신 runAnalysis 호출
        setTimeout(() => { runAnalysisRef.current?.(); }, 0);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleCloseDetail = useCallback(() => {
        setIsRightShow(false);
        setIsRightCollapsed(false);
        setActiveCardId(null);
        setSelectedData(null);

        pinOverlaysRef.current.forEach(p => p.setMap(null));
        pinOverlaysRef.current = [];

        if (mapRef.current) {
            mapRef.current.setLevel(6);
            setTimeout(() => mapRef.current.relayout(), 400);
        }
    }, []);

    const handleMapInit = useCallback((instance) => {
        mapRef.current = instance;
    }, []);

    const handleLeftToggle = useCallback(() => {
        setIsLeftCollapsed(prev => {
            setTimeout(() => mapRef.current?.relayout(), 400);
            return !prev;
        });
    }, []);

    const handleRightToggle = useCallback(() => {
        setIsRightCollapsed(prev => {
            setTimeout(() => mapRef.current?.relayout(), 400);
            return !prev;
        });
    }, []);

    const handleCategoryChange = useCallback((cat) => {
        setSelectedCategory(cat);
        setSelectedSubCategory('');
    }, []);

    return (
        <div className="analysis-page">
            <MainNav />
            <div className="app-container">
                <LeftPanel
                    isCollapsed={isLeftCollapsed}
                    onToggle={handleLeftToggle}
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                    selectedSubCategory={selectedSubCategory}
                    onSubCategoryChange={setSelectedSubCategory}
                    budgetMin={budgetMin}
                    budgetMax={budgetMax}
                    onBudgetMinChange={setBudgetMin}
                    onBudgetMaxChange={setBudgetMax}
                    onSearch={runAnalysis}
                    resultList={resultList}
                    isAnalyzing={isAnalyzing}
                    activeCardId={activeCardId}
                    onSelectData={handleSelectData}
                />
                <MapPanel onMapInit={handleMapInit} />
                <RightPanel
                    isShow={isRightShow}
                    isCollapsed={isRightCollapsed}
                    onToggle={handleRightToggle}
                    onClose={handleCloseDetail}
                    selectedData={selectedData}
                    selectedSubCategory={selectedSubCategory}
                    isLoggedIn={isLoggedIn}
                    budgetMin={budgetMin}
                    budgetMax={budgetMax}
                />
            </div>
        </div>
    );
}
