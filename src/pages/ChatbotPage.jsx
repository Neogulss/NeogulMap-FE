import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getChatSessions,
  getChatLogs,
  sendChatMessage,
  updateChatSessionTitle,
  deleteChatSession,
  getRecommendedQuestions,
  fetchMyProfile,
  askPolicyChatbotAsGuest,
} from "../api/api";
import ChatbotSidebar from "../components/chatbot/ChatbotSidebar";
import ChatbotMessages from "../components/chatbot/ChatbotMessages";
import ChatbotInput from "../components/chatbot/ChatbotInput";
import "../styles/ChatbotPage.css";

function formatAmount(val) {
  const n = Number(val);
  if (!n || isNaN(n)) return `${val}만원`;
  if (n >= 10000) {
    const uk = Math.floor(n / 10000);
    const rest = n % 10000;
    return rest > 0 ? `${uk}억 ${rest.toLocaleString()}만원` : `${uk}억원`;
  }
  return `${n.toLocaleString()}만원`;
}

const GUEST_SERVICE_INTRO_QUESTION = "입지너구리 서비스 소개해줘";
const GUEST_RECOMMENDED_QUESTIONS = [
  { questionIdx: "guest-service-intro", questionTitle: GUEST_SERVICE_INTRO_QUESTION },
];
const REGION_OPTIONS = [
  "금천구",
  "영등포구",
  "구로구",
  "관악구",
  "동작구",
  "서초구",
  "강남구",
  "마포구",
  "용산구",
  "성동구",
  "광진구",
  "중구",
  "종로구",
  "성북구",
  "강북구",
  "도봉구",
  "노원구",
  "은평구",
  "강서구",
  "양천구",
  "중랑구",
  "동대문구",
  "서대문구",
  "강동구",
  "송파구",
];
const STARTUP_STATUS_OPTIONS = [
  "창업 예정",
  "운영 중",
  "재창업 예정",
];

export default function ChatbotPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const analysisContext = location.state?.fromAnalysis ? location.state : null;
  const autoSentRef = useRef(false);

  const isLoggedIn = Boolean(localStorage.getItem("userIdx"));

  const [sessions, setSessions] = useState([]);
  const [selectedSessionIdx, setSelectedSessionIdx] = useState(null);
  const [logs, setLogs] = useState([]);
  const [pendingUserQuery, setPendingUserQuery] = useState("");
  const [recommendedQuestions, setRecommendedQuestions] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [profileIndustry, setProfileIndustry] = useState("");
  const [profileAge, setProfileAge] = useState("");
  const [profileHasBusinessRegistration, setProfileHasBusinessRegistration] = useState("");
  const [profileRegion, setProfileRegion] = useState("");
  const [profileStartupStatus, setProfileStartupStatus] = useState("");
  const [isStartupStatusDropdownOpen, setIsStartupStatusDropdownOpen] = useState(false);
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);

  const messagesContainerRef = useRef(null);
  const prevLogLengthRef = useRef(0);
  const startupStatusDropdownRef = useRef(null);
  const businessDropdownRef = useRef(null);
  const regionDropdownRef = useRef(null);

  const initializeGuestMode = () => {
    setSessions([]);
    setSelectedSessionIdx(null);
    setLogs([]);
    setPendingUserQuery("");
    setErrorMessage("");
    setLoadingSessions(false);
    setLoadingLogs(false);
    setLoadingRecommendations(false);
    setRecommendedQuestions(GUEST_RECOMMENDED_QUESTIONS);
    setIsProfileFormOpen(false);
    setIsStartupStatusDropdownOpen(false);
    setIsBusinessDropdownOpen(false);
    setIsRegionDropdownOpen(false);
  };

  // 초기 로드: 상권분석에서 넘어온 경우 새 채팅 시작 (기존 세션 자동 선택 안 함)
  useEffect(() => {
    window.scrollTo(0, 0);
    if (isLoggedIn) {
      loadSessions({ autoSelect: !analysisContext });
    } else {
      initializeGuestMode();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedSessionIdx]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (logs.length > 0) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: logs.length !== prevLogLengthRef.current ? "smooth" : "auto",
      });
    } else {
      container.scrollTo({ top: 0, behavior: "auto" });
    }
    prevLogLengthRef.current = logs.length;
  }, [logs, sending]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        startupStatusDropdownRef.current &&
        !startupStatusDropdownRef.current.contains(event.target)
      ) {
        setIsStartupStatusDropdownOpen(false);
      }
      if (
        businessDropdownRef.current &&
        !businessDropdownRef.current.contains(event.target)
      ) {
        setIsBusinessDropdownOpen(false);
      }
      if (
        regionDropdownRef.current &&
        !regionDropdownRef.current.contains(event.target)
      ) {
        setIsRegionDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasMessages = useMemo(
    () => (logs && logs.length > 0) || Boolean(pendingUserQuery),
    [logs, pendingUserQuery]
  );

  const showGuestAnswerLoginButton = !isLoggedIn && logs.length > 0;

  // 상권분석 페이지에서 넘어온 경우: 세션 로드 완료 후 새 채팅으로 맞춤 메시지 자동 전송
  useEffect(() => {
    if (!analysisContext || autoSentRef.current || loadingSessions) return;
    autoSentRef.current = true;

    const run = async () => {
      let userAge = "";
      let isRegistered = "";
      const userIdx = localStorage.getItem("userIdx");
      if (userIdx) {
        try {
          const profileRes = await fetchMyProfile(Number(userIdx));
          const p = profileRes?.data?.data ?? profileRes?.data ?? null;
          if (p) {
            userAge = p.userAge ?? p.age ?? "";
            isRegistered = p.isRegisteredBusiness ?? p.hasBusinessRegistration ?? "";
          }
        } catch { /* 프로필 조회 실패 시 생략 */ }
      }

      const floorLabel = analysisContext.floor === -1 ? "지하" : `${analysisContext.floor}층`;
      const diff = analysisContext.diff;
      const diffText =
        diff !== undefined && diff !== null
          ? diff >= 0
            ? `+${formatAmount(diff)} 여유`
            : `${formatAmount(Math.abs(diff))} 부족`
          : "정보 없음";

      const districtLine =
        analysisContext.districtName && analysisContext.adminDongName
          ? `\n자치구·행정동: ${analysisContext.districtName} ${analysisContext.adminDongName}`
          : "";

      const ageLine = userAge ? `\n나이: ${userAge}세` : "";
      const bizLine =
        isRegistered !== ""
          ? `\n사업자등록: ${isRegistered === true || isRegistered === "true" ? "있음" : "없음"}`
          : "";

      const message =
        `안녕하세요! 저는 ${analysisContext.serviceIndustryCodeName} 창업을 준비하고 있어요.` +
        districtLine +
        `\n업종: ${analysisContext.serviceIndustryCodeName} / 층수: ${floorLabel} / 면적: ${analysisContext.area}㎡` +
        ` / 자본금: ${formatAmount(analysisContext.budgetMax)} / 예상 차액: ${diffText}` +
        ageLine +
        bizLine +
        `\n\n이 조건에 맞는 창업 대출이나 정책 자금을 추천해주세요.`;

      handleSendMessage({
        userQuery: message,
        industry: analysisContext.serviceIndustryCodeName,
        age: userAge,
        hasBusinessRegistration: isRegistered !== "" ? String(isRegistered) : "",
        region: analysisContext.districtName || "",
      });
    };

    run();
  }, [loadingSessions]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSessions = async ({ autoSelect = true } = {}) => {
    if (!isLoggedIn) {
      initializeGuestMode();
      return;
    }
    try {
      setLoadingSessions(true);
      setErrorMessage("");
      const data = await getChatSessions();
      setSessions(data);
      if (autoSelect && data.length > 0 && !selectedSessionIdx) {
        const firstSessionIdx = data[0].sessionIdx;
        setSelectedSessionIdx(firstSessionIdx);
        await loadLogs(firstSessionIdx);
      } else if (data.length === 0) {
        await loadRecommendedQuestions(null);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("세션 목록을 불러오지 못했습니다.");
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadLogs = async (sessionIdx) => {
    if (!isLoggedIn) return;
    try {
      setLoadingLogs(true);
      setErrorMessage("");
      const data = await getChatLogs(sessionIdx);
      setLogs(data);
      setSelectedSessionIdx(sessionIdx);
      await loadRecommendedQuestions(sessionIdx);
    } catch (error) {
      console.error(error);
      setErrorMessage("대화 내역을 불러오지 못했습니다.");
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleNewChat = () => {
    if (!isLoggedIn) {
      initializeGuestMode();
      return;
    }
    setSelectedSessionIdx(null);
    setLogs([]);
    setPendingUserQuery("");
    setErrorMessage("");
    setIsProfileFormOpen(false);
    setIsStartupStatusDropdownOpen(false);
    setIsBusinessDropdownOpen(false);
    setIsRegionDropdownOpen(false);
    loadRecommendedQuestions(null);
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = 0;
      }
    });
  };

  const handleSendMessage = async ({
    userQuery,
    industry,
    age,
    hasBusinessRegistration,
    region,
    startupStatus,
  }) => {
    if (!userQuery.trim()) return;
    if (!isLoggedIn) {
      setErrorMessage("로그인 후 전체 챗봇 기능을 이용할 수 있습니다.");
      return;
    }
    try {
      const trimmedQuery = userQuery.trim();
      setIsProfileFormOpen(false);
      setIsStartupStatusDropdownOpen(false);
      setIsBusinessDropdownOpen(false);
      setIsRegionDropdownOpen(false);
      setPendingUserQuery(trimmedQuery);
      setSending(true);
      setErrorMessage("");

      const userProfile = {};
      const resolvedIndustry = industry ?? profileIndustry;
      const resolvedAge = age ?? profileAge;
      const resolvedBusinessRegistration =
        hasBusinessRegistration ?? profileHasBusinessRegistration;
      const resolvedRegion = region ?? profileRegion;
      const resolvedStartupStatus = startupStatus ?? profileStartupStatus;

      if (resolvedIndustry?.trim()) userProfile.industry = resolvedIndustry.trim();
      if (resolvedAge !== "" && resolvedAge !== null && resolvedAge !== undefined) {
        const parsedAge = Number(resolvedAge);
        if (!Number.isNaN(parsedAge) && parsedAge >= 0) {
          userProfile.age = parsedAge;
        }
      }
      if (resolvedBusinessRegistration !== "") {
        userProfile.hasBusinessRegistration =
          resolvedBusinessRegistration === "true";
      }
      if (resolvedRegion?.trim()) userProfile.region = resolvedRegion.trim();
      if (resolvedStartupStatus?.trim()) userProfile.startupStatus = resolvedStartupStatus.trim();

      const payload = {
        sessionIdx: selectedSessionIdx,
        userQuery: trimmedQuery,
        userProfile: Object.keys(userProfile).length > 0 ? userProfile : null,
      };

      const response = await sendChatMessage(payload);
      await loadSessions();
      if (response?.sessionIdx) {
        await loadLogs(response.sessionIdx);
      } else {
        await loadRecommendedQuestions(selectedSessionIdx);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("메시지 전송에 실패했습니다.");
    } finally {
      setPendingUserQuery("");
      setSending(false);
    }
  };

  const handleUpdateTitle = async (sessionIdx, title) => {
    if (!isLoggedIn) return;
    try {
      setErrorMessage("");
      await updateChatSessionTitle(sessionIdx, title);
      await loadSessions();
    } catch (error) {
      console.error(error);
      setErrorMessage("세션 제목 수정에 실패했습니다.");
    }
  };

  const handleDeleteSession = async (sessionIdx) => {
    if (!isLoggedIn) return;
    const ok = window.confirm("이 세션을 삭제하시겠습니까?");
    if (!ok) return;
    try {
      setErrorMessage("");
      await deleteChatSession(sessionIdx);
      if (selectedSessionIdx === sessionIdx) {
        setSelectedSessionIdx(null);
        setLogs([]);
      }
      const updatedSessions = await getChatSessions();
      setSessions(updatedSessions);
      if (updatedSessions.length > 0 && selectedSessionIdx === sessionIdx) {
        const firstSessionIdx = updatedSessions[0].sessionIdx;
        setSelectedSessionIdx(firstSessionIdx);
        await loadLogs(firstSessionIdx);
      } else if (updatedSessions.length === 0) {
        await loadRecommendedQuestions(null);
      }
      window.scrollTo(0, 0);
    } catch (error) {
      console.error(error);
      setErrorMessage("세션 삭제에 실패했습니다.");
    }
  };

  const loadRecommendedQuestions = async (sessionIdx) => {
    if (!isLoggedIn) {
      setRecommendedQuestions(GUEST_RECOMMENDED_QUESTIONS);
      return;
    }
    try {
      setLoadingRecommendations(true);
      const data = await getRecommendedQuestions(sessionIdx);
      setRecommendedQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setRecommendedQuestions([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleSelectRecommendedQuestion = async (questionTitle) => {
    if (!questionTitle || sending) return;

    if (!isLoggedIn) {
      if (questionTitle !== GUEST_SERVICE_INTRO_QUESTION) return;
      setSending(true);
      setPendingUserQuery(questionTitle);
      setErrorMessage("");
      try {
        const response = await askPolicyChatbotAsGuest(questionTitle);
        setLogs([
          {
            chatLogIdx: "guest-service-intro-log",
            userQuery: questionTitle,
            botResponse:
              response?.answer ||
              "서비스 소개 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
            model: response?.model || "guest-preview",
            turnLatencyMs: response?.latency?.turn_latency_ms || 0,
            createdAt: new Date().toISOString(),
          },
        ]);
        setRecommendedQuestions([]);
      } catch (error) {
        console.error(error);
        setErrorMessage("서비스 소개 답변을 불러오지 못했습니다.");
      } finally {
        setPendingUserQuery("");
        setSending(false);
      }
      return;
    }

    await handleSendMessage({
      userQuery: questionTitle,
      industry: "",
      age: "",
      hasBusinessRegistration: "",
      region: "",
      startupStatus: "",
    });
  };

  return (
    <div className="chatbot-shell">
      <div className="chat-page">
        <div className="hero-grid" />
        <div className="hero-glow" />
        <div className="hero-glow2" />

        <div className="chat-container">
          <ChatbotSidebar
            sessions={sessions}
            selectedSessionIdx={selectedSessionIdx}
            onSelectSession={loadLogs}
            onNewChat={handleNewChat}
            onUpdateTitle={handleUpdateTitle}
            onDeleteSession={handleDeleteSession}
            loading={loadingSessions}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
            readOnly={!isLoggedIn}
          />

          <main className="chat-main">
            <div className="chat-top-area">
              {!hasMessages && !loadingLogs && (
                <section className="welcome-banner">
                  <h2>창업 정책과 대출 정보를 빠르게 찾아보세요</h2>
                  <p>
                    {isLoggedIn
                      ? "업종, 나이, 사업자등록 여부, 지역, 창업 상태를 입력하면 더 정확한 답변을 받을 수 있어요."
                      : "로그인시 더 자세한 내용을 질문할 수 있습니다."}
                  </p>
                  {!isLoggedIn && (
                    <button
                      type="button"
                      className="guest-login-btn"
                      onClick={() => navigate("/auth/signin")}
                    >
                      로그인하고 전체 기능 사용하기
                    </button>
                  )}
                </section>
              )}

              {isLoggedIn && isProfileFormOpen && (
                <section className="chat-profile-panel">
                  <div className="chat-profile-panel-inner">
                    <div className="survey-box">
                      <div className="survey-item">
                        <label>관심 업종</label>
                        <input
                          type="text"
                          placeholder="예: 외식업, 카페, 뷰티"
                          value={profileIndustry}
                          onChange={(e) => setProfileIndustry(e.target.value)}
                        />
                      </div>

                      <div className="survey-item">
                        <label>나이</label>
                        <input
                          type="number"
                          placeholder="예: 29"
                          min="0"
                          value={profileAge}
                          onChange={(e) => {
                            const next = e.target.value;
                            if (next === "") {
                              setProfileAge("");
                              return;
                            }
                            const parsed = Number(next);
                            if (!Number.isNaN(parsed) && parsed >= 0) {
                              setProfileAge(next);
                            }
                          }}
                        />
                      </div>

                      <div className="survey-item">
                        <label>창업 상태</label>
                        <div className="region-dropdown" ref={startupStatusDropdownRef}>
                          <button
                            type="button"
                            className={`region-dropdown-trigger ${isStartupStatusDropdownOpen ? "open" : ""}`}
                            onClick={() => setIsStartupStatusDropdownOpen((prev) => !prev)}
                          >
                            <span>{profileStartupStatus || "선택"}</span>
                            <span className="region-dropdown-arrow">
                              {isStartupStatusDropdownOpen ? "▴" : "▾"}
                            </span>
                          </button>

                          {isStartupStatusDropdownOpen && (
                            <div className="region-dropdown-menu">
                              <button
                                type="button"
                                className={`region-dropdown-item ${profileStartupStatus === "" ? "selected" : ""}`}
                                onClick={() => {
                                  setProfileStartupStatus("");
                                  setIsStartupStatusDropdownOpen(false);
                                }}
                              >
                                선택
                              </button>
                              {STARTUP_STATUS_OPTIONS.map((status) => (
                                <button
                                  key={status}
                                  type="button"
                                  className={`region-dropdown-item ${profileStartupStatus === status ? "selected" : ""}`}
                                  onClick={() => {
                                    setProfileStartupStatus(status);
                                    setIsStartupStatusDropdownOpen(false);
                                  }}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="survey-item">
                        <label>사업자등록 여부</label>
                        <div className="region-dropdown" ref={businessDropdownRef}>
                          <button
                            type="button"
                            className={`region-dropdown-trigger ${isBusinessDropdownOpen ? "open" : ""}`}
                            onClick={() => setIsBusinessDropdownOpen((prev) => !prev)}
                          >
                            <span>
                              {profileHasBusinessRegistration === "true"
                                ? "있음"
                                : profileHasBusinessRegistration === "false"
                                  ? "없음"
                                  : "선택"}
                            </span>
                            <span className="region-dropdown-arrow">
                              {isBusinessDropdownOpen ? "▴" : "▾"}
                            </span>
                          </button>

                          {isBusinessDropdownOpen && (
                            <div className="region-dropdown-menu">
                              <button
                                type="button"
                                className={`region-dropdown-item ${profileHasBusinessRegistration === "" ? "selected" : ""}`}
                                onClick={() => {
                                  setProfileHasBusinessRegistration("");
                                  setIsBusinessDropdownOpen(false);
                                }}
                              >
                                선택
                              </button>
                              <button
                                type="button"
                                className={`region-dropdown-item ${profileHasBusinessRegistration === "true" ? "selected" : ""}`}
                                onClick={() => {
                                  setProfileHasBusinessRegistration("true");
                                  setIsBusinessDropdownOpen(false);
                                }}
                              >
                                있음
                              </button>
                              <button
                                type="button"
                                className={`region-dropdown-item ${profileHasBusinessRegistration === "false" ? "selected" : ""}`}
                                onClick={() => {
                                  setProfileHasBusinessRegistration("false");
                                  setIsBusinessDropdownOpen(false);
                                }}
                              >
                                없음
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="survey-item">
                        <label>지역</label>
                        <div className="region-dropdown" ref={regionDropdownRef}>
                          <button
                            type="button"
                            className={`region-dropdown-trigger ${isRegionDropdownOpen ? "open" : ""}`}
                            onClick={() => setIsRegionDropdownOpen((prev) => !prev)}
                          >
                            <span>{profileRegion || "지역 선택"}</span>
                            <span className="region-dropdown-arrow">
                              {isRegionDropdownOpen ? "▴" : "▾"}
                            </span>
                          </button>

                          {isRegionDropdownOpen && (
                            <div className="region-dropdown-menu">
                              <button
                                type="button"
                                className={`region-dropdown-item ${profileRegion === "" ? "selected" : ""}`}
                                onClick={() => {
                                  setProfileRegion("");
                                  setIsRegionDropdownOpen(false);
                                }}
                              >
                                선택
                              </button>
                              {REGION_OPTIONS.map((region) => (
                                <button
                                  key={region}
                                  type="button"
                                  className={`region-dropdown-item ${profileRegion === region ? "selected" : ""}`}
                                  onClick={() => {
                                    setProfileRegion(region);
                                    setIsRegionDropdownOpen(false);
                                  }}
                                >
                                  {region}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            <div className="chat-messages" ref={messagesContainerRef}>
              {errorMessage && <div className="error-box">{errorMessage}</div>}

              <ChatbotMessages
                logs={logs}
                loading={loadingLogs}
                pendingUserQuery={pendingUserQuery}
                sending={sending}
                recommendedQuestions={recommendedQuestions}
                loadingRecommendations={loadingRecommendations}
                onSelectRecommendedQuestion={handleSelectRecommendedQuestion}
                showGuestAnswerLoginButton={showGuestAnswerLoginButton}
                onGuestAnswerLoginClick={() => navigate("/auth/signin")}
              />
            </div>

            <div className="chat-input-area">
              <div className="chat-bottom-container">
                <ChatbotInput
                  onSend={handleSendMessage}
                  sending={sending}
                  disabled={!isLoggedIn}
                  isProfileFormOpen={isProfileFormOpen}
                  onToggleProfileForm={() => setIsProfileFormOpen((prev) => !prev)}
                  showProfileHint={isLoggedIn && !hasMessages}
                />
                <div className="input-footer">
                  {isLoggedIn
                    ? "입지너구리는 정책·대출 정보를 바탕으로 답변하며, 실제 신청 전 세부 자격 조건을 꼭 확인해 주세요."
                    : "비로그인 상태에서는 서비스 소개 질문만 이용할 수 있어요. 로그인하면 전체 기능을 사용할 수 있습니다."}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
