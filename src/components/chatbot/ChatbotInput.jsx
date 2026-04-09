import { useEffect, useRef, useState } from "react";

export default function ChatbotInput({
  onSend,
  sending,
  showProfileForm = false,
}) {
  const [userQuery, setUserQuery] = useState("");
  const [industry, setIndustry] = useState("");
  const [age, setAge] = useState("");
  const [hasBusinessRegistration, setHasBusinessRegistration] = useState("");

  const textareaRef = useRef(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "24px";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [userQuery]);

  const handleSend = async () => {
    if (!userQuery.trim() || sending) return;

    await onSend({
      userQuery,
      industry,
      age,
      hasBusinessRegistration,
    });

    setUserQuery("");
  };

  const handleKeyDown = async (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSend();
    }
  };

  return (
    <>
      {showProfileForm && (
        <div className="survey-box">
          <div className="survey-item">
            <label>업종</label>
            <input
              type="text"
              placeholder="예: 외식업, 카페, 뷰티"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>

          <div className="survey-item">
            <label>나이</label>
            <input
              type="number"
              placeholder="예: 29"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          <div className="survey-item">
            <label>사업자등록 여부</label>
            <select
              value={hasBusinessRegistration}
              onChange={(e) => setHasBusinessRegistration(e.target.value)}
            >
              <option value="">선택</option>
              <option value="true">있음</option>
              <option value="false">없음</option>
            </select>
          </div>
        </div>
      )}

      <div className="chat-input-wrapper">
        <button
          type="button"
          className="btn-attach"
          title="첨부 기능 준비 중"
          onClick={() => window.alert("첨부 기능은 아직 연결되지 않았습니다.")}
        >
          <svg viewBox="0 0 24 24">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          className="input-field"
          placeholder="입지너구리에게 정책 정보나 궁금한 창업 대출을 질문해 보세요."
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />

        <button
          type="button"
          className="btn-send"
          onClick={handleSend}
          disabled={sending}
          title="전송"
        >
          {sending ? (
            "..."
          ) : (
            <svg viewBox="0 0 24 24">
              <path d="M3.4 20.4l17.45-8.4c.8-.38.8-1.52 0-1.9L3.4 1.7c-.66-.32-1.4.24-1.28.96l1.1 6.82c.06.35.34.62.69.67l9.1 1.27-9.1 1.27a.82.82 0 0 0-.69.67l-1.1 6.82c-.12.72.62 1.28 1.28.96z" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}