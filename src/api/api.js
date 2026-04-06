import axios from "axios";

// =====================================================
// Axios 인스턴스
// =====================================================
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// =====================================================
// District API
// =====================================================

/**
 * 추천 상권 리스트 조회
 * @param {string} mainCategoryCode - 대분류 코드 (MC1, MC2, MC3)
 * @param {string} serviceIndustryCodeName - 업종명 (한식음식점 등)
 * @returns {Promise}
 */
export const fetchDistrictRecommendList = (
  mainCategoryCode,
  serviceIndustryCodeName,
) => api.post("/district", { mainCategoryCode, serviceIndustryCodeName });

// =====================================================
// Report API
// =====================================================

/**
 * 점포수, 개업, 폐업, 업종분포, 평균영업기간 조회
 * @param {number} adminDongCode - 행정동 코드
 * @param {string} serviceIndustryCode - 서비스 업종 코드
 * @param {number} yearQuarter - 기준 년분기 코드 (예: 20254)
 * @returns {Promise}
 */
export const fetchStoreReport = (
  adminDongCode,
  serviceIndustryCode,
  yearQuarter,
) =>
  api.post("/report/store", {
    adminDongCode,
    serviceIndustryCode,
    yearQuarter,
  });

/**
 * 유동인구, 성별/연령대/요일/시간대별 조회
 * @param {number} adminDongCode - 행정동 코드
 * @param {number} yearQuarter - 기준 년분기 코드
 * @returns {Promise}
 */
export const fetchFloatingReport = (adminDongCode, yearQuarter) =>
  api.post("/report/floating", { adminDongCode, yearQuarter });

/**
 * 주거인구, 성별/연령대별 조회
 * @param {number} adminDongCode - 행정동 코드
 * @param {number} yearQuarter - 기준 년분기 코드
 * @returns {Promise}
 */
export const fetchResidentReport = (adminDongCode, yearQuarter) =>
  api.post("/report/resident", { adminDongCode, yearQuarter });

/**
 * 가구세대수, 아파트 현황 조회
 * @param {number} adminDongCode - 행정동 코드
 * @param {number} yearQuarter - 기준 년분기 코드
 * @returns {Promise}
 */
export const fetchHouseholdReport = (adminDongCode, yearQuarter) =>
  api.post("/report/household", { adminDongCode, yearQuarter });

/**
 * 집객시설 현황 조회
 * @param {number} adminDongCode - 행정동 코드
 * @param {number} yearQuarter - 기준 년분기 코드
 * @returns {Promise}
 */
export const fetchFacilityReport = (adminDongCode, yearQuarter) =>
  api.post("/report/facility", { adminDongCode, yearQuarter });

/**
 * 소득수준, 소비트렌드 조회
 * @param {number} adminDongCode - 행정동 코드
 * @param {number} yearQuarter - 기준 년분기 코드
 * @returns {Promise}
 */
export const fetchIncomeReport = (adminDongCode, yearQuarter) =>
  api.post("/report/income", { adminDongCode, yearQuarter });

/**
 * 상권변화지표 조회
 * @param {number} adminDongCode - 행정동 코드
 * @param {number} yearQuarter - 기준 년분기 코드
 * @returns {Promise}
 */
export const fetchCommercialReport = (adminDongCode, yearQuarter) =>
  api.post("/report/commercial", { adminDongCode, yearQuarter });
