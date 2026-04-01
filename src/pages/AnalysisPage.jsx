import { useState, useRef, useEffect, useCallback } from 'react';
import '../styles/main.css';
import '../styles/analysis.css';
import MainNav from '../components/main/MainNav';
import LeftPanel from '../components/analysis/LeftPanel';
import MapPanel from '../components/analysis/MapPanel';
import RightPanel from '../components/analysis/RightPanel';
import { mockDataList } from '../data/analysisData';

export default function AnalysisPage() {
    const [selectedCategory, setSelectedCategory]       = useState('전체');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [budgetMin, setBudgetMin]     = useState(5000);
    const [budgetMax, setBudgetMax]     = useState(15000);
    const [resultList, setResultList]   = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedData, setSelectedData]     = useState(null);
    const [activeCardId, setActiveCardId]     = useState(null);
    const [isReportUnlocked, setIsReportUnlocked] = useState(false);
    const [isLeftCollapsed, setIsLeftCollapsed]   = useState(false);
    const [isRightShow, setIsRightShow]           = useState(false);
    const [isRightCollapsed, setIsRightCollapsed] = useState(false);

    const mapRef             = useRef(null);
    const clusterOverlaysRef = useRef([]);
    const pinOverlaysRef     = useRef([]);
    const handleSelectRef    = useRef(null);

    /* ── body / root override ── */
    useEffect(() => {
        document.body.classList.add('analysis-active');
        const root = document.getElementById('root');
        if (root) root.classList.add('analysis-fullwidth');

        return () => {
            document.body.classList.remove('analysis-active');
            if (root) root.classList.remove('analysis-fullwidth');
        };
    }, []);

    /* ── scatter detail pins on map ── */
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

    /* ── select a location and show detail panel ── */
    const handleSelectData = useCallback((data) => {
        setActiveCardId(data.id);
        setSelectedData(data);
        setIsRightShow(true);
        setIsRightCollapsed(false);

        if (mapRef.current) {
            mapRef.current.panTo(new window.kakao.maps.LatLng(data.lat, data.lng));
            setTimeout(() => { mapRef.current.setLevel(5); mapRef.current.relayout(); }, 400);
            setTimeout(() => scatterPins(data.lat, data.lng, data.count), 700);
        }
    }, [scatterPins]);

    /* keep a stable ref so map overlay callbacks always call the latest version */
    useEffect(() => { handleSelectRef.current = handleSelectData; }, [handleSelectData]);

    /* ── run analysis ── */
    const runAnalysis = useCallback(() => {
        if (!selectedSubCategory)                       { alert('상세 업종을 선택해주세요.'); return; }
        if (!budgetMin || !budgetMax)                   { alert('최소 및 최대 자본금을 입력해주세요.'); return; }
        if (Number(budgetMin) >= Number(budgetMax))     { alert('최대 자본금이 최소 자본금보다 커야 합니다.'); return; }

        clusterOverlaysRef.current.forEach(o => o.setMap(null));
        pinOverlaysRef.current.forEach(p => p.setMap(null));
        clusterOverlaysRef.current = [];
        pinOverlaysRef.current = [];

        setResultList([]);
        setIsAnalyzing(true);

        setTimeout(() => {
            setResultList(mockDataList);
            setIsAnalyzing(false);

            if (mapRef.current) {
                mockDataList.forEach((data) => {
                    const el = document.createElement('div');
                    el.className = 'dong-cluster';
                    el.innerHTML = `<span class="d-name">${data.name}</span><span class="d-count">${data.count}</span>`;
                    el.onclick = () => handleSelectRef.current(data);

                    const overlay = new window.kakao.maps.CustomOverlay({
                        position: new window.kakao.maps.LatLng(data.lat, data.lng),
                        content: el,
                        zIndex: 3,
                    });
                    overlay.setMap(mapRef.current);
                    clusterOverlaysRef.current.push(overlay);
                });
                mapRef.current.panTo(new window.kakao.maps.LatLng(37.553, 126.920));
            }
        }, 600);
    }, [selectedSubCategory, budgetMin, budgetMax]);

    /* ── close detail panel ── */
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
                    isReportUnlocked={isReportUnlocked}
                    onUnlock={() => setIsReportUnlocked(true)}
                />
            </div>
        </div>
    );
}
