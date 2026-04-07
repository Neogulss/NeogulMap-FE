import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/community.css";
import "../styles/notice.css";
import { createNotice, updateNotice, fetchNoticeDetail } from "../api/api";

const isAdmin = () =>
  localStorage.getItem("userId") === import.meta.env.VITE_ADMIN_USER_ID;

const NoticeWritePage = () => {
  const navigate = useNavigate();
  const { noticeIdx } = useParams(); // 수정 시에만 존재
  const isEdit = !!noticeIdx;

  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [isFixed, setIsFixed] = useState("N");
  const [submitting, setSubmitting] = useState(false);

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (!isAdmin()) {
      alert("관리자만 접근할 수 있습니다.");
      navigate("/notice");
      return;
    }
    if (!isEdit) return;

    fetchNoticeDetail(Number(noticeIdx))
      .then((res) => {
        const data = res.data.data;
        setTitle(data.title ?? "");
        setContents(data.contents ?? "");
        setIsFixed(data.isFixed ?? "N");
      })
      .catch(() => {
        alert("공지사항을 불러오지 못했습니다.");
        navigate("/notice");
      });
  }, [noticeIdx, isEdit, navigate]);

  const handleSubmit = async () => {
    if (!title.trim()) { alert("제목을 입력하세요."); return; }
    if (!contents.trim()) { alert("내용을 입력하세요."); return; }

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateNotice(Number(noticeIdx), title, contents, isFixed);
        alert("공지사항이 수정되었습니다.");
        navigate(`/notice/${noticeIdx}`);
      } else {
        await createNotice(title, contents, isFixed);
        alert("공지사항이 등록되었습니다.");
        navigate("/notice");
      }
    } catch (err) {
      console.error("공지사항 저장 오류:", err);
      const msg = err.response?.data?.message;
      alert(msg || "저장 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="comm-hero">
        <div className="hero-grid" />
        <div className="hero-glow" />
        <div className="comm-hero-inner">
          <div className="comm-eyebrow">Notice</div>
          <h1 className="comm-title">{isEdit ? "공지사항 수정" : "공지사항 작성"}</h1>
        </div>
      </div>

      <div className="write-wrap">
        <div className="write-container">
          {/* 고정 공지 토글 */}
          <button
            type="button"
            className={`notice-fixed-toggle-btn${isFixed === "Y" ? " active" : ""}`}
            onClick={() => setIsFixed(isFixed === "Y" ? "N" : "Y")}
          >
            <span className="notice-fixed-toggle-icon">
              {/* 확성기 아이콘 */}
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 3a1 1 0 0 0-1 1v.17A5 5 0 0 1 13 9H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3h.28l1.38 4.13A2 2 0 0 0 9.56 20H10a2 2 0 0 0 2-2v-2.06A5 5 0 0 1 17 20.83V21a1 1 0 0 0 1 1 1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm-6 15a.5.5 0 0 1-.5.5h-.44a.5.5 0 0 1-.47-.33L9.39 15H12zm5 1.18A7 7 0 0 0 12 13.1V9.9a7 7 0 0 0 5-5.08z"/>
              </svg>
            </span>
            <span>상단 고정 공지로 등록</span>
            <span className="notice-fixed-toggle-status">
              {isFixed === "Y" ? "ON" : "OFF"}
            </span>
          </button>

          <input
            type="text"
            className="write-title-input"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="editor-box">
            <textarea
              className="write-content-area"
              placeholder="내용을 입력하세요."
              value={contents}
              onChange={(e) => setContents(e.target.value)}
              style={{ minHeight: "320px" }}
            />
          </div>

          <div className="write-actions">
            <div className="btn-group">
              <button
                className="btn-cancel"
                onClick={() => navigate(isEdit ? `/notice/${noticeIdx}` : "/notice")}
              >
                취소
              </button>
              <button
                className="btn-submit"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "저장 중..." : isEdit ? "수정하기" : "등록하기"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NoticeWritePage;
