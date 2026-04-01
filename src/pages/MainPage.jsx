import { useEffect } from 'react';
import '../styles/main.css';
import MainNav from '../components/main/MainNav';
import HeroSection from '../components/main/HeroSection';
import DashboardSection from '../components/main/DashboardSection';
import MarqueeSection from '../components/main/MarqueeSection';
import MainFooter from '../components/main/MainFooter';

export default function MainPage() {
    useEffect(() => {
        document.documentElement.classList.add('main-html');
        document.body.classList.add('main-active');
        const root = document.getElementById('root');
        if (root) root.classList.add('main-fullwidth');

        return () => {
            document.documentElement.classList.remove('main-html');
            document.body.classList.remove('main-active');
            if (root) root.classList.remove('main-fullwidth');
        };
    }, []);

    return (
        <div className="main-page">
            <MainNav />
            <HeroSection />
            <DashboardSection />
            <MarqueeSection />
            <MainFooter />
        </div>
    );
}
