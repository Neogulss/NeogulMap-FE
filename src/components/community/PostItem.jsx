function formatTime(createdAt) {
  if (!createdAt) return "";
  const diff = Math.floor((Date.now() - new Date(createdAt)) / 1000);
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(createdAt).toLocaleDateString("ko-KR");
}

const PostItem = ({ post, onClick }) => {
  return (
    <div className="post-item" onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="post-head">
        <div className="post-title">
          {post.title}
          <span className="post-comments">[{post.commentCount ?? 0}]</span>
        </div>
      </div>

      <div className="post-meta">
        <div className="post-author">
          <div className="author-pic"></div>
          {post.userNickname}
        </div>
        <div>{formatTime(post.createdAt)}</div>
        <div>👁 {post.views ?? 0}</div>
        {post.likes > 0 && <div>❤️ {post.likes}</div>}
      </div>
    </div>
  );
};

export default PostItem;
