import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const STATS = [
  { value: "40+", label: "Hospitals Registered", icon: "🏥" },
  { value: "2000+", label: "Patients Served", icon: "🫀" },
  { value: "500+", label: "Certified Doctors", icon: "👨‍⚕️" },
  { value: "98%", label: "Satisfaction Rate", icon: "⭐" },
];

const SERVICES = [
  {
    icon: "📅",
    title: "Smart Appointment Booking",
    desc: "Book doctor visits in seconds — choose your specialist, date, and hospital from one seamless interface.",
    color: "#0ea5e9",
    bg: "rgba(14,165,233,0.08)",
  },
  {
    icon: "💊",
    title: "Digital Prescriptions",
    desc: "Doctors issue prescriptions digitally, reducing errors and enabling instant pharmacy fulfilment.",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
  },
  {
    icon: "🖥️",
    title: "Telemedicine Consultations",
    desc: "Connect face-to-face with top specialists from home via secure HD video calls — anytime, anywhere.",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
  },
  {
    icon: "📋",
    title: "Health Records Hub",
    desc: "A unified, encrypted timeline of your test results, diagnoses, and prescriptions — always at hand.",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
  },
  {
    icon: "🏥",
    title: "Hospital Network",
    desc: "Access 40+ partner hospitals across the region — compare ratings, specialities, and availability instantly.",
    color: "#14b8a6",
    bg: "rgba(20,184,166,0.08)",
  },
];

const REVIEWS = [
  {
    name: "Priya Mendis",
    role: "Patient · Colombo",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    rating: 5,
    text: "MediLink changed everything for me. I booked a cardiology appointment on a Tuesday evening and had my prescription ready by Wednesday noon. Absolutely seamless.",
  },
  {
    name: "Dr. Ruwan Silva",
    role: "Cardiologist · Asiri Hospital",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face",
    rating: 5,
    text: "Managing 30+ patients a day used to be chaos. With MediLink's digital prescription system, I can focus entirely on care instead of paperwork.",
  },
  {
    name: "Kamal Perera",
    role: "Patient · Kandy",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    rating: 5,
    text: "The telemedicine feature is a lifesaver — literally. I live 3 hours from Colombo and I got a specialist consultation from my living room within an hour.",
  },
  {
    name: "Nimali Fernando",
    role: "Patient · Galle",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
    rating: 5,
    text: "The health records hub keeps everything in one place. I shared my full history with a new doctor in seconds. This is what modern healthcare should feel like.",
  },
  {
    name: "Anushka Rajapaksha",
    role: "Patient · Negombo",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face",
    rating: 5,
    text: "I was skeptical about digital healthcare at first, but MediLink exceeded all my expectations. The user-friendly interface and quick appointment booking made my entire healthcare journey stress-free.",
  },
];

const HOSPITALS = [
  { name: "Asiri Health", city: "Colombo" },
  { name: "Nawaloka", city: "Colombo" },
  { name: "Lanka Hospitals", city: "Colombo" },
  { name: "Hemas Hospital", city: "Wattala" },
  { name: "Durdans Hospital", city: "Colombo" },
  { name: "Ninewells Hospital", city: "Colombo" },
  { name: "Cinnamon Life", city: "Colombo" },
  { name: "District General", city: "Kandy" },
];

const NAV_LINKS = ["Home", "Services", "Hospitals", "Telemedicine", "About"];

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function StarRating({ count = 5 }) {
  return (
    <span style={{ color: "#f59e0b", letterSpacing: "1px", fontSize: "14px" }}>
      {"★".repeat(count)}{"☆".repeat(5 - count)}
    </span>
  );
}

function AnimatedCounter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const num = parseInt(target.replace(/\D/g, ""), 10);
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = Math.ceil(num / 60);
        const timer = setInterval(() => {
          start += step;
          if (start >= num) { setCount(num); clearInterval(timer); }
          else setCount(start);
        }, 25);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeReview, setActiveReview] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveReview(p => (p + 1) % REVIEWS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --navy: #040d21;
          --navy2: #071230;
          --blue: #0ea5e9;
          --cyan: #06b6d4;
          --mint: #10b981;
          --white: #f8faff;
          --muted: #8b9bbf;
          --card: rgba(255,255,255,0.04);
          --border: rgba(255,255,255,0.07);
          --glow: rgba(14,165,233,0.18);
          --radius: 20px;
          --font: 'Sora', sans-serif;
          --display: 'DM Serif Display', serif;
        }

        html { scroll-behavior: smooth; }

        body {
          font-family: var(--font);
          background: var(--navy);
          color: var(--white);
          overflow-x: hidden;
        }

        /* ── NAV ── */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 999;
          padding: 18px 5%;
          display: flex; align-items: center; justify-content: space-between;
          transition: all 0.35s ease;
        }
        nav.scrolled {
          background: rgba(4,13,33,0.92);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid var(--border);
          padding: 14px 5%;
        }
        .nav-logo {
          display: flex; align-items: center; gap: 10px;
          font-weight: 700; font-size: 22px; letter-spacing: -0.5px;
          text-decoration: none; color: var(--white);
        }
        .logo-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: linear-gradient(135deg, var(--blue), var(--mint));
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .logo-span { color: var(--blue); }
        .nav-links {
          display: flex; align-items: center; gap: 36px; list-style: none;
        }
        .nav-links a {
          color: var(--muted); text-decoration: none; font-size: 14px;
          font-weight: 500; transition: color 0.2s;
        }
        .nav-links a:hover { color: var(--white); }
        .nav-cta {
          background: linear-gradient(135deg, var(--blue), var(--cyan));
          color: #fff; border: none; padding: 11px 24px;
          border-radius: 50px; font-size: 14px; font-weight: 600;
          cursor: pointer; font-family: var(--font);
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 0 20px rgba(14,165,233,0.35);
        }
        .nav-cta:hover { transform: translateY(-2px); box-shadow: 0 0 30px rgba(14,165,233,0.5); }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; background: none; border: none; }
        .hamburger span { width: 24px; height: 2px; background: var(--white); border-radius: 2px; transition: 0.3s; }

        /* ── HERO ── */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column; justify-content: center;
          padding: 120px 5% 80px;
          position: relative; overflow: hidden;
        }
        .hero-bg {
          position: absolute; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 60% 60% at 70% 50%, rgba(14,165,233,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 40% 50% at 20% 80%, rgba(16,185,129,0.08) 0%, transparent 70%),
            linear-gradient(180deg, var(--navy) 0%, var(--navy2) 100%);
        }
        .hero-grid {
          position: absolute; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
        }
        .hero-content { position: relative; z-index: 1; max-width: 680px; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.25);
          border-radius: 50px; padding: 7px 16px; font-size: 12px; font-weight: 600;
          color: var(--blue); margin-bottom: 28px; letter-spacing: 0.5px;
          animation: fadeUp 0.6s ease both;
        }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--blue); animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
        .hero h1 {
          font-family: var(--display); font-size: clamp(42px, 6vw, 76px);
          line-height: 1.08; letter-spacing: -1px; margin-bottom: 24px;
          animation: fadeUp 0.7s 0.1s ease both;
        }
        .hero h1 em { font-style: italic; color: var(--blue); }
        .hero p {
          font-size: clamp(15px, 1.6vw, 18px); line-height: 1.75; color: var(--muted);
          max-width: 520px; margin-bottom: 40px;
          animation: fadeUp 0.7s 0.2s ease both;
        }
        .hero-actions {
          display: flex; gap: 16px; flex-wrap: wrap;
          animation: fadeUp 0.7s 0.3s ease both;
        }
        .btn-primary {
          background: linear-gradient(135deg, var(--blue), var(--cyan));
          color: #fff; border: none; padding: 16px 32px;
          border-radius: 50px; font-size: 15px; font-weight: 600;
          cursor: pointer; font-family: var(--font);
          display: flex; align-items: center; gap: 8px;
          box-shadow: 0 0 40px rgba(14,165,233,0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 0 60px rgba(14,165,233,0.55); }
        .btn-outline {
          background: transparent; color: var(--white);
          border: 1px solid var(--border); padding: 16px 32px;
          border-radius: 50px; font-size: 15px; font-weight: 500;
          cursor: pointer; font-family: var(--font);
          transition: background 0.2s, border-color 0.2s;
          display: flex; align-items: center; gap: 8px;
        }
        .btn-outline:hover { background: var(--card); border-color: rgba(255,255,255,0.18); }

        .hero-image-wrap {
          position: absolute; right: 5%; top: 50%; transform: translateY(-50%);
          width: min(45%, 580px); z-index: 1;
          animation: fadeIn 1s 0.4s ease both;
        }
        .hero-img-container {
          position: relative; border-radius: 28px; overflow: hidden;
          box-shadow: 0 40px 120px rgba(0,0,0,0.6), 0 0 80px rgba(14,165,233,0.15);
        }
        .hero-img-container img { width: 100%; display: block; }
        .hero-img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(4,13,33,0.3), transparent);
        }
        .floating-card {
          position: absolute; background: rgba(4,13,33,0.88);
          backdrop-filter: blur(16px); border: 1px solid var(--border);
          border-radius: 16px; padding: 14px 18px;
          animation: float 4s ease-in-out infinite;
        }
        .fc-1 { bottom: -18px; left: -30px; min-width: 180px; animation-delay: 0s; }
        .fc-2 { top: 20px; right: -20px; min-width: 160px; animation-delay: 2s; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .fc-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
        .fc-value { font-size: 18px; font-weight: 700; margin-top: 4px; color: var(--blue); }
        .fc-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }

        /* ── SECTIONS ── */
        section { padding: 90px 5%; }
        .section-label {
          font-size: 11px; font-weight: 700; letter-spacing: 3px;
          text-transform: uppercase; color: var(--blue);
          margin-bottom: 14px; display: block;
        }
        .section-title {
          font-family: var(--display); font-size: clamp(32px, 4vw, 52px);
          line-height: 1.1; margin-bottom: 18px;
        }
        .section-subtitle { color: var(--muted); font-size: 16px; line-height: 1.7; max-width: 560px; }
        .section-header-row {
          display: flex; justify-content: space-between; align-items: flex-end;
          gap: 40px; margin-bottom: 60px; flex-wrap: wrap;
        }

        /* ── STATS ── */
        .stats-section {
          background: linear-gradient(135deg, rgba(14,165,233,0.06), rgba(16,185,129,0.04));
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
          padding: 60px 5%;
        }
        .stats-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2px;
        }
        .stat-card {
          padding: 40px 32px; text-align: center;
          border-right: 1px solid var(--border);
          transition: background 0.3s;
        }
        .stat-card:last-child { border-right: none; }
        .stat-card:hover { background: var(--card); }
        .stat-icon { font-size: 32px; margin-bottom: 14px; display: block; }
        .stat-value {
          font-family: var(--display); font-size: 52px; line-height: 1;
          background: linear-gradient(135deg, var(--white), var(--blue));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .stat-label { color: var(--muted); font-size: 13px; margin-top: 8px; letter-spacing: 0.5px; }

        /* ── SERVICES ── */
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .service-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 32px;
          transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
          position: relative; overflow: hidden;
        }
        .service-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent, var(--blue)), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .service-card:hover { transform: translateY(-6px); border-color: rgba(255,255,255,0.14); box-shadow: 0 24px 60px rgba(0,0,0,0.35); }
        .service-card:hover::before { opacity: 1; }
        .service-icon-wrap {
          width: 56px; height: 56px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; margin-bottom: 20px;
        }
        .service-card h3 { font-size: 17px; font-weight: 700; margin-bottom: 12px; }
        .service-card p { color: var(--muted); font-size: 14px; line-height: 1.7; }
        .service-link {
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 20px; font-size: 13px; font-weight: 600;
          text-decoration: none; transition: gap 0.2s;
        }
        .service-link:hover { gap: 10px; }

        /* ── HOW IT WORKS ── */
        .how-section { background: var(--navy2); }
        .steps-wrap {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0; position: relative;
        }
        .steps-wrap::before {
          content: ''; position: absolute;
          top: 52px; left: 10%; right: 10%; height: 1px;
          background: linear-gradient(90deg, transparent, var(--border), var(--blue), var(--border), transparent);
        }
        .step {
          padding: 0 24px 0; text-align: center; position: relative;
        }
        .step-num {
          width: 54px; height: 54px; border-radius: 50%;
          background: linear-gradient(135deg, var(--blue), var(--cyan));
          color: #fff; font-size: 18px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 28px; position: relative; z-index: 1;
          box-shadow: 0 0 30px rgba(14,165,233,0.4);
        }
        .step h3 { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
        .step p { color: var(--muted); font-size: 14px; line-height: 1.65; }

        /* ── TELEMEDICINE FEATURE ── */
        .tele-section {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px; align-items: center;
        }
        .tele-img-wrap { position: relative; }
        .tele-img {
          width: 100%; border-radius: 28px; display: block;
          box-shadow: 0 40px 100px rgba(0,0,0,0.5);
        }
        .tele-badge {
          position: absolute; bottom: 24px; left: 24px;
          background: rgba(4,13,33,0.9); backdrop-filter: blur(12px);
          border: 1px solid var(--border); border-radius: 16px;
          padding: 16px 20px; display: flex; gap: 14px; align-items: center;
        }
        .tele-badge-icon { font-size: 28px; }
        .tele-badge-text { font-size: 13px; font-weight: 600; }
        .tele-badge-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }
        .tele-features { margin-top: 36px; display: flex; flex-direction: column; gap: 18px; }
        .tele-feat { display: flex; align-items: flex-start; gap: 16px; }
        .tele-feat-icon {
          width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
          background: rgba(14,165,233,0.1); display: flex; align-items: center; justify-content: center; font-size: 18px;
        }
        .tele-feat h4 { font-size: 15px; font-weight: 600; margin-bottom: 5px; }
        .tele-feat p { color: var(--muted); font-size: 13px; line-height: 1.6; }

        /* ── REVIEWS ── */
        .reviews-section { background: var(--navy2); text-align: center; }
        .reviews-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px; margin-top: 60px;
        }
        .review-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 28px; text-align: left;
          transition: transform 0.3s, border-color 0.3s;
          position: relative;
        }
        .review-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.12); }
        .review-quote { font-size: 40px; color: var(--blue); line-height: 1; margin-bottom: 14px; opacity: 0.5; }
        .review-text { font-size: 14px; line-height: 1.75; color: rgba(248,250,255,0.85); margin-bottom: 24px; }
        .review-author { display: flex; align-items: center; gap: 12px; }
        .review-avatar { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border); }
        .review-name { font-weight: 700; font-size: 14px; }
        .review-role { font-size: 12px; color: var(--muted); margin-top: 2px; }
        .review-stars { margin-bottom: 8px; }

        /* ── HOSPITALS ── */
        .hospitals-ticker {
          overflow: hidden; padding: 16px 0;
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
        }
        .ticker-track {
          display: flex; gap: 48px; width: max-content;
          animation: ticker 20s linear infinite;
        }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .ticker-item {
          display: flex; align-items: center; gap: 10px;
          white-space: nowrap; color: var(--muted); font-size: 14px; font-weight: 500;
        }
        .ticker-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--blue); opacity: 0.5; }

        /* ── CTA ── */
        .cta-section {
          margin: 0 5% 90px; border-radius: 32px;
          background: linear-gradient(135deg, rgba(14,165,233,0.15), rgba(16,185,129,0.08));
          border: 1px solid rgba(14,165,233,0.2);
          padding: 80px; text-align: center;
          position: relative; overflow: hidden;
        }
        .cta-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 80% at 50% 50%, rgba(14,165,233,0.07), transparent);
        }
        .cta-section h2 {
          font-family: var(--display); font-size: clamp(32px, 4vw, 52px);
          margin-bottom: 20px; position: relative;
        }
        .cta-section p { color: var(--muted); font-size: 16px; margin-bottom: 40px; position: relative; }
        .cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; position: relative; }
        .year-badge {
          display: inline-block; margin-bottom: 16px;
          background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25);
          border-radius: 50px; padding: 5px 14px; font-size: 12px; font-weight: 600; color: var(--mint);
          letter-spacing: 0.5px;
        }

        /* ── FOOTER ── */
        footer {
          border-top: 1px solid var(--border);
          padding: 60px 5% 32px;
        }
        .footer-top {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 60px; margin-bottom: 48px;
        }
        .footer-brand p { color: var(--muted); font-size: 14px; line-height: 1.7; margin-top: 16px; max-width: 280px; }
        .footer-col h4 { font-size: 14px; font-weight: 700; margin-bottom: 20px; }
        .footer-col a {
          display: block; color: var(--muted); text-decoration: none;
          font-size: 14px; margin-bottom: 12px; transition: color 0.2s;
        }
        .footer-col a:hover { color: var(--white); }
        .footer-bottom {
          border-top: 1px solid var(--border); padding-top: 28px;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 16px;
        }
        .footer-bottom p { color: var(--muted); font-size: 13px; }
        .footer-badges { display: flex; gap: 10px; }
        .fbadge {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 8px; padding: 6px 12px; font-size: 11px; color: var(--muted);
        }

        /* ── MOBILE ── */
        @media (max-width: 900px) {
          .nav-links, .nav-cta { display: none; }
          .hamburger { display: flex; }
          .hero { padding: 100px 5% 60px; }
          .hero-image-wrap { display: none; }
          .hero h1 { font-size: 40px; }
          .tele-section { grid-template-columns: 1fr; gap: 40px; }
          .footer-top { grid-template-columns: 1fr 1fr; gap: 36px; }
          .steps-wrap::before { display: none; }
          .cta-section { padding: 48px 32px; margin: 0 4% 60px; }
        }
        @media (max-width: 600px) {
          section { padding: 60px 5%; }
          .stat-card { border-right: none; border-bottom: 1px solid var(--border); }
          .footer-top { grid-template-columns: 1fr; }
          .footer-bottom { flex-direction: column; text-align: center; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className={scrolled ? "scrolled" : ""}>
        <ul className="nav-links">
          {NAV_LINKS.map(l => <li key={l}><a href="#">{l}</a></li>)}
        </ul>
        <button className="nav-cta" onClick={() => navigate('/login')}>Get Started →</button>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-badge">

            Sri Lanka's Leading Smart Health Platform
          </div>
          <h1>
            Healthcare That <em>Works</em> for You
          </h1>
          <p>
            MediLink connects patients with 500+ doctors across 40+ hospitals — offering seamless booking,
            digital prescriptions, and HD telemedicine consultations, all in one place.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/login')}>Book an Appointment →</button>
            <button className="btn-outline">▶ See How It Works</button>
          </div>
        </div>

        <div className="hero-image-wrap">
          <div className="hero-img-container">
            <img
              src="/img4.jpg"
              alt="Doctor consulting patient"
            />
            <div className="hero-img-overlay" />
          </div>
          <div className="floating-card fc-1">
            <div className="fc-label">Next Available Slot</div>
            <div className="fc-value">Today, 3:00 PM</div>
            <div className="fc-sub">Dr. Ruwan Silva · Cardiology</div>
          </div>
          <div className="floating-card fc-2">
            <div className="fc-label">Active Patients</div>
            <div className="fc-value">2,000+</div>
            <div className="fc-sub">Across Sri Lanka</div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="stats-section">
        <div className="stats-grid">
          {STATS.map(s => (
            <div className="stat-card" key={s.label}>
              <span className="stat-icon">{s.icon}</span>
              <div className="stat-value">
                <AnimatedCounter
                  target={s.value}
                  suffix={s.value.includes("+") ? "+" : s.value.includes("%") ? "%" : ""}
                />
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SERVICES ── */}
      <section id="services">
        <div className="section-header-row">
          <div>
            <span className="section-label">What We Offer</span>
            <h2 className="section-title">Everything your health<br />needs in one app</h2>
          </div>
          <p className="section-subtitle">
            From booking to prescriptions to follow-ups — MediLink handles your entire healthcare journey
            so you can focus on getting better.
          </p>
        </div>
        <div className="services-grid">
          {SERVICES.map(s => (
            <div className="service-card" key={s.title} style={{ "--accent": s.color }}>
              <div className="service-icon-wrap" style={{ background: s.bg }}>
                {s.icon}
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <a className="service-link" href="#" style={{ color: s.color }}>
                Learn more <span>→</span>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section">
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span className="section-label">Simple Process</span>
          <h2 className="section-title">Up and running in 3 steps</h2>
        </div>
        <div className="steps-wrap">
          {[
            { n: "01", title: "Create Your Profile", desc: "Sign up in under two minutes. Your health history is encrypted and accessible only by you and your chosen doctors." },
            { n: "02", title: "Find & Book a Doctor", desc: "Browse specialists by category or hospital. Real-time availability shows you the earliest open slot." },
            { n: "03", title: "Consult & Heal", desc: "Attend in-person or via telemedicine. Get your digital prescription instantly and track your recovery." },
          ].map(step => (
            <div className="step" key={step.n}>
              <div className="step-num">{step.n}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TELEMEDICINE ── */}
      <section id="telemedicine">
        <div className="tele-section">
          <div className="tele-img-wrap">
            <img
              className="tele-img"
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=500&fit=crop"
              alt="Telemedicine consultation"
            />
            <div className="tele-badge">
              <span className="tele-badge-icon">🟢</span>
              <div>
                <div className="tele-badge-text">Live Consultation</div>
                <div className="tele-badge-sub">Secure · HD Video · Encrypted</div>
              </div>
            </div>
          </div>
          <div>
            <span className="section-label">Telemedicine</span>
            <h2 className="section-title">A specialist,<br />wherever you are</h2>
            <p className="section-subtitle">
              Distance is no longer a barrier to world-class care. Connect with verified specialists
              across Sri Lanka via secure, HD video calls — from your home, office, or anywhere.
            </p>
            <div className="tele-features">
              {[
                { icon: "🔒", t: "End-to-End Encrypted", d: "Every session is fully encrypted — your consultations remain private and HIPAA-compliant." },
                { icon: "⚡", t: "Connect in Minutes", d: "Average wait time under 8 minutes. Emergency slots available 24/7." },
                { icon: "📄", t: "Instant Digital Prescriptions", d: "Receive your prescription immediately after the session — ready for any partner pharmacy." },
              ].map(f => (
                <div className="tele-feat" key={f.t}>
                  <div className="tele-feat-icon">{f.icon}</div>
                  <div>
                    <h4>{f.t}</h4>
                    <p>{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{ marginTop: 36 }} onClick={() => navigate('/login')}>
              Start a Consultation →
            </button>
          </div>
        </div>
      </section>

      {/* ── HOSPITALS TICKER ── */}
      <div className="hospitals-ticker">
        <div className="ticker-track">
          {[...HOSPITALS, ...HOSPITALS].map((h, i) => (
            <div className="ticker-item" key={i}>
              <span className="ticker-dot" />
              <span>{h.name}</span>
              <span style={{ opacity: 0.4, fontSize: 12 }}>· {h.city}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── REVIEWS ── */}
      <section className="reviews-section">
        <span className="section-label">Patient Stories</span>
        <h2 className="section-title">Real people, real results</h2>
        <p className="section-subtitle" style={{ margin: "0 auto" }}>
          Hear from the patients and doctors who trust MediLink every day.
        </p>
        <div className="reviews-grid">
          {REVIEWS.map((r, i) => (
            <div
              className="review-card"
              key={r.name}
              style={{ borderColor: i === activeReview ? "rgba(14,165,233,0.35)" : undefined }}
            >
              <div className="review-stars"><StarRating count={r.rating} /></div>
              <div className="review-quote">"</div>
              <p className="review-text">{r.text}</p>
              <div className="review-author">
                <img className="review-avatar" src={r.avatar} alt={r.name} />
                <div>
                  <div className="review-name">{r.name}</div>
                  <div className="review-role">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="cta-section">
        <div className="cta-bg" />
        <span className="year-badge">✦ Since 2026 · Year of Excellence</span>
        <h2>Your health journey<br />starts today</h2>
        <p>Join 2,000+ patients who've made MediLink their trusted health partner.</p>
        <div className="cta-actions">
          <button className="btn-primary" onClick={() => navigate('/login')}>Create Free Account →</button>
          <button className="btn-outline">For Hospitals & Doctors</button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <p>Sri Lanka's smartest health management platform, connecting patients, doctors, and hospitals seamlessly since 2026.</p>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            {["Book Appointment", "Telemedicine", "Prescriptions", "Health Records", "Reminders"].map(l => <a href="#" key={l}>{l}</a>)}
          </div>
          <div className="footer-col">
            <h4>Hospitals</h4>
            {["Find a Hospital", "Partner With Us", "For Doctors", "Admin Portal", "API Access"].map(l => <a href="#" key={l}>{l}</a>)}
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            {["About Us", "Careers", "Privacy Policy", "Terms of Service", "Contact"].map(l => <a href="#" key={l}>{l}</a>)}
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 MediLink Health Technologies. All rights reserved.</p>
          <div className="footer-badges">
            <span className="fbadge">🔒 HIPAA Compliant</span>
            <span className="fbadge">🌐 ISO 27001</span>
            <span className="fbadge">🇱🇰 Made in Sri Lanka</span>
          </div>
        </div>
      </footer>
    </>
  );
}