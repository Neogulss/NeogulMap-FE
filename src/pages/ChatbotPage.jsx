import { useEffect, useMemo, useRef, useState } from "react";
import {
  getChatSessions,
  getChatLogs,
  sendChatMessage,
  updateChatSessionTitle,
  deleteChatSession,
} from "../api/api";
import ChatbotSidebar from "../components/chatbot/ChatbotSidebar";
import ChatbotMessages from "../components/chatbot/ChatbotMessages";
import ChatbotInput from "../components/chatbot/ChatbotInput";
import "../styles/ChatbotPage.css";

export default function ChatbotPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionIdx, setSelectedSessionIdx] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const messagesContainerRef = useRef(null);
  const prevLogLengthRef = useRef(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadSessions();
  }, []);

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

  const hasMessages = useMemo(() => logs && logs.length > 0, [logs]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      setErrorMessage("");

      const data = await getChatSessions();
      setSessions(data);

      if (data.length > 0 && !selectedSessionIdx) {
        const firstSessionIdx = data[0].sessionIdx;
        setSelectedSessionIdx(firstSessionIdx);
        await loadLogs(firstSessionIdx);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("세션 목록을 불러오지 못했습니다.");
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadLogs = async (sessionIdx) => {
    try {
      setLoadingLogs(true);
      setErrorMessage("");

      const data = await getChatLogs(sessionIdx);
      setLogs(data);
      setSelectedSessionIdx(sessionIdx);
    } catch (error) {
      console.error(error);
      setErrorMessage("대화 내역을 불러오지 못했습니다.");
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleNewChat = () => {
    setSelectedSessionIdx(null);
    setLogs([]);
    setErrorMessage("");

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

    try {
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
        userQuery: userQuery.trim(),
        userProfile:
          Object.keys(userProfile).length > 0 ? userProfile : null,
      };

      const response = await sendChatMessage(payload);

      await loadSessions();

      if (response?.sessionIdx) {
        await loadLogs(response.sessionIdx);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("메시지 전송에 실패했습니다.");
    } finally {
      setSending(false);
    }
  };

  const handleUpdateTitle = async (sessionIdx, title) => {
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
      }

      window.scrollTo(0, 0);
    } catch (error) {
      console.error(error);
      setErrorMessage("세션 삭제에 실패했습니다.");
    }
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
          />

          <main className="chat-main">
            <div className="chat-messages" ref={messagesContainerRef}>
              {!hasMessages && !loadingLogs && (
                <section className="welcome-banner">
                  <h2>창업 정책과 대출 정보를 빠르게 찾아보세요</h2>
                  <p>
                    업종, 나이, 사업자등록 여부를 입력하면 더 정확한 답변을
                    받을 수 있어요.
                  </p>
                </section>
              )}

              {errorMessage && <div className="error-box">{errorMessage}</div>}

              <ChatbotMessages logs={logs} loading={loadingLogs} />

              {sending && (
                <div className="msg-row bot">
                  <div className="msg-content">
                    <div className="msg-sender">입지너구리 AI</div>
                    <div className="msg-bubble">
                      답변을 생성하고 있습니다...
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="chat-input-area">
              <div className="chat-bottom-container">
                <ChatbotInput
                  onSend={handleSendMessage}
                  sending={sending}
                  showProfileForm={!hasMessages}
                />
                <div className="input-footer">
                  입지너구리는 정책·대출 정보를 바탕으로 답변하며, 실제 신청 전
                  세부 자격 조건을 꼭 확인해 주세요.
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}