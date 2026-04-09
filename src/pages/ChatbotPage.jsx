import { useEffect, useState } from "react";
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

export default function ChatbotPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionIdx, setSelectedSessionIdx] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
  };

  const handleSendMessage = async ({ userQuery, industry, age, hasBusinessRegistration }) => {
    if (!userQuery.trim()) return;

    try {
      setSending(true);
      setErrorMessage("");

      const userProfile = {};
      if (industry?.trim()) userProfile.industry = industry.trim();
      if (age !== "" && age !== null && age !== undefined) userProfile.age = Number(age);
      if (hasBusinessRegistration !== "") {
        userProfile.hasBusinessRegistration = hasBusinessRegistration === "true";
      }

      const payload = {
        sessionIdx: selectedSessionIdx,
        userQuery: userQuery.trim(),
        userProfile: Object.keys(userProfile).length > 0 ? userProfile : null,
      };

      const response = await sendChatMessage(payload);

      await loadSessions();

      if (response.sessionIdx) {
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
    } catch (error) {
      console.error(error);
      setErrorMessage("세션 삭제에 실패했습니다.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <ChatbotSidebar
          sessions={sessions}
          selectedSessionIdx={selectedSessionIdx}
          onSelectSession={loadLogs}
          onNewChat={handleNewChat}
          onUpdateTitle={handleUpdateTitle}
          onDeleteSession={handleDeleteSession}
          loading={loadingSessions}
        />
      </div>

      <div style={styles.right}>
        <div style={styles.chatArea}>
          {errorMessage && <div style={styles.errorBox}>{errorMessage}</div>}

          <ChatbotMessages logs={logs} loading={loadingLogs} />
        </div>

        <div style={styles.inputArea}>
          <ChatbotInput onSend={handleSendMessage} sending={sending} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    width: "100%",
    minHeight: "calc(100vh - 80px)",
    backgroundColor: "#f8f9fb",
  },
  left: {
    width: "320px",
    borderRight: "1px solid #ddd",
    backgroundColor: "#fff",
  },
  right: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  chatArea: {
    flex: 1,
    padding: "16px",
    overflowY: "auto",
  },
  inputArea: {
    borderTop: "1px solid #ddd",
    backgroundColor: "#fff",
    padding: "12px",
  },
  errorBox: {
    marginBottom: "12px",
    padding: "10px",
    border: "1px solid #f1b0b7",
    backgroundColor: "#fdecef",
    color: "#842029",
    borderRadius: "6px",
  },
};
