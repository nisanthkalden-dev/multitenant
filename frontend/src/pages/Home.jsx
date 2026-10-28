import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import AnnouncementBanner from '../components/AnnouncementBanner/AnnouncementBanner';
import Navbar from '../components/Navbar/Navbar';
import Hero from '../components/Hero/Hero';
import TrustMetrics from '../components/TrustMetrics/TrustMetrics';
import Features from '../components/Features/Features';
import Security from '../components/Security/Security';
import Pricing from '../components/Pricing/Pricing';
import CTA from '../components/CTA/CTA';
import Footer from '../components/Footer/Footer';
import Toast from '../components/Toast/Toast';

export default function Home() {
  const { theme, toggleTheme, isLight } = useTheme();

  // Banner visibility
  const [bannerVisible, setBannerVisible] = useState(true);

  // Navbar states
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Pricing toggle state
  const [isYearly, setIsYearly] = useState(false);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, show: false };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, show: true } : t))
      );
    }, 10);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, show: false } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 250);
    }, 3200);
  }, []);

  const handleToggleTheme = () => {
    toggleTheme();
    showToast(theme === 'dark' ? 'Light mode activated' : 'Dark mode activated');
  };

  // Sticky navbar & scrollspy
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      const sections = ['home', 'features', 'security', 'pricing'];
      const scrollPos = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionId = sections[i];
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectPlan = (planName, priceVal, yearly) => {
    const cycle = yearly ? 'yearly billing (20% off)' : 'monthly billing';
    showToast(`${planName} plan selected — ₹${priceVal}/mo (${cycle})`);
  };

  return (
    <>
      <AnnouncementBanner
        isVisible={bannerVisible}
        onClose={() => setBannerVisible(false)}
      />

      <Navbar
        theme={theme}
        toggleTheme={handleToggleTheme}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        scrolled={scrolled}
        activeSection={activeSection}
      />

      <main>
        <Hero onCopyNotify={showToast} />
        <TrustMetrics />
        <Features />
        <Security />
        <Pricing
          isYearly={isYearly}
          setIsYearly={setIsYearly}
          onSelectPlan={handleSelectPlan}
        />
        <CTA />
      </main>

      <Footer />

      <Toast toasts={toasts} />
    </>
  );
}
