import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";
import { addFavorite } from "../../api/api";

const TREND_LABELS = ["25년 1Q", "25년 2Q", "25년 3Q", "25년 4Q"];
const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
const TIME_LABELS = [
  "00~06시",
  "06~11시",
  "11~14시",
  "14~17시",
  "17~21시",
  "21~24시",
];

// 차트 색상 팔레트
const AGE_COLORS   = ["#ff6b6b", "#ff9f43", "#ffd43b", "#a9e34b", "#4dabf7", "#cc5de8"];
const DAY_COLORS   = ["#4dabf7", "#748ffc", "#9775fa", "#f783ac", "#ff6b6b", "#ff9f43", "#a9e34b"];
const TIME_COLORS  = ["#748ffc", "#4dabf7", "#69db7c", "#ffd43b", "#ff9f43", "#cc5de8"];
const STORE_HISTORY_COLORS = ["#c5d8f5", "#9dbde8", "#75a3da", "#4d88cd", "#1a73e8"];

/** null-safe 숫자 포맷 */
const n = (v, suffix = "") =>
  v != null ? `${Number(v).toLocaleString()}${suffix}` : "-";

function Tooltip({ text }) {
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);

  const handleClick = () => {
    if (pos) {
      setPos(null);
      return;
    }
    const r = btnRef.current.getBoundingClientRect();
    const maxW = 300;
    const margin = 12;
    let left = r.left + r.width / 2;
    let transformX = "-50%";

    if (left - maxW / 2 < margin) {
      left = Math.max(margin, r.left);
      transformX = "0%";
    } else if (left + maxW / 2 > window.innerWidth - margin) {
      left = Math.min(window.innerWidth - margin, r.right);
      transformX = "-100%";
    }

    setPos({ top: r.top - 8, left, transformX });
  };

  return (
    <span className="tooltip-wrap">
      <button
        ref={btnRef}
        className="tooltip-btn"
        onClick={handleClick}
        onBlur={() => setPos(null)}
        type="button"
      >
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 10a3.001 3.001 0 01-2 2.83V13a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {pos && (
        <div
          className="tooltip-popup"
          style={{
            top: pos.top,
            left: pos.left,
            transform: `translate(${pos.transformX}, -100%)`,
          }}
        >
          {text}
        </div>
      )}
    </span>
  );
}

const EVAL_CRITERIA = [
  {
    num: "①",
    label: "매출 트렌드",
    max: 30,
    reason: "전분기 대비 월매출 성장률을 기준으로 측정합니다. 매출 흐름은 상권의 실질적인 활성화 정도를 가장 직접적으로 반영하는 지표입니다.",
  },
  {
    num: "②",
    label: "유동인구",
    max: 25,
    reason: "일평균 유동인구 수와 전분기 대비 증감 추세를 반영합니다. 잠재 고객 수가 창업 후 매출 가능성에 가장 큰 영향을 미칩니다.",
  },
  {
    num: "③",
    label: "점포 안정성",
    max: 20,
    reason: "평균 영업기간, 폐업률, 개폐업 순증감률을 종합합니다. 가게들이 얼마나 오래 살아남는지, 폐업이 개업보다 많지 않은지를 봅니다.",
  },
  {
    num: "④",
    label: "지역 소비력",
    max: 15,
    reason: "지역 주민의 소득 분위로 측정합니다. 소비 여력이 높을수록 외식·소매업 매출에 유리한 환경이 형성됩니다.",
  },
  {
    num: "⑤",
    label: "입지 인프라",
    max: 10,
    reason: "지하철역 수와 주변 집객시설 수를 반영합니다. 교통 편의성과 주변 시설이 유동인구를 끌어들이는 기반이 됩니다.",
  },
];

function EvalCriteriaPanel() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  const handleClick = () => setOpen((v) => !v);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (
        !btnRef.current?.contains(e.target) &&
        !panelRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <span className="eval-criteria-wrap">
      <button
        ref={btnRef}
        className="tooltip-btn"
        onClick={handleClick}
        type="button"
        aria-label="평가 기준 보기"
      >
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 10a3.001 3.001 0 01-2 2.83V13a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <div ref={panelRef} className="eval-criteria-panel">
          <div className="ecp-header">종합평가 산정 기준 · 100점 만점</div>
          {EVAL_CRITERIA.map((c) => (
            <div key={c.num} className="ecp-item">
              <div className="ecp-item-top">
                <span className="ecp-num">{c.num}</span>
                <span className="ecp-label">{c.label}</span>
                <span className="ecp-max">{c.max}점</span>
              </div>
              <p className="ecp-reason">{c.reason}</p>
            </div>
          ))}
        </div>
      )}
    </span>
  );
}

/** 비율 계산 (소수점 1자리) */
const pct = (part, total) =>
  total > 0 ? Math.round((part / total) * 1000) / 10 : 0;

/**
 * 5개 지표 가중 합산으로 종합평가점수 계산 (100점 만점)
 * ① 매출 트렌드  30점
 * ② 유동인구     25점
 * ③ 점포 안정성 20점
 * ④ 지역 소비력 15점
 * ⑤ 입지 인프라 10점
 */
function calcComprehensiveEvaluation(selectedData) {
  if (!selectedData) return null;

  const s   = selectedData.storeRaw;
  const f   = selectedData.floatingRaw;
  const sal = selectedData.sales;
  const inc = selectedData.income;
  const fac = selectedData.facility;

  const items = [];

  // ① 매출 트렌드 (30점)
  let salesScore = 15;
  let salesDetail = "데이터 없음";
  if (sal?.monthlySalesAmount) {
    const monthly = sal.monthlySalesAmount;
    const diff    = sal.prevQuarterAmountDiff ?? 0;
    const rate    = diff / monthly;
    if      (rate >  0.10) { salesScore = 28; salesDetail = "강한 성장세"; }
    else if (rate >  0.02) { salesScore = 22; salesDetail = "성장세"; }
    else if (rate >= -0.02){ salesScore = 16; salesDetail = "안정적"; }
    else if (rate >= -0.10){ salesScore =  9; salesDetail = "소폭 감소"; }
    else                    { salesScore =  3; salesDetail = "하락세"; }
  }
  items.push({ key: "sales", label: "매출 트렌드", score: salesScore, max: 30, detail: salesDetail });

  // ② 유동인구 (25점)
  let popScore = 12;
  let popDetail = "데이터 없음";
  if (f) {
    const daily = Math.round((f.totalFloatingPopulation ?? 0) / 91);
    const diff  = f.prevQuarterDiff ?? 0;
    const base  = daily >= 30000 ? 18 : daily >= 15000 ? 14 : daily >= 7000 ? 10 : daily >= 3000 ? 6 : 3;
    const trend = diff > 3000 ? 7 : diff > 0 ? 4 : diff >= -3000 ? 2 : 0;
    popScore  = Math.min(25, base + trend);
    popDetail = popScore >= 20 ? "매우 활발" : popScore >= 14 ? "활발" : popScore >= 8 ? "보통" : "적음";
  }
  items.push({ key: "pop", label: "유동인구", score: popScore, max: 25, detail: popDetail });

  // ③ 점포 안정성 (20점)
  // - 평균 영업기간 (0~7점): 가게들이 오래 버티냐
  // - 폐업률 (0~7점)       : 영업 중 점포 대비 이번 분기 폐업 규모
  // - 순증감률 (0~6점)     : (개업-폐업)/storeCount — 시장 성장/수축 방향
  let storeScore = 10;
  let storeDetail = "데이터 없음";
  if (s) {
    const avgYears   = s.avgOperatingYears ?? 0;
    const storeCount = Math.max(s.storeCount ?? 1, 1);
    const closeCount = s.closureStoreCount ?? 0;
    const openCount  = s.openingStoreCount  ?? 0;

    // 평균 영업기간 점수 (0~7점)
    const yearsScore =
      avgYears >= 5 ? 7 : avgYears >= 3 ? 5 : avgYears >= 2 ? 3 : avgYears >= 1 ? 2 : 1;

    // 폐업률 점수 (0~7점): 폐업 수 / 영업 중 점포 수
    const closureRate = closeCount / storeCount;
    const closeScore =
      closureRate < 0.03 ? 7 : closureRate < 0.07 ? 5 : closureRate < 0.12 ? 3 : closureRate < 0.20 ? 1 : 0;

    // 순증감률 점수 (0~6점): (개업 - 폐업) / 영업 중 점포 수
    const netRate = (openCount - closeCount) / storeCount;
    const netScore =
      netRate >  0.05 ? 6 : netRate > 0 ? 4 : netRate === 0 ? 3 : netRate > -0.05 ? 1 : 0;

    storeScore  = Math.min(20, yearsScore + closeScore + netScore);
    storeDetail = storeScore >= 16 ? "매우 안정적" : storeScore >= 12 ? "안정적" : storeScore >= 8 ? "보통" : "불안정";
  }
  items.push({ key: "store", label: "점포 안정성", score: storeScore, max: 20, detail: storeDetail });

  // ④ 지역 소비력 (15점)
  let incScore = 7;
  let incDetail = "데이터 없음";
  if (inc) {
    const code = Number(inc.incomeRangeCode ?? 5);
    incScore  = Math.round((code / 10) * 15);
    incDetail = incScore >= 12 ? "높음" : incScore >= 8 ? "보통" : "낮음";
  }
  items.push({ key: "income", label: "지역 소비력", score: incScore, max: 15, detail: incDetail });

  // ⑤ 입지 인프라 (10점)
  let facScore = 5;
  let facDetail = "데이터 없음";
  if (fac) {
    const subway    = fac.subwayStationCount ?? 0;
    const totalFac  = fac.totalVisitorFacilityCount ?? 0;
    const subwaySc  = subway >= 3 ? 5 : subway >= 1 ? 3 : 0;
    const facBaseSc = totalFac >= 50 ? 5 : totalFac >= 20 ? 3 : totalFac >= 5 ? 2 : 1;
    facScore  = Math.min(10, subwaySc + facBaseSc);
    facDetail = facScore >= 8 ? "우수" : facScore >= 5 ? "보통" : "취약";
  }
  items.push({ key: "fac", label: "입지 인프라", score: facScore, max: 10, detail: facDetail });

  const total = items.reduce((sum, i) => sum + i.score, 0);

  let grade, gradeColor;
  if      (total >= 85) { grade = "최우수 상권"; gradeColor = "#1a73e8"; }
  else if (total >= 70) { grade = "우수 상권";   gradeColor = "#2ecc71"; }
  else if (total >= 55) { grade = "양호 상권";   gradeColor = "#f39c12"; }
  else if (total >= 40) { grade = "보통 상권";   gradeColor = "#e67e22"; }
  else                   { grade = "주의 상권";   gradeColor = "#e74c3c"; }

  // ── 종합의견 생성 ──
  const opinions = [];

  // 매출 의견
  if (sal?.monthlySalesAmount) {
    if      (salesScore >= 22) opinions.push("월평균 매출이 성장세를 유지하고 있어 영업 환경이 우호적입니다.");
    else if (salesScore >= 9)  opinions.push("매출은 안정적이나 성장 모멘텀은 다소 미약합니다.");
    else                       opinions.push("매출이 감소 추세에 있어 업종 경쟁력 재검토가 필요합니다.");
  }

  // 유동인구 의견
  if (f) {
    const daily = Math.round((f.totalFloatingPopulation ?? 0) / 91);
    if      (popScore >= 18) opinions.push(`일평균 ${daily.toLocaleString()}명의 풍부한 유동인구로 잠재 고객 확보에 유리합니다.`);
    else if (popScore >= 10) opinions.push(`유동인구는 보통 수준으로 적극적인 마케팅 전략이 도움이 됩니다.`);
    else                     opinions.push(`유동인구가 상대적으로 적어 고정 고객 확보 전략이 중요합니다.`);
  }

  // 점포 안정성 의견
  if (s?.avgOperatingYears) {
    if      (storeScore >= 14) opinions.push(`평균 영업기간 ${s.avgOperatingYears}년으로 점포 생존율이 높은 안정된 상권입니다.`);
    else if (storeScore >= 8)  opinions.push(`점포 교체율이 보통 수준으로 업종 선택 시 경쟁력 분석이 권장됩니다.`);
    else                       opinions.push(`폐업률이 높아 창업 전 철저한 현장 조사와 차별화 전략이 필요합니다.`);
  }

  // 종합 결론
  if      (total >= 70) opinions.push("전반적으로 창업 입지로서 긍정적인 조건을 갖추고 있습니다.");
  else if (total >= 50) opinions.push("창업 가능한 수준이나 취약 지표를 면밀히 검토 후 결정하시길 권장합니다.");
  else                  opinions.push("여러 지표가 낮아 신중한 검토와 충분한 현장 조사가 필요합니다.");

  return { total, grade, gradeColor, items, opinions };
}

function NullSection({ title }) {
  return (
    <div className="report-section">
      <h3 className="rs-title">{title}</h3>
      <div className="null-data-card">
        <div className="null-data-icon">⏳</div>
        <div className="null-data-label">데이터 준비 중</div>
        <div className="null-data-desc">
          해당 데이터 API가 곧 제공될 예정입니다.
        </div>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="empty-chart">
      <span>데이터 없음</span>
    </div>
  );
}

export default function RightPanel({
  isShow,
  isCollapsed,
  onToggle,
  onClose,
  selectedData,
  selectedCategory,
  selectedSubCategory,
  isLoggedIn,
  budgetMin,
  budgetMax,
  floor,
  area,
}) {
  const navigate = useNavigate();
  const innerRef = useRef(null);

  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // 상권이 바뀌면 즐겨찾기 상태 초기화
  useEffect(() => {
    setIsFavorited(false);
  }, [selectedData?.id]);

  const handleFavorite = async () => {
    if (!isLoggedIn) {
      sessionStorage.setItem("returnPath", "/analysis");
      navigate("/auth/signin");
      return;
    }
    if (isFavorited || favLoading) return;

    const userIdx = Number(localStorage.getItem("userIdx"));
    // 유저가 입력한 최대 자본금을 그대로 저장 (만원 단위)
    const initialCap = Math.floor(budgetMax ?? 0);
    const catName =
      selectedSubCategory || selectedData?.serviceIndustryCodeName || "";

    setFavLoading(true);
    try {
      await addFavorite(
        userIdx,
        selectedData.adminDongCode,
        initialCap,
        catName,
        selectedCategory || '',
        floor ?? 1,
        area ?? 33,
      );
      // 백엔드가 반환하지 않는 추가 조건을 로컬에 보관
      const favMeta = JSON.parse(localStorage.getItem('favMeta') || '{}');
      favMeta[selectedData.adminDongCode] = {
        floor: floor ?? 1,
        area: area ?? 33,
        majorCategoryName: selectedCategory || '',
      };
      localStorage.setItem('favMeta', JSON.stringify(favMeta));
      setIsFavorited(true);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg?.includes("이미")) {
        setIsFavorited(true); // 이미 추가된 경우 별표만 채움
      } else {
        alert(msg || "즐겨찾기 추가에 실패했습니다.");
      }
    } finally {
      setFavLoading(false);
    }
  };

  const handleLoginClick = () => {
    sessionStorage.setItem("returnPath", "/analysis");
    navigate("/auth/signin");
  };

  const chartStoresHistoryRef = useRef(null);
  const chartFranchisePieRef = useRef(null);
  const chartOperatingCompareRef = useRef(null);
  const chartIndustryPieRef = useRef(null);
  const chartIndustryTrendRef = useRef(null);
  const chartFloatingTimeRef = useRef(null);
  const chartFloatingDayRef = useRef(null);
  const chartFloatingAgeRef = useRef(null);
  const chartResidentAgeRef = useRef(null);
  const chartConsumptionRef = useRef(null);
  const chartSalesTimeRef = useRef(null);
  const chartSalesDayRef = useRef(null);
  const chartWorkerAgeRef = useRef(null);

  const chartInstancesRef = useRef({});

  const destroyCharts = () => {
    Object.values(chartInstancesRef.current).forEach((inst) => inst.destroy());
    chartInstancesRef.current = {};
  };

  useEffect(() => {
    if (!selectedData?.historyData || !selectedData?.compareData) {
      destroyCharts();
      return;
    }

    destroyCharts();

    const d = selectedData;
    const s = d.storeRaw;
    const f = d.floatingRaw;
    const res = d.resident;
    const inc = d.income;
    const dOp = d.historyData.operating;
    const dInd = d.compareData.industry;

    // ── 점포수 추이 ──
    const storeHistory = d.historyData.stores ?? [];
    const hasStoreHistory = storeHistory.some((v) => v != null);
    if (chartStoresHistoryRef.current && hasStoreHistory) {
      chartInstancesRef.current.storesHistory = new Chart(
        chartStoresHistoryRef.current.getContext("2d"),
        {
          type: "bar",
          data: {
            labels: TREND_LABELS,
            datasets: [
              {
                data: storeHistory,
                backgroundColor: storeHistory.map((_, i) => STORE_HISTORY_COLORS[i] ?? "#1a73e8"),
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { display: false, beginAtZero: true },
              x: {
                grid: { display: false },
                ticks: {
                  font: { size: 10, family: "Pretendard", weight: "500" },
                  color: "#868e96",
                },
              },
            },
          },
        },
      );
    }

    // ── 프랜차이즈 비율 ──
    if (chartFranchisePieRef.current && s?.franchiseRatio != null) {
      chartInstancesRef.current.franchisePie = new Chart(
        chartFranchisePieRef.current.getContext("2d"),
        {
          type: "doughnut",
          data: {
            labels: ["프랜차이즈", "일반점포"],
            datasets: [
              {
                data: [
                  s.franchiseRatio,
                  s.generalRatio ?? 100 - s.franchiseRatio,
                ],
                backgroundColor: ["#1a73e8", "#ff9f43"],
                borderWidth: 2,
                borderColor: "#fff",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: "bottom",
                labels: { boxWidth: 12, padding: 14, font: { size: 11 } },
              },
            },
          },
        },
      );
    }

    // ── 평균영업기간 비교 ──
    if (chartOperatingCompareRef.current) {
      const opData = [dOp.selected, dOp.dong, dOp.seoul].map(
        (v) => v ?? 0,
      );
      const opColors = ["#1a73e8", "#00b4d8", "#f4845f"];
      chartInstancesRef.current.operatingCompare = new Chart(
        chartOperatingCompareRef.current.getContext("2d"),
        {
          type: "bar",
          data: {
            labels: ["선택상권", "행정동", "서울시"],
            datasets: [
              { data: opData, backgroundColor: opColors, borderRadius: 6 },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y}년` } },
            },
            scales: {
              y: { display: false, beginAtZero: true },
              x: {
                grid: { display: false },
                ticks: {
                  font: { size: 11, family: "Pretendard", weight: "600" },
                },
              },
            },
          },
        },
      );
    }

    // ── 업종분포 파이 ──
    if (chartIndustryPieRef.current) {
      chartInstancesRef.current.industryPie = new Chart(
        chartIndustryPieRef.current.getContext("2d"),
        {
          type: "doughnut",
          data: {
            labels: ["외식업", "서비스업", "소매업"],
            datasets: [
              {
                data: [dInd.food, dInd.service, dInd.retail],
                backgroundColor: ["#1a73e8", "#e91e63", "#f5a623"],
                borderWidth: 2,
                borderColor: "#fff",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: "bottom",
                labels: { boxWidth: 12, padding: 16, font: { size: 11 } },
              },
            },
          },
        },
      );
    }

    // ── 업종분포 추이 ──
    const industryTrend = d.historyData.industryTrend ?? [];
    const hasIndustryTrend = industryTrend.some(t => t.food != null);
    if (chartIndustryTrendRef.current && hasIndustryTrend) {
      chartInstancesRef.current.industryTrend = new Chart(
        chartIndustryTrendRef.current.getContext("2d"),
        {
          type: "bar",
          data: {
            labels: TREND_LABELS,
            datasets: [
              {
                label: "외식업",
                data: industryTrend.map(t => t.food),
                backgroundColor: "#1a73e8",
                borderRadius: 4,
              },
              {
                label: "서비스업",
                data: industryTrend.map(t => t.service),
                backgroundColor: "#e91e63",
                borderRadius: 4,
              },
              {
                label: "소매업",
                data: industryTrend.map(t => t.retail),
                backgroundColor: "#f5a623",
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: "bottom",
                labels: { boxWidth: 10, padding: 12, font: { size: 10 } },
              },
            },
            scales: {
              y: { grid: { display: true }, ticks: { font: { size: 10 } } },
              x: {
                grid: { display: false },
                ticks: { font: { size: 10 }, color: "#868e96" },
              },
            },
          },
        },
      );
    }

    // ── 유동인구 시간대별 ──
    if (
      chartFloatingTimeRef.current &&
      (d.historyData.salesHourly?.length ?? 0) > 0
    ) {
      chartInstancesRef.current.floatingTime = new Chart(
        chartFloatingTimeRef.current.getContext("2d"),
        {
          type: "line",
          data: {
            labels: TIME_LABELS,
            datasets: [
              {
                data: d.historyData.salesHourly,
                borderColor: "#1a73e8",
                backgroundColor: "rgba(26,115,232,0.1)",
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 6,
                pointBackgroundColor: "#fff",
                pointBorderColor: "#1a73e8",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { display: false, beginAtZero: true },
              x: {
                grid: { display: false },
                ticks: { font: { size: 10 }, color: "#868e96" },
              },
            },
          },
        },
      );
    }

    // ── 유동인구 요일별 ──  (실제 필드명: mondayFloatingPopulation ~ sundayFloatingPopulation)
    const dayVals = f
      ? [
          f.mondayFloatingPopulation,
          f.tuesdayFloatingPopulation,
          f.wednesdayFloatingPopulation,
          f.thursdayFloatingPopulation,
          f.fridayFloatingPopulation,
          f.saturdayFloatingPopulation,
          f.sundayFloatingPopulation,
        ]
      : [];
    const dayTotal = dayVals.reduce((a, b) => a + (b ?? 0), 0);
    if (chartFloatingDayRef.current && dayTotal > 0) {
      const dayRatios = dayVals.map((v) => pct(v ?? 0, dayTotal));
      chartInstancesRef.current.floatingDay = new Chart(
        chartFloatingDayRef.current.getContext("2d"),
        {
          type: "bar",
          data: {
            labels: DAY_LABELS,
            datasets: [
              {
                data: dayRatios,
                backgroundColor: DAY_COLORS,
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y}%` } },
            },
            scales: {
              y: { display: false, beginAtZero: true },
              x: {
                grid: { display: false },
                ticks: {
                  font: { size: 11, family: "Pretendard", weight: "600" },
                },
              },
            },
          },
        },
      );
    }

    // ── 유동인구 연령별 ── (age10 ~ age60Above)
    if (chartFloatingAgeRef.current && f) {
      const ageLabels = ["10대", "20대", "30대", "40대", "50대", "60대+"];
      const ageVals = [
        f.age10FloatingPopulation,
        f.age20FloatingPopulation,
        f.age30FloatingPopulation,
        f.age40FloatingPopulation,
        f.age50FloatingPopulation,
        f.age60AboveFloatingPopulation,
      ].map((v) => v ?? 0);
      chartInstancesRef.current.floatingAge = new Chart(
        chartFloatingAgeRef.current.getContext("2d"),
        {
          type: "bar",
          data: {
            labels: ageLabels,
            datasets: [
              {
                data: ageVals,
                backgroundColor: AGE_COLORS,
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => `${ctx.parsed.y.toLocaleString()}명`,
                },
              },
            },
            scales: {
              y: { display: false, beginAtZero: true },
              x: { grid: { display: false }, ticks: { font: { size: 11 } } },
            },
          },
        },
      );
    }

    // ── 주거인구 연령별 ──
    if (chartResidentAgeRef.current && res) {
      const rAgeLabels = ["10대", "20대", "30대", "40대", "50대", "60대+"];
      const maleAges = [
        res.maleAge10ResidentPopulation,
        res.maleAge20ResidentPopulation,
        res.maleAge30ResidentPopulation,
        res.maleAge40ResidentPopulation,
        res.maleAge50ResidentPopulation,
        res.maleAge60AboveResidentPopulation,
      ].map((v) => v ?? 0);
      const femaleAges = [
        res.femaleAge10ResidentPopulation,
        res.femaleAge20ResidentPopulation,
        res.femaleAge30ResidentPopulation,
        res.femaleAge40ResidentPopulation,
        res.femaleAge50ResidentPopulation,
        res.femaleAge60AboveResidentPopulation,
      ].map((v) => v ?? 0);
      chartInstancesRef.current.residentAge = new Chart(
        chartResidentAgeRef.current.getContext("2d"),
        {
          type: "bar",
          data: {
            labels: rAgeLabels,
            datasets: [
              {
                label: "남성",
                data: maleAges,
                backgroundColor: "#1a73e8",
                borderRadius: 3,
              },
              {
                label: "여성",
                data: femaleAges,
                backgroundColor: "#e91e63",
                borderRadius: 3,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: "bottom",
                labels: { boxWidth: 10, padding: 12, font: { size: 10 } },
              },
            },
            scales: {
              y: { display: false, beginAtZero: true },
              x: { grid: { display: false }, ticks: { font: { size: 11 } } },
            },
          },
        },
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
      ].map((v) => pct(v ?? 0, totalExp));

      chartInstancesRef.current.consumption = new Chart(
        chartConsumptionRef.current.getContext("2d"),
        {
          type: "doughnut",
          data: {
            labels: [
              "음식(외식)",
              "의류·신발",
              "생활용품",
              "의료비",
              "교통",
              "여가·문화",
              "교육",
              "유흥",
              "기타",
            ],
            datasets: [
              {
                data: consumptionData,
                backgroundColor: [
                  "#1a73e8",
                  "#e91e63",
                  "#f5a623",
                  "#00b34a",
                  "#9c27b0",
                  "#ff5722",
                  "#607d8b",
                  "#795548",
                  "#bdbdbd",
                ],
                borderWidth: 2,
                borderColor: "#fff",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: "right",
                labels: { boxWidth: 10, padding: 8, font: { size: 10 } },
              },
            },
          },
        },
      );
    }

    // ── 매출 시간대별 ──
    const sal = d.sales;
    if (chartSalesTimeRef.current && sal) {
      const salesTimeVals = [
        sal.time0006SalesAmount, sal.time0611SalesAmount,
        sal.time1114SalesAmount, sal.time1417SalesAmount,
        sal.time1721SalesAmount, sal.time2124SalesAmount,
      ].map((v) => Math.round((v ?? 0) / 10000));
      chartInstancesRef.current.salesTime = new Chart(
        chartSalesTimeRef.current.getContext("2d"),
        {
          type: "bar",
          data: {
            labels: TIME_LABELS,
            datasets: [{
              data: salesTimeVals,
              backgroundColor: TIME_COLORS,
              borderRadius: 4,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y.toLocaleString()}만원` } },
            },
            scales: {
              y: { display: false, beginAtZero: true },
              x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#868e96" } },
            },
          },
        },
      );
    }

    // ── 매출 요일별 ──
    if (chartSalesDayRef.current && sal) {
      const salesDayVals = [
        sal.mondaySalesAmount, sal.tuesdaySalesAmount, sal.wednesdaySalesAmount,
        sal.thursdaySalesAmount, sal.fridaySalesAmount, sal.saturdaySalesAmount,
        sal.sundaySalesAmount,
      ].map((v) => Math.round((v ?? 0) / 10000));
      chartInstancesRef.current.salesDay = new Chart(
        chartSalesDayRef.current.getContext("2d"),
        {
          type: "bar",
          data: {
            labels: DAY_LABELS,
            datasets: [{
              data: salesDayVals,
              backgroundColor: DAY_COLORS,
              borderRadius: 4,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y.toLocaleString()}만원` } },
            },
            scales: {
              y: { display: false, beginAtZero: true },
              x: { grid: { display: false }, ticks: { font: { size: 11, family: "Pretendard", weight: "600" } } },
            },
          },
        },
      );
    }

    // ── 직장인구 연령별 ──
    const wkr = d.worker;
    if (chartWorkerAgeRef.current && wkr) {
      const wkrAgeVals = [
        wkr.age10WorkerPopulation, wkr.age20WorkerPopulation,
        wkr.age30WorkerPopulation, wkr.age40WorkerPopulation,
        wkr.age50WorkerPopulation, wkr.age60AboveWorkerPopulation,
      ].map((v) => v ?? 0);
      chartInstancesRef.current.workerAge = new Chart(
        chartWorkerAgeRef.current.getContext("2d"),
        {
          type: "bar",
          data: {
            labels: ["10대", "20대", "30대", "40대", "50대", "60대+"],
            datasets: [{
              data: wkrAgeVals,
              backgroundColor: AGE_COLORS,
              borderRadius: 4,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y.toLocaleString()}명` } },
            },
            scales: {
              y: { display: false, beginAtZero: true },
              x: { grid: { display: false }, ticks: { font: { size: 11 } } },
            },
          },
        },
      );
    }

    if (innerRef.current) innerRef.current.scrollTop = 0;
    return () => {
      destroyCharts();
    };
  }, [selectedData]);

  const panelClass = [
    "right-panel",
    isShow ? "show" : "",
    isCollapsed ? "collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const blurClass = ["report-content-blur", !isLoggedIn ? "locked" : ""]
    .filter(Boolean)
    .join(" ");

  if (!selectedData) return <aside className="right-panel" id="right-panel" />;

  const hasReport = !!(
    selectedData.statSummary &&
    selectedData.historyData &&
    selectedData.compareData
  );
  const ss = selectedData.statSummary;
  const swot = selectedData.swot;
  const s = selectedData.storeRaw;
  const f = selectedData.floatingRaw;
  const com = selectedData.commercialRaw;
  const res = selectedData.resident;
  const hh = selectedData.household;
  const fac = selectedData.facility;
  const inc = selectedData.income;
  const wkr = selectedData.worker;
  const sal = selectedData.sales;

  // ── 유동인구 파생값 ──
  const fTotal = f?.totalFloatingPopulation ?? 0;
  const malePct =
    fTotal > 0 ? pct(f.maleFloatingPopulation ?? 0, fTotal) : null;
  const femalePct =
    fTotal > 0 ? pct(f.femaleFloatingPopulation ?? 0, fTotal) : null;

  const dayVals = f
    ? [
        f.mondayFloatingPopulation,
        f.tuesdayFloatingPopulation,
        f.wednesdayFloatingPopulation,
        f.thursdayFloatingPopulation,
        f.fridayFloatingPopulation,
        f.saturdayFloatingPopulation,
        f.sundayFloatingPopulation,
      ]
    : [];
  const dayTotal = dayVals.reduce((a, b) => a + (b ?? 0), 0);
  const hasDayData = dayTotal > 0;
  const dayRatios = hasDayData ? dayVals.map((v) => pct(v ?? 0, dayTotal)) : [];
  const maxDayIdx = hasDayData ? dayRatios.indexOf(Math.max(...dayRatios)) : -1;

  const timeRatios = selectedData.historyData?.salesHourly ?? [];
  const maxTimeIdx = timeRatios.length
    ? timeRatios.indexOf(Math.max(...timeRatios))
    : -1;

  // ── 주거인구 파생값 ──
  const resTotal = res?.totalResidentPopulation ?? 0;
  const resMalePct =
    resTotal > 0 ? pct(res.maleResidentPopulation ?? 0, resTotal) : null;
  const resFemPct =
    resTotal > 0 ? pct(res.femaleResidentPopulation ?? 0, resTotal) : null;

  // ── 직장인구 파생값 ──
  const wkrTotal = wkr?.totalWorkerPopulation ?? 0;
  const wkrMalePct = wkrTotal > 0 ? pct(wkr.maleWorkerPopulation ?? 0, wkrTotal) : null;
  const wkrFemPct  = wkrTotal > 0 ? pct(wkr.femaleWorkerPopulation ?? 0, wkrTotal) : null;

  // ── 종합평가 계산 ──
  const compEval = calcComprehensiveEvaluation(selectedData);

  // ── 소비트렌드 비율 ──
  const totalExp = inc?.totalExpenditureAmount ?? 0;
  const consumptionRows = inc
    ? [
        ["음식(외식)", inc.foodServiceExpenditureAmount],
        ["의류·신발", inc.clothingShoesExpenditureAmount],
        ["생활용품", inc.householdGoodsExpenditureAmount],
        ["의료비", inc.medicalExpenditureAmount],
        ["교통", inc.transportExpenditureAmount],
        ["여가·문화", inc.leisureCultureExpenditureAmount],
        ["교육", inc.educationExpenditureAmount],
        ["유흥", inc.entertainmentExpenditureAmount],
        ["기타", inc.etcExpenditureAmount],
      ].map(([label, val]) => [label, pct(val ?? 0, totalExp)])
    : [];

  return (
    <aside className={panelClass} id="right-panel">
      <button
        className="panel-toggle right-toggle"
        id="right-toggle-btn"
        onClick={onToggle}
      >
        {isCollapsed ? "❮" : "❯"}
      </button>

      <div className="right-panel-inner" ref={innerRef}>
        <button className="rh-close" onClick={onClose}>
          ×
        </button>

        <div className="report-header">
          <span className="rh-tag">
            {selectedData.score != null
              ? `매칭률 ${selectedData.score}%`
              : "상권 분석 리포트"}
          </span>
          <div className="rh-title-row">
            <h2 className="rh-title">
              서울시 {selectedData.districtName} {selectedData.name}
            </h2>
            <button
              className={`rh-fav-btn${isFavorited ? " active" : ""}`}
              onClick={handleFavorite}
              disabled={favLoading}
              title={isFavorited ? "즐겨찾기 완료" : "즐겨찾기 추가"}
            >
              <svg
                viewBox="0 0 24 24"
                fill={isFavorited ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {isFavorited ? "즐겨찾기 완료" : "즐겨찾기"}
            </button>
          </div>
          <div className="rh-meta">
            기준: 2025년 4분기 ·{" "}
            {selectedSubCategory || selectedData.serviceIndustryCodeName || "-"}
          </div>
        </div>

        <div className="report-wrapper">
          {!isLoggedIn && (
            <div className="login-overlay">
              <div className="lo-icon">🔒</div>
              <h3 className="lo-title">로그인이 필요합니다</h3>
              <p className="lo-desc">
                상권 분석 리포트는 로그인 후 열람할 수 있습니다.
              </p>
              <button className="lo-btn" onClick={handleLoginClick}>
                로그인하러 가기
              </button>
            </div>
          )}

          <div id="blur-content" className={blurClass}>
            {!hasReport && (
              <p
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "var(--text3)",
                  fontSize: "14px",
                }}
              >
                리포트 데이터를 불러오는 중...
              </p>
            )}
            <div
              className="report-content"
              style={{ display: hasReport ? undefined : "none" }}
            >
              {/* ── 1. 종합 평가 ── */}
              <div className="report-section">
                {/* 종합평가점수 박스 */}
                {compEval && (
                  <div className="comp-eval-box">
                    <div className="comp-eval-top">
                      {/* 왼쪽: 점수 + 등급 */}
                      <div className="comp-eval-score-wrap">
                        <div className="comp-eval-label">
                          종합평가점수
                          <EvalCriteriaPanel />
                        </div>
                        <div className="comp-eval-score">
                          {compEval.total}
                          <span>/ 100</span>
                        </div>
                        <div
                          className="comp-eval-grade"
                          style={{ color: compEval.gradeColor, borderColor: compEval.gradeColor + "33" }}
                        >
                          {compEval.grade}
                        </div>
                      </div>

                      {/* 오른쪽: 지표별 점수 바 */}
                      <div className="comp-eval-bars">
                        {compEval.items.map((item) => (
                          <div key={item.key} className="ceb-row">
                            <span className="ceb-label">{item.label}</span>
                            <div className="ceb-bar-wrap">
                              <div
                                className="ceb-bar"
                                style={{ width: `${(item.score / item.max) * 100}%` }}
                              />
                            </div>
                            <span className="ceb-score">
                              {item.score}<em>/{item.max}</em>
                            </span>
                            <span className="ceb-detail">{item.detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 종합의견 */}
                {compEval && compEval.opinions.length > 0 && (
                  <div className="comp-opinion-card">
                    <div className="co-title">💡 종합의견</div>
                    <ul className="co-list">
                      {compEval.opinions.map((op, i) => (
                        <li key={i}>{op}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 상권 분석 요약 (서버 제공 코멘트) */}
                <div className="advice-summary">
                  <div className="advice-summary-header">
                    <span className="advice-summary-title">상권 분석 요약</span>
                    <Tooltip text="상권변화지표 기준: 다이나믹 (급격한 변화) → 상승 (성장세) → 유지 (안정적) → 하강 (쇠퇴세) → 침체 (장기 부진)" />
                  </div>
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
                        <div className="ss-diff-label">
                          {ss.stores.diffLabel}
                        </div>
                        <div className="ss-diff-val">{ss.stores.diffVal}</div>
                      </div>
                      <div className="ss-main-box">
                        <div className="ss-main-label">현재 점포수</div>
                        <div className="ss-main-val">
                          {ss.stores.current}
                          <em>개</em>
                        </div>
                      </div>
                      <div className="ss-rank">
                        자치구 내 <strong>{ss.stores.rank}위</strong>/
                        {ss.stores.totalDongCount ?? "-"}개
                      </div>
                    </div>
                  )}
                  {ss?.sales ? (
                    <div className="stat-sum-item">
                      <div className="ss-label">매출액 (월평균)</div>
                      <div className={`ss-diff-box ${ss.sales.diffType}`}>
                        <div className="ss-diff-label">{ss.sales.diffLabel}</div>
                        <div className="ss-diff-val">{ss.sales.diffVal}</div>
                      </div>
                      <div className="ss-main-box">
                        <div className="ss-main-label">평균 매출액</div>
                        <div className="ss-main-val">
                          {Math.round(ss.sales.current / 10000).toLocaleString()}
                          <em>만원</em>
                        </div>
                      </div>
                    </div>
                  ) : (
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
                  )}
                  {ss?.pop && (
                    <div className="stat-sum-item">
                      <div className="ss-label">유동인구 (일평균)</div>
                      <div className={`ss-diff-box ${ss.pop.diffType}`}>
                        <div className="ss-diff-label">{ss.pop.diffLabel}</div>
                        <div className="ss-diff-val">{ss.pop.diffVal}</div>
                      </div>
                      <div className="ss-main-box">
                        <div className="ss-main-label">평균 유동인구</div>
                        <div className="ss-main-val">
                          {ss.pop.current.toLocaleString()}
                          <em>명</em>
                        </div>
                      </div>
                      <div className="ss-rank">
                        자치구 내 <strong>{ss.pop.rank}위</strong>/
                        {ss.pop.totalDongCount ?? "-"}개
                      </div>
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
                      <span className="ssrow-val">{n(s.storeCount, "개")}</span>
                    </div>
                    <div className="ssrow-item">
                      <span className="ssrow-label">전분기 대비</span>
                      <span
                        className={`ssrow-val ${(s.prevQuarterDiff ?? 0) >= 0 ? "up" : "down"}`}
                      >
                        {s.prevQuarterDiff != null
                          ? `${s.prevQuarterDiff >= 0 ? "+" : ""}${s.prevQuarterDiff}개`
                          : "-"}
                      </span>
                    </div>
                    <div className="ssrow-item">
                      <span className="ssrow-label">전년동기 대비</span>
                      <span
                        className={`ssrow-val ${(s.prevYearDiff ?? 0) >= 0 ? "up" : "down"}`}
                      >
                        {s.prevYearDiff != null
                          ? `${s.prevYearDiff >= 0 ? "+" : ""}${s.prevYearDiff}개`
                          : "-"}
                      </span>
                    </div>
                    <div className="ssrow-item">
                      <span className="ssrow-label">자치구 내 순위</span>
                      <span className="ssrow-val">
                        {s.rank != null
                          ? `${s.rank}위/${s.totalDongCount ?? "-"}`
                          : "-"}
                      </span>
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
                      {(selectedData.historyData?.stores ?? []).some(
                        (v) => v != null,
                      ) ? (
                        <canvas ref={chartStoresHistoryRef} />
                      ) : (
                        <EmptyChart />
                      )}
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
                            <strong>
                              {(
                                s.generalRatio ?? 100 - s.franchiseRatio
                              ).toFixed(1)}
                              %
                            </strong>
                          </div>
                        </div>
                        <div
                          className="chart-container"
                          style={{ height: "180px" }}
                        >
                          <canvas ref={chartFranchisePieRef} />
                        </div>
                      </>
                    ) : (
                      <div className="chart-container">
                        <EmptyChart />
                      </div>
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
                    <div className="oc-val">
                      {n(s?.openingStoreCount, "개")}
                    </div>
                    <div className="oc-diff">
                      전분기{" "}
                      {s?.openingPrevQuarterDiff != null
                        ? `${s.openingPrevQuarterDiff >= 0 ? "+" : ""}${s.openingPrevQuarterDiff}개`
                        : "-"}
                    </div>
                  </div>
                  <div className="oc-card oc-close">
                    <div className="oc-label">폐업</div>
                    <div className="oc-val">
                      {n(s?.closureStoreCount, "개")}
                    </div>
                    <div className="oc-diff">
                      전분기{" "}
                      {s?.closurePrevQuarterDiff != null
                        ? `${s.closurePrevQuarterDiff >= 0 ? "+" : ""}${s.closurePrevQuarterDiff}개`
                        : "-"}
                    </div>
                  </div>
                  <div className="oc-card oc-operating">
                    <div className="oc-label">평균 영업기간</div>
                    <div className="oc-val">
                      {n(s?.avgOperatingYears, "년")}
                    </div>
                    <div className="oc-diff">
                      서울시 평균{" "}
                      {com?.seoulOperatingBusinessMonthAvg != null
                        ? `${(com.seoulOperatingBusinessMonthAvg / 12).toFixed(1)}년`
                        : "-"}
                    </div>
                  </div>
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

              {/* ── 5. 업종분포 ── */}
              <div className="report-section">
                <h3 className="rs-title">업종분포</h3>
                {s && (
                  <div className="industry-ratio-row">
                    {[
                      {
                        label: "외식업",
                        ratio: s.foodRatio,
                        count: s.foodCount,
                        color: "#1a73e8",
                      },
                      {
                        label: "서비스업",
                        ratio: s.serviceRatio,
                        count: s.serviceCount,
                        color: "#e91e63",
                      },
                      {
                        label: "소매업",
                        ratio: s.retailRatio,
                        count: s.retailCount,
                        color: "#f5a623",
                      },
                    ].map(({ label, ratio, count, color }) => (
                      <div className="ir-item" key={label}>
                        <span className="ir-label">{label}</span>
                        <div className="ir-bar-wrap">
                          <div
                            className="ir-bar"
                            style={{
                              width: `${ratio ?? 0}%`,
                              background: color,
                            }}
                          />
                        </div>
                        <span className="ir-pct">
                          {ratio != null ? `${ratio}%` : "-"}
                        </span>
                        <span className="ir-count">{n(count, "개")}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid-2viz">
                  <div className="viz-box">
                    <div className="viz-header">
                      <div className="viz-title">업종 비율</div>
                    </div>
                    <div className="chart-container">
                      <canvas ref={chartIndustryPieRef} />
                    </div>
                  </div>
                  <div className="viz-box">
                    <div className="viz-header">
                      <div className="viz-title">업종분포 추이</div>
                      <div className="viz-meta">단위: %</div>
                    </div>
                    <div className="chart-container">
                      {(selectedData.historyData?.industryTrend ?? []).some(t => t.food != null)
                        ? <canvas ref={chartIndustryTrendRef} />
                        : <EmptyChart />}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 6. 매출액 분석 (NULL) ── */}
              {/* ── 6. 매출액 분석 ── */}
              {sal ? (
                <div className="report-section">
                  <h3 className="rs-title">매출액 분석</h3>
                  <div className="store-summary-row">
                    <div className="ssrow-item">
                      <span className="ssrow-label">월평균 매출</span>
                      <span className="ssrow-val">{n(Math.round(sal.monthlySalesAmount / 10000), "만원")}</span>
                    </div>
                    <div className="ssrow-item">
                      <span className="ssrow-label">전분기 대비</span>
                      <span className={`ssrow-val ${(sal.prevQuarterAmountDiff ?? 0) >= 0 ? "up" : "down"}`}>
                        {sal.prevQuarterAmountDiff != null
                          ? `${sal.prevQuarterAmountDiff >= 0 ? "+" : ""}${Math.round(sal.prevQuarterAmountDiff / 10000).toLocaleString()}만원`
                          : "-"}
                      </span>
                    </div>
                    <div className="ssrow-item">
                      <span className="ssrow-label">전년동기 대비</span>
                      <span className={`ssrow-val ${(sal.prevYearAmountDiff ?? 0) >= 0 ? "up" : "down"}`}>
                        {sal.prevYearAmountDiff != null
                          ? `${sal.prevYearAmountDiff >= 0 ? "+" : ""}${Math.round(sal.prevYearAmountDiff / 10000).toLocaleString()}만원`
                          : "-"}
                      </span>
                    </div>
                    <div className="ssrow-item">
                      <span className="ssrow-label">월 매출건수</span>
                      <span className="ssrow-val">{n(sal.monthlySalesCount, "건")}</span>
                    </div>
                  </div>
                  <div className="grid-2viz">
                    <div className="viz-box">
                      <div className="viz-header">
                        <div className="viz-title">시간대별 매출</div>
                        <div className="viz-meta">단위: 만원</div>
                      </div>
                      <div className="chart-container">
                        <canvas ref={chartSalesTimeRef} />
                      </div>
                    </div>
                    <div className="viz-box">
                      <div className="viz-header">
                        <div className="viz-title">요일별 매출</div>
                        <div className="viz-meta">단위: 만원</div>
                      </div>
                      <div className="chart-container">
                        <canvas ref={chartSalesDayRef} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <NullSection title="매출액 분석" />
              )}

              {/* ── 7. 유동인구 분석 ── */}
              <div className="report-section">
                <h3 className="rs-title">유동인구 분석</h3>
                {f && (
                  <div className="store-summary-row">
                    <div className="ssrow-item">
                      <span className="ssrow-label">일평균 유동인구</span>
                      <span className="ssrow-val">
                        {n(Math.round(fTotal / 91), "명")}
                      </span>
                    </div>
                    <div className="ssrow-item">
                      <span className="ssrow-label">전분기 대비</span>
                      <span
                        className={`ssrow-val ${(f.prevQuarterDiff ?? 0) >= 0 ? "up" : "down"}`}
                      >
                        {f.prevQuarterDiff != null
                          ? `${f.prevQuarterDiff >= 0 ? "+" : ""}${Math.round(f.prevQuarterDiff / 91).toLocaleString()}명`
                          : "-"}
                      </span>
                    </div>
                    <div className="ssrow-item">
                      <span className="ssrow-label">전년동기 대비</span>
                      <span
                        className={`ssrow-val ${(f.prevYearDiff ?? 0) >= 0 ? "up" : "down"}`}
                      >
                        {f.prevYearDiff != null
                          ? `${f.prevYearDiff >= 0 ? "+" : ""}${Math.round(f.prevYearDiff / 91).toLocaleString()}명`
                          : "-"}
                      </span>
                    </div>
                    <div className="ssrow-item">
                      <span className="ssrow-label">피크 시간대</span>
                      <span className="ssrow-val">
                        {maxTimeIdx >= 0 ? TIME_LABELS[maxTimeIdx] : "-"}
                      </span>
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
                      <div
                        className="gb-male"
                        style={{ width: `${malePct}%` }}
                      />
                      <div
                        className="gb-female"
                        style={{ width: `${femalePct}%` }}
                      />
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
                      {timeRatios.length > 0 ? (
                        <canvas ref={chartFloatingTimeRef} />
                      ) : (
                        <EmptyChart />
                      )}
                    </div>
                  </div>
                  <div className="viz-box">
                    <div className="viz-header">
                      <div className="viz-title">요일별 유동인구</div>
                      <div className="viz-meta">단위: 비율(%)</div>
                    </div>
                    <div className="chart-container">
                      {hasDayData ? (
                        <canvas ref={chartFloatingDayRef} />
                      ) : (
                        <EmptyChart />
                      )}
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
                    <strong>
                      {DAY_LABELS[maxDayIdx]}요일(
                      {dayRatios[maxDayIdx]?.toFixed(2)}%)
                    </strong>{" "}
                    유동인구가 가장 많습니다.
                    {maxDayIdx < 5
                      ? " 평일 고객이 중요한 상권입니다."
                      : " 주말 유동인구가 활발한 상권입니다."}
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
                      <span className="ssrow-val">
                        {n(res.totalResidentPopulation, "명")}
                      </span>
                    </div>
                    <div className="ssrow-item">
                      <span className="ssrow-label">남성</span>
                      <span className="ssrow-val">
                        {n(res.maleResidentPopulation, "명")}
                      </span>
                    </div>
                    <div className="ssrow-item">
                      <span className="ssrow-label">여성</span>
                      <span className="ssrow-val">
                        {n(res.femaleResidentPopulation, "명")}
                      </span>
                    </div>
                    <div className="ssrow-item">
                      <span className="ssrow-label">전분기 대비</span>
                      <span className="ssrow-val">
                        {res.prevQuarterDiff != null
                          ? `${res.prevQuarterDiff >= 0 ? "+" : ""}${res.prevQuarterDiff}명`
                          : "-"}
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
                        <div
                          className="gb-male"
                          style={{ width: `${resMalePct}%` }}
                        />
                        <div
                          className="gb-female"
                          style={{ width: `${resFemPct}%` }}
                        />
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
              {wkr ? (
                <div className="report-section">
                  <h3 className="rs-title">직장인구</h3>
                  <div className="store-summary-row">
                    <div className="ssrow-item">
                      <span className="ssrow-label">총 직장인구</span>
                      <span className="ssrow-val">{n(wkr.totalWorkerPopulation, "명")}</span>
                    </div>
                    <div className="ssrow-item">
                      <span className="ssrow-label">전분기 대비</span>
                      <span className={`ssrow-val ${(wkr.prevQuarterDiff ?? 0) >= 0 ? "up" : "down"}`}>
                        {wkr.prevQuarterDiff != null
                          ? `${wkr.prevQuarterDiff >= 0 ? "+" : ""}${wkr.prevQuarterDiff.toLocaleString()}명`
                          : "-"}
                      </span>
                    </div>
                    <div className="ssrow-item">
                      <span className="ssrow-label">남성</span>
                      <span className="ssrow-val">{n(wkr.maleWorkerPopulation, "명")}</span>
                    </div>
                    <div className="ssrow-item">
                      <span className="ssrow-label">여성</span>
                      <span className="ssrow-val">{n(wkr.femaleWorkerPopulation, "명")}</span>
                    </div>
                  </div>
                  {wkrMalePct != null && (
                    <div className="gender-bar-wrap">
                      <div className="gb-label-row">
                        <span>남성 {wkrMalePct}%</span>
                        <span>여성 {wkrFemPct}%</span>
                      </div>
                      <div className="gender-bar">
                        <div className="gb-male" style={{ width: `${wkrMalePct}%` }} />
                        <div className="gb-female" style={{ width: `${wkrFemPct}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="viz-box">
                    <div className="viz-header">
                      <div className="viz-title">연령별 직장인구</div>
                      <div className="viz-meta">단위: 명</div>
                    </div>
                    <div className="chart-container">
                      <canvas ref={chartWorkerAgeRef} />
                    </div>
                  </div>
                </div>
              ) : (
                <NullSection title="직장인구" />
              )}

              {/* ── 10. 가구세대 수 ── */}
              {hh ? (
                <div className="report-section">
                  <h3 className="rs-title">가구세대 수</h3>
                  <div className="store-summary-row">
                    <div className="ssrow-item">
                      <span className="ssrow-label">총 가구수</span>
                      <span className="ssrow-val">
                        {n(hh.totalHouseholdCount, "가구")}
                      </span>
                    </div>
                    <div className="ssrow-item">
                      <span className="ssrow-label">아파트 단지수</span>
                      <span className="ssrow-val">
                        {n(hh.apartmentComplexCount, "개")}
                      </span>
                    </div>
                    <div className="ssrow-item">
                      <span className="ssrow-label">아파트 평균면적</span>
                      <span className="ssrow-val">
                        {n(hh.apartmentAvgArea, "㎡")}
                      </span>
                    </div>
                    <div className="ssrow-item">
                      <span className="ssrow-label">아파트 평균가격</span>
                      <span className="ssrow-val">
                        {hh.apartmentAvgPrice != null
                          ? `${(hh.apartmentAvgPrice / 100000000).toFixed(1)}억`
                          : "-"}
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
                    총 집객시설{" "}
                    <strong>{n(fac.totalVisitorFacilityCount, "개")}</strong>
                  </div>
                  <div className="facility-grid">
                    {[
                      { label: "관공서", val: fac.governmentOfficeCount },
                      { label: "금융기관", val: fac.bankCount },
                      {
                        label: "병원",
                        val:
                          (fac.generalHospitalCount ?? 0) +
                          (fac.hospitalCount ?? 0),
                      },
                      { label: "약국", val: fac.pharmacyCount },
                      {
                        label: "학교",
                        val:
                          (fac.kindergartenCount ?? 0) +
                          (fac.elementarySchoolCount ?? 0) +
                          (fac.middleSchoolCount ?? 0) +
                          (fac.highSchoolCount ?? 0) +
                          (fac.universityCount ?? 0),
                      },
                      { label: "대학교", val: fac.universityCount },
                      {
                        label: "대형마트",
                        val:
                          (fac.departmentStoreCount ?? 0) +
                          (fac.supermarketCount ?? 0),
                      },
                      { label: "극장", val: fac.theaterCount },
                      { label: "숙박시설", val: fac.accommodationCount },
                      { label: "지하철", val: fac.subwayStationCount },
                      { label: "버스정류장", val: fac.busStopCount },
                      { label: "철도역", val: fac.railwayStationCount },
                    ].map(({ label, val }) => (
                      <div className="fac-item" key={label}>
                        <span className="fac-label">{label}</span>
                        <span className="fac-val">{n(val, "개")}</span>
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
                      <div className="il-val">
                        {inc.incomeRangeCode ?? "-"}
                        <span>분위</span>
                      </div>
                      <div className="il-range">
                        월평균 소득
                        <br />
                        {inc.monthlyAvgIncomeAmount != null
                          ? `${Math.round(inc.monthlyAvgIncomeAmount / 10000).toLocaleString()}만원`
                          : "-"}
                      </div>
                    </div>
                    <div className="consumption-chart-wrap">
                      <div
                        className="viz-header"
                        style={{ marginBottom: "12px" }}
                      >
                        <div className="viz-title">소비트렌드 구성</div>
                        <div className="viz-meta">단위: % (지출 기준)</div>
                      </div>
                      <div
                        className="chart-container"
                        style={{ height: "220px" }}
                      >
                        <canvas ref={chartConsumptionRef} />
                      </div>
                    </div>
                  </div>
                  <div className="consumption-table">
                    {consumptionRows.map(([label, val]) => (
                      <div className="ct-row" key={label}>
                        <span className="ct-label">{label}</span>
                        <div className="ct-bar-wrap">
                          <div
                            className="ct-bar"
                            style={{ width: `${Math.min(val, 100)}%` }}
                          />
                        </div>
                        <span className="ct-val">
                          {val > 0 ? `${val}%` : "-"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <NullSection title="소득수준 & 소비트렌드" />
              )}


              {/* ── 14. AI SWOT ── */}
              {swot && (
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
              )}

              {/* ── 15. AI 최종 코멘트 ── */}
              {selectedData.advice && (
                <div className="report-section">
                  <div className="ai-advice">
                    <div className="ai-advice-title">
                      💡 입지너구리의 최종 코멘트
                    </div>
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
