import { useState } from "react";

export default function ChatbotSidebar({
  sessions,
  selectedSessionIdx,
  onSelectSession,
  onNewChat,
  onUpdateTitle,
  onDeleteSession,
  loading,
}) {
  const [editingSessionIdx, setEditingSessionIdx] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const startEdit = (session) => {
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
    <div style={styles.wrapper}>
      <button style={styles.newButton} onClick={onNewChat}>
        + 새 채팅
      </button>

      <div style={styles.list}>
        {loading ? (
          <div style={styles.empty}>세션 불러오는 중...</div>
        ) : sessions.length === 0 ? (
          <div style={styles.empty}>세션이 없습니다.</div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.sessionIdx}
              style={{
                ...styles.item,
                backgroundColor:
                  session.sessionIdx === selectedSessionIdx ? "#eef3ff" : "#fff",
              }}
            >
              <div
                style={styles.itemMain}
                onClick={() => onSelectSession(session.sessionIdx)}
              >
                {editingSessionIdx === session.sessionIdx ? (
                  <input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    style={styles.input}
                  />
                ) : (
                  <div style={styles.title}>{session.title || "제목 없음"}</div>
                )}

                <div style={styles.date}>{session.createdAt || ""}</div>
              </div>

              <div style={styles.actions}>
                {editingSessionIdx === session.sessionIdx ? (
                  <>
                    <button style={styles.smallButton} onClick={() => saveEdit(session.sessionIdx)}>
                      저장
                    </button>
                    <button style={styles.smallButton} onClick={cancelEdit}>
                      취소
                    </button>
                  </>
                ) : (
                  <>
                    <button style={styles.smallButton} onClick={() => startEdit(session)}>
                      수정
                    </button>
                    <button
                      style={styles.deleteButton}
                      onClick={() => onDeleteSession(session.sessionIdx)}
                    >
                      삭제
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    height: "100%",
    padding: "12px",
    boxSizing: "border-box",
  },
  newButton: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    border: "1px solid #bbb",
    borderRadius: "6px",
    backgroundColor: "#fff",
    cursor: "pointer",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  item: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "10px",
  },
  itemMain: {
    cursor: "pointer",
    marginBottom: "8px",
  },
  title: {
    fontWeight: "bold",
    marginBottom: "4px",
  },
  date: {
    fontSize: "12px",
    color: "#666",
  },
  actions: {
    display: "flex",
    gap: "6px",
  },
  input: {
    width: "100%",
    padding: "6px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box",
  },
  smallButton: {
    padding: "6px 8px",
    border: "1px solid #aaa",
    borderRadius: "4px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "12px",
  },
  deleteButton: {
    padding: "6px 8px",
    border: "1px solid #dc3545",
    borderRadius: "4px",
    backgroundColor: "#fff",
    color: "#dc3545",
    cursor: "pointer",
    fontSize: "12px",
  },
  empty: {
    fontSize: "14px",
    color: "#666",
  },
};