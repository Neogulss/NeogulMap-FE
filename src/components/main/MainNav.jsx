import { useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../../api/api";

export default function MainNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const userIdx = localStorage.getItem("userIdx");
  const userNickname = localStorage.getItem("userNickname");
  const isLoggedIn = !!userIdx;

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (_) {
      // 세션 만료 등 무시
    }
    localStorage.removeItem("userIdx");
    localStorage.removeItem("userNickname");
    localStorage.removeItem("userId");
    window.location.href = "/";
  };

  const navLinks = [
    { label: "상권분석", path: "/analysis" },
    { label: "커뮤니티", path: "/community" },
    { label: "공지사항", path: "/notice" },
    { label: "마이페이지", path: "/mypage" },
    { label: "챗봇", path: "/chatbot" },
  ];

  return (
    <nav className="main-nav">
      <a
        className="nav-logo"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          navigate("/");
        }}
      >
        <div className="logo-mark">
          <img src="/neoguri.svg" alt="입지너구리 로고 아이콘" />
        </div>
        <div className="logo-text-wrap">
          <span className="logo-ko">
            <span className="logo-ko-light">입지</span>
            <span className="logo-ko-bold">너구리</span>
          </span>
          <span className="logo-en">AI 상권분석 서비스</span>
        </div>
      </a>

      <div className="nav-center">
        {navLinks.map(({ label, path }) => (
          <a
            key={path}
            href="#"
            className={pathname.startsWith(path) ? "on" : ""}
            onClick={(e) => {
              e.preventDefault();
              navigate(path);
            }}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="nav-right">
        {isLoggedIn ? (
          <div className="nav-user">
            <div className="nav-avatar">{userNickname?.charAt(0) ?? "U"}</div>
            <span className="nav-nickname">{userNickname}</span>
            <button className="nav-btn-ghost" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        ) : (
          <>
            <button
              className="nav-btn-ghost"
              onClick={() => navigate("/auth/signin")}
            >
              로그인
            </button>
            <button
              className="nav-btn-solid"
              onClick={() => navigate("/auth/signup")}
            >
              회원가입
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
