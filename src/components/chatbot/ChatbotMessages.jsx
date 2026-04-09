export default function ChatbotMessages({ logs, loading }) {
  if (loading) {
    return <div>대화 내역 불러오는 중...</div>;
  }

  if (!logs || logs.length === 0) {
    return <div style={styles.empty}>대화 내역이 없습니다.</div>;
  }

  return (
    <div>
      {logs.map((log) => (
        <div key={log.chatLogIdx} style={styles.logBlock}>
          <div style={styles.userBubble}>
            <div style={styles.label}>사용자</div>
            <div>{log.userQuery}</div>
          </div>

          <div style={styles.botBubble}>
            <div style={styles.label}>챗봇</div>
            <div style={{ whiteSpace: "pre-wrap" }}>{log.botResponse}</div>

            <div style={styles.meta}>
              model: {log.model} / latency: {log.turnLatencyMs}ms
            </div>

            {log.rag?.retrievedDocuments?.length > 0 && (
              <div style={styles.ragBox}>
                <div style={styles.ragTitle}>검색 문서</div>

                {log.rag.retrievedDocuments.map((doc, idx) => (
                  <div key={idx} style={styles.ragItem}>
                    <div><strong>source:</strong> {doc.source}</div>
                    <div><strong>chunk:</strong> {doc.chunkText}</div>
                    <div>
                      <strong>scores:</strong> faiss={String(doc.faissScore)} / bm25={String(doc.bm25Score)} / rerank={String(doc.rerankScore)}
                    </div>
                  </div>
                ))}

                {log.rag.systemLatency && (
                  <div style={styles.meta}>
                    retrieval: {log.rag.systemLatency.retrievalMs}ms / llm: {log.rag.systemLatency.llmGenerationMs}ms
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  empty: {
    color: "#666",
  },
  logBlock: {
    marginBottom: "20px",
  },
  userBubble: {
    backgroundColor: "#f1f1f1",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "8px",
  },
  botBubble: {
    backgroundColor: "#eef3ff",
    borderRadius: "8px",
    padding: "12px",
  },
  label: {
    fontWeight: "bold",
    fontSize: "12px",
    color: "#555",
    marginBottom: "6px",
  },
  meta: {
    marginTop: "8px",
    fontSize: "12px",
    color: "#666",
  },
  ragBox: {
    marginTop: "12px",
    backgroundColor: "#fff",
    border: "1px solid #d9e1ff",
    borderRadius: "6px",
    padding: "10px",
  },
  ragTitle: {
    fontWeight: "bold",
    marginBottom: "8px",
    fontSize: "13px",
  },
  ragItem: {
    fontSize: "13px",
    marginBottom: "10px",
    paddingBottom: "10px",
    borderBottom: "1px solid #eee",
  },
};