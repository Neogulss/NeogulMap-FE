import { useNavigate, NavLink } from "react-router-dom";
import CustomButton from "../common/CustomButton";


export default function Header() {
  const navigate = useNavigate();

  const menuClass = ({ isActive }) =>
    `text-sm font-medium pb-1 border-b-2 ${
      isActive
        ? "text-primary-3 border-primary-3"
        : "text-neutral-600 border-transparent hover:text-neutral-800 hover:border-neutral-300"
    }`;

  return (
    <header className="flex items-center px-10 py-4 bg-white border-b border-gray-100">
        <button onClick={() => navigate("/")} className="focus:outline-none">
      <div className="flex items-center gap-1">
            <img
              src="src/assets/images/logo.svg"
              alt="입지너구리 로고"
              className="object-contain w-auto h-8"
            />
          <div className="flex flex-col items-start">
          <div className="font-bold text-b-7 text-neutral-9">입지너구리</div>
          <div className="font-medium text-b-5 text-primary-3">AI 상권 분석 서비스</div>
        </div>

      </div>
        </button>

      <nav className="flex items-center gap-8 ml-auto mr-4">
        <NavLink to="/analysis" className={menuClass}>
          상권분석
        </NavLink>
        <NavLink to="/community" className={menuClass}>
          커뮤니티
        </NavLink>
        <NavLink to="/notice" className={menuClass}>
          공지사항
        </NavLink>
        <NavLink to="/mypage" className={menuClass}>
          마이페이지
        </NavLink>
        <NavLink to="/chatbot" className={menuClass}>
          챗봇
        </NavLink>
      </nav>
      <div className="flex items-center gap-3">
        <CustomButton
          variant="white"
          className="px-4 py-1.5 text-b-3 font-extrabold text-neutral-7"
          onClick={() => navigate("/auth/signin")}
        >
          로그인
        </CustomButton>

        <CustomButton
          variant="primary"
          className="px-4 py-1.5 text-b-3 font-extrabold text-neutral-2"
          onClick={() => navigate("/auth/signup")}
        >
          회원가입
        </CustomButton>
      </div>
    </header>
  );
}
