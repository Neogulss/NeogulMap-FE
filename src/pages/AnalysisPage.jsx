import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/main.css";
import "../styles/analysis.css";
import MainNav from "../components/main/MainNav";
import LeftPanel from "../components/analysis/LeftPanel";
import MapPanel from "../components/analysis/MapPanel";
import RightPanel from "../components/analysis/RightPanel";
import {
  fetchAIRecommend,
  fetchCategoryList,
  fetchStoreReport,
  fetchFloatingReport,
  fetchCommercialReport,
  fetchResidentReport,
  fetchHouseholdReport,
  fetchFacilityReport,
  fetchIncomeReport,
  fetchWorkerReport,
  fetchSalesReport,
  fetchSalesPred,
} from "../api/api";

const YEAR_QUARTER = 20254;
const HISTORY_QUARTERS = [20244, 20251, 20252, 20253, 20254];

const CATEGORY_TABS = [
  { label: "외식업", mc: "MC1" },
  { label: "서비스업", mc: "MC2" },
  { label: "소매업", mc: "MC3" },
];

export default function AnalysisPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const initState = location.state;
  const [selectedCategory, setSelectedCategory] = useState(
    () => initState?.majorCategoryName ?? "외식업",
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState(
    () => initState?.serviceCategoryName ?? "",
  );
  const [subCategories, setSubCategories] = useState([]);
  const [budgetMax, setBudgetMax] = useState(() =>
    initState?.budgetMax != null ? Number(initState.budgetMax) : "",
  );
  const [floor, setFloor] = useState(() =>
    initState?.floor != null ? Number(initState.floor) : "",
  );
  const [area, setArea] = useState(() =>
    initState?.area != null ? Number(initState.area) : "",
  );
  const [resultList, setResultList] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [activeCardId, setActiveCardId] = useState(null);
  const isLoggedIn = !!localStorage.getItem("userIdx");
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightShow, setIsRightShow] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  const mapRef = useRef(null);
  const clusterOverlaysRef = useRef([]);
  const handleSelectRef = useRef(null);
  const activeDataRef = useRef(null);
  const pendingDongRef = useRef(null); // 즐겨찾기에서 자동 선택할 adminDongCode
  const runAnalysisRef = useRef(null); // 항상 최신 runAnalysis를 가리키는 ref

  useEffect(() => {
    activeDataRef.current = selectedData;
  }, [selectedData]);

  useEffect(() => {
    document.body.classList.add("analysis-active");
    const root = document.getElementById("root");
    if (root) root.classList.add("analysis-fullwidth");
    return () => {
      document.body.classList.remove("analysis-active");
      if (root) root.classList.remove("analysis-fullwidth");
    };
  }, []);

  // 마운트 후 히스토리 state를 제거 → 새로고침 시 항상 기본값으로 시작
  useEffect(() => {
    if (location.state) {
      window.history.replaceState(null, "");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReportData = useCallback(async (data) => {
    try {
      const [
        storeRes,
        floatingRes,
        commercialRes,
        residentRes,
        householdRes,
        facilityRes,
        incomeRes,
        workerRes,
        salesRes,
        // 예상 매출
        salesPredRes,
        ...storeHistoryRes
      ] = await Promise.all([
        fetchStoreReport(
          data.adminDongCode,
          data.serviceIndustryCode,
          YEAR_QUARTER,
        ),
        fetchFloatingReport(data.adminDongCode, YEAR_QUARTER),
        fetchCommercialReport(data.adminDongCode, YEAR_QUARTER),
        fetchResidentReport(data.adminDongCode, YEAR_QUARTER).catch(() => null),
        fetchHouseholdReport(data.adminDongCode, YEAR_QUARTER).catch(
          () => null,
        ),
        fetchFacilityReport(data.adminDongCode, YEAR_QUARTER).catch(() => null),
        fetchIncomeReport(data.adminDongCode, YEAR_QUARTER).catch(() => null),
        fetchWorkerReport(data.adminDongCode, YEAR_QUARTER).catch(() => null),
        fetchSalesReport(
          data.adminDongCode,
          data.serviceIndustryCode,
          YEAR_QUARTER,
        ).catch(() => null),
        //예상 매출
        fetchSalesPred(data.adminDongCode, data.serviceIndustryCode).catch(
          () => null,
        ),
        ...HISTORY_QUARTERS.map((q) =>
          fetchStoreReport(
            data.adminDongCode,
            data.serviceIndustryCode,
            q,
          ).catch(() => null),
        ),
      ]);

      const s = storeRes.data.data;
      const storeCountHistory = storeHistoryRes
        .map((r) => r?.data?.data?.storeCount ?? null)
        .slice(1);
      const industryRatioHistory = storeHistoryRes.map((r) => ({
        food: r?.data?.data?.foodRatio || null,
        service: r?.data?.data?.serviceRatio || null,
        retail: r?.data?.data?.retailRatio || null,
      }));
      const f = floatingRes.data.data;
      const com = commercialRes.data.data;
      const res = residentRes?.data?.data ?? null;
      const hh = householdRes?.data?.data ?? null;
      const fac = facilityRes?.data?.data ?? null;
      const inc = incomeRes?.data?.data ?? null;
      const wkr = workerRes?.data?.data ?? null;
      const sal = salesRes?.data?.data ?? null;
      // 예상 매출
      const salesPred = salesPredRes?.data?.data ?? null;
      // null 상태 설명
      const salesRequestStatus =
        salesRes == null ? "ERROR" : sal == null ? "NO_DATA" : "OK";

      const fmt = (v, unit) =>
        `${v >= 0 ? "+" : ""}${v.toLocaleString()}${unit}`;

      const timeVals = [
        f.time0006FloatingPopulation,
        f.time0611FloatingPopulation,
        f.time1114FloatingPopulation,
        f.time1417FloatingPopulation,
        f.time1721FloatingPopulation,
        f.time2124FloatingPopulation,
      ];
      const timeSum = timeVals.reduce((a, b) => a + b, 0);
      const tRatio = (v) =>
        timeSum > 0 ? Math.round((v / timeSum) * 1000) / 10 : 0;

      const dailyPop = Math.round(f.totalFloatingPopulation / 91);
      const dailyPopDiff = Math.round((f.prevQuarterDiff ?? 0) / 91);

      setResultList((prev) =>
        prev.map((item) =>
          item.id === data.id ? { ...item, count: s.storeCount } : item,
        ),
      );

      setSelectedData((prev) => {
        if (!prev || prev.id !== data.id) return prev;
        return {
          ...prev,
          count: s.storeCount,
          grade: com.commercialChangeIndicatorName,
          summaryComments: [
            `선택 상권의 상권변화지표가 <strong>${com.commercialChangeIndicatorName}</strong> 상태입니다.`,
            `평균 영업기간은 <strong>${s.avgOperatingYears}년</strong>으로 서울시 평균(${(com.seoulOperatingBusinessMonthAvg / 12).toFixed(1)}년)과 비교됩니다.`,
          ],
          statSummary: {
            stores: {
              current: s.storeCount,
              diffLabel: "전분기 대비",
              diffVal: fmt(s.prevQuarterDiff ?? 0, "개"),
              diffType: (s.prevQuarterDiff ?? 0) >= 0 ? "up" : "down",
              rank: s.rank,
              totalDongCount: s.totalDongCount,
            },
            pop: {
              current: dailyPop,
              diffLabel: "전분기 대비",
              diffVal: fmt(dailyPopDiff, "명"),
              diffType: dailyPopDiff >= 0 ? "up" : "down",
              rank: f.rank,
              totalDongCount: f.totalDongCount,
            },
            sales: sal
              ? {
                  current: sal.monthlySalesAmount,
                  diffLabel: "전분기 대비",
                  diffVal: `${(sal.prevQuarterAmountDiff ?? 0) >= 0 ? "+" : ""}${Math.round((sal.prevQuarterAmountDiff ?? 0) / 10000).toLocaleString()}만원`,
                  diffType:
                    (sal.prevQuarterAmountDiff ?? 0) >= 0 ? "up" : "down",
                }
              : null,
          },
          historyData: {
            stores: storeCountHistory,
            industryTrend: industryRatioHistory.slice(1),
            operating: {
              selected: s.avgOperatingYears,
              dong: Math.round((com.operatingBusinessMonthAvg / 12) * 10) / 10,
              seoul:
                Math.round((com.seoulOperatingBusinessMonthAvg / 12) * 10) / 10,
            },
            sales: [],
            salesHourly: timeVals.map(tRatio),
          },
          compareData: {
            storesCompare: [],
            industry: {
              food: s.foodRatio,
              service: s.serviceRatio,
              retail: s.retailRatio,
            },
            salesDistrict: [],
            salesSeoul: [],
          },
          // 원본 API 데이터 (RightPanel에서 직접 접근)
          storeRaw: s,
          floatingRaw: f,
          commercialRaw: com,
          resident: res,
          household: hh,
          facility: fac,
          income: inc,
          worker: wkr,
          sales: sal,
          salesRequestStatus,
          salesPred: salesPred,
        };
      });
    } catch (err) {
      console.error("리포트 API 오류:", {
        message: err?.message,
        status: err?.response?.status,
        url: err?.config?.url,
        data: err?.response?.data,
      });
    }
  }, []);

  const handleSelectData = useCallback(
    async (data) => {
      setActiveCardId(data.id);
      setSelectedData(data);
      setIsRightShow(true);
      setIsRightCollapsed(false);

      if (mapRef.current) {
        const pos = new window.kakao.maps.LatLng(data.lat, data.lng);
        mapRef.current.setCenter(pos);
        mapRef.current.setLevel(5);
        // 우측 패널 CSS 트랜지션(400ms) 완료 후 relayout + 재중앙 정렬
        setTimeout(() => {
          mapRef.current?.relayout();
          mapRef.current?.setCenter(pos);
        }, 420);
      }

      fetchReportData(data);
    },
    [fetchReportData],
  );

  useEffect(() => {
    handleSelectRef.current = handleSelectData;
  }, [handleSelectData]);

  // resultList 갱신 후 pendingDong 자동 선택
  useEffect(() => {
    if (!pendingDongRef.current || resultList.length === 0) return;
    const target = resultList.find(
      (item) => item.adminDongCode === pendingDongRef.current,
    );
    if (target) {
      pendingDongRef.current = null;
      handleSelectData(target);
    }
  }, [resultList, handleSelectData]);

  const runAnalysis = useCallback(async () => {
    if (!selectedSubCategory) {
      alert("상세 업종을 선택해주세요.");
      return;
    }
    if (!budgetMax) {
      alert("최대 자본금을 입력해주세요.");
      return;
    }
    if (!floor) {
      alert("층수를 입력해주세요.");
      return;
    }
    if (!area) {
      alert("면적을 입력해주세요.");
      return;
    }

    clusterOverlaysRef.current.forEach((o) => o.setMap(null));
    clusterOverlaysRef.current = [];

    setResultList([]);
    setIsAnalyzing(true);

    try {
      const res = await fetchAIRecommend(
        selectedSubCategory,
        floor,
        area,
        budgetMax,
      );
      const items = (res.data.results ?? []).map((item) => ({
        id: item.adminDongCode,
        name: item.adminDongName,
        districtName: item.districtName,
        lat: item.latitude,
        lng: item.longitude,
        adminDongCode: item.adminDongCode,
        adminDongName: item.adminDongName,
        districtCode: item.districtCode,
        serviceIndustryCode: item.serviceIndustryCode,
        serviceIndustryCodeName: item.serviceIndustryCodeName,
        estimatedCost: item.estimatedCost,
        diff: (budgetMax || 0) - (item.estimatedCost || 0),
        score: null,
        grade: null,
        desc: `${item.districtName} 추천 상권`,
        count: 0,
        summaryComments: [],
        statSummary: null,
        historyData: null,
        compareData: null,
        storeRaw: null,
        floatingRaw: null,
        commercialRaw: null,
        resident: null,
        household: null,
        facility: null,
        income: null,
        worker: null,
        sales: null,
        swot: null,
        advice: null,
      }));

      items.sort((a, b) => b.diff - a.diff);

      setResultList(items);
      setIsAnalyzing(false);

      if (mapRef.current) {
        const bounds = new window.kakao.maps.LatLngBounds();
        items.forEach((data) => {
          const el = document.createElement("div");
          el.className = `dong-cluster ${data.diff >= 0 ? "dong-cluster--pos" : "dong-cluster--neg"}`;
          el.innerHTML = `<span class="d-name">${data.name}</span>`;
          el.onclick = () => handleSelectRef.current(data);

          const pos = new window.kakao.maps.LatLng(data.lat, data.lng);
          const overlay = new window.kakao.maps.CustomOverlay({
            position: pos,
            content: el,
            zIndex: 3,
          });
          overlay.setMap(mapRef.current);
          clusterOverlaysRef.current.push(overlay);
          bounds.extend(pos);
        });
        mapRef.current.setBounds(bounds, 80);
      }
    } catch (err) {
      console.error("AI 분석 API 오류:", err);
      alert(
        "분석 중 오류가 발생했습니다. FastAPI 서버가 실행 중인지 확인해주세요.",
      );
      setIsAnalyzing(false);
    }
  }, [selectedSubCategory, budgetMax, floor, area]);

  // runAnalysis ref 동기화 (항상 최신 버전 유지)
  useEffect(() => {
    runAnalysisRef.current = runAnalysis;
  }, [runAnalysis]);

  // 즐겨찾기에서 넘어온 경우: pendingDong 설정 후 자동 분석
  useEffect(() => {
    if (!initState?.serviceCategoryName) return;
    if (initState.adminDongCode)
      pendingDongRef.current = Number(initState.adminDongCode);
    setTimeout(() => {
      runAnalysisRef.current?.();
    }, 0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCloseDetail = useCallback(() => {
    setIsRightShow(false);
    setIsRightCollapsed(false);
    setActiveCardId(null);
    setSelectedData(null);

    if (mapRef.current) {
      mapRef.current.setLevel(7);
      setTimeout(() => mapRef.current.relayout(), 400);
    }
  }, []);

  const handleMapInit = useCallback((instance) => {
    mapRef.current = instance;
  }, []);

  const handleLeftToggle = useCallback(() => {
    setIsLeftCollapsed((prev) => {
      setTimeout(() => mapRef.current?.relayout(), 400);
      return !prev;
    });
  }, []);

  const handleRightToggle = useCallback(() => {
    setIsRightCollapsed((prev) => {
      setTimeout(() => mapRef.current?.relayout(), 400);
      return !prev;
    });
  }, []);

  const handleChatbotClick = useCallback(() => {
    navigate("/chatbot", {
      state: selectedData
        ? {
            fromAnalysis: true,
            serviceIndustryCodeName: selectedData.serviceIndustryCodeName,
            districtName: selectedData.districtName,
            adminDongName: selectedData.adminDongName,
            floor,
            area,
            budgetMax,
            diff: selectedData.diff,
          }
        : { fromAnalysis: false },
    });
  }, [navigate, selectedData, floor, area, budgetMax]);

  // 탭 변경 시 해당 MC 코드로 업종 목록 fetch
  useEffect(() => {
    const mc = CATEGORY_TABS.find((t) => t.label === selectedCategory)?.mc;
    if (!mc) return;
    fetchCategoryList(mc)
      .then((res) => setSubCategories(res.data.data.categoryList ?? []))
      .catch(() => setSubCategories([]));
  }, [selectedCategory]);

  // 즐겨찾기에서 넘어온 경우: 업종명으로 속한 탭 탐색 후 카테고리 설정
  useEffect(() => {
    const name = initState?.serviceCategoryName;
    if (!name) return;
    Promise.all(CATEGORY_TABS.map((t) => fetchCategoryList(t.mc)))
      .then((results) => {
        results.forEach((res, i) => {
          const list = res.data.data.categoryList ?? [];
          if (list.some((item) => item.serviceIndustryCodeName === name)) {
            setSelectedCategory(CATEGORY_TABS[i].label);
          }
        });
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCategoryChange = useCallback((cat) => {
    setSelectedCategory(cat);
    setSelectedSubCategory("");
  }, []);

  return (
    <div className="analysis-page">
      <MainNav />
      <div className="app-container">
        <LeftPanel
          isCollapsed={isLeftCollapsed}
          onToggle={handleLeftToggle}
          categoryTabs={CATEGORY_TABS}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          subCategories={subCategories}
          selectedSubCategory={selectedSubCategory}
          onSubCategoryChange={setSelectedSubCategory}
          budgetMax={budgetMax}
          onBudgetMaxChange={setBudgetMax}
          floor={floor}
          onFloorChange={setFloor}
          area={area}
          onAreaChange={setArea}
          onSearch={runAnalysis}
          resultList={resultList}
          isAnalyzing={isAnalyzing}
          activeCardId={activeCardId}
          onSelectData={handleSelectData}
        />
        <MapPanel
          onMapInit={handleMapInit}
          selectedData={selectedData}
          onChatbotClick={handleChatbotClick}
        />
        <RightPanel
          isShow={isRightShow}
          isCollapsed={isRightCollapsed}
          onToggle={handleRightToggle}
          onClose={handleCloseDetail}
          selectedData={selectedData}
          selectedCategory={selectedCategory}
          selectedSubCategory={selectedSubCategory}
          isLoggedIn={isLoggedIn}
          budgetMin={0}
          budgetMax={budgetMax}
          floor={floor}
          area={area}
        />
      </div>
    </div>
  );
}
