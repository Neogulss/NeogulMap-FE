import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const LOADING_MESSAGE = "너구리가 딱 맞는 정보를 찾고 있어요 🔎🐾";
const LOADING_MESSAGE_CHARS = Array.from(LOADING_MESSAGE);

function formatText(text) {
  if (!text) return "";
  return text;
}

function TypingLoadingText() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const isComplete = visibleCount >= LOADING_MESSAGE_CHARS.length;
    const timeoutId = window.setTimeout(
      () => setVisibleCount(isComplete ? 0 : visibleCount + 1),
      isComplete ? 900 : 80
    );

    return () => window.clearTimeout(timeoutId);
  }, [visibleCount]);

  return (
    <span className="typing-loading-text" aria-live="polite">
      {LOADING_MESSAGE_CHARS.slice(0, visibleCount).join("")}
      <span className="typing-loading-cursor" aria-hidden="true" />
    </span>
  );
}

export default function ChatbotMessages({
  logs,
  loading,
  pendingUserQuery,
  sending,
  recommendedQuestions = [],
  loadingRecommendations = false,
  onSelectRecommendedQuestion,
  showGuestAnswerLoginButton = false,
  onGuestAnswerLoginClick,
}) {
  const hasRecommendedQuestions = recommendedQuestions.length > 0;

  if (loading) {
    return <div className="chat-placeholder">대화 내역 불러오는 중...</div>;
  }

  if (
    (!logs || logs.length === 0) &&
    !pendingUserQuery &&
    !hasRecommendedQuestions &&
    !loadingRecommendations
  ) {
    return (
      <div className="chat-placeholder">
        아직 대화가 없습니다. 아래 입력창에서 질문을 시작해보세요.
      </div>
    );
  }

  return (
    <>
      {logs.map((log, index) => {
        const isLastLog = index === logs.length - 1;

        return (
          <div key={log.chatLogIdx ?? `${log.userQuery}-${log.createdAt}`}>
            <div className="msg-row user">
              <div className="msg-content">
                <div className="msg-sender">나</div>
                <div className="msg-bubble">{log.userQuery}</div>
              </div>
            </div>

            <div className="msg-row bot">
              <div className="msg-content">
                <div className="bot-profile">
                  <img
                    src="/image.jpg"
                    alt="입지너구리 챗봇"
                    className="chatbot-bot-avatar"
                  />
                  <div className="msg-sender">입지너구리 AI</div>
                </div>
                <div className="msg-bubble markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {formatText(log.botResponse)}
                  </ReactMarkdown>
                </div>

                {(log.model || log.turnLatencyMs) && (
                  <div className="message-meta">
                    {log.model ? `model: ${log.model}` : ""}
                    {log.model && log.turnLatencyMs ? " / " : ""}
                    {log.turnLatencyMs ? `latency: ${log.turnLatencyMs}ms` : ""}
                  </div>
                )}

                {showGuestAnswerLoginButton && isLastLog && (
                  <button
                    type="button"
                    className="guest-login-btn guest-answer-login-btn"
                    onClick={onGuestAnswerLoginClick}
                  >
                    로그인하고 전체 기능 사용하기
                  </button>
                )}

                {log.rag?.retrievedDocuments?.length > 0 && (
                  <div className="chat-rich-card">
                    <div className="crc-header">
                      <div className="crc-title">참고 문서</div>
                      <div className="crc-tag">
                        {log.rag.retrievedDocuments.length}건
                      </div>
                    </div>

                    <div className="crc-grid">
                      {log.rag.retrievedDocuments.map((doc, idx) => (
                        <div className="crc-item" key={idx}>
                          <span className="crc-item-label">출처</span>
                          <span className="crc-item-val">
                            {doc.source || "-"}
                          </span>

                          <span className="crc-item-label">문서 내용</span>
                          <span className="crc-item-val crc-chunk">
                            {doc.chunkText || "-"}
                          </span>

                          <span className="crc-item-label">점수</span>
                          <span className="crc-item-val crc-score">
                            faiss={String(doc.faissScore)} / bm25=
                            {String(doc.bm25Score)} / rerank=
                            {String(doc.rerankScore)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {log.rag.systemLatency && (
                      <div className="message-meta">
                        retrieval: {log.rag.systemLatency.retrievalMs}ms / llm:{" "}
                        {log.rag.systemLatency.llmGenerationMs}ms
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {pendingUserQuery && (
        <div className="msg-row user">
          <div className="msg-content">
            <div className="msg-sender">나</div>
            <div className="msg-bubble">{pendingUserQuery}</div>
          </div>
        </div>
      )}

      {sending && (
        <div className="msg-row bot">
          <div className="msg-content">
            <div className="bot-profile">
              <img
                src="/image.jpg"
                alt="입지너구리 챗봇"
                className="chatbot-bot-avatar"
              />
              <div className="msg-sender">입지너구리 AI</div>
            </div>
            <div className="msg-bubble">
              <TypingLoadingText />
            </div>
          </div>
        </div>
      )}

      {!sending && loadingRecommendations && (
        <div className="msg-row user recommendation-row">
          <div className="msg-content">
            <div className="msg-sender">추천 질문</div>
            <div className="recommendation-loading">
              추천 질문을 불러오는 중...
            </div>
          </div>
        </div>
      )}

      {!sending && !loadingRecommendations && hasRecommendedQuestions && (
        <div className="msg-row user recommendation-row">
          <div className="msg-content">
            <div className="msg-sender">추천 질문</div>
            <div className="recommendation-list">
              {recommendedQuestions.map((item) => (
                <button
                  type="button"
                  key={item.questionIdx ?? item.questionTitle}
                  className="recommendation-btn"
                  onClick={() =>
                    onSelectRecommendedQuestion?.(item.questionTitle)
                  }
                  disabled={sending}
                >
                  {item.questionTitle}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
