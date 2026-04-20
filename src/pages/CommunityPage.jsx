import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/community.css";
import PostItem from "../components/community/PostItem";
import Sidebar from "../components/community/Sidebar";
import { fetchPostList } from "../api/api";

const SORT_OPTIONS = [
  { label: "최신순", value: "LATEST" },
  { label: "조회순", value: "VIEWS" },
];

const PAGE_SIZE = 10;

const CommunityPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [sortType, setSortType] = useState("LATEST");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadPosts = useCallback(async (currentPage, currentSort) => {
    setLoading(true);
    try {
      const res = await fetchPostList(currentPage, PAGE_SIZE, currentSort);
      const data = res.data.data;
      setPosts(data.posts ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      console.error("게시글 목록 오류:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts(page, sortType);
  }, [page, sortType, loadPosts]);

  const handleSortChange = (value) => {
    setSortType(value);
    setPage(1);
  };

  return (
    <>
      <div className="comm-hero">
        <div className="comm-hero-inner">
          <div className="comm-eyebrow">Community</div>
          <h1 className="comm-title">창업자들의 생생한 이야기</h1>
          <p className="comm-desc">현장에서 겪는 생생한 고민을 나누어 보세요.</p>
        </div>
      </div>

      <div className="comm-wrap">
        <div className="comm-main">
          <div className="list-util">
            <div className="sort-wrap">
              {SORT_OPTIONS.map((opt) => (
                <span
                  key={opt.value}
                  className={`sort-item${sortType === opt.value ? " active" : ""}`}
                  onClick={() => handleSortChange(opt.value)}
                >
                  {opt.label}
                </span>
              ))}
            </div>
          </div>

          <div className="post-list">
            {loading ? (
              <p style={{ textAlign: "center", padding: "40px 0", color: "var(--text3)" }}>
                불러오는 중...
              </p>
            ) : posts.length === 0 ? (
              <p style={{ textAlign: "center", padding: "40px 0", color: "var(--text3)" }}>
                게시글이 없습니다.
              </p>
            ) : (
              posts.map((post) => (
                <PostItem
                  key={post.postIdx}
                  post={post}
                  onClick={() => navigate(`/community/${post.postIdx}`)}
                />
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                이전
              </button>
              <span className="page-info">{page} / {totalPages}</span>
              <button
                className="page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                다음
              </button>
            </div>
          )}
        </div>

        <Sidebar />
      </div>
    </>
  );
};

export default CommunityPage;
