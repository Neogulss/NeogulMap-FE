import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
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

export default function ChatbotPage() {

  const navigate = useNavigate();
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

  const isLoggedIn = Boolean(localStorage.getItem("userIdx"));

  const messagesContainerRef = useRef(null);
  const prevLogLengthRef = useRef(0);

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
  };

    const location = useLocation();
    const analysisContext = location.state?.fromAnalysis ? location.state : null;
    const autoSentRef = useRef(false);

    const GUEST_SERVICE_INTRO_QUESTION = "입지너구리 서비스 소개해줘";
    const GUEST_RECOMMENDED_QUESTIONS = [
  {
    questionIdx: "guest-service-intro",
    questionTitle: GUEST_SERVICE_INTRO_QUESTION,
  },
];

  useEffect(() => {
    window.scrollTo(0, 0);
    // 상권분석에서 넘어온 경우 새 채팅으로 시작 → 기존 세션 자동 선택 안 함
    loadSessions({ autoSelect: !analysisContext });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (isLoggedIn) {
      loadSessions();
    } else {
      initializeGuestMode();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedSessionIdx]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (logs.length > 0) {
      const hasNewMessage = logs.length !== prevLogLengthRef.current;

      container.scrollTo({
        top: container.scrollHeight,
        behavior: hasNewMessage ? "smooth" : "auto",
      });
    } else {
      container.scrollTo({
        top: 0,
        behavior: "auto",
      });
    }

    prevLogLengthRef.current = logs.length;
  }, [logs, sending]);

  const hasMessages = useMemo(
    () => (logs && logs.length > 0) || Boolean(pendingUserQuery),
    [logs, pendingUserQuery]
  );

  // 상권분석 페이지에서 넘어온 경우: 세션 로드 완료 후 새 채팅으로 맞춤 메시지 자동 전송
  useEffect(() => {
    if (!analysisContext || autoSentRef.current || loadingSessions) return;
    autoSentRef.current = true;

    const run = async () => {
      // 사용자 프로필 조회 (나이·사업자등록여부)
      let userAge = '';
      let isRegistered = '';
      const userIdx = localStorage.getItem('userIdx');
      if (userIdx) {
        try {
          const profileRes = await fetchMyProfile(Number(userIdx));
          const p = profileRes?.data?.data ?? profileRes?.data ?? null;
          if (p) {
            userAge = p.userAge ?? p.age ?? '';
            isRegistered = p.isRegisteredBusiness ?? p.hasBusinessRegistration ?? '';
          }
        } catch { /* 프로필 조회 실패 시 생략 */ }
      }

      const floorLabel = analysisContext.floor === -1 ? '지하' : `${analysisContext.floor}층`;
      const diff = analysisContext.diff;
      const diffText =
        diff !== undefined && diff !== null
          ? diff >= 0
            ? `+${formatAmount(diff)} 여유`
            : `${formatAmount(Math.abs(diff))} 부족`
          : '정보 없음';

      const districtLine =
        analysisContext.districtName && analysisContext.adminDongName
          ? `\n자치구·행정동: ${analysisContext.districtName} ${analysisContext.adminDongName}`
          : '';

      const ageLine = userAge ? `\n나이: ${userAge}세` : '';
      const bizLine =
        isRegistered !== ''
          ? `\n사업자등록: ${isRegistered === true || isRegistered === 'true' ? '있음' : '없음'}`
          : '';

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
        hasBusinessRegistration: isRegistered !== '' ? String(isRegistered) : '',
      });
    };

    run();
  }, [loadingSessions]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSessions = async ({ autoSelect = true } = {}) => {
  const showGuestAnswerLoginButton = !isLoggedIn && logs.length > 0;

  const loadSessions = async () => {
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
  }) => {
    if (!userQuery.trim()) return;

    if (!isLoggedIn) {
      setErrorMessage("로그인 후 전체 챗봇 기능을 이용할 수 있습니다.");
      return;
    }

    try {
      const trimmedQuery = userQuery.trim();
      setPendingUserQuery(trimmedQuery);
      setSending(true);
      setErrorMessage("");

      const userProfile = {};
      if (industry?.trim()) userProfile.industry = industry.trim();
      if (age !== "" && age !== null && age !== undefined) {
        userProfile.age = Number(age);
      }
      if (hasBusinessRegistration !== "") {
        userProfile.hasBusinessRegistration =
          hasBusinessRegistration === "true";
      }

      const payload = {
        sessionIdx: selectedSessionIdx,
        userQuery: trimmedQuery,
        userProfile:
          Object.keys(userProfile).length > 0 ? userProfile : null,
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

        // 비로그인에서는 서비스 소개 1회 답변 후 추천 질문 비노출
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
            <div className="chat-messages" ref={messagesContainerRef}>
              {!hasMessages && !loadingLogs && (
                <section className="welcome-banner">
                  <h2>창업 정책과 대출 정보를 빠르게 찾아보세요</h2>
                  <p>
                    {isLoggedIn
                      ? "업종, 나이, 사업자등록 여부를 입력하면 더 정확한 답변을 받을 수 있어요."
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
                  showProfileForm={isLoggedIn && !hasMessages}
                  disabled={!isLoggedIn}
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
