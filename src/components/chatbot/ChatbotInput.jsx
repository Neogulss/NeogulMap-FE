import { useState } from "react";

export default function ChatbotInput({ onSend, sending }) {
  const [userQuery, setUserQuery] = useState("");
  const [industry, setIndustry] = useState("");
  const [age, setAge] = useState("");
  const [hasBusinessRegistration, setHasBusinessRegistration] = useState("");

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

  return (
    <div>
      <div style={styles.profileRow}>
        <input
          style={styles.input}
          placeholder="업종 (선택)"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        />
        <input
          style={styles.input}
          type="number"
          placeholder="나이 (선택)"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
        <select
          style={styles.input}
          value={hasBusinessRegistration}
          onChange={(e) => setHasBusinessRegistration(e.target.value)}
        >
          <option value="">사업자등록 여부(선택)</option>
          <option value="true">있음</option>
          <option value="false">없음</option>
        </select>
      </div>

      <div style={styles.sendRow}>
        <textarea
          style={styles.textarea}
          placeholder="질문을 입력하세요"
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
        />
        <button style={styles.sendButton} onClick={handleSend} disabled={sending}>
          {sending ? "전송 중..." : "전송"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  profileRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
  },
  input: {
    flex: 1,
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
  sendRow: {
    display: "flex",
    gap: "8px",
  },
  textarea: {
    flex: 1,
    minHeight: "80px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    resize: "vertical",
  },
  sendButton: {
    width: "100px",
    border: "1px solid #4a67d6",
    backgroundColor: "#4a67d6",
    color: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
  },
};