import indexApi from "./indexApi";

export const postRiskData = async (payload) => {
  try {
    const response = await indexApi.post("/pred/risk", payload);
    return response.data;
  } catch (error) {
    console.error("Error posting risk data:", error);
    throw error;
  }
}