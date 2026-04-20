import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/main.css";
import "../styles/community.css";
import Header from "../components/layouts/Header";
import { fetchPostDetail, createComment } from "../api/api";
import { useAlertStore } from "../stores/useAlertStore";

function formatTime(createdAt) {
  if (!createdAt) return "";
  const diff = Math.floor((Date.now() - new Date(createdAt)) / 1000);
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(createdAt).toLocaleDateString("ko-KR");
}

const PostDetailPage = () => {
  const { postIdx } = useParams();
  const navigate = useNavigate();
  const showAlert = useAlertStore((s) => s.showAlert);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadPost = async () => {
    setLoading(true);
    try {
      const res = await fetchPostDetail(Number(postIdx));
      setPost(res.data.data);
    } catch (err) {
      console.error("게시글 조회 오류:", err);
      showAlert({ message: "게시글을 불러오지 못했습니다.", type: "error" });
      navigate("/community");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [postIdx]);

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) { showAlert({ message: "댓글을 입력하세요.", type: "error" }); return; }

    const userIdx = Number(localStorage.getItem("userIdx"));
    if (!userIdx) { showAlert({ message: "로그인이 필요합니다.", type: "error" }); navigate("/auth/signin"); return; }

    setSubmitting(true);
    try {
      await createComment(Number(postIdx), userIdx, commentText);
      setCommentText("");
      await loadPost(); // 댓글 목록 갱신
    } catch (err) {
      console.error("댓글 등록 오류:", err);
      showAlert({ message: "댓글 등록에 실패했습니다.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />

      <div className="comm-hero" style={{ padding: "120px 0 40px" }}>
        <div className="hero-grid" />
        <div className="hero-glow" />
        <div className="comm-hero-inner">
          <div className="comm-eyebrow">Community</div>
          {loading ? (
            <h1 className="comm-title" style={{ fontSize: "28px" }}>불러오는 중...</h1>
          ) : (
            <h1 className="comm-title" style={{ fontSize: "28px", wordBreak: "keep-all" }}>
              {post?.title}
            </h1>
          )}
        </div>
      </div>

      <div className="detail-wrap">
        {loading ? (
          <p style={{ textAlign: "center", padding: "80px 0", color: "var(--text3)" }}>
            불러오는 중...
          </p>
        ) : post ? (
          <>
            {/* 게시글 메타 */}
            <div className="detail-meta">
              <div className="post-author">
                <div className="author-pic" />
                <span>{post.userNickname}</span>
              </div>
              <div className="detail-meta-right">
                <span>{formatTime(post.createdAt)}</span>
                <span>👁 {post.views}</span>
                {post.likes > 0 && <span>❤️ {post.likes}</span>}
              </div>
            </div>

            {/* 본문 */}
            <div className="detail-content">
              {post.contents?.split("\n").map((line, i) => (
                <p key={i}>{line || <br />}</p>
              ))}
            </div>

            {/* 하단 버튼 */}
            <div className="detail-actions">
              <button className="btn-back" onClick={() => navigate("/community")}>
                ← 목록으로
              </button>
            </div>

            {/* 댓글 섹션 */}
            <div className="comment-section">
              <div className="comment-header">
                댓글 <span className="comment-count">{post.comments?.length ?? 0}</span>
              </div>

              {/* 댓글 목록 */}
              <div className="comment-list">
                {post.comments?.length === 0 ? (
                  <p className="comment-empty">첫 번째 댓글을 남겨보세요.</p>
                ) : (
                  post.comments?.map((c) => (
                    <div key={c.commentIdx} className="comment-item">
                      <div className="comment-top">
                        <div className="post-author">
                          <div className="author-pic" />
                          <span>{c.userNickname}</span>
                        </div>
                        <span className="comment-time">{formatTime(c.createdAt)}</span>
                      </div>
                      <div className="comment-body">{c.contents}</div>
                    </div>
                  ))
                )}
              </div>

              {/* 댓글 입력 */}
              <div className="comment-form">
                <textarea
                  className="comment-input"
                  placeholder="댓글을 입력하세요."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                />
                <button
                  className="comment-submit"
                  onClick={handleCommentSubmit}
                  disabled={submitting}
                >
                  {submitting ? "등록 중..." : "등록"}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
};

export default PostDetailPage;
