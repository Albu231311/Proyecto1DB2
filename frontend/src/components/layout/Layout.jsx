import "./Layout.css";

const NAV_ITEMS = [
  { id: "gestion", icon: "restaurant", label: "Management" },
  { id: "reporteria", icon: "analytics", label: "Reporting" },
  { id: "operaciones", icon: "settings_applications", label: "System Operations" },
  { id: "imagenes", icon: "photo_library", label: "Image Library" },
];

export default function Layout({ children, currentPage, onNavigate }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <span className="material-symbols-outlined">restaurant</span>
          </div>
          <div>
            <div className="sidebar-logo-title">FoodOps Pro</div>
            <div className="sidebar-logo-sub">Kitchen Admin</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? "active" : ""}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-footer-btn">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add_circle</span>
            New Report
          </button>
        </div>
      </aside>

      <div className="main-content">
        {children}
      </div>
    </div>
  );
}