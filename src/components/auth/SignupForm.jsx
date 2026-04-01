import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignupForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [businessType, setBusinessType] = useState('pre');
  const [checkAll, setCheckAll] = useState(false);
  const [termService, setTermService] = useState(false);
  const [termPrivacy, setTermPrivacy] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="auth-form-view active">
      <h2 className="form-title">회원가입</h2>
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
            placeholder="영문, 숫자, 특수문자 포함 8자 이상"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">비밀번호 확인</label>
          <input
            type="password"
            className="form-input"
            placeholder="비밀번호를 다시 한 번 입력해주세요"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">닉네임</label>
          <input
            type="text"
            className="form-input"
            placeholder="사용하실 닉네임을 입력해주세요"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        <div className="form-group-row">
          <div style={{ flex: '0.8' }}>
            <label className="form-label">나이</label>
            <input
              type="number"
              className="form-input"
              placeholder="예: 30"
              min="15"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div style={{ flex: '1.2' }}>
            <label className="form-label">사업자 등록여부</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="business"
                  value="pre"
                  checked={businessType === 'pre'}
                  onChange={() => setBusinessType('pre')}
                /> 예비창업자
              </label>
              <label className="radio-label">
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

        <div className="terms-box">
          <div className="term-item">
            <label className="checkbox-label" style={{ fontWeight: 700, color: 'var(--text)' }}>
              <input type="checkbox" checked={checkAll} onChange={handleCheckAll} />
              <span className="checkbox-custom"></span>
              전체 약관에 동의합니다.
            </label>
          </div>
          <hr className="terms-divider" />
          <div className="term-item">
            <label className="checkbox-label">
              <input type="checkbox" checked={termService} onChange={handleTermService} />
              <span className="checkbox-custom"></span>
              [필수] 입지너구리 이용약관 동의
            </label>
            <span className="term-detail">보기</span>
          </div>
          <div className="term-item">
            <label className="checkbox-label">
              <input type="checkbox" checked={termPrivacy} onChange={handleTermPrivacy} />
              <span className="checkbox-custom"></span>
              [필수] 개인정보 수집 및 이용 동의
            </label>
            <span className="term-detail">보기</span>
          </div>
        </div>

        <button type="submit" className="btn-primary">가입 완료하기</button>
      </form>

      <div className="switch-view-link">
        이미 계정이 있으신가요? <button onClick={() => navigate('/auth/signin')}>로그인하기</button>
      </div>
    </div>
  );
}
