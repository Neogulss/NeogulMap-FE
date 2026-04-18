import { useEffect } from 'react';
import '../../styles/main.css';
import '../../styles/auth.css';
import Header from '../../components/layouts/Header';
import AuthHero from '../../components/auth/AuthHero';
import LoginForm from '../../components/auth/LoginForm';
import Footer from '../../components/layouts/Footer';

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
      <Header />
      <div className="auth-content" style={{ paddingTop: '64px' }}>
        <AuthHero />
        <div className="auth-wrap">
          <div className="auth-container">
            <LoginForm />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
