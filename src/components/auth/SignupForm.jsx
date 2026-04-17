import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUpUser } from '../../api/api';

export default function SignupForm() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [businessType, setBusinessType] = useState('pre');
  const [checkAll, setCheckAll] = useState(false);
  const [termService, setTermService] = useState(false);
  const [termPrivacy, setTermPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckAll = (e) => {
    const checked = e.target.checked;
    setCheckAll(checked);
    setTermService(checked);
    setTermPrivacy(checked);
  };

  const handleTermService = (e) => {
    setTermService(e.target.checked);
    if (!e.target.checked) setCheckAll(false);
    else if (termPrivacy) setCheckAll(true);
  };

  const handleTermPrivacy = (e) => {
    setTermPrivacy(e.target.checked);
    if (!e.target.checked) setCheckAll(false);
    else if (termService) setCheckAll(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (userId.length < 4 || userId.length > 50) {
      setError('아이디는 4~50자 이내여야 합니다.');
      return;
    }
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    if (!termService || !termPrivacy) {
      setError('필수 약관에 동의해주세요.');
      return;
    }

    setLoading(true);
    try {
      await signUpUser(
        userId,
        password,
        nickname,
        age ? Number(age) : null,
        businessType === 'reg' ? 'Y' : 'N'
      );
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/auth/signin');
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-view active">
      <h2 className="auth-form-title">회원가입</h2>
      <form onSubmit={handleSubmit}>
        <div className="auth-form-group">
          <label className="auth-form-label">아이디</label>
          <input
            type="text"
            className="auth-form-input"
            placeholder="4~50자 영문, 숫자"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div className="auth-form-group">
          <label className="auth-form-label">비밀번호</label>
          <input
            type="password"
            className="auth-form-input"
            placeholder="8자 이상"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div className="auth-form-group">
          <label className="auth-form-label">비밀번호 확인</label>
          <input
            type="password"
            className="auth-form-input"
            placeholder="비밀번호를 다시 한 번 입력해주세요"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <div className="auth-form-group">
          <label className="auth-form-label">닉네임</label>
          <input
            type="text"
            className="auth-form-input"
            placeholder="사용하실 닉네임을 입력해주세요"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        <div className="auth-form-group-row">
          <div style={{ flex: '0.8' }}>
            <label className="auth-form-label">나이</label>
            <input
              type="number"
              className="auth-form-input"
              placeholder="예: 30"
              min="15"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div style={{ flex: '1.2' }}>
            <label className="auth-form-label">사업자 등록여부</label>
            <div className="auth-radio-group">
              <label className="auth-radio-label">
                <input
                  type="radio"
                  name="business"
                  value="pre"
                  checked={businessType === 'pre'}
                  onChange={() => setBusinessType('pre')}
                /> 예비창업자
              </label>
              <label className="auth-radio-label">
                <input
                  type="radio"
                  name="business"
                  value="reg"
                  checked={businessType === 'reg'}
                  onChange={() => setBusinessType('reg')}
                /> 기존사업자
              </label>
            </div>
          </div>
        </div>

        <div className="auth-terms-box">
          <div className="auth-term-item">
            <label className="auth-checkbox-label" style={{ fontWeight: 700, color: 'var(--text)' }}>
              <input type="checkbox" checked={checkAll} onChange={handleCheckAll} />
              <span className="auth-checkbox-custom"></span>
              전체 약관에 동의합니다.
            </label>
          </div>
          <hr className="auth-terms-divider" />
          <div className="auth-term-item">
            <label className="auth-checkbox-label">
              <input type="checkbox" checked={termService} onChange={handleTermService} />
              <span className="auth-checkbox-custom"></span>
              [필수] 입지너구리 이용약관 동의
            </label>
            <span className="auth-term-detail">보기</span>
          </div>
          <div className="auth-term-item">
            <label className="auth-checkbox-label">
              <input type="checkbox" checked={termPrivacy} onChange={handleTermPrivacy} />
              <span className="auth-checkbox-custom"></span>
              [필수] 개인정보 수집 및 이용 동의
            </label>
            <span className="auth-term-detail">보기</span>
          </div>
        </div>

        {error && <p className="auth-form-error">{error}</p>}

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? '처리 중...' : '가입 완료하기'}
        </button>
      </form>

      <div className="auth-switch-link">
        이미 계정이 있으신가요? <button onClick={() => navigate('/auth/signin')}>로그인하기</button>
      </div>
    </div>
  );
}
