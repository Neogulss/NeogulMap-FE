import axios from "axios";

// =====================================================
// Axios 인스턴스
// =====================================================
const baseURL = import.meta.env.DEV ? import.meta.env.VITE_API_URL : "/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =====================================================
// Category API
// =====================================================

/**
 * 대분류 코드에 해당하는 업종 목록 조회
 * @param {string} mainCategoryCode - 대분류 코드 (MC1: 외식업, MC2: 서비스업, MC3: 소매업)
 * @returns {Promise}
 */
export const fetchCategoryList = (mainCategoryCode) =>
  api.post("/category/list", { mainCategoryCode });

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
// FastAPI AI 추천 API
// =====================================================
const aiApi = axios.create({
  baseURL: "http://localhost:8001",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * AI 맞춤 상권 추천
 * @param {string} serviceType - 서울시 업종명 (예: 한식음식점)
 * @param {number} floor - 층수
 * @param {number} area - 면적 (㎡)
 * @param {number} budget - 초기자본금 (만원)
 * @param {number} topN - 추천 개수 (기본값 10)
 * @returns {Promise}
 */
export const fetchAIRecommend = (serviceType, floor, area, budget, topN = 10) =>
  aiApi.post("/recommend", {
    service_type: serviceType,
    floor: Number(floor),
    area: Number(area),
    budget: Number(budget),
    top_n: topN,
  });

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

// =====================================================
// Auth API
// =====================================================

/** 로그인 - 성공 시 세션 저장 + UserResponse 반환 */
export const loginUser = (userId, userPwd) =>
  api.post("/user/login", { userId, userPwd }, { withCredentials: true });

/** 회원가입 */
export const signUpUser = (
  userId,
  userPwd,
  userNickname,
  userAge,
  isRegisteredBusiness,
) =>
  api.post("/user/sign-up", {
    userId,
    userPwd,
    userNickname,
    userAge,
    isRegisteredBusiness,
  });

/** 로그아웃 */
export const logoutUser = () =>
  api.post("/user/logout", {}, { withCredentials: true });

/** 세션 유저 조회 (로그인 상태 확인) */
export const getSessionUser = () =>
  api.post("/user/session", {}, { withCredentials: true });

// =====================================================
// Community API
// =====================================================

/** 게시글 목록 조회 - sortType: "LATEST" | "VIEWS" | "LIKES" */
export const fetchPostList = (
  page = 1,
  size = 10,
  sortType = "LATEST",
  keyword = null,
) =>
  api.post("/community/list", {
    page,
    size,
    sortType,
    keyword,
    offset: (page - 1) * size,
  });

/** 게시글 상세 조회 */
export const fetchPostDetail = (postIdx) =>
  api.post("/community/detail", { postIdx });

/** 게시글 작성 */
export const createPost = (userIdx, title, contents, attachment = null) =>
  api.post("/community/write", { userIdx, title, contents, attachment });

/** 게시글 수정 */
export const updatePost = (
  postIdx,
  userIdx,
  title,
  contents,
  attachment = null,
) =>
  api.post("/community/update", {
    postIdx,
    userIdx,
    title,
    contents,
    attachment,
  });

/** 게시글 삭제 */
export const deletePost = (postIdx, userIdx) =>
  api.post("/community/delete", { postIdx, userIdx });

/** 이번 주 HOT 게시글 */
export const fetchHotPostList = () => api.post("/community/hot");

/** 댓글 작성 */
export const createComment = (postIdx, userIdx, contents) =>
  api.post("/community/comment/write", { postIdx, userIdx, contents });

/** 댓글 수정 */
export const updateComment = (commentIdx, userIdx, contents) =>
  api.post("/community/comment/update", { commentIdx, userIdx, contents });

/** 댓글 삭제 */
export const deleteComment = (commentIdx, userIdx) =>
  api.post("/community/comment/delete", { commentIdx, userIdx });

// =====================================================
// Notice API
// =====================================================

/** 공지사항 목록 조회 */
export const fetchNoticeList = (page = 1, size = 10, keyword = "") =>
  api.post("/notice/list", { page, size, keyword });

/** 공지사항 상세 조회 */
export const fetchNoticeDetail = (noticeIdx) =>
  api.post("/notice/detail", { noticeIdx });

/** 공지사항 작성 (어드민) */
export const createNotice = (title, contents, isFixed = "N") =>
  api.post(
    "/notice/write",
    { title, contents, isFixed },
    { withCredentials: true },
  );

/** 공지사항 수정 (어드민) */
export const updateNotice = (noticeIdx, title, contents, isFixed = "N") =>
  api.post(
    "/notice/update",
    { noticeIdx, title, contents, isFixed },
    { withCredentials: true },
  );

/** 공지사항 삭제 (어드민) */
export const deleteNotice = (noticeIdx) =>
  api.post("/notice/delete", { noticeIdx }, { withCredentials: true });

// =====================================================
// Mypage API
// =====================================================

/** 프로필 조회 */
export const fetchMyProfile = (userIdx) =>
  api.post("/mypage/profile", { userIdx }, { withCredentials: true });

/** 프로필 수정 (닉네임, 나이, 사업자등록여부, 비밀번호 변경) */
export const updateMyProfile = (
  userIdx,
  userNickname,
  userAge,
  isRegisteredBusiness,
  currentPwd = null,
  newPwd = null,
) =>
  api.post(
    "/mypage/profile/update",
    {
      userIdx,
      userNickname,
      userAge,
      isRegisteredBusiness,
      currentPwd,
      newPwd,
    },
    { withCredentials: true },
  );

/** 내가 쓴 글 목록 조회 */
export const fetchMyPostList = (userIdx, page = 1, size = 10) =>
  api.post(
    "/mypage/posts",
    { userIdx, page, size, offset: (page - 1) * size },
    { withCredentials: true },
  );

/** 내가 쓴 댓글 목록 조회 */
export const fetchMyCommentList = (userIdx, page = 1, size = 10) =>
  api.post(
    "/mypage/comments",
    { userIdx, page, size, offset: (page - 1) * size },
    { withCredentials: true },
  );

/** 회원 탈퇴 (비밀번호 확인 후 탈퇴) */
export const withdrawUser = (userIdx, userPwd) =>
  api.post("/mypage/withdraw", { userIdx, userPwd }, { withCredentials: true });

/** 즐겨찾기 목록 조회 (마이페이지 경로) */
export const fetchMyFavoriteList = (userIdx) =>
  api.post("/mypage/favorites", { userIdx }, { withCredentials: true });

// =====================================================
// Favorite API
// =====================================================

/** 즐겨찾기 추가 */
export const addFavorite = (
  userIdx,
  adminDongCode,
  initialCapital,
  serviceCategoryName,
) =>
  api.post(
    "/favorite/add",
    { userIdx, adminDongCode, initialCapital, serviceCategoryName },
    { withCredentials: true },
  );

/** 즐겨찾기 삭제 */
export const deleteFavorite = (favoriteIdx, userIdx) =>
  api.post(
    "/favorite/delete",
    { favoriteIdx, userIdx },
    { withCredentials: true },
  );

// =====================================================
// Chatbot API
// =====================================================
export const getChatSessions = async () => {
  const response = await axios.get("/api/chatbot/sessions", {
    withCredentials: true,
  });
  return response.data;
};

export const getChatLogs = async (sessionIdx) => {
  const response = await axios.get(`/api/chatbot/sessions/${sessionIdx}/logs`, {
    withCredentials: true,
  });
  return response.data;
};

export const sendChatMessage = async (payload) => {
  const response = await axios.post("/api/chatbot/send", payload, {
    withCredentials: true,
  });
  return response.data;
};

export const updateChatSessionTitle = async (sessionIdx, title) => {
  const response = await axios.patch(
    `/api/chatbot/sessions/${sessionIdx}/title`,
    { title },
    { withCredentials: true },
  );
  return response.data;
};

export const deleteChatSession = async (sessionIdx) => {
  const response = await axios.delete(`/api/chatbot/sessions/${sessionIdx}`, {
    withCredentials: true,
  });
  return response.data;
};

export const getRecommendedQuestions = async (sessionIdx = null) => {
  const response = await axios.get("/api/chatbot/recommended-questions", {
    params: sessionIdx ? { sessionIdx } : undefined,
    withCredentials: true,
  });
  return response.data;
};

// 비로그인 전용: 서비스 소개 질문은 AI 서버를 직접 호출
const policyChatbotGuestApi = axios.create({
  baseURL: import.meta.env.VITE_POLICY_CHATBOT_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const askPolicyChatbotAsGuest = async (userQuery) => {
  const response = await policyChatbotGuestApi.post("/api/policy-chatbot/ask", {
    user_query: userQuery,
    user_profile: null,
    session_idx: null,
  });
  return response.data;
};
