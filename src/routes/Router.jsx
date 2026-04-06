import { Routes, Route } from "react-router-dom";
import MainPage from "../pages/MainPage";
import Layout from "../components/layouts/Layout";
import SigninPage from "../pages/auth/SigninPage";
import SignupPage from "../pages/auth/SignupPage";
import AnalysisPage from "../pages/AnalysisPage";
import CommunityPage from "../pages/CommunityPage";
import NoticePage from "../pages/NoticePage";
import MyPage from "../pages/MyPage";
import ChatbotPage from "../pages/ChatbotPage";
import WritePage from "../pages/WritePage";
import PostDetailPage from "../pages/PostDetailPage";

export default function Router() {
  return (
    <Routes>
      {/* 전체화면 독립 레이아웃 페이지 (Layout 미사용) */}
      <Route path="/" element={<MainPage />} />
      <Route path="analysis" element={<AnalysisPage />} />
      <Route path="auth/signin" element={<SigninPage />} />
      <Route path="auth/signup" element={<SignupPage />} />
      <Route path="community/:postIdx" element={<PostDetailPage />} />

      {/* 나머지 페이지는 공통 Header/Footer Layout 사용 */}
      <Route element={<Layout />}>
        <Route path="community" element={<CommunityPage />} />
        <Route path="community/write" element={<WritePage />} />
        <Route path="notice" element={<NoticePage />} />
        <Route path="mypage" element={<MyPage />} />
        <Route path="chatbot" element={<ChatbotPage />} />
      </Route>
    </Routes>
  );
}
