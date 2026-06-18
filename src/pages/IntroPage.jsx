// src/pages/IntroPage.jsx
// LUSH LIFE — Ultra-Cinematic Director's Cut Landing Page
// Three.js + GSAP + Custom Cursor + Particle Trail + Booking Panel

import React, {
  useRef, useEffect, useState, useCallback, useMemo,
} from 'react';
import { Canvas } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroScene, { heroScroll } from '../components/lush/HeroCanvas.jsx';
import '../styles/lush-life.css';

gsap.registerPlugin(ScrollTrigger);

// ── CONSTANTS ──────────────────────────────────────────────────
const SERVICES = [
  { num: '01', icon: '✂️', title: 'Precision Blade Work', desc: 'Architectural cuts that redefine your silhouette with surgical exactitude.', price: '₹1,500+', delay: '0s' },
  { num: '02', icon: '🎨', title: 'Chromatic Override', desc: 'Chemical color alteration. Your hair becomes a living canvas.', price: '₹4,000+', delay: '0.4s' },
  { num: '03', icon: '👁️', title: 'Lash Architecture', desc: 'Precision lash work that transforms your entire face geometry.', price: '₹2,200+', delay: '0.8s' },
  { num: '04', icon: '💎', title: 'Skin Alchemy', desc: 'Deep facial regeneration. Science meets ritual.', price: '₹3,000+', delay: '0.2s' },
  { num: '05', icon: '⚡', title: 'Brow Engineering', desc: 'Millimeter-perfect brow sculpting using precision instruments.', price: '₹1,200+', delay: '0.6s' },
  { num: '06', icon: '👑', title: 'The Full Transformation', desc: 'All six disciplines in one radical session. You enter. Something else leaves.', price: '₹12,000+', delay: '1s' },
];

const TESTIMONIALS = [
  { initials: 'AK', name: 'Anaya K.', rating: 5, quote: 'I walked in uncertain. I left unstoppable. The chromatic override session completely changed how I see myself.' },
  { initials: 'PR', name: 'Priya R.', rating: 5, quote: 'The precision blade work is unlike anything I\'ve experienced. It\'s art. Pure sculptural art.' },
  { initials: 'MS', name: 'Maya S.', rating: 5, quote: 'Lush Life doesn\'t do beauty appointments. They do transformations. My skin alchemy session was transcendent.' },
  { initials: 'ZA', name: 'Zara A.', rating: 5, quote: 'The Full Transformation package is worth every rupee. Six hours of complete reinvention.' },
  { initials: 'NK', name: 'Nisha K.', rating: 5, quote: 'Their lash architecture is next level. I\'ve never had compliments like this before.' },
  { initials: 'RM', name: 'Riya M.', rating: 5, quote: 'Brow engineering sounds clinical. The result is anything but. Absolute precision, maximum impact.' },
  { initials: 'SJ', name: 'Sara J.', rating: 5, quote: 'The atmosphere alone is worth it. But the results? They follow you everywhere.' },
  { initials: 'VL', name: 'Veda L.', rating: 5, quote: 'I\'ve been to luxury salons worldwide. Lush Life operates on a completely different level of intention.' },
];

const GALLERY_ITEMS = [
  { height: 320, service: 'Chromatic Override', client: 'A.K.', color1: '#1a0a2e', color2: '#4B0082' },
  { height: 240, service: 'Precision Blade Work', client: 'M.S.', color1: '#0a0a1a', color2: '#1a1a3e' },
  { height: 380, service: 'Lash Architecture', client: 'P.R.', color1: '#1a0818', color2: '#3D0033' },
  { height: 280, service: 'Skin Alchemy', client: 'Z.A.', color1: '#0a1a1a', color2: '#003340' },
  { height: 360, service: 'The Full Transformation', client: 'N.K.', color1: '#0f0a1a', color2: '#2D0050' },
  { height: 220, service: 'Brow Engineering', client: 'R.M.', color1: '#1a0a0a', color2: '#400010' },
  { height: 300, service: 'Chromatic Override', client: 'S.J.', color1: '#0a1400', color2: '#1a3300' },
  { height: 260, service: 'Precision Blade Work', client: 'V.L.', color1: '#14000a', color2: '#380020' },
  { height: 340, service: 'Lash Architecture', client: 'A.P.', color1: '#000a14', color2: '#001838' },
];

const BOOKING_SERVICES = [
  { label: 'Precision Blade Work', price: '₹1,500+' },
  { label: 'Chromatic Override', price: '₹4,000+' },
  { label: 'Lash Architecture', price: '₹2,200+' },
  { label: 'Skin Alchemy', price: '₹3,000+' },
  { label: 'Brow Engineering', price: '₹1,200+' },
  { label: 'The Full Transformation', price: '₹12,000+' },
];

const NAV_LINKS = ['STUDIO', 'SERVICES', 'GALLERY', 'TRANSFORMATIONS', 'JOURNAL'];

// ── CURSOR PARTICLE TRAIL ─────────────────────────────────────
function useParticleTrail(canvasRef) {
  const particles = useRef([]);
  const mouse = useRef({ x: -999, y: -999 });
  const rafRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      // Emit 3 particles
      for (let k = 0; k < 3; k++) {
        particles.current.push({
          x: e.clientX + (Math.random() - 0.5) * 4,
          y: e.clientY + (Math.random() - 0.5) * 4,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -1.5 - Math.random() * 1.5,
          life: 1,
          size: 1.5 + Math.random() * 1.5,
          color: `rgba(0,207,255,`,
        });
      }
    };
    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current = particles.current.filter(p => p.life > 0);
      particles.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // slight gravity upward correction
        p.life -= 0.018;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.life.toFixed(2)})`;
        ctx.fill();
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [canvasRef]);
}

// ── CTA GALAXY PARTICLES ──────────────────────────────────────
function useCTAParticles(canvasRef, active) {
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const COUNT = 1200;
    const pts = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 1000,
      speed: 0.1 + Math.random() * 0.4,
      size: 0.5 + Math.random() * 1.5,
    }));

    let raf;
    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      pts.forEach(p => {
        p.z -= p.speed;
        if (p.z <= 0) {
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
          p.z = 1000;
        }
        const sx = (p.x - cx) * (500 / p.z) + cx;
        const sy = (p.y - cy) * (500 / p.z) + cy;
        const r = p.size * (500 / p.z);
        const alpha = (1 - p.z / 1000) * 0.6;
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(0.1, r), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,207,255,${alpha.toFixed(2)})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [canvasRef, active]);
}

// ── AMBIENT DOTS (testimonials) ───────────────────────────────
function AmbientDots() {
  const dots = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      animDuration: `${8 + Math.random() * 15}s`,
      animDelay: `${Math.random() * 10}s`,
      size: 1 + Math.random() * 1,
    })), []
  );
  return (
    <div className="ll-ambient-wrap" aria-hidden>
      {dots.map((d, i) => (
        <span
          key={i}
          className="ll-ambient-dot"
          style={{
            left: d.left,
            bottom: 0,
            animationDuration: d.animDuration,
            animationDelay: d.animDelay,
            width: `${d.size}px`,
            height: `${d.size}px`,
          }}
        />
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  MAIN PAGE COMPONENT
// ════════════════════════════════════════════════════════════════
export default function IntroPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Refs
  const trailCanvasRef = useRef(null);
  const ctaCanvasRef = useRef(null);
  const cursorOuterRef = useRef(null);
  const cursorDotRef = useRef(null);
  const cursorDotPos = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ nx: 0, ny: 0 }); // normalized for Three.js
  const heroSpacerRef = useRef(null);
  const scrollFillRef = useRef(null);
  const scrollPctRef = useRef(null);
  const scrollSectionRef = useRef(null);
  const scrollShockwaveContainer = useRef(null);
  const heroLettersRef = useRef([]);
  const heroEyebrowRef = useRef(null);
  const heroSubRef = useRef(null);
  const heroScrollHintRef = useRef(null);
  const mobileMenuOpen = useRef(false);

  // State
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelStep, setPanelStep] = useState(1); // 1,2,3
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [shockwaveVisible, setShockwaveVisible] = useState(false);
  const [ctaSectionVisible, setCtaSectionVisible] = useState(false);
  const [mobileMenuState, setMobileMenuState] = useState(false);

  // Cursor hover label
  const [cursorLabel, setCursorLabel] = useState('');
  const [cursorHovering, setCursorHovering] = useState(false);

  // Redirect if logged in
  useEffect(() => {
    if (user) navigate('/search', { replace: true });
  }, [user, navigate]);

  // ── PARTICLE TRAIL ────────────────────────────────────────
  useParticleTrail(trailCanvasRef);
  useCTAParticles(ctaCanvasRef, ctaSectionVisible);

  // ── CUSTOM CURSOR ─────────────────────────────────────────
  useEffect(() => {
    const outer = cursorOuterRef.current;
    const dot = cursorDotRef.current;
    if (!outer || !dot) return;

    let outerX = 0, outerY = 0;
    let dotX = 0, dotY = 0;
    let raf;

    const onMouseMove = (e) => {
      outerX = e.clientX;
      outerY = e.clientY;
      mouseRef.current = {
        nx: (e.clientX / window.innerWidth) * 2 - 1,
        ny: -((e.clientY / window.innerHeight) * 2 - 1),
      };
    };

    const animate = () => {
      // Outer follows instantly
      gsap.set(outer, { x: outerX, y: outerY });
      // Dot trails with spring
      dotX += (outerX - dotX) * 0.18;
      dotY += (outerY - dotY) * 0.18;
      gsap.set(dot, { x: dotX, y: dotY });
      raf = requestAnimationFrame(animate);
    };
    animate();
    window.addEventListener('mousemove', onMouseMove);

    // Hover detection for interactive elements
    const interactiveEls = document.querySelectorAll(
      '.ll-nav-cta, .ll-shatter-btn, .ll-service-card, .ll-gallery-item, .ll-nav-link, .ll-panel-close, button, a'
    );
    const onEnter = (e) => {
      const el = e.currentTarget;
      setCursorHovering(true);
      const label = el.dataset.cursorLabel || '';
      setCursorLabel(label);
    };
    const onLeave = () => {
      setCursorHovering(false);
      setCursorLabel('');
    };
    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouseMove);
      interactiveEls.forEach(el => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
    };
  }, []);

  // ── SCROLL LISTENER ───────────────────────────────────────
  useEffect(() => {
    const SECTIONS = ['HERO', 'SERVICES', 'GALLERY', 'BOOK'];
    const sectionEls = [
      document.querySelector('.ll-hero-spacer'),
      document.querySelector('.ll-services'),
      document.querySelector('.ll-gallery'),
      document.querySelector('.ll-booking-cta'),
    ];

    const onScroll = () => {
      const sy = window.scrollY;
      heroScroll.y = sy;

      // Update scroll indicator
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? (sy / total) : 0;
      if (scrollFillRef.current) {
        scrollFillRef.current.style.height = `${pct * 100}%`;
      }
      if (scrollPctRef.current) {
        scrollPctRef.current.textContent = `${Math.round(pct * 100)}%`;
      }
      // Current section name
      let currentSection = 'HERO';
      sectionEls.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.5) currentSection = SECTIONS[i];
      });
      if (scrollSectionRef.current) scrollSectionRef.current.textContent = currentSection;

      // CTA canvas activation
      const ctaEl = document.querySelector('.ll-booking-cta');
      if (ctaEl) {
        const rect = ctaEl.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8 && !ctaSectionVisible) {
          setCtaSectionVisible(true);
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [ctaSectionVisible]);

  // ── GSAP HERO HEADLINE ASSEMBLY ───────────────────────────
  useEffect(() => {
    const letters = heroLettersRef.current.filter(Boolean);
    if (!letters.length) return;

    // Scatter positions
    const scatterX = letters.map(() => (Math.random() - 0.5) * 300);
    const scatterY = letters.map(() => (Math.random() - 0.5) * 200);
    const scatterRot = letters.map(() => (Math.random() - 0.5) * 40);

    gsap.set(letters, (i) => ({
      opacity: 0,
      x: scatterX[i],
      y: scatterY[i],
      rotation: scatterRot[i],
      scale: 0.6,
    }));

    if (heroEyebrowRef.current) gsap.set(heroEyebrowRef.current, { opacity: 0, y: 20 });
    if (heroSubRef.current) gsap.set(heroSubRef.current, { opacity: 0, y: 30 });

    // Trigger: headline assembles as the hero scroll reaches ~70%
    const heroSpacer = heroSpacerRef.current;
    if (!heroSpacer) return;

    ScrollTrigger.create({
      trigger: heroSpacer,
      start: 'top top',
      end: 'bottom top',
      scrub: false,
      onUpdate: (self) => {
        const p = self.progress;
        // Phase 3: 70%-100% = headline assembles
        if (p >= 0.55) {
          const phaseProgress = Math.min((p - 0.55) / 0.45, 1);

          letters.forEach((letter, i) => {
            const letterDelay = i * 0.07;
            const lp = Math.max(0, Math.min(1, (phaseProgress - letterDelay * 0.4) / 0.6));
            const eased = lp < 0.5 ? 4 * lp * lp * lp : 1 - Math.pow(-2 * lp + 2, 3) / 2;

            gsap.set(letter, {
              opacity: eased,
              x: scatterX[i] * (1 - eased),
              y: scatterY[i] * (1 - eased),
              rotation: scatterRot[i] * (1 - eased),
              scale: 0.6 + 0.4 * eased,
            });
          });

          // Eyebrow + sub appear at 85%+
          if (p >= 0.8) {
            const sp = Math.min((p - 0.8) / 0.2, 1);
            if (heroEyebrowRef.current) {
              gsap.set(heroEyebrowRef.current, { opacity: sp, y: 20 * (1 - sp) });
            }
            if (heroSubRef.current) {
              gsap.set(heroSubRef.current, { opacity: sp * 0.7, y: 30 * (1 - sp) });
            }
          }

          // Shockwave at ~95%
          if (p >= 0.92 && !shockwaveVisible) {
            setShockwaveVisible(true);
            setTimeout(() => setShockwaveVisible(false), 800);
          }
        }
      },
    });

    // On page load: fade in eyebrow after 1s
    setTimeout(() => {
      if (heroEyebrowRef.current) {
        gsap.to(heroEyebrowRef.current, { opacity: 0.6, y: 0, duration: 0.8, ease: 'power2.out' });
      }
    }, 1200);

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  // ── SERVICES CARD OBSERVER ────────────────────────────────
  useEffect(() => {
    const cards = document.querySelectorAll('.ll-service-card');
    if (!cards.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const delay = parseFloat(card.dataset.delay || 0);
          setTimeout(() => card.classList.add('visible'), delay * 1000);
          obs.unobserve(card);
        }
      });
    }, { threshold: 0.15 });

    cards.forEach(c => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  // ── BOOKING PANEL OPEN/CLOSE ──────────────────────────────
  const openPanel = useCallback(() => {
    setPanelOpen(true);
    setPanelStep(1);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    document.body.style.overflow = 'hidden';
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    document.body.style.overflow = '';
  }, []);

  const nextStep = useCallback(() => {
    setPanelStep(s => Math.min(s + 1, 3));
  }, []);

  const prevStep = useCallback(() => {
    setPanelStep(s => Math.max(s - 1, 1));
  }, []);

  // ── DATE GRID DATA ────────────────────────────────────────
  const dateGridData = useMemo(() => {
    const today = new Date();
    const days = [];
    for (let i = 0; i < 28; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push({
        date: d.getDate(),
        available: i > 0 && Math.random() > 0.35,
        isoStr: d.toISOString().split('T')[0],
      });
    }
    return days;
  }, []);

  const timeSlots = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00'];

  // ── MOBILE MENU ────────────────────────────────────────────
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuState(s => !s);
  }, []);

  // ── HERO LETTERS ──────────────────────────────────────────
  const heroWord = 'LUSH LIFE';
  const heroLetters = heroWord.split('').map((ch, i) => (
    <span
      key={i}
      ref={el => { heroLettersRef.current[i] = el; }}
      className={`ll-hero-letter${ch === ' ' ? ' space' : ''}`}
      aria-hidden={ch === ' '}
    >
      {ch === ' ' ? '\u00A0' : ch}
    </span>
  ));

  // ════════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div className="ll-root" role="main">

      {/* ── CURSOR ─────────────────────────────────────────── */}
      <div
        ref={cursorOuterRef}
        className={`ll-cursor-outer${cursorHovering ? ' hovering' : ''}`}
        aria-hidden="true"
      >
        <span className="ll-cursor-label" aria-hidden="true">{cursorLabel}</span>
      </div>
      <div ref={cursorDotRef} className="ll-cursor-dot" aria-hidden="true" />
      <canvas ref={trailCanvasRef} id="ll-trail-canvas" aria-hidden="true" />

      {/* ── THREE.JS CANVAS (Fixed) ─────────────────────────── */}
      <div className="ll-canvas-wrap" aria-hidden="true">
        <Canvas
          camera={{ position: [0, 1.5, 10], fov: 65, near: 0.1, far: 200 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ background: '#000000' }}
          shadows
        >
          <HeroScene mouseRef={mouseRef} />
        </Canvas>
      </div>

      {/* ── NAVIGATION (Fixed) ─────────────────────────────── */}
      <nav className="ll-nav" role="navigation" aria-label="Main navigation">
        <a href="/" className="ll-nav-logo" aria-label="Lush Life home">
          <span className="ll-monogram" aria-hidden="true">
            <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="6" y1="6" x2="22" y2="22" stroke="#00CFFF" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="22" y1="6" x2="6" y2="22" stroke="#5B5FFF" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="11" y="4" width="6" height="2" rx="1" fill="#00CFFF" opacity="0.7" />
              <rect x="11" y="22" width="6" height="2" rx="1" fill="#5B5FFF" opacity="0.7" />
            </svg>
          </span>
          <span className="ll-wordmark">LUSH LIFE</span>
        </a>

        <ul className="ll-nav-links" role="list">
          {NAV_LINKS.map(link => (
            <li key={link}>
              <a href={`#${link.toLowerCase()}`} className="ll-nav-link" data-cursor-label={link.slice(0,4)}>
                {link}
              </a>
            </li>
          ))}
        </ul>

        <button
          className="ll-nav-cta"
          onClick={openPanel}
          aria-label="Book your appointment"
          data-cursor-label="BOOK"
        >
          BOOK YOUR REVOLUTION <span className="ll-cta-arrow" aria-hidden="true">↗</span>
        </button>

        <button
          className={`ll-hamburger${mobileMenuState ? ' open' : ''}`}
          onClick={toggleMobileMenu}
          aria-label={mobileMenuState ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuState}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </nav>

      {/* ── SCROLL DEPTH INDICATOR ─────────────────────────── */}
      <div className="ll-scroll-indicator" aria-hidden="true">
        <span ref={scrollSectionRef} className="ll-scroll-section-name">HERO</span>
        <div className="ll-scroll-track">
          <div ref={scrollFillRef} className="ll-scroll-fill" style={{ height: '0%' }} />
        </div>
        <span ref={scrollPctRef} className="ll-scroll-pct">0%</span>
      </div>

      {/* ── SCROLLABLE CONTENT ─────────────────────────────── */}
      <div className="ll-scroll-content">

        {/* HERO SPACER (200vh) — canvas animates within this space */}
        <div ref={heroSpacerRef} className="ll-hero-spacer" id="hero" aria-label="Hero section">
          <div className="ll-hero-overlay" role="presentation">
            {/* Eyebrow */}
            <p
              ref={heroEyebrowRef}
              className="ll-hero-eyebrow"
              aria-label="Cinematic salon experience"
            >
              ✦ PRECISION · RITUAL · REVOLUTION ✦
            </p>

            {/* Kinetic Headline */}
            <div className="ll-headline-wrap" aria-label="Lush Life">
              {heroLetters}
            </div>

            {/* Shockwave */}
            {shockwaveVisible && (
              <div className="ll-shockwave" aria-hidden="true" />
            )}

            {/* Sub-headline */}
            <p ref={heroSubRef} className="ll-hero-sub">
              A sensory ambush. Step into a high-budget fragrance commercial shot in zero gravity.
            </p>

            {/* Scroll hint */}
            <div ref={heroScrollHintRef} className="ll-hero-scroll-hint" aria-hidden="true">
              <div className="ll-scroll-hint-line" />
              <span className="ll-scroll-hint-text">SCROLL TO IGNITE</span>
            </div>
          </div>
        </div>

        {/* ════ SERVICES SECTION ═══════════════════════════════ */}
        <section className="ll-services" id="services" aria-labelledby="services-heading">
          <div className="ll-section-header">
            <p className="ll-eyebrow">✦ THE OFFER VOID ✦</p>
            <h2 id="services-heading" className="ll-section-title">WHAT WE DO</h2>
          </div>

          <div className="ll-services-grid">
            {SERVICES.map((s, i) => (
              <article
                key={s.num}
                className="ll-service-card"
                data-delay={parseFloat(s.delay)}
                style={{ transitionDelay: s.delay, transitionDuration: '0.7s', transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
                aria-label={s.title}
              >
                <div className="ll-card-visual" aria-hidden="true">
                  <div
                    className="ll-card-visual-icon"
                    style={{ '--icon-delay': `${i * 0.3}s` }}
                  >
                    {s.icon}
                  </div>
                  <div className="ll-card-neon-line" />
                </div>
                <div className="ll-card-content">
                  <span className="ll-card-num">{s.num} —</span>
                  <h3 className="ll-card-title">{s.title}</h3>
                  <p className="ll-card-desc">{s.desc}</p>
                  <div className="ll-card-footer">
                    <span className="ll-card-price">{s.price}</span>
                    <button
                      className="ll-card-cta"
                      onClick={openPanel}
                      data-cursor-label="BOOK"
                      aria-label={`Discover ${s.title}`}
                    >
                      DISCOVER <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ════ TESTIMONIALS (ECHO CHAMBER) ════════════════════ */}
        <section className="ll-testimonials" aria-labelledby="testimonials-heading" id="studio">
          <div className="ll-section-header" style={{ padding: '0 48px 60px', textAlign: 'center' }}>
            <p className="ll-eyebrow">✦ THE ECHO CHAMBER ✦</p>
            <h2 id="testimonials-heading" className="ll-section-title">THEY SAID IT.</h2>
          </div>
          <AmbientDots />
          <div className="ll-ticker-wrap" aria-label="Client testimonials">
            {/* Row 1 — forward */}
            <div className="ll-ticker-row fwd" aria-hidden="true">
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                <article key={`f${i}`} className="ll-tcard">
                  <div className="ll-tcard-top">
                    <div className="ll-avatar" aria-hidden="true">
                      <div className="ll-avatar-initials">{t.initials}</div>
                    </div>
                    <div className="ll-tcard-meta">
                      <p className="ll-tcard-name">{t.name}</p>
                      <div className="ll-tcard-dots" aria-label={`${t.rating} stars`}>
                        {Array.from({ length: t.rating }, (_, k) => (
                          <span key={k} className="ll-tcard-dot" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="ll-tcard-quote">"{t.quote}"</p>
                </article>
              ))}
            </div>
            {/* Row 2 — reverse */}
            <div className="ll-ticker-row rev" aria-hidden="true">
              {[...TESTIMONIALS.slice().reverse(), ...TESTIMONIALS.slice().reverse()].map((t, i) => (
                <article key={`r${i}`} className="ll-tcard">
                  <div className="ll-tcard-top">
                    <div className="ll-avatar" aria-hidden="true">
                      <div className="ll-avatar-initials">{t.initials}</div>
                    </div>
                    <div className="ll-tcard-meta">
                      <p className="ll-tcard-name">{t.name}</p>
                      <div className="ll-tcard-dots" aria-label={`${t.rating} stars`}>
                        {Array.from({ length: t.rating }, (_, k) => (
                          <span key={k} className="ll-tcard-dot" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="ll-tcard-quote">"{t.quote}"</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ════ GALLERY (TRANSFORMATION VAULT) ════════════════ */}
        <section className="ll-gallery" id="gallery" aria-labelledby="gallery-heading">
          <div className="ll-section-header" style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p className="ll-eyebrow">✦ THE TRANSFORMATION VAULT ✦</p>
            <h2 id="gallery-heading" className="ll-section-title">THE EVIDENCE</h2>
          </div>
          <div className="ll-masonry" role="list">
            {GALLERY_ITEMS.map((item, i) => (
              <div
                key={i}
                className="ll-gallery-item"
                role="listitem"
                tabIndex={0}
                aria-label={`${item.service} transformation — client ${item.client}`}
                data-cursor-label="VIEW"
              >
                {/* CSS gradient as image placeholder */}
                <div
                  className="ll-gallery-img"
                  style={{
                    height: `${item.height}px`,
                    background: `linear-gradient(135deg, ${item.color1} 0%, ${item.color2} 60%, #0A0A0D 100%)`,
                    position: 'relative',
                  }}
                  aria-hidden="true"
                >
                  {/* Inner glow effect */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(ellipse at 50% 70%, rgba(0,207,255,0.06) 0%, transparent 70%)`,
                  }} />
                  {/* Service number */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%,-50%)',
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: `${item.height * 0.18}px`,
                    color: 'rgba(255,255,255,0.04)',
                    letterSpacing: '0.1em',
                    userSelect: 'none',
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                </div>
                <div className="ll-gallery-badge" aria-hidden="true">
                  <div className="ll-gallery-badge-label">{item.client}</div>
                  <div className="ll-gallery-badge-service">{item.service}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════ BOOKING CTA (REVOLUTION GATE) ════════════════ */}
        <section className="ll-booking-cta" id="book" aria-labelledby="cta-heading">
          <canvas ref={ctaCanvasRef} id="ll-cta-canvas" aria-hidden="true" />
          <div className="ll-booking-inner">
            <h2 id="cta-heading" className="ll-booking-headline">
              SHATTER THE<br />STANDARD.
            </h2>
            <p className="ll-booking-sub">
              Your most radical transformation starts with one decision.
            </p>
            <button
              className="ll-shatter-btn"
              onClick={openPanel}
              aria-label="Book your transformation"
              data-cursor-label="BOOK"
            >
              <span>BOOK YOUR REVOLUTION</span>
            </button>
          </div>
        </section>

        {/* ════ FOOTER ════════════════════════════════════════ */}
        <footer className="ll-footer" aria-label="Site footer">
          <div className="ll-footer-brand">
            <div className="ll-footer-logo">LUSH LIFE</div>
            <p className="ll-footer-tagline">
              Unapologetically bold. Gender-fluid. Cinematic brutalism meets material luxury.
            </p>
          </div>
          <div>
            <p className="ll-footer-col-title">Navigate</p>
            <nav className="ll-footer-links" aria-label="Footer navigation">
              {NAV_LINKS.map(link => (
                <a key={link} href={`#${link.toLowerCase()}`} className="ll-footer-link">{link}</a>
              ))}
            </nav>
          </div>
          <div>
            <p className="ll-footer-col-title">Contact</p>
            <div className="ll-footer-links">
              <span className="ll-footer-link">Banjara Hills, Hyderabad</span>
              <span className="ll-footer-link">+91 98765 43210</span>
              <span className="ll-footer-link">hello@lushlife.in</span>
            </div>
          </div>
        </footer>
        <div className="ll-footer-bottom">
          <span className="ll-footer-copy">© 2026 LUSH LIFE. ALL RIGHTS RESERVED.</span>
          <span className="ll-footer-neon">SHATTER THE STANDARD ✦</span>
        </div>

      </div>{/* end .ll-scroll-content */}

      {/* ════ BOOKING PANEL ══════════════════════════════════ */}
      <div
        className={`ll-panel-backdrop${panelOpen ? ' open' : ''}`}
        onClick={closePanel}
        aria-hidden={!panelOpen}
      />

      <div
        className={`ll-booking-panel${panelOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Book your appointment"
        aria-hidden={!panelOpen}
      >
        <div className="ll-panel-scroll">
          {/* Header */}
          <div className="ll-panel-header">
            <h2 className="ll-panel-title">YOUR REVOLUTION</h2>
            <button
              className="ll-panel-close"
              onClick={closePanel}
              aria-label="Close booking panel"
            >
              ✕
            </button>
          </div>

          {/* Step indicator */}
          <div className="ll-step-bar" role="progressbar" aria-valuenow={panelStep} aria-valuemin={1} aria-valuemax={3} aria-label={`Step ${panelStep} of 3`}>
            {[1, 2, 3].map(s => (
              <div key={s} className={`ll-step-seg${panelStep >= s ? ' active' : ''}`} />
            ))}
          </div>

          {/* Step 1: Service Selection */}
          <div className={`ll-step-content${panelStep === 1 ? ' active' : ''}`} role="region" aria-label="Step 1: Select your service">
            <h3 className="ll-step-heading">Select Your Service</h3>
            <div className="ll-srv-options" role="group" aria-label="Service options">
              {BOOKING_SERVICES.map((srv, i) => (
                <button
                  key={i}
                  className={`ll-srv-option${selectedService === i ? ' sel' : ''}`}
                  onClick={() => setSelectedService(i)}
                  aria-pressed={selectedService === i}
                  aria-label={`${srv.label}, ${srv.price}`}
                >
                  <span>{srv.label}</span>
                  <span className="ll-srv-price">{srv.price}</span>
                </button>
              ))}
            </div>
            <div className="ll-panel-nav">
              <button
                className="ll-panel-next"
                onClick={nextStep}
                disabled={selectedService === null}
                style={{ opacity: selectedService === null ? 0.4 : 1 }}
                aria-label="Continue to date selection"
              >
                SELECT DATE →
              </button>
            </div>
          </div>

          {/* Step 2: Date & Time */}
          <div className={`ll-step-content${panelStep === 2 ? ' active' : ''}`} role="region" aria-label="Step 2: Choose date and time">
            <h3 className="ll-step-heading">Choose Your Moment</h3>

            {/* Month label */}
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'rgba(0,207,255,0.5)', letterSpacing: '0.15em', marginBottom: '12px' }}>
              JULY 2026
            </p>

            {/* Day headers */}
            <div className="ll-date-header" aria-hidden="true">
              {['SU','MO','TU','WE','TH','FR','SA'].map(d => (
                <div key={d} className="ll-date-day-label">{d}</div>
              ))}
            </div>

            {/* Date grid */}
            <div className="ll-date-grid" role="grid" aria-label="Date selector">
              {/* First day offset (July 2026 starts on Wednesday) */}
              {[0,1,2].map(i => <div key={`e${i}`} className="ll-date-cell" aria-hidden="true" />)}
              {dateGridData.map((d, i) => (
                <button
                  key={i}
                  className={`ll-date-cell${d.available ? ' avail' : ''}${selectedDate === d.isoStr ? ' sel' : ''}`}
                  onClick={() => d.available && setSelectedDate(d.isoStr)}
                  disabled={!d.available}
                  aria-label={d.available ? `${d.date} July, available` : `${d.date} July, unavailable`}
                  aria-pressed={selectedDate === d.isoStr}
                >
                  {d.date}
                </button>
              ))}
            </div>

            {/* Time slots */}
            {selectedDate && (
              <>
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: 'rgba(0,207,255,0.45)', letterSpacing: '0.2em', margin: '16px 0 10px' }}>
                  AVAILABLE TIMES
                </p>
                <div className="ll-time-slots" role="group" aria-label="Time slot options">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      className={`ll-time-slot${selectedTime === slot ? ' sel' : ''}`}
                      onClick={() => setSelectedTime(slot)}
                      aria-pressed={selectedTime === slot}
                      aria-label={`${slot} appointment time`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="ll-panel-nav">
              <button className="ll-panel-back" onClick={prevStep} aria-label="Go back to service selection">←</button>
              <button
                className="ll-panel-next"
                onClick={nextStep}
                disabled={!selectedDate || !selectedTime}
                style={{ opacity: (!selectedDate || !selectedTime) ? 0.4 : 1 }}
                aria-label="Continue to client details"
              >
                YOUR DETAILS →
              </button>
            </div>
          </div>

          {/* Step 3: Client Details */}
          <div className={`ll-step-content${panelStep === 3 ? ' active' : ''}`} role="region" aria-label="Step 3: Enter your details">
            <h3 className="ll-step-heading">Complete Your Revolution</h3>

            {/* Booking summary */}
            <div style={{
              background: 'rgba(0,207,255,0.04)',
              border: '0.5px solid rgba(0,207,255,0.15)',
              padding: '14px 16px',
              marginBottom: '28px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '10px',
              color: 'rgba(0,207,255,0.6)',
              letterSpacing: '0.08em',
              lineHeight: '1.8',
            }}>
              <div>{selectedService !== null ? BOOKING_SERVICES[selectedService].label.toUpperCase() : '—'}</div>
              <div>{selectedDate || '—'} · {selectedTime || '—'}</div>
              <div style={{ color: '#00CFFF', marginTop: '4px' }}>
                {selectedService !== null ? BOOKING_SERVICES[selectedService].price : ''}
              </div>
            </div>

            <div className="ll-input-group">
              <label className="ll-label" htmlFor="booking-name">Full Name</label>
              <input id="booking-name" className="ll-input" type="text" placeholder="Your name" aria-required="true" autoComplete="name" />
            </div>
            <div className="ll-input-group">
              <label className="ll-label" htmlFor="booking-phone">Phone Number</label>
              <input id="booking-phone" className="ll-input" type="tel" placeholder="+91 00000 00000" aria-required="true" autoComplete="tel" />
            </div>
            <div className="ll-input-group">
              <label className="ll-label" htmlFor="booking-email">Email Address</label>
              <input id="booking-email" className="ll-input" type="email" placeholder="your@email.com" aria-required="true" autoComplete="email" />
            </div>
            <div className="ll-input-group">
              <label className="ll-label" htmlFor="booking-notes">Special Requests</label>
              <input id="booking-notes" className="ll-input" type="text" placeholder="Any preferences or notes…" />
            </div>

            <div className="ll-panel-nav" style={{ flexDirection: 'column', gap: 12 }}>
              <button
                className="ll-confirm-btn"
                onClick={() => {
                  closePanel();
                  navigate('/login');
                }}
                aria-label="Confirm your booking"
              >
                CONFIRM YOUR REVOLUTION ✦
              </button>
              <button className="ll-panel-back" onClick={prevStep} style={{ alignSelf: 'flex-start' }} aria-label="Go back">
                ← BACK
              </button>
            </div>
          </div>

        </div>{/* end .ll-panel-scroll */}
      </div>{/* end .ll-booking-panel */}

    </div>
  );
}
