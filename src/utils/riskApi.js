import { postRiskData } from "../api/risk";

export const fetchRiskResult = async (data) => {
  try {
    const payload = {
      adminDongCode: data.adminDongCode,
      serviceIndustryCode: data.serviceIndustryCode,
    };
    const response = await postRiskData(payload);
    const riskResult = response.data;
    let riskSummary = "";
let riskClosureRate = Number(
  (riskResult.finalClosureRate ?? 0).toFixed(2)
);
    let riskMessage = riskResult.message ?? "";

    if (riskResult.riskAiResponse) {
      const ai = JSON.parse(riskResult.riskAiResponse);
      riskSummary = ai.summary;
    }
    return { riskSummary, riskClosureRate, riskMessage };
  } catch (error) {
    console.error("Error posting risk data:", error);
    throw error;
  }
};