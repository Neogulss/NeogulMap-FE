import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchHotPostList } from "../../api/api";

const Sidebar = () => {
  const navigate = useNavigate();
  const [hotPosts, setHotPosts] = useState([]);

  useEffect(() => {
    fetchHotPostList()
      .then((res) => setHotPosts(res.data.data ?? []))
      .catch((err) => console.error("HOT 게시글 오류:", err));
  }, []);

  return (
    <div className="comm-side">
      <button className="write-btn" onClick={() => navigate("/community/write")}>
        새 글 쓰기
      </button>

      <div className="widget">
        <div className="widget-title">🔥 이번 주 HOT 게시글</div>
        <div className="hot-list">
          {hotPosts.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text3)", padding: "12px 0" }}>
              핫 게시글이 없습니다.
            </p>
          ) : (
            hotPosts.map((post, idx) => (
              <div
                key={post.postIdx}
                className="hot-item"
                onClick={() => navigate(`/community/${post.postIdx}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="hot-rank">{idx + 1}</div>
                <div className="hot-info">
                  <div className="hot-title">{post.title}</div>
                  <div className="hot-meta">
                    조회 {post.views} · 댓글 {post.commentCount}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
