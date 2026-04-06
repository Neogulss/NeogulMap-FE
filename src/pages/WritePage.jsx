import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/main.css";
import "../styles/community.css";
import MainNav from "../components/main/MainNav";
import { createPost } from "../api/api";

const WritePage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleInput = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const handleSubmit = async () => {
    if (!title.trim()) { alert("제목을 입력하세요"); return; }
    if (!content.trim()) { alert("내용을 입력하세요"); return; }

    // TODO: 로그인 연동 후 실제 userIdx로 교체 (임시 하드코딩)
    const userIdx = Number(localStorage.getItem("userIdx")) || 1;

    setSubmitting(true);
    try {
      await createPost(userIdx, title, content);
      alert("게시글이 등록되었습니다.");
      navigate("/community");
    } catch (err) {
      console.error("게시글 등록 오류:", err);
      alert("등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <MainNav />

      <div className="comm-hero">
        <div className="hero-grid"></div>
        <div className="hero-glow"></div>
        <div className="comm-hero-inner">
          <div className="comm-eyebrow">Write a Post</div>
          <h1 className="comm-title">새 글 쓰기</h1>
          <p className="comm-desc">창업 고민, 상권 분석 결과 등을 자유롭게 작성해보세요.</p>
        </div>
      </div>

      <div className="write-wrap">
        <div className="write-container">
          <input
            type="text"
            className="write-title-input"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="editor-box">
            <div className="editor-toolbar">
              <button className="toolbar-btn">B</button>
              <button className="toolbar-btn">I</button>
              <button className="toolbar-btn">U</button>
              <div className="toolbar-divider"></div>
              <button className="toolbar-btn">•</button>
              <button className="toolbar-btn">1.</button>
            </div>
            <textarea
              className="write-content-area"
              placeholder="여기에 내용을 작성해주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onInput={handleInput}
            />
          </div>

          <div className="write-actions">
            <div className="btn-group">
              <button className="btn-cancel" onClick={() => navigate("/community")}>
                취소
              </button>
              <button className="btn-submit" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "등록 중..." : "등록하기"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WritePage;
