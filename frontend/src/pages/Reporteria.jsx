import Header from "../components/layout/Header";

const TOP_MERCHANTS = [
  { name: "The Burger Joint", category: "Fast Food", rating: 4.9, trend: "up", delta: "+0.2" },
  { name: "Sushi Master Elite", category: "Japanese", rating: 4.8, trend: "flat", delta: "0.0" },
  { name: "Green Garden Salads", category: "Healthy", rating: 4.7, trend: "up", delta: "+0.4" },
  { name: "Pasta Palace", category: "Italian", rating: 4.6, trend: "down", delta: "-0.1" },
];

const BEST_DISHES = [
  { name: "Classic Wagyu Burger", units: "2.4k", pct: 92 },
  { name: "Spicy Salmon Roll", units: "1.8k", pct: 75 },
  { name: "Truffle Fettuccine", units: "1.2k", pct: 55 },
  { name: "Quinoa Power Bowl", units: "950", pct: 40 },
  { name: "Pepperoni Flatbread", units: "820", pct: 32 },
];

const CUSTOMERS = [
  { initials: "JD", name: "John Doe", orders: 42, spent: "$1,284.50" },
  { initials: "SK", name: "Sarah Kim", orders: 38, spent: "$952.20" },
  { initials: "MB", name: "Mike Brown", orders: 31, spent: "$840.00" },
  { initials: "EL", name: "Emma Lee", orders: 29, spent: "$712.45" },
];

const MAP_MARKERS = [
  { top: "25%", left: "33%", label: "48 Orders Pending" },
  { top: "50%", right: "25%", label: "Sushi Master (Active)" },
  { top: "35%", left: "55%", label: "Pizza Heaven (Busy)" },
  { top: "65%", left: "45%", label: "Taco Fiesta (Active)" },
];

function TrendBadge({ trend, delta }) {
  if (trend === "up") return (
    <span className="trend-up">
      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>trending_up</span> {delta}
    </span>
  );
  if (trend === "down") return (
    <span className="trend-down">
      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>trending_down</span> {delta}
    </span>
  );
  return (
    <span className="trend-flat">
      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>trending_flat</span> {delta}
    </span>
  );
}

export default function Reporteria() {
  return (
    <>
      <Header title="Operational Insights">
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>calendar_today</span>
            Last 30 Days
          </button>
          <button className="btn btn-primary btn-sm">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>download</span>
            Export
          </button>
        </div>
      </Header>

      <div className="page-body">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, marginBottom: 24 }}>

          {/* Top Rated Merchants */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div className="card-header">
              <div className="card-header-title">
                <span className="material-symbols-outlined">stars</span>
                Top Rated Merchants
              </div>
              <button className="btn-link" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>View All</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Merchant</th>
                    <th>Category</th>
                    <th>Rating</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_MERCHANTS.map((m) => (
                    <tr key={m.name}>
                      <td className="td-bold">{m.name}</td>
                      <td className="text-muted text-sm">{m.category}</td>
                      <td>
                        <div className="rating">
                          <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>star</span>
                          {m.rating}
                        </div>
                      </td>
                      <td><TrendBadge trend={m.trend} delta={m.delta} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Best Selling Dishes */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-title">
                <span className="material-symbols-outlined">restaurant_menu</span>
                Best Selling Dishes
              </div>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {BEST_DISHES.map((d, i) => (
                <div key={d.name} className="bar-item">
                  <div className="bar-header">
                    <span>{d.name}</span>
                    <span className="bar-count">{d.units} units</span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${d.pct}%`,
                        opacity: 1 - i * 0.15,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: "grid", gridTemplateColumns: "5fr 7fr", gap: 24 }}>

          {/* Loyalty Leaderboard */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div className="card-header">
              <div className="card-header-title">
                <span className="material-symbols-outlined">groups</span>
                Loyalty Leaderboard
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th style={{ textAlign: "right" }}>Orders</th>
                    <th style={{ textAlign: "right" }}>Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {CUSTOMERS.map((c) => (
                    <tr key={c.name}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="customer-avatar">{c.initials}</div>
                          <span className="td-bold">{c.name}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>{c.orders}</td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>{c.spent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Geospatial Search */}
          <div className="card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div className="card-header">
              <div className="card-header-title">
                <span className="material-symbols-outlined">location_searching</span>
                Geospatial Search
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input className="geo-input" placeholder="Lat: 40.7128" />
                <input className="geo-input" placeholder="Lng: -74.006" />
                <button className="icon-btn" style={{ background: "var(--primary-10)", color: "var(--primary)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>search</span>
                </button>
              </div>
            </div>

            {/* Map */}
            <div className="map-container" style={{ flex: 1, minHeight: 260 }}>
              {/* SVG Grid background */}
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }}>
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748b" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Simulated streets */}
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.2 }}>
                <line x1="0" y1="40%" x2="100%" y2="40%" stroke="#94a3b8" strokeWidth="2" />
                <line x1="0" y1="65%" x2="100%" y2="65%" stroke="#94a3b8" strokeWidth="1" />
                <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#94a3b8" strokeWidth="2" />
                <line x1="60%" y1="0" x2="60%" y2="100%" stroke="#94a3b8" strokeWidth="1" />
                <line x1="80%" y1="0" x2="80%" y2="100%" stroke="#94a3b8" strokeWidth="1" />
              </svg>

              {/* Markers */}
              {MAP_MARKERS.map((m, i) => (
                <div
                  key={i}
                  className={`map-marker ${i === 0 ? "pulse" : ""}`}
                  style={{ top: m.top, left: m.left, right: m.right }}
                  title={m.label}
                />
              ))}

              {/* Legend */}
              <div className="map-legend">
                <div className="legend-item">
                  <div className="legend-dot" style={{ background: "var(--primary)" }} />
                  Active Delivery
                </div>
                <div className="legend-item">
                  <div className="legend-dot" style={{ background: "var(--slate-400)" }} />
                  Merchant Offline
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}