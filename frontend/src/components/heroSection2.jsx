import { useState, useEffect, useRef } from "react";

function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, [target, duration]);

  return count;
}

export default function HeroSection({ totalCompanies, searchQuery, onSearchChange }) {
  const companyCount = useCountUp(totalCompanies);
  const [typed, setTyped] = useState("");
  const tagline = "Trusted by India's best. Recruiting from one campus.";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTyped(tagline.slice(0, i + 1));
      i++;
      if (i >= tagline.length) clearInterval(interval);
    }, 28);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero-section">
      {/* Background grid */}
      <div className="hero-grid-bg" />
      <div className="hero-glow" />

      <div className="hero-content">
        <div className="hero-eyebrow">
          <span className="eyebrow-dot" />
          NIT Jalandhar · Training &amp; Placement Cell
        </div>

        <h1 className="hero-title">
          Our <span className="hero-title-accent">Recruiters</span>
        </h1>

        <p className="hero-tagline">{typed}<span className="cursor-blink">|</span></p>

        {/* Stat counters */}
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">{companyCount}+</span>
            <span className="stat-label">Recruiters</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">8</span>
            <span className="stat-label">Sectors</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">1</span>
            <span className="stat-label">Campus</span>
          </div>
        </div>

        {/* Search */}
        <div className="search-wrapper">
          <span className="search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            id="company-search"
            className="search-input"
            type="text"
            placeholder="Search recruiters — Amazon, Google, TCS…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            autoComplete="off"
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => onSearchChange("")} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>
      </div>
    </section>
  );
}