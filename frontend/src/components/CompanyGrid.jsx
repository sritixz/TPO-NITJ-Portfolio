import CompanyCard from "./CompanyCard";

export default function CompanyGrid({ companies }) {
  if (companies.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <p className="empty-title">No recruiters found</p>
        <p className="empty-sub">Try a different search or filter</p>
      </div>
    );
  }

  return (
    <section className="grid-section">
      <div className="grid-header">
        <span className="grid-count">
          Showing <strong>{companies.length}</strong> recruiter{companies.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="company-grid">
        {companies.map((company, index) => (
          <CompanyCard key={`${company.name}-${index}`} company={company} />
        ))}
      </div>
    </section>
  );
}