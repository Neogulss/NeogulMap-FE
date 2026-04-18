import Tooltip from "../common/Tooltip";
import ReactMarkdown from "react-markdown";

export default function RiskAnalysis({ riskSummary, riskClosureRate, riskLoading }) {

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

     if (riskLoading) {
    return (
      <div className="p-4 mt-4 bg-gray-100 rounded-xl animate-pulse">
        <div className="w-1/3 h-4 mb-3 bg-gray-300 rounded"></div>
        <div className="w-full h-4 mb-2 bg-gray-300 rounded"></div>
        <div className="w-5/6 h-4 bg-gray-300 rounded"></div>
      </div>
    );
  } else{

  return (
    <>
      <div className="advice-summary-header">
        <div className="rs-title">
           예상 폐업률
        </div>
        <Tooltip text="예상 폐업률은 폐업률, 개업률, 유동인구 등 다양한 지표를 활용하여 AI 모델이 예측한 다음 분기 폐업률입니다."/>
      </div>

      {riskClosureRate != null && (
        <div className={`flex items-center justify-between !px-3 !py-4 rounded-xl ${bgColor}`}>
          <span className="font-semibold text-b-3">최종 예측 폐업률</span>
          <span className={`font-bold text-b-1 ${riskColor}`}>
            {riskClosureRate}%
          </span>
        </div>
      )}

      {riskSummary?.trim() && (
        <div className="!p-3 mt-4 text-b-3 leading-relaxed text-gray-700 whitespace-pre-wrap bg-[#f9fafb] border-[1px] border-[#e5e7eb] rounded-lg">
          <ReactMarkdown>
          {riskSummary}
          </ReactMarkdown>
        </div>
      )}
    </>

  );
}
}