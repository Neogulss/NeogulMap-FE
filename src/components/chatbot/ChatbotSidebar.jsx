import { useMemo, useState } from "react";

export default function ChatbotSidebar({
  sessions,
  selectedSessionIdx,
  onSelectSession,
  onNewChat,
  onUpdateTitle,
  onDeleteSession,
  loading,
  collapsed,
  onToggleCollapse,
  readOnly = false,
}) {
  const [editingSessionIdx, setEditingSessionIdx] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const sortedSessions = useMemo(() => {
    return [...sessions];
  }, [sessions]);

  const startEdit = (session) => {
    if (readOnly) return;
    setEditingSessionIdx(session.sessionIdx);
    setEditingTitle(session.title || "");
  };

  const cancelEdit = () => {
    setEditingSessionIdx(null);
    setEditingTitle("");
  };

  const saveEdit = async (sessionIdx) => {
    if (!editingTitle.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    await onUpdateTitle(sessionIdx, editingTitle.trim());
    cancelEdit();
  };

  return (
    <aside className={`chat-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-full">
        <div className="sidebar-top-row">
          <button
            type="button"
            className="icon-btn-transparent"
            onClick={onToggleCollapse}
            title="사이드바 닫기"
          >
            ☰
          </button>

          <button
            type="button"
            className="icon-btn-transparent"
            onClick={onNewChat}
            title="새 채팅"
            disabled={readOnly}
          >
            ＋
          </button>
        </div>

        <div className="sidebar-title">최근 분석 기록</div>

        <div className="history-list">
          {readOnly ? (
            <div className="sidebar-empty">로그인 후 대화 기록을 이용할 수 있습니다.</div>
          ) : loading ? (
            <div className="sidebar-empty">세션 불러오는 중...</div>
          ) : sortedSessions.length === 0 ? (
            <div className="sidebar-empty">세션이 없습니다.</div>
          ) : (
            sortedSessions.map((session) => {
              const isActive = session.sessionIdx === selectedSessionIdx;
              const isEditing = editingSessionIdx === session.sessionIdx;

              return (
                <div
                  key={session.sessionIdx}
                  className={`history-card ${isActive ? "active" : ""}`}
                >
                  <div
                    className="history-item"
                    onClick={() => onSelectSession(session.sessionIdx)}
                  >
                    <div className="history-top-row">
                      {isEditing ? (
                        <input
                          className="history-edit-input"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="세션 제목 입력"
                        />
                      ) : (
                        <div className="history-title">
                          {session.title || "제목 없음"}
                        </div>
                      )}

                      <div className="history-actions">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              className="history-action-btn"
                              onClick={() => saveEdit(session.sessionIdx)}
                            >
                              저장
                            </button>
                            <button
                              type="button"
                              className="history-action-btn"
                              onClick={cancelEdit}
                            >
                              취소
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="history-action-btn"
                              onClick={() => startEdit(session)}
                              aria-label="수정"
                              title="수정"
                            >
                              ✎
                            </button>
                            <button
                              type="button"
                              className="history-action-btn danger"
                              onClick={() => onDeleteSession(session.sessionIdx)}
                              aria-label="삭제"
                              title="삭제"
                            >
                              ×
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="history-date">
                      {session.createdAt || ""}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="sidebar-mini">
        <button
          type="button"
          className="icon-btn-circle"
          onClick={onToggleCollapse}
          title="사이드바 열기"
        >
          ☰
        </button>

        <button
          type="button"
          className="icon-btn-circle"
          onClick={onNewChat}
          title="새 채팅"
          disabled={readOnly}
        >
          ＋
        </button>
      </div>
    </aside>
  );
}
