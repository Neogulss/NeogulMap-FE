import Tooltip from "../common/Tooltip";

export default function RiskAnalysis({
  riskSummary,
  riskClosureRate,
  riskLoading,
}) {
  if (!riskSummary && riskClosureRate == null) return null;

  let riskColor = "text-blue-600";
  let bgColor = "bg-blue-50";

  if (riskClosureRate >= 40) {
    riskColor = "text-red-600";
    bgColor = "bg-red-50";
  } else if (riskClosureRate >= 20) {
    riskColor = "text-blue-600";
    bgColor = "bg-blue-50";
  }

  return (
    <>
      <div className="advice-summary-header">
        <div className="rs-title">AI 폐업률 예측</div>
        <Tooltip text="예상 폐업률은 폐업률, 개업률, 유동인구 등 다양한 지표를 활용하여 AI 모델이 예측한 다음 분기 폐업률입니다." />
      </div>

      {riskClosureRate != null && (
        <div
          className={`flex items-center justify-between !px-3 !py-4 rounded-xl ${bgColor}`}
        >
          <span className="font-semibold text-b-3">최종 예측 폐업률</span>

          {riskLoading ? (
            <div className="w-12 h-5 bg-gray-300 rounded animate-pulse"></div>
          ) : (
            <span className={`font-bold text-b-1 ${riskColor}`}>
              {riskClosureRate}%
            </span>
          )}
        </div>
      )}
      {riskSummary?.trim() && (
        <div className="sales-forecast-comment-card sales-forecast-comment-card--wide">
          <div className="sales-forecast-comments-title">AI 분석 코멘트</div>
          {riskLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="w-full h-4 bg-gray-300 rounded"></div>
              <div className="w-5/6 h-4 bg-gray-300 rounded"></div>
              <div className="w-4/6 h-4 bg-gray-300 rounded"></div>
            </div>
          ) : (
            <ul className="sales-forecast-comments-list">
              {riskSummary.trim().split("\n").filter(l => l.trim()).map((line, i) => (
                <li key={i}>{line.replace(/^[-•*]\s*/, "")}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
