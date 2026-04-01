import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="auth-form-view active">
      <h2 className="form-title">로그인</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">이메일</label>
          <input
            type="email"
            className="form-input"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">비밀번호</label>
          <input
            type="password"
            className="form-input"
            placeholder="비밀번호를 입력해주세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span className="checkbox-custom"></span>
            로그인 상태 유지
          </label>
          <a href="#" className="link-forgot">비밀번호를 잊으셨나요?</a>
        </div>

        <button type="submit" className="btn-primary">로그인</button>
      </form>

      <div className="switch-view-link">
        계정이 없으신가요? <button onClick={() => navigate('/auth/signup')}>회원가입하기</button>
      </div>
    </div>
  );
}
