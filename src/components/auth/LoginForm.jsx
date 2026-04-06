import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/api';

export default function LoginForm() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [userPwd, setUserPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId.trim() || !userPwd.trim()) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await loginUser(userId, userPwd);
      const user = res.data?.data;
      if (user?.userIdx) {
        localStorage.setItem('userIdx', user.userIdx);
        localStorage.setItem('userNickname', user.userNickname);
        localStorage.setItem('userId', user.userId);
      }
      const returnPath = sessionStorage.getItem('returnPath') || '/';
      sessionStorage.removeItem('returnPath');
      window.location.href = returnPath;
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || '아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-view active">
      <h2 className="form-title">로그인</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">아이디</label>
          <input
            type="text"
            className="form-input"
            placeholder="아이디를 입력해주세요"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div className="form-group">
          <label className="form-label">비밀번호</label>
          <input
            type="password"
            className="form-input"
            placeholder="비밀번호를 입력해주세요"
            value={userPwd}
            onChange={(e) => setUserPwd(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="switch-view-link">
        계정이 없으신가요? <button onClick={() => navigate('/auth/signup')}>회원가입하기</button>
      </div>
    </div>
  );
}
