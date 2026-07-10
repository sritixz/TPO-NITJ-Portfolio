import { useState, useEffect, useCallback } from "react";
import Footer from "../components/footer";
import Header from "../components/header";
import { color } from "framer-motion";

/* ─────────────────────────────────────────────
   PROGRAM DATA  (card summary + full popout)
───────────────────────────────────────────── */
const programs = [
  {
    id: "7th-sem",
    emoji: "👜",
    emojiBg: "white",
    title: "7th Sem Intern",
    policy: "Policy § 3.3",
    tagline: "Industry immersion during 7th semester (2023 batch onwards)",
    accent: "#0369A0",
    accentGlow: "#0369A0",
    accentBorder: "#0369A0",
    badge: "Intern",
    badgeBg: "#0369A0",
    badgeColor: "white",
    text: "white",
    note: "Max 50% of class strength. Notify CTP within 24 hrs of off-campus offer.",
    rows: [
      { label: "Duration",    value: "4–6 months (July – Dec)" },
      { label: "Eligibility", value: "B.Tech 7th Sem · 2023 batch+" },
      { label: "Credits",     value: "13-credit course waiver" },
      { label: "Apply",       value: "CTP drive – mid 6th Sem" },
      { label: "Selection",   value: "Resume + Technical Interview" },
    ],
    popout: {
      overview:
        "From the 2023 batch onwards, B.Tech students are permitted to undertake a 4–6 month internship during the 7th or 8th semester. The opportunity is extended to a maximum of 50% of the class strength per semester, and the student must not have more than three backlogs in the preceding semesters. The CTP initiates the on-campus internship drive in the middle of the 6th semester.",
      objectives: [
        "Real industry experience before final semester",
        "Skill enhancement & improved employability",
        "Exposure to live software or core engineering projects",
        "Opportunity for Pre-Placement Offer (PPO)",
        "Research exposure for students inclined towards higher studies",
      ],
      eligibility: [
        "B.Tech student (7th semester) — 2023 batch onwards",
        "Not more than 3 backlogs in preceding semesters",
        "Seats limited to maximum 50% of class strength",
        "Off-campus internship: prior IAC (Internship Advisory Committee) approval mandatory",
        "Off-campus offer letter must be reported to CTP within 24 hours (ctp@nitj.ac.in or internships@nitj.ac.in)",
        "No off-campus application allowed after last date of 6th semester end-semester exam",
      ],
      internshipTypes: [
        "On-campus internship through CTP",
        "Off-campus — private company / industry (IAC approval needed)",
        "Govt. research orgs: ISRO, DRDO, PSUs",
        "Academic institutes — NIRF top 100 (India)",
        "International universities — QS top 500",
        "Note: Research internships recommended only for students pursuing higher studies",
      ],
      documents: [
        "Offer / Confirmation Letter (report to CTP within 24 hrs)",
        "IAC Approval Letter (for off-campus)",
        "Joining Report",
        "Mid-term Progress Report",
        "Final Internship Report",
        "Internship Completion Certificate",
        "External Supervisor Evaluation Form (Proforma-1)",
      ],
      academicBenefits:
        "Students undertaking a full-semester internship are granted a course/project waiver of 13 credits as per institute norms. Evaluation is based on the internship report, mentor feedback, and the external supervisor's Proforma-1 evaluation form.",
      timeline: [
        { activity: "CTP On-Campus Drive Opens", period: "Mid 6th Semester" },
        { activity: "Off-Campus Deadline", period: "Before 6th Sem End-Exam" },
        { activity: "Internship Duration", period: "July – December" },
        { activity: "Return to Institute", period: "January" },
      ],
      outcomes: [
        "Pre-Placement Offer (PPO) — reported via CTP with full CTC",
        "Full-time campus placement in 8th semester",
        "Research experience at premier institutions",
        "Industrial exposure & professional networking",
      ],
      faqs: [
        {
          q: "Is the 7th-sem internship available to 2022 batch students?",
          a: "No. Students of the 2022 batch can only undertake a six-month internship during the 8th semester, not the 7th.",
        },
        {
          q: "What happens if I get an off-campus offer and don't notify CTP within 24 hours?",
          a: "As per § 3.3.5, failure to inform CTP (ctp@nitj.ac.in / internships@nitj.ac.in) within 24 hours of receiving the offer letter means the student will not be allowed to proceed with that internship.",
        },
        {
          q: "Can I attend campus placements after the 7th-sem internship?",
          a: "Yes. Returning students are eligible for campus placement drives held in the 8th semester.",
        },
        {
          q: "Do companies need to follow any guidelines during the internship?",
          a: "Yes. Industry partners must allow the internal supervisor to visit the onsite location at least once per semester, inform PPO details (with CTC) through CTP, and have the external supervisor fill the Proforma-1 evaluation form at the end of the internship.",
        },
      ],
    },
  },
  {
    id: "8th-sem",
    emoji: "🚀",
    emojiBg: "white",
    title: "8th Sem Intern",
    policy: "Policy § 3.3",
    tagline: "Pre-placement opportunity in final semester",
    accent: "#0369A0",
    accentGlow: "#0369A0",
    accentBorder: "#0369A0",
    badge: "Intern",
    badgeBg: "#0369A0",
    badgeColor: "white",
    text : "white",
    note: "2022 batch: 8th sem only. Notify CTP within 24 hrs of off-campus offer.",
    rows: [
      { label: "Duration",    value: "4–6 months (Jan – June)" },
      { label: "Eligibility", value: "B.Tech 8th Sem · All batches" },
      { label: "Credits",     value: "13-credit course waiver" },
      { label: "Apply",       value: "CTP drive – mid 6th Sem" },
      { label: "Selection",   value: "Resume + Coding + HR" },
    ],
    popout: {
      overview:
        "Students can opt for a 4–6 month internship during the 8th (final) semester instead of conventional project work. The 2022 batch is exclusively eligible for the 8th semester internship. For the 2023 batch onwards, the internship may be done in either the 7th or 8th semester. The CTP initiates the on-campus drive in the middle of the 6th semester.",
      objectives: [
        "Real industry experience in final year",
        "Company training & mentorship",
        "Pre-Placement Offer (PPO) opportunity",
        "Practical application of 4 years of learning",
        "Research exposure for students targeting higher studies",
      ],
      eligibility: [
        "B.Tech student (8th semester) — all batches eligible",
        "2022 batch: 8th semester internship only (not 7th)",
        "Not more than 3 backlogs in preceding semesters",
        "Seats limited to maximum 50% of class strength",
        "Off-campus internship: prior IAC (Internship Advisory Committee) approval mandatory",
        "Off-campus offer letter must be reported to CTP within 24 hours (ctp@nitj.ac.in or internships@nitj.ac.in)",
        "No off-campus application allowed after last date of 7th semester end-semester exam",
      ],
      internshipTypes: [
        "On-campus internship through CTP",
        "Off-campus — private company / industry (IAC approval needed)",
        "Govt. research orgs: ISRO, DRDO, PSUs",
        "Academic institutes — NIRF top 100 (India)",
        "International universities — QS top 500",
        "Note: Research internships recommended only for students pursuing higher studies",
      ],
      documents: [
        "Offer / Confirmation Letter (report to CTP within 24 hrs)",
        "IAC Approval Letter (for off-campus)",
        "Joining Report",
        "Mid-term / Monthly Progress Reports",
        "Final Internship Report",
        "Internship Completion Certificate",
        "External Supervisor Evaluation Form (Proforma-1)",
      ],
      academicBenefits:
        "Students undertaking a full-semester internship receive a course/project waiver of 13 credits as per institute norms. Evaluation is based on the internship report, supervisor feedback, and the external supervisor's Proforma-1 form. This substitutes the conventional B.Tech major project requirement.",
      timeline: [
        { activity: "CTP On-Campus Drive Opens", period: "Mid 6th Semester" },
        { activity: "Off-Campus Deadline", period: "Before 7th Sem End-Exam" },
        { activity: "Internship Duration", period: "January – June" },
        { activity: "Graduation", period: "July" },
      ],
      outcomes: [
        "Pre-Placement Offer (PPO) — reported via CTP with full CTC",
        "Campus placement drives in remaining slots",
        "Industrial networking & resume enhancement",
        "Research experience at premier institutions",
      ],
      faqs: [
        {
          q: "I'm from the 2022 batch. Can I do a 7th-sem internship?",
          a: "No. As per § 3.3.1, the 2022 batch is only eligible for the 6-month internship during the 8th semester.",
        },
        {
          q: "What happens if I get an off-campus offer and don't notify CTP within 24 hours?",
          a: "As per § 3.3.5, failure to inform CTP (ctp@nitj.ac.in / internships@nitj.ac.in) within 24 hours of receiving the offer letter means the student will not be allowed to proceed with that internship.",
        },
        {
          q: "Does the 8th-sem internship replace the major project?",
          a: "Yes. The internship substitutes the conventional B.Tech major project requirement (13-credit waiver), subject to departmental and IAC guidelines.",
        },
        {
          q: "Do companies need to follow any guidelines during the internship?",
          a: "Yes. Industry partners must allow the internal supervisor to visit onsite at least once per semester, inform PPO details (with CTC) through CTP, and have the external supervisor fill the Proforma-1 evaluation form at the end of the internship.",
        },
      ],
    },
  },
  {
    id: "mtech",
    emoji: "🎓",
    emojiBg: "white",
    title: "M.Tech Program",
    policy: "Policy v2.1",
    tagline: "Master of Technology — 2 years",
    accent: "#0369A0",
    accentGlow: "#0369A0",
    accentBorder: "#0369A0",
    badge: "Degree",
    badgeBg: "#0369A0",
    badgeColor: "white",
    text: "white",
    note: "GATE-qualified students receive stipend.",
    rows: [
      { label: "Duration",        value: "2 years (4 semesters)" },
      { label: "Eligibility",     value: "B.E./B.Tech 60%+" },
      { label: "Specializations", value: "AI/ML, Data Science, VLSI" },
      { label: "Admission",       value: "GATE score + Institute" },
    ],
    popout: {
      overview:
        "The M.Tech program at NIT Jalandhar is a 2-year postgraduate degree spread over 4 semesters, combining advanced coursework, laboratory work, and research-oriented dissertation.",
      objectives: [
        "Advanced technical knowledge in chosen specialization",
        "Research aptitude and academic depth",
        "Industry-ready postgraduate skill set",
        "Access to funded research projects",
      ],
      eligibility: [
        "B.E. / B.Tech degree with minimum 60% marks",
        "Valid GATE score (for stipend and preferred admission)",
        "Sponsored / self-sponsored seats available in some depts.",
        "Admission through CCMT counselling",
      ],
      internshipTypes: [
        "Artificial Intelligence & Machine Learning",
        "Data Science & Big Data",
        "VLSI & Embedded Systems",
        "Communication Systems",
        "Manufacturing Engineering",
        "Structural Engineering",
        "Renewable Energy & Power Systems",
        "Cyber Security",
      ],
      documents: [
        "GATE Scorecard",
        "B.Tech Degree / Provisional Certificate",
        "Transcripts / Mark Sheets",
        "Category Certificate (if applicable)",
        "Experience Certificate (for sponsored candidates)",
      ],
      academicBenefits:
        "GATE-qualified students receive AICTE / MoE stipend (subject to prevailing norms). The program includes mini-projects, research methodology coursework, and a full-year dissertation.",
      timeline: [
        { activity: "GATE Exam", period: "February" },
        { activity: "CCMT Counselling", period: "May – June" },
        { activity: "Semester 1 & 2", period: "Year 1" },
        { activity: "Research & Dissertation", period: "Year 2" },
      ],
      outcomes: [
        "Software & semiconductor industry roles",
        "PSUs & Government research labs",
        "PhD & academia",
        "Product companies & MNCs",
        "Core engineering roles",
      ],
      faqs: [
        {
          q: "Is GATE mandatory for M.Tech admission?",
          a: "GATE score is required for stipend eligibility and preferred admission through CCMT. Sponsored seats may have different criteria.",
        },
        {
          q: "Can M.Tech students participate in campus placements?",
          a: "Yes. M.Tech students are eligible for campus placement drives organized by the CTP cell.",
        },
      ],
    },
  },
  {
    id: "btech",
    emoji: "🎓",
    emojiBg: "white",
    title: "B.Tech Program",
    policy: "Policy v2.1",
    tagline: "Bachelor of Technology — 4 years",
    accent: "#0369A0",
    accentGlow: "#0369A0",
    accentBorder: "#0369A0",
    badge: "Degree",
    badgeBg: "#0369A0",
    badgeColor: "white",
    text: "white",
    note: "Industry-aligned, NEP-compliant curriculum.",
    rows: [
      { label: "Duration",        value: "4 years (8 semesters)" },
      { label: "Eligibility",     value: "10+2 (PCM)" },
      { label: "Specializations", value: "CSE, ECE, ME, Civil" },
      { label: "Admission",       value: "JEE Main / State Exam" },
      { label: "Internship",      value: "Mandatory 6 months" },
    ],
    popout: {
      overview:
        "The B.Tech program is a 4-year undergraduate degree spanning 8 semesters. It follows an Outcome-Based Education (OBE) framework aligned with NEP guidelines, combining core engineering, elective specializations, and mandatory experiential learning.",
      objectives: [
        "Strong foundation in basic sciences & engineering",
        "Core discipline expertise",
        "Experiential and project-based learning",
        "Placement & higher education readiness",
      ],
      eligibility: [
        "Passed 10+2 with Physics, Chemistry, Mathematics",
        "Valid JEE Main score",
        "Admission through JoSAA / CSAB counselling",
        "Category reservations as per Government norms",
      ],
      internshipTypes: [
        "Computer Science & Engineering (CSE)",
        "Electronics & Communication (ECE)",
        "Mechanical Engineering (ME)",
        "Civil Engineering",
        "Chemical Engineering",
        "Industrial & Production Engineering",
        "Instrumentation & Control",
        "Textile Technology",
      ],
      documents: [
        "JEE Main Scorecard",
        "10th & 12th Mark Sheets",
        "Category / Caste Certificate (if applicable)",
        "Transfer Certificate from previous institution",
        "Medical Fitness Certificate",
      ],
      academicBenefits:
        "Students gain credits through core courses, open electives, minor projects, major projects, and mandatory internships. The curriculum is NEP-aligned with outcome-based assessment.",
      timeline: [
        { activity: "JEE Main Exam", period: "January & April" },
        { activity: "JoSAA Counselling", period: "June – July" },
        { activity: "Semesters 1–6", period: "Years 1–3" },
        { activity: "7th Sem Internship (optional)", period: "Year 4, Sem 1" },
        { activity: "8th Sem Internship / Project", period: "Year 4, Sem 2" },
      ],
      outcomes: [
        "Campus placements at top MNCs & startups",
        "Higher education (M.Tech / MBA / MS abroad)",
        "Research & development roles",
        "Entrepreneurship & startups",
        "Government & PSU jobs",
      ],
      faqs: [
        {
          q: "Is the 7th-semester internship mandatory?",
          a: "No. It is optional. Students may choose to attend regular classes instead. Refer to the 7th-Sem Internship policy for full details.",
        },
        {
          q: "What is the minimum attendance requirement?",
          a: "75% attendance is mandatory per NITJ academic regulations. Specific courses may have stricter requirements.",
        },
      ],
    },
  },
];

/* ─────────────────────────────────────────────
   POPOUT MODAL COMPONENT
───────────────────────────────────────────── */
function ProgramModal({ prog, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const { popout } = prog;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`modal-title-${prog.id}`}
    >
      <div
        className="modal-panel"
        style={{ "--modal-accent": prog.accent, "--modal-glow": prog.accentGlow, "--modal-border": prog.accentBorder }}
      >
        {/* ── Fixed Header ── */}
        <div className="modal-header" style={{ borderBottom: `2px solid ${prog.accentBorder}` }}>
          <div className="modal-header-left">
            <div
              className="modal-emoji-wrap"
              style={{ background: prog.emojiBg, border: `1px solid ${prog.accentBorder}` }}
            >
              <span className="modal-emoji">{prog.emoji}</span>
            </div>
            <div>
              <div className="modal-header-top">
                <h2 className="modal-title" id={`modal-title-${prog.id}`}>{prog.title}</h2>
                <span
                  className="modal-badge"
                  style={{ background: prog.badgeBg, color: prog.badgeColor, border: `1px solid ${prog.accentBorder}` }}
                >
                  {prog.badge}
                </span>
              </div>
              <p className="modal-policy" style={{ color: prog.accent }}>{prog.policy}</p>
              <p className="modal-tagline">{prog.tagline}</p>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
            title="Close (Esc)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="modal-body">

          {/* Overview */}
          <section className="modal-section">
            <h3 className="modal-section-title" style={{ color: prog.accent }}>
              <span className="modal-section-icon">📌</span> Overview
            </h3>
            <p className="modal-text">{popout.overview}</p>
          </section>

          {/* Objectives */}
          <section className="modal-section">
            <h3 className="modal-section-title" style={{ color: prog.accent }}>
              <span className="modal-section-icon">🎯</span> Objectives
            </h3>
            <ul className="modal-list">
              {popout.objectives.map((obj, i) => (
                <li key={i} className="modal-list-item">
                  <span className="modal-list-dot" style={{ background: prog.accent }} />
                  {obj}
                </li>
              ))}
            </ul>
          </section>

          {/* Eligibility */}
          <section className="modal-section">
            <h3 className="modal-section-title" style={{ color: prog.accent }}>
              <span className="modal-section-icon">✅</span> Eligibility
            </h3>
            <ul className="modal-list">
              {popout.eligibility.map((el, i) => (
                <li key={i} className="modal-list-item">
                  <span className="modal-list-dot" style={{ background: prog.accent }} />
                  {el}
                </li>
              ))}
            </ul>
          </section>

          {/* Structure / Types */}
          <section className="modal-section">
            <h3 className="modal-section-title" style={{ color: prog.accent }}>
              <span className="modal-section-icon">🏢</span>
              {prog.badge === "Internship" ? "Internship Types" : "Specializations / Departments"}
            </h3>
            <div className="modal-chips">
              {popout.internshipTypes.map((item, i) => (
                <span
                  key={i}
                  className="modal-chip"
                  style={{ background: prog.accentGlow, color: prog.text, border: `1px solid ${prog.accentBorder}` }}
                >
                  {item}
                </span>
              ))}
            </div>
          </section>

          {/* Documents Required */}
          <section className="modal-section">
            <h3 className="modal-section-title" style={{ color: prog.accent }}>
              <span className="modal-section-icon">📄</span> Documents Required
            </h3>
            <ul className="modal-list">
              {popout.documents.map((doc, i) => (
                <li key={i} className="modal-list-item">
                  <span className="modal-list-dot" style={{ background: prog.accent }} />
                  {doc}
                </li>
              ))}
            </ul>
          </section>

          {/* Academic Evaluation */}
          <section className="modal-section">
            <h3 className="modal-section-title" style={{ color: prog.accent }}>
              <span className="modal-section-icon">🎓</span> Academic Evaluation
            </h3>
            <p className="modal-text">{popout.academicBenefits}</p>
          </section>

          {/* Timeline */}
          <section className="modal-section">
            <h3 className="modal-section-title" style={{ color: prog.accent }}>
              <span className="modal-section-icon">📅</span> Timeline
            </h3>
            <div className="modal-timeline">
              {popout.timeline.map((item, i) => (
                <div key={i} className="modal-timeline-row">
                  <span className="modal-timeline-dot" style={{ background: prog.accent }} />
                  <span className="modal-timeline-activity">{item.activity}</span>
                  <span className="modal-timeline-period" style={{ color: prog.accent }}>{item.period}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Career Outcomes */}
          <section className="modal-section">
            <h3 className="modal-section-title" style={{ color: prog.accent }}>
              <span className="modal-section-icon">💼</span> Benefits &amp; Career Outcomes
            </h3>
            <ul className="modal-list">
              {popout.outcomes.map((out, i) => (
                <li key={i} className="modal-list-item">
                  <span className="modal-list-dot" style={{ background: prog.accent }} />
                  {out}
                </li>
              ))}
            </ul>
          </section>

          {/* FAQs */}
          <section className="modal-section modal-section--last">
            <h3 className="modal-section-title" style={{ color: prog.accent }}>
              <span className="modal-section-icon">❓</span> FAQs
            </h3>
            <div className="modal-faqs">
              {popout.faqs.map((faq, i) => (
                <div key={i} className="modal-faq" style={{ borderLeft: `3px solid ${prog.accentBorder}` }}>
                  <p className="modal-faq-q">Q: {faq.q}</p>
                  <p className="modal-faq-a">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function ProgramsPage() {
  // const [isDark, setIsDark] = useState(false);
  const [visible, setVisible] = useState([]);
  const [activeModal, setActiveModal] = useState(null);

  // useEffect(() => {
  //   if (isDark) {
  //     document.documentElement.setAttribute("data-theme", "dark");
  //   } else {
  //     document.documentElement.removeAttribute("data-theme");
  //   }
  // }, [isDark]);

  // Staggered entrance animation
  useEffect(() => {
    programs.forEach((_, i) => {
      setTimeout(() => setVisible((prev) => [...prev, i]), i * 120);
    });
  }, []);

  const openModal  = useCallback((prog) => setActiveModal(prog), []);
  const closeModal = useCallback(() => setActiveModal(null), []);

  return (
    <div className="app-root">
      {/* Theme toggle */}
      {/* <button
        className="theme-toggle-btn"
        onClick={() => setIsDark((d) => !d)}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        aria-label="Toggle theme"
      >
        <span className="theme-toggle-icon">{isDark ? "☀️" : "🌙"}</span>
        {isDark ? "Light Mode" : "Dark Mode"}
      </button> */}

      <Header/>
      {/* ── Hero ── */}

      <section className="pp-hero">
        <div className="hero-grid-bg" />
        <div className="hero-glow" />
        <div className="pp-hero-content">
          {/* <span className="hero-eyebrow">
            <span className="eyebrow-dot" />
            NIT Jalandhar · Training &amp; Placement Cell
          </span> */}
          <h1 className="hero-title text-3xl font-bold sm:text-4xl lg:text-5xl">
            Programs &amp;{" "}
            <span className="hero-title-accent text-custom-blue">Policies</span>
          </h1>
          <p className="pp-hero-sub">
            Click any card to explore full details — eligibility, documents, timelines &amp; FAQs.
          </p>
        </div>
      </section>

      {/* ── Cards Grid ── */}
      <main className="pp-main">
        <div className="pp-grid">
          {programs.map((prog, i) => (
            <article
              key={prog.id}
              className={`pp-card pp-card--clickable${visible.includes(i) ? " pp-card--visible" : ""}`}
              style={{
                "--card-accent": prog.accent,
                "--card-glow": prog.accentGlow,
                "--card-border-glow": prog.accentBorder,
              }}
              onClick={() => openModal(prog)}
              role="button"
              tabIndex={0}
              aria-label={`Open details for ${prog.title}`}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(prog); } }}
            >
              <div className="pp-card-inner-layout">
              {/* Top accent bar */}
              <div className="pp-card-bar" />

              {/* Header */}
              <div className="pp-card-header">
                <div className="pp-card-emoji-wrap" style={{background:prog.emojiBg}} >
                  <span className="pp-card-emoji">{prog.emoji}</span>
                </div>
                <div className="pp-card-meta">
                  <div className="pp-card-top-row">
                    <h2 className="pp-card-title">{prog.title}</h2>
                    <span
                      className="pp-card-badge"
                      style={{
                        background: prog.badgeBg,
                        color: prog.badgeColor,
                        border: `1px solid ${prog.accentBorder}`,
                      }}
                    >
                      {prog.badge}
                    </span>
                  </div>
                  <p className="pp-card-policy">{prog.policy}</p>
                  <p className="pp-card-tagline">{prog.tagline}</p>
                </div>
              </div>

              {/* Table */}
              <div className="pp-table-wrap">
                <table className="pp-table">
                  <tbody>
                    {prog.rows.map((row) => (
                      <tr key={row.label} className="pp-table-row">
                        <td className="pp-table-label">{row.label}</td>
                        <td className="pp-table-value">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Note */}
              <div
                className="pp-note"
                style={{
                  background: prog.accentGlow,
                  borderColor: prog.accentBorder,
                  color: prog.accent,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span style={{color: prog.text}} >{prog.note}</span>
              </div>

              {/* "View Details" affordance */}
              <div className="pp-card-cta" style={{ color: prog.accent }}>
                <span>View full details</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      <Footer />

      {/* ── Modal ── */}
      {activeModal && <ProgramModal prog={activeModal} onClose={closeModal} />}
    </div>
  );
}