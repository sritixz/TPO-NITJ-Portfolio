import { SECTORS, SECTOR_COLORS } from "../data/companies";

export default function SectorFilterBar({ activeSector, onSectorChange, counts }) {
  return (
    <div className="filter-bar-wrapper">
      <div className="filter-bar">
        {SECTORS.map((sector) => {
          const isActive = activeSector === sector;
          const color = sector === "All" ? "#3B82F6" : SECTOR_COLORS[sector];
          return (
            <button
              key={sector}
              id={`filter-${sector.toLowerCase().replace(/[\s/]+/g, "-")}`}
              className={`filter-pill ${isActive ? "filter-pill-active" : ""}`}
              style={isActive ? { "--pill-color": color, borderColor: color, color: color, background: `${color}18` } : { "--pill-color": color }}
              onClick={() => onSectorChange(sector)}
            >
              {sector !== "All" && (
                <span
                  className="pill-dot"
                  style={{ background: color }}
                />
              )}
              {sector}
              {counts && (
                <span className="pill-count">
                  {sector === "All" ? counts.total : (counts[sector] ?? 0)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}