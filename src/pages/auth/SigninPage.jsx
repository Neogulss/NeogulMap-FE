import { useEffect } from 'react';
import '../../styles/auth.css';
import MainNav from '../../components/main/MainNav';
import AuthHero from '../../components/auth/AuthHero';
import AuthFooter from '../../components/auth/AuthFooter';
import LoginForm from '../../components/auth/LoginForm';

export default function SigninPage() {
  useEffect(() => {
    document.body.classList.add('auth-active');
    document.getElementById('root')?.classList.add('auth-fullwidth');
    return () => {
      document.body.classList.remove('auth-active');
      document.getElementById('root')?.classList.remove('auth-fullwidth');
    };
  }, []);

  return (
    <div className="auth-page">
      <MainNav />
      <div style={{ paddingTop: '64px' }}>
        <AuthHero />
        <div className="auth-wrap">
          <div className="auth-container">
            <LoginForm />
          </div>
        </div>
      </div>
      <AuthFooter />
    </div>
  );
}
