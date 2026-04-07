import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/community.css";
import "../styles/notice.css";
import { fetchNoticeDetail, deleteNotice } from "../api/api";

const isAdmin = () =>
  localStorage.getItem("userId") === import.meta.env.VITE_ADMIN_USER_ID;

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

const NoticeDetailPage = () => {
  const { noticeIdx } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const admin = isAdmin();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchNoticeDetail(Number(noticeIdx));
        setNotice(res.data.data);
      } catch (err) {
        console.error("공지사항 조회 오류:", err);
        alert("공지사항을 불러오지 못했습니다.");
        navigate("/notice");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [noticeIdx, navigate]);

  const handleDelete = async () => {
    if (!window.confirm("공지사항을 삭제하시겠습니까?")) return;
    setDeleting(true);
    try {
      await deleteNotice(Number(noticeIdx));
      alert("공지사항이 삭제되었습니다.");
      navigate("/notice");
    } catch (err) {
      console.error("공지사항 삭제 오류:", err);
      const msg = err.response?.data?.message;
      alert(msg || "삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="comm-hero" style={{ padding: "140px 0 60px" }}>
        <div className="hero-grid" />
        <div className="hero-glow" />
        <div className="comm-hero-inner">
          <div className="comm-eyebrow">Notice</div>
          {loading ? (
            <h1 className="comm-title" style={{ fontSize: "28px" }}>불러오는 중...</h1>
          ) : (
            <h1 className="comm-title" style={{ fontSize: "28px", wordBreak: "keep-all" }}>
              {notice?.isFixed === "Y" && (
                <span className="notice-badge" style={{ fontSize: "13px", marginRight: "12px", verticalAlign: "middle" }}>중요</span>
              )}
              {notice?.title}
            </h1>
          )}
        </div>
      </div>

      <div className="detail-wrap">
        {loading ? (
          <p style={{ textAlign: "center", padding: "80px 0", color: "var(--text3)" }}>
            불러오는 중...
          </p>
        ) : notice ? (
          <>
            <div className="detail-meta">
              <div style={{ fontSize: "14px", color: "var(--text3)", fontWeight: 500 }}>
                공지사항
              </div>
              <div className="detail-meta-right">
                <span>{formatDate(notice.createdAt)}</span>
                <span>조회 {notice.views}</span>
              </div>
            </div>

            <div className="detail-content">
              {notice.contents?.split("\n").map((line, i) => (
                <p key={i}>{line || <br />}</p>
              ))}
            </div>

            <div className="detail-actions" style={{ justifyContent: "space-between" }}>
              <button className="btn-back" onClick={() => navigate("/notice")}>
                ← 목록으로
              </button>

              {admin && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="btn-back"
                    onClick={() => navigate(`/notice/${noticeIdx}/edit`)}
                  >
                    수정
                  </button>
                  <button
                    className="notice-delete-btn"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "삭제 중..." : "삭제"}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </>
  );
};

export default NoticeDetailPage;
