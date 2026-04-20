import indexApi from "./indexApi";

// BE /pred/sales 로 요청 보내기
// 요청, 응답만 담당
export const postSalesData = async (payload) => {
  try {
    const response = await indexApi.post("/pred/sales", payload);
    return response.data;
  } catch (error) {
    console.error("[에러] : Error posting sales pred data", error);
    throw error;
  }
};
