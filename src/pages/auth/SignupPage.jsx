import { useEffect } from 'react';
import '../../styles/main.css';
import '../../styles/auth.css';
import Header from '../../components/layouts/Header';
import AuthHero from '../../components/auth/AuthHero';
import SignupForm from '../../components/auth/SignupForm';
import Footer from '../../components/layouts/Footer';

export default function SignupPage() {
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
            <SignupForm />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
