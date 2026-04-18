import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/community.css";
import "../styles/notice.css";
import { fetchNoticeList } from "../api/api";

const PAGE_SIZE = 10;

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

const NoticePage = () => {
  const navigate = useNavigate();
  const [fixedNotices, setFixedNotices] = useState([]);
  const [notices, setNotices] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const admin = isAdmin();

  const loadNotices = useCallback(async (currentPage, currentKeyword) => {
    setLoading(true);
    try {
      const res = await fetchNoticeList(currentPage, PAGE_SIZE, currentKeyword);
      const data = res.data.data;
      setFixedNotices(data.fixedNotices ?? []);
      setNotices(data.notices ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      console.error("공지사항 목록 오류:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotices(page, keyword);
  }, [page, keyword, loadNotices]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setKeyword(inputValue.trim());
  };

  const handleNoticeClick = (noticeIdx) => {
    navigate(`/notice/${noticeIdx}`);
  };

  return (
    <>
      <div className="comm-hero">
        <div className="comm-hero-inner">
          <div className="comm-eyebrow">Notice</div>
          <h1 className="comm-title">공지사항</h1>
          <p className="comm-desc">너굴맵의 새로운 소식을 확인하세요.</p>
        </div>
      </div>

      <div className="notice-wrap">
        {/* 검색 + 작성버튼 */}
        <div className="notice-toolbar">
          <form className="notice-search" onSubmit={handleSearch}>
            <div className="search-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="22" y2="22" />
              </svg>
              <input
                type="text"
                placeholder="제목 또는 내용 검색"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            <button type="submit" className="notice-search-btn">
              검색
            </button>
          </form>

          {admin && (
            <button
              className="notice-write-btn"
              onClick={() => navigate("/notice/write")}
            >
              + 공지 작성
            </button>
          )}
        </div>

        {/* 고정 공지 */}
        {fixedNotices.length > 0 && (
          <div className="notice-fixed-section">
            {fixedNotices.map((n) => (
              <div
                key={n.noticeIdx}
                className="notice-item notice-item--fixed"
                onClick={() => handleNoticeClick(n.noticeIdx)}
              >
                <span className="notice-megaphone">
                  {/* 확성기 아이콘 */}
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 3a1 1 0 0 0-1 1v.17A5 5 0 0 1 13 9H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3h.28l1.38 4.13A2 2 0 0 0 9.56 20H10a2 2 0 0 0 2-2v-2.06A5 5 0 0 1 17 20.83V21a1 1 0 0 0 1 1 1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm-6 15a.5.5 0 0 1-.5.5h-.44a.5.5 0 0 1-.47-.33L9.39 15H12zm5 1.18A7 7 0 0 0 12 13.1V9.9a7 7 0 0 0 5-5.08z" />
                    <circle cx="21" cy="12" r="1.5" />
                  </svg>
                </span>
                <span className="notice-badge">중요</span>
                <span className="notice-title">{n.title}</span>
                <div className="notice-meta">
                  <span>{formatDate(n.createdAt)}</span>
                  <span>조회 {n.views}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 일반 공지 목록 */}
        <div className="notice-list">
          {loading ? (
            <p className="notice-empty">불러오는 중...</p>
          ) : notices.length === 0 ? (
            <p className="notice-empty">공지사항이 없습니다.</p>
          ) : (
            notices.map((n) => (
              <div
                key={n.noticeIdx}
                className="notice-item"
                onClick={() => handleNoticeClick(n.noticeIdx)}
              >
                <span className="notice-title">{n.title}</span>
                <div className="notice-meta">
                  <span>{formatDate(n.createdAt)}</span>
                  <span>조회 {n.views}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              이전
            </button>
            <span className="page-info">
              {page} / {totalPages}
            </span>
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
    </>
  );
};

export default NoticePage;
