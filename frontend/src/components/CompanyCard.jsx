import { useState } from "react";
import { SECTOR_COLORS } from "../data/companies";
import availableLogos from "../data/available-logos.json";

function getInitials(name) {
  // Strip long suffixes for cleaner initials
  const cleaned = name
    .replace(/\(.*?\)/g, "")
    .replace(/Pvt\.?|Ltd\.?|Limited|Private|Inc\.?|Corp\.?/gi, "")
    .trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function CompanyCard({ company }) {
  const { name, domain, sector } = company;
  const [fallbackLevel, setFallbackLevel] = useState(0); // 0: Local / Clearbit, 1: Clearbit / Google, 2: Google / Initials, 3: Initials
  const color = SECTOR_COLORS[sector] || "#6B7280";

  const slug = slugify(name);
  const hasLocalLogo = availableLogos.includes(slug);

  let logoUrl = null;
  if (hasLocalLogo && fallbackLevel === 0) {
    logoUrl = `/logos/${slug}.png`;
  } else {
    const apiFallbackLevel = hasLocalLogo ? fallbackLevel - 1 : fallbackLevel;
    if (domain) {
      if (apiFallbackLevel === 0) {
        logoUrl = `https://logo.clearbit.com/${domain}`;
      } else if (apiFallbackLevel === 1) {
        logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      }
    }
  }

  const handleError = () => {
    setFallbackLevel((prev) => prev + 1);
  };

  const showLogo = logoUrl && (hasLocalLogo ? fallbackLevel < 3 : fallbackLevel < 2);

  return (
    <div className="company-card" title={name}>
      <div className="card-logo-wrapper">
        {showLogo ? (
          <img
            src={logoUrl}
            alt={`${name} logo`}
            className="card-logo-img"
            onError={handleError}
            loading="lazy"
          />
        ) : (
          <div
            className="card-initials"
            style={{
              background: `${color}18`,
              border: `1px solid ${color}40`,
              color: color,
            }}
          >
            {getInitials(name)}
          </div>
        )}
      </div>
      <div className="card-info">
        <p className="card-name">{name}</p>
        <span
          className="card-sector-tag"
          style={{ color, background: `${color}15`, borderColor: `${color}30` }}
        >
          {sector}
        </span>
      </div>
    </div>
  );
}