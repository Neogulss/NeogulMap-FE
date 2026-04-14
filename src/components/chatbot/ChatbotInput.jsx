import { useEffect, useRef, useState } from "react";

export default function ChatbotInput({
  onSend,
  sending,
  disabled = false,
  isProfileFormOpen = false,
  onToggleProfileForm,
  showProfileHint = false,
}) {
  const [userQuery, setUserQuery] = useState("");
  const [isHintDismissed, setIsHintDismissed] = useState(false);
  const isInputLocked = disabled || sending;

  const textareaRef = useRef(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "24px";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [userQuery]);

  const handleSend = async () => {
    const trimmedQuery = userQuery.trim();
    if (isInputLocked || !trimmedQuery) return;

    setUserQuery("");
    await onSend({
      userQuery: trimmedQuery,
    });
  };

  const handleKeyDown = async (e) => {
    if (isInputLocked) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSend();
    }
  };

  const showHintBubble =
    showProfileHint && !isHintDismissed && !isProfileFormOpen && !isInputLocked;

  return (
    <div className="chat-input-wrapper-container">
      <div className={`chat-input-wrapper ${isInputLocked ? "disabled" : ""}`}>
        <div className="plus-btn-wrap">
          {showHintBubble && (
            <div className="profile-hint-bubble">
              조건 입력창에서 정보를 입력하면 더 정확한 답변을 받을 수 있어요.
            </div>
          )}

          <button
            type="button"
            className="btn-attach btn-plus"
          title={
            disabled
              ? "로그인 후 사용할 수 있습니다."
              : sending
                ? "답변 생성 중에는 변경할 수 없습니다."
              : isProfileFormOpen
                ? "조건 입력창 닫기"
                : "조건 입력창 열기"
          }
          onClick={() => {
            if (isInputLocked) return;
            setIsHintDismissed(true);
            onToggleProfileForm?.();
          }}
          disabled={isInputLocked}
        >
          {isProfileFormOpen ? "-" : "+"}
        </button>
        </div>

        <textarea
          ref={textareaRef}
          className="input-field"
          placeholder={
            disabled
              ? "로그인 후 질문을 입력할 수 있어요."
              : sending
                ? "답변 생성 중에는 입력할 수 없어요."
              : "입지너구리에게 정책 정보나 궁금한 창업 대출을 질문해 보세요."
          }
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isInputLocked}
        />

        <button
          type="button"
          className="btn-send"
          onClick={handleSend}
          disabled={isInputLocked}
          title={disabled ? "로그인 후 전송할 수 있습니다." : "전송"}
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
    </div>
  );
}
