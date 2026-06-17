import { useState, useMemo, useEffect } from "react";
import HeroSection from "../components/heroSection2";
import SectorFilterBar from "../components/SectorFilterBar";
import CompanyGrid from "../components/CompanyGrid";
import Footer from "../components/Footer";
import { companies, SECTORS } from "../data/companies";

import Header from "../components/header";

// Deduplicate companies by name
const uniqueCompanies = companies.filter(
  (c, index, self) => index === self.findIndex((t) => t.name === c.name)
);

export default function RecruitersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSector, setActiveSector] = useState("All");
  // const [isDark, setIsDark] = useState(false);

  // Theme toggle effect
  // useEffect(() => {
  //   if (isDark) {
  //     document.documentElement.setAttribute("data-theme", "dark");
  //   } else {
  //     document.documentElement.removeAttribute("data-theme");
  //   }
  // }, [isDark]);

  const filteredCompanies = useMemo(() => {
    let result = uniqueCompanies;
    if (activeSector !== "All") {
      result = result.filter((c) => c.sector === activeSector);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }
    return result;
  }, [searchQuery, activeSector]);

  const counts = useMemo(() => {
    const c = { total: uniqueCompanies.length };
    SECTORS.slice(1).forEach((s) => {
      c[s] = uniqueCompanies.filter((co) => co.sector === s).length;
    });
    return c;
  }, []);

  return (
    <div className="app-root">
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

      <HeroSection
        totalCompanies={uniqueCompanies.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <SectorFilterBar
        activeSector={activeSector}
        onSectorChange={setActiveSector}
        counts={counts}
      />
      <CompanyGrid companies={filteredCompanies} />
      <Footer />
    </div>
  );
}