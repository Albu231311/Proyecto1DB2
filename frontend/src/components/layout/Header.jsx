export default function Header({ title, icon, children }) {
  return (
    <header className="page-header">
      <div className="page-header-title">
        {icon && <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: 20 }}>{icon}</span>}
        {title}
      </div>
      <div className="header-actions">
        <div className="search-bar">
          <span className="material-symbols-outlined">search</span>
          <input placeholder="Search..." />
        </div>
        <button className="icon-btn">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>notifications</span>
          <span className="badge-dot" />
        </button>
        <button className="icon-btn">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>forum</span>
        </button>
        <div className="vdivider" />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>Admin User</span>
          <span style={{ fontSize: 10, color: "var(--slate-500)", fontWeight: 600 }}>Super Admin</span>
        </div>
        <div className="avatar-initials">AU</div>
        {children}
      </div>
    </header>
  );
}