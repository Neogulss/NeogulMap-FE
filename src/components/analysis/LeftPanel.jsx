import { useState, useRef, useEffect } from "react";
import { useState, useRef } from "react";
import loadingDots from "../../assets/images/Loading Dots.gif";

function Tooltip({ text }) {
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);

  const handleClick = () => {
    if (pos) { setPos(null); return; }
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.top - 8, left: r.left + r.width / 2 });
  };

  return (
    <span className="tooltip-wrap">
      <button ref={btnRef} className="tooltip-btn" onClick={handleClick} onBlur={() => setPos(null)} type="button">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 10a3.001 3.001 0 01-2 2.83V13a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>
      {pos && (
        <div className="tooltip-popup" style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -100%)' }}>
          {text}
        </div>
      )}
    </span>
  );
}

const FLOOR_OPTIONS = [
  { label: "5층+", value: 5, ground: false },
  { label: "4층", value: 4, ground: false },
  { label: "3층", value: 3, ground: false },
  { label: "2층", value: 2, ground: false },
  { label: "1층", value: 1, ground: true },
  { label: "지하", value: -1, ground: false, underground: true },
];

// w/h: 카드 안에 그려질 평면도 비율 (46 기준 정규화)
const AREA_OPTIONS = [
  { label: "~30㎡", sub: "소형", value: 20, w: 28, h: 22 },
  { label: "~50㎡", sub: "중소형", value: 40, w: 34, h: 27 },
  { label: "~80㎡", sub: "중형", value: 65, w: 38, h: 32 },
  { label: "~120㎡", sub: "중대형", value: 100, w: 42, h: 36 },
  { label: "~200㎡", sub: "대형", value: 160, w: 46, h: 40 },
  { label: "200+㎡", sub: "초대형", value: 250, w: 46, h: 46 },
];

function formatAmount(val) {
  const n = Number(val);
  if (!n || isNaN(n)) return "";
  if (n >= 10000) {
    const uk = Math.floor(n / 10000);
    const rest = n % 10000;
    return rest > 0 ? `${uk}억 ${rest.toLocaleString()}만원` : `${uk}억원`;
  }
  return `${n.toLocaleString()}만원`;
}

function BudgetInput({ value, onChange, placeholder }) {
  const [display, setDisplay] = useState(
    value ? Number(value).toLocaleString() : "",
  );

  const handleChange = (e) => {
    const raw = e.target.value.replace(/,/g, "").replace(/[^0-9]/g, "");
    const num = raw === "" ? "" : Number(raw);
    setDisplay(raw === "" ? "" : Number(raw).toLocaleString());
    onChange(num);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      className="budget-input"
      placeholder={placeholder}
      value={display}
      onChange={handleChange}
    />
  );
}

const CAT_ICONS = {
  외식업:
    "M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z",
  소매업:
    "M16 6V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H2v13c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6h-6zm-6-2h4v2h-4V4zm10 15H4V8h16v13z",
  서비스업:
    "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
};

export default function LeftPanel({
  isCollapsed,
  onToggle,
  categoryTabs,
  selectedCategory,
  onCategoryChange,
  subCategories,
  selectedSubCategory,
  onSubCategoryChange,
  budgetMax,
  onBudgetMaxChange,
  floor,
  onFloorChange,
  area,
  onAreaChange,
  onSearch,
  resultList,
  isAnalyzing,
  activeCardId,
  onSelectData,
}) {
  const [showResults, setShowResults] = useState(false);

  // 분석 시작되거나 결과가 오면 자동으로 결과 뷰로 전환 (즐겨찾기 자동분석 포함)
  useEffect(() => {
    if (isAnalyzing || resultList.length > 0) setShowResults(true);
  }, [isAnalyzing, resultList.length]);

  const handleSearch = () => {
    onSearch();
  };

  return (
    <aside
      className={`left-panel${isCollapsed ? " collapsed" : ""}`}
      id="left-panel"
    >
      <button
        className="panel-toggle left-toggle"
        id="left-toggle-btn"
        onClick={onToggle}
      >
        {isCollapsed ? "❯" : "❮"}
      </button>

      {showResults ? (
        /* ── 결과 뷰 ── */
        <>
          <div className="results-topbar">
            <div className="results-topbar-left">
              <span>추천 지역 리스트</span>
              {resultList.length > 0 && (
                <span className="list-count-badge">{resultList.length}곳</span>
              )}
            </div>
            <button className="btn-back" onClick={() => setShowResults(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              다시 선택
            </button>
          </div>

          <div className="list-section">
            <div id="result-list">
              {isAnalyzing ? (
                <p style={{ fontSize: "14px", color: "var(--g)", fontWeight: "700", textAlign: "center", marginTop: "40px" }}>
                  조건에 맞는 상권을 찾고 있습니다... 🐾
                </p>
              ) : resultList.length === 0 ? (
                <p style={{ fontSize: "14px", color: "var(--text3)", textAlign: "center", marginTop: "40px" }}>
                  결과가 없습니다.<br />조건을 변경해보세요.
                </p>
              ) : (
                resultList.map((data, idx) => (
                  <div
                    key={data.adminDongCode}
                    className={`list-card${activeCardId === data.adminDongCode ? " active" : ""}`}
                    onClick={() => onSelectData(data, idx)}
                  >
                    <div className="lc-head">
                      <div className="lc-title">
                        {data.districtName} {data.adminDongName}
                      </div>
                    </div>
                    <div className="lc-desc">
                      <strong style={{ color: "var(--g)" }}>
                        [{data.serviceIndustryCodeName}]
                      </strong>
                    </div>
                    <div className="lc-meta">
                      {data.diff !== undefined && (
                        <span className={`lc-tag lc-tag-diff${data.diff >= 0 ? ' positive' : ' negative'}`}>
                          예상 차액 {data.diff >= 0 ? '+' : '-'}{Math.abs(data.diff).toLocaleString()}만원
                        </span>
                      )}
                      <span style={{ flex: 1 }} />
                      {data.count > 0 && (
                        <span className="lc-tag lc-tag-count">점포 {data.count}개</span>
                      )}
                      <span className="lc-tag">
                        예상 초기비용{" "}
                        {data.estimatedCost ? `${data.estimatedCost.toLocaleString()}만원` : "-"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        /* ── 필터 뷰 ── */
        <div className="filter-section">
          <div className="form-label">창업 희망 업종</div>
          <div className="cat-tabs" id="cat-tabs">
            {categoryTabs.map((cat) => (
              <div
                key={cat.label}
                className={`cat-tab${selectedCategory === cat.label ? " active" : ""}`}
                onClick={() => onCategoryChange(cat.label)}
              >
                <svg viewBox="0 0 24 24">
                  <path d={CAT_ICONS[cat.label]} />
                </svg>
                {cat.label}
              </div>
            ))}
          </div>

          <div className="sub-grid-wrap">
            <div className="sub-grid" id="sub-grid">
              {subCategories.map((item, idx) => (
                <div
                  key={item.serviceIndustryCode ?? item.serviceIndustryCodeName ?? idx}
                  className={`sub-btn${selectedSubCategory === item.serviceIndustryCodeName ? " active" : ""}`}
                  onClick={() => onSubCategoryChange(item.serviceIndustryCodeName)}
                >
                  {item.serviceIndustryCodeName}
                </div>
              ))}
            </div>
          </div>

          {/* 층수 */}
          <div className="form-label">층수</div>
          <div className="floor-pills">
            {FLOOR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`floor-pill${Number(floor) === opt.value ? " active" : ""}${opt.underground ? " underground" : ""}`}
                onClick={() => onFloorChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* 면적 */}
          <div className="form-label">면적</div>
          <div className="area-grid">
            {AREA_OPTIONS.map((opt) => (
      <div className="list-section">
        <div className="list-header">
          <strong>추천 지역 리스트</strong>
          {resultList.length > 0 && (
            <span className="list-count-badge">{resultList.length}곳</span>
          )}
        </div>
        <div id="result-list">
          {isAnalyzing ? (
            <div className="analysis-loading">
              <img
                src={loadingDots}
                alt="AI 분석 로딩 중"
                className="analysis-loading-gif"
              />
              <p className="analysis-loading-text">AI가 분석중입니다...</p>
            </div>
          ) : resultList.length === 0 ? (
            <p
              style={{
                fontSize: "14px",
                color: "var(--text3)",
                textAlign: "center",
                marginTop: "40px",
              }}
            >
              조건을 입력하고
              <br />
              분석 버튼을 눌러주세요.
            </p>
          ) : (
            resultList.map((data, idx) => (
              <div
                key={opt.value}
                className={`area-card${Number(area) === opt.value ? " active" : ""}`}
                onClick={() => onAreaChange(opt.value)}
              >
                <svg viewBox="0 0 40 34" className="area-plan-svg" xmlns="http://www.w3.org/2000/svg">
                  <rect
                    x={(40 - opt.w * 0.78) / 2} y={(34 - opt.h * 0.72) / 2}
                    width={opt.w * 0.78} height={opt.h * 0.72}
                    className="plan-wall" rx="1"
                  />
                  <line
                    x1={(40 - opt.w * 0.78) / 2 + opt.w * 0.18} y1={(34 + opt.h * 0.72) / 2}
                    x2={(40 - opt.w * 0.78) / 2 + opt.w * 0.42} y2={(34 + opt.h * 0.72) / 2}
                    className="plan-door-gap" strokeWidth="2"
                  />
                  <path
                    d={`M ${(40 - opt.w * 0.78) / 2 + opt.w * 0.42} ${(34 + opt.h * 0.72) / 2} a ${opt.w * 0.24} ${opt.w * 0.24} 0 0 0 ${-(opt.w * 0.24)} ${-(opt.w * 0.24)}`}
                    className="plan-door-arc" fill="none" strokeWidth="0.8"
                  />
                </svg>
                <span className="area-label">{opt.label}</span>
              </div>
            ))}
          </div>

          {/* 창업 자본금 */}
          <div className="form-label form-label-row">
            창업 자본금
            <Tooltip text="창업 자본금은 권리금 + 보증금을 합한 금액입니다." />
          </div>
          <div className="budget-single-wrap">
            <div className="budget-input-group">
              <BudgetInput value={budgetMax} onChange={onBudgetMaxChange} placeholder="자본금 입력" />
              <span className="budget-unit">만원</span>
            </div>
            {budgetMax && (
              <div className="budget-summary">{formatAmount(budgetMax)}</div>
            )}
          </div>

          <button className="btn-search" onClick={handleSearch}>
            AI 맞춤 입지 분석하기
          </button>
        </div>
      )}
    </aside>
  );
}
