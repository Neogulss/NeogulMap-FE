import { postSalesData } from "../api/sales";

// services 역할
// AnlaysisPage에서 사용할 매출 예측 결과 호출
// response.data 정리해서 넘기기
export const fetchSalesResult = async (data) => {
  try {
    const payload = {
      adminDongCode: data.adminDongCode,
      serviceIndustryCode: data.serviceIndustryCode,
    };
    const response = await postSalesData(payload);
    const salesResult = response.data ?? null;

    return salesResult;
  } catch (error) {
    console.error("[에러] : Error posting sales pred data", error);
    throw error;
  }
};
