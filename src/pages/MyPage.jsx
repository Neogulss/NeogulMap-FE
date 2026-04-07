import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchMyProfile,
  updateMyProfile,
  fetchMyPostList,
  fetchMyCommentList,
  fetchMyFavoriteList,
  deleteFavorite,
  withdrawUser,
} from '../api/api';
import '../styles/mypage.css';

// initialCapital = budgetMin * 100000 + budgetMax (둘 다 만원 단위)
function decodeCapital(initialCapital) {
  const min = Math.floor(initialCapital / 100000);
  const max = initialCapital % 100000;
  return { budgetMin: min, budgetMax: max };
}

function formatMan(v) {
  if (!v) return '0만원';
  if (v >= 10000) {
    const uk = Math.floor(v / 10000);
    const rem = v % 10000;
    return rem > 0 ? `${uk}억 ${rem.toLocaleString()}만원` : `${uk}억원`;
  }
  return `${v.toLocaleString()}만원`;
}

function formatCapitalRange(initialCapital) {
  if (!initialCapital) return '-';
  const { budgetMin, budgetMax } = decodeCapital(initialCapital);
  return `${formatMan(budgetMin)} ~ ${formatMan(budgetMax)}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
}

export default function MyPage() {
  const navigate = useNavigate();
  const userIdx = Number(localStorage.getItem('userIdx'));

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  // ── 프로필 ──
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  // ── 수정 폼 ──
  const [form, setForm] = useState({
    userNickname: '', userAge: '', isRegisteredBusiness: 'N',
    currentPwd: '', newPwd: '', newPwdConfirm: '',
  });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // ── 즐겨찾기 ──
  const [favData, setFavData] = useState(null);
  const [favLoading, setFavLoading] = useState(false);

  // ── 내가 쓴 글 ──
  const [postsData, setPostsData] = useState(null);
  const [postsPage, setPostsPage] = useState(1);
  const [postsLoading, setPostsLoading] = useState(false);

  // ── 내가 쓴 댓글 ──
  const [commentsData, setCommentsData] = useState(null);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // ── 회원 탈퇴 모달 ──
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawPwd, setWithdrawPwd] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // ── 프로필 로드 ──
  const loadProfile = useCallback(async () => {
    if (!userIdx) { navigate('/auth/signin'); return; }
    setProfileLoading(true);
    setProfileError('');
    try {
      const res = await fetchMyProfile(userIdx);
      const data = res.data.data;
      setProfile(data);
      setForm({
        userNickname: data.userNickname || '',
        userAge: data.userAge ?? '',
        isRegisteredBusiness: data.isRegisteredBusiness || 'N',
        currentPwd: '', newPwd: '', newPwdConfirm: '',
      });
    } catch {
      setProfileError('프로필을 불러오지 못했습니다.');
    } finally {
      setProfileLoading(false);
    }
  }, [userIdx, navigate]);

  // ── 즐겨찾기 로드 ──
  const loadFavorites = useCallback(async () => {
    setFavLoading(true);
    try {
      const res = await fetchMyFavoriteList(userIdx);
      setFavData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setFavLoading(false);
    }
  }, [userIdx]);

  // ── 즐겨찾기 삭제 ──
  const handleDeleteFavorite = async (favoriteIdx) => {
    try {
      await deleteFavorite(favoriteIdx, userIdx);
      setFavData(prev => ({
        ...prev,
        favorites: prev.favorites.filter(f => f.favoriteIdx !== favoriteIdx),
        totalCount: prev.totalCount - 1,
      }));
    } catch (err) {
      alert(err.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  // ── 내가 쓴 글 로드 ──
  const loadPosts = useCallback(async (page) => {
    setPostsLoading(true);
    try {
      const res = await fetchMyPostList(userIdx, page);
      setPostsData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setPostsLoading(false);
    }
  }, [userIdx]);

  // ── 내가 쓴 댓글 로드 ──
  const loadComments = useCallback(async (page) => {
    setCommentsLoading(true);
    try {
      const res = await fetchMyCommentList(userIdx, page);
      setCommentsData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCommentsLoading(false);
    }
  }, [userIdx]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  useEffect(() => {
    if (activeTab === 'favorites') loadFavorites();
  }, [activeTab, loadFavorites]);

  useEffect(() => {
    if (activeTab === 'posts') loadPosts(postsPage);
  }, [activeTab, postsPage, loadPosts]);

  useEffect(() => {
    if (activeTab === 'comments') loadComments(commentsPage);
  }, [activeTab, commentsPage, loadComments]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsEditing(false);
    setEditError('');
  };

  // ── 프로필 저장 ──
  const handleSaveProfile = async () => {
    if (!form.userNickname.trim()) { setEditError('닉네임을 입력해주세요.'); return; }
    if (form.newPwd && form.newPwd !== form.newPwdConfirm) { setEditError('새 비밀번호가 일치하지 않습니다.'); return; }
    if (form.newPwd && !form.currentPwd) { setEditError('현재 비밀번호를 입력해주세요.'); return; }

    setEditLoading(true);
    setEditError('');
    try {
      await updateMyProfile(
        userIdx,
        form.userNickname,
        form.userAge !== '' ? Number(form.userAge) : null,
        form.isRegisteredBusiness,
        form.newPwd ? form.currentPwd : null,
        form.newPwd || null,
      );
      localStorage.setItem('userNickname', form.userNickname);
      await loadProfile();
      setIsEditing(false);
    } catch (err) {
      setEditError(err.response?.data?.message || '수정에 실패했습니다.');
    } finally {
      setEditLoading(false);
    }
  };

  // ── 회원 탈퇴 ──
  const handleWithdraw = async () => {
    if (!withdrawPwd) { setWithdrawError('비밀번호를 입력해주세요.'); return; }
    setWithdrawLoading(true);
    setWithdrawError('');
    try {
      await withdrawUser(userIdx, withdrawPwd);
      localStorage.clear();
      navigate('/');
    } catch (err) {
      setWithdrawError(err.response?.data?.message || '탈퇴에 실패했습니다.');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const closeWithdrawModal = () => {
    setShowWithdraw(false);
    setWithdrawPwd('');
    setWithdrawError('');
  };

  return (
    <div className="mypage-wrapper">
      {/* ── 사이드바 ── */}
      <aside className="mp-sidebar">
        <h2 className="mp-title">마이페이지</h2>
        <div className="mp-menu">
          <button
            className={`mp-menu-item${activeTab === 'profile' ? ' active' : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            프로필 관리 <span>❯</span>
          </button>
          <button
            className={`mp-menu-item${activeTab === 'favorites' ? ' active' : ''}`}
            onClick={() => handleTabChange('favorites')}
          >
            즐겨찾기 상권 <span>❯</span>
          </button>
          <button
            className={`mp-menu-item${activeTab === 'posts' ? ' active' : ''}`}
            onClick={() => handleTabChange('posts')}
          >
            내가 쓴 글 <span>❯</span>
          </button>
          <button
            className={`mp-menu-item${activeTab === 'comments' ? ' active' : ''}`}
            onClick={() => handleTabChange('comments')}
          >
            내가 쓴 댓글 <span>❯</span>
          </button>
          <button className="mp-menu-item danger" onClick={() => setShowWithdraw(true)}>
            회원 탈퇴
          </button>
        </div>
      </aside>

      {/* ── 콘텐츠 ── */}
      <main className="mp-content">

        {/* 프로필 관리 */}
        {activeTab === 'profile' && (
          <section className="tab-section">
            <h3 className="section-title">프로필 정보</h3>
            {profileLoading ? (
              <div className="mp-loading">불러오는 중...</div>
            ) : profileError ? (
              <div className="mp-empty">{profileError}</div>
            ) : profile && (
              <div className="box-card">
                <div className="profile-layout">
                  {/* 아바타 */}
                  <div className="profile-avatar-col">
                    <div className="avatar-circle">
                      <img src="/neoguri2.png" alt="프로필 너구리" />
                    </div>
                  </div>

                  {/* 폼 필드 */}
                  <div className="profile-form-col">
                    <div className="form-row">
                      <div className="form-label">아이디</div>
                      <div className="form-val">{profile.userId}</div>
                    </div>

                    {isEditing && (
                      <>
                        <div className="form-row">
                          <div className="form-label">현재 비밀번호</div>
                          <input
                            type="password"
                            className="form-input"
                            placeholder="비밀번호 변경 시 입력"
                            value={form.currentPwd}
                            onChange={e => setForm(f => ({ ...f, currentPwd: e.target.value }))}
                          />
                        </div>
                        <div className="form-row">
                          <div className="form-label">새 비밀번호</div>
                          <input
                            type="password"
                            className="form-input"
                            placeholder="변경할 경우에만 입력 (8자 이상)"
                            value={form.newPwd}
                            onChange={e => setForm(f => ({ ...f, newPwd: e.target.value }))}
                          />
                        </div>
                        <div className="form-row">
                          <div className="form-label">비밀번호 확인</div>
                          <input
                            type="password"
                            className="form-input"
                            placeholder="새 비밀번호 재입력"
                            value={form.newPwdConfirm}
                            onChange={e => setForm(f => ({ ...f, newPwdConfirm: e.target.value }))}
                          />
                        </div>
                      </>
                    )}

                    <div className="form-row">
                      <div className="form-label">닉네임</div>
                      {isEditing
                        ? <input type="text" className="form-input" value={form.userNickname} onChange={e => setForm(f => ({ ...f, userNickname: e.target.value }))} />
                        : <div className="form-val">{profile.userNickname}</div>
                      }
                    </div>

                    <div className="form-row">
                      <div className="form-label">나이</div>
                      {isEditing
                        ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="number"
                              className="form-input"
                              value={form.userAge}
                              onChange={e => setForm(f => ({ ...f, userAge: e.target.value }))}
                              style={{ maxWidth: '100px' }}
                            /> 세
                          </div>
                        )
                        : <div className="form-val">{profile.userAge ? `${profile.userAge}세` : '-'}</div>
                      }
                    </div>

                    <div className="form-row">
                      <div className="form-label">사업자 등록여부</div>
                      {isEditing
                        ? (
                          <div className="radio-group">
                            <label className="radio-label">
                              <input type="radio" name="business" value="Y" checked={form.isRegisteredBusiness === 'Y'} onChange={() => setForm(f => ({ ...f, isRegisteredBusiness: 'Y' }))} />
                              등록함
                            </label>
                            <label className="radio-label">
                              <input type="radio" name="business" value="N" checked={form.isRegisteredBusiness === 'N'} onChange={() => setForm(f => ({ ...f, isRegisteredBusiness: 'N' }))} />
                              미등록
                            </label>
                          </div>
                        )
                        : <div className="form-val">{profile.isRegisteredBusiness === 'Y' ? '등록' : '미등록'}</div>
                      }
                    </div>
                  </div>
                </div>

                {editError && <p className="mp-form-error">{editError}</p>}

                <div className="profile-actions">
                  {isEditing ? (
                    <>
                      <button className="btn-outline" onClick={() => { setIsEditing(false); setEditError(''); }}>취소</button>
                      <button className="btn-primary" onClick={handleSaveProfile} disabled={editLoading}>
                        {editLoading ? '저장 중...' : '저장하기'}
                      </button>
                    </>
                  ) : (
                    <button className="btn-outline" onClick={() => setIsEditing(true)}>정보 수정</button>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* 즐겨찾기 상권 */}
        {activeTab === 'favorites' && (
          <section className="tab-section">
            <h3 className="section-title">
              즐겨찾기 상권
              {favData && <span className="section-count">총 {favData.totalCount}건</span>}
            </h3>
            {favLoading ? (
              <div className="mp-loading">불러오는 중...</div>
            ) : !favData || favData.favorites.length === 0 ? (
              <div className="mp-empty">저장된 즐겨찾기 상권이 없습니다.</div>
            ) : (
              <div className="fav-grid">
                {favData.favorites.map(fav => (
                  <div key={fav.favoriteIdx} className="fav-card">
                    <div className="fc-head">
                      <h4 className="fc-title">{fav.districtName} {fav.adminDongName}</h4>
                      <button className="fc-del" title="삭제" onClick={() => handleDeleteFavorite(fav.favoriteIdx)}>×</button>
                    </div>
                    <div className="fc-tags">
                      <span className="fc-tag accent">{fav.serviceCategoryName}</span>
                      <span className="fc-tag">자본금 {formatCapitalRange(fav.initialCapital)}</span>
                    </div>
                    <div className="fc-foot">
                      <button
                        className="btn-view-report"
                        onClick={() => {
                          const { budgetMin, budgetMax } = decodeCapital(fav.initialCapital);
                          navigate('/analysis', {
                            state: {
                              adminDongCode: fav.adminDongCode,
                              serviceCategoryName: fav.serviceCategoryName,
                              budgetMin,
                              budgetMax,
                            },
                          });
                        }}
                      >
                        상세 리포트 보기
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 내가 쓴 글 */}
        {activeTab === 'posts' && (
          <section className="tab-section">
            <h3 className="section-title">
              내가 쓴 글
              {postsData && <span className="section-count">총 {postsData.totalCount}건</span>}
            </h3>
            <div className="box-card" style={{ padding: '24px 32px' }}>
              {postsLoading ? (
                <div className="mp-loading">불러오는 중...</div>
              ) : !postsData || postsData.posts.length === 0 ? (
                <div className="mp-empty">작성한 글이 없습니다.</div>
              ) : (
                <>
                  <div className="post-list">
                    {postsData.posts.map(post => (
                      <div
                        key={post.postIdx}
                        className="post-item"
                        onClick={() => navigate(`/community/${post.postIdx}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="post-title">
                          {post.title}
                          <span className="post-comments">[{post.commentCount}]</span>
                        </div>
                        <div className="post-preview">{post.contents}</div>
                        <div className="post-meta">
                          <div className="meta-item">
                            <svg viewBox="0 0 24 24">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            {post.views}
                          </div>
                          <div className="meta-item">{formatDate(post.createdAt)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {postsData.totalPages > 1 && (
                    <div className="pagination">
                      <button className="page-btn" disabled={postsPage <= 1} onClick={() => setPostsPage(p => p - 1)}>이전</button>
                      <span className="page-info">{postsPage} / {postsData.totalPages}</span>
                      <button className="page-btn" disabled={postsPage >= postsData.totalPages} onClick={() => setPostsPage(p => p + 1)}>다음</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        )}

        {/* 내가 쓴 댓글 */}
        {activeTab === 'comments' && (
          <section className="tab-section">
            <h3 className="section-title">
              내가 쓴 댓글
              {commentsData && <span className="section-count">총 {commentsData.totalCount}건</span>}
            </h3>
            <div className="box-card" style={{ padding: '24px 32px' }}>
              {commentsLoading ? (
                <div className="mp-loading">불러오는 중...</div>
              ) : !commentsData || commentsData.comments.length === 0 ? (
                <div className="mp-empty">작성한 댓글이 없습니다.</div>
              ) : (
                <>
                  <div className="post-list">
                    {commentsData.comments.map(comment => (
                      <div
                        key={comment.commentIdx}
                        className="post-item"
                        onClick={() => navigate(`/community/${comment.postIdx}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="post-title" style={{ color: 'var(--text3)', fontSize: '14px', fontWeight: '500' }}>
                          원문: {comment.postTitle}
                        </div>
                        <div className="post-preview" style={{ color: 'var(--text)', fontWeight: '600', fontSize: '15px' }}>
                          {comment.contents}
                        </div>
                        <div className="post-meta">
                          <div className="meta-item">{formatDate(comment.createdAt)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {commentsData.totalPages > 1 && (
                    <div className="pagination">
                      <button className="page-btn" disabled={commentsPage <= 1} onClick={() => setCommentsPage(p => p - 1)}>이전</button>
                      <span className="page-info">{commentsPage} / {commentsData.totalPages}</span>
                      <button className="page-btn" disabled={commentsPage >= commentsData.totalPages} onClick={() => setCommentsPage(p => p + 1)}>다음</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        )}
      </main>

      {/* ── 회원 탈퇴 모달 ── */}
      {showWithdraw && (
        <div className="mp-modal-overlay" onClick={closeWithdrawModal}>
          <div className="mp-modal" onClick={e => e.stopPropagation()}>
            <h3 className="mp-modal-title">회원 탈퇴</h3>
            <p className="mp-modal-desc">
              탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.<br />
              확인을 위해 비밀번호를 입력해주세요.
            </p>
            <input
              type="password"
              className="form-input"
              placeholder="비밀번호 입력"
              value={withdrawPwd}
              onChange={e => setWithdrawPwd(e.target.value)}
              style={{ width: '100%', maxWidth: '100%', marginBottom: '12px' }}
            />
            {withdrawError && <p className="mp-form-error">{withdrawError}</p>}
            <div className="mp-modal-actions">
              <button className="btn-outline" onClick={closeWithdrawModal}>취소</button>
              <button className="btn-danger" onClick={handleWithdraw} disabled={withdrawLoading}>
                {withdrawLoading ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
