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

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Layout />} >
      <Route index element={<MainPage />} />
      <Route path="auth">
        <Route path="signin" element={<SigninPage />} />
        <Route path="signup" element={<SignupPage />} />
      </Route>
      <Route path="analysis" element={<AnalysisPage />} />
       <Route path="community" element={<CommunityPage />} />
       <Route path="notice" element={<NoticePage />} />
       <Route path="mypage" element={<MyPage />} />
       <Route path="chatbot" element={<ChatbotPage />} /> 
       </Route>
    </Routes>
  );
}
