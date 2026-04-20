import { useEffect } from 'react';

export default function useScrollReveal(selector = '[data-reveal]', options = {}) {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay ?? '0';
            entry.target.style.transitionDelay = `${delay}s`;
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, ...options }
    );

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [selector]);
}
