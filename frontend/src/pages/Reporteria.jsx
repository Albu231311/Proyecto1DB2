import { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import { getTopRestaurantes, getClientesRecurrentes, getPlatillosTop, getRestaurantesCercanos } from "../api/reportes";

function TrendBadge({ rating }) {
  const trend = rating >= 4.5 ? "up" : rating >= 4.0 ? "flat" : "down";
  const delta = rating >= 4.5 ? "+0.2" : rating >= 4.0 ? "0.0" : "-0.3";
  const config = {
    up: { class: "trend-up", icon: "trending_up" },
    down: { class: "trend-down", icon: "trending_down" },
    flat: { class: "trend-flat", icon: "trending_flat" },
  };
  return (
    <span className={config[trend].class}>
      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{config[trend].icon}</span> {delta}
    </span>
  );
}

export default function Reporteria() {
  const [topRestaurantes, setTopRestaurantes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [platillos, setPlatillos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para búsqueda Geoespacial
  const [geoQuery, setGeoQuery] = useState({ lat: "14.6349", lng: "-90.506" });
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resTop, resLoyalty, resPlatillos] = await Promise.all([
          getTopRestaurantes(),
          getClientesRecurrentes(),
          getPlatillosTop()
        ]);
        setTopRestaurantes(resTop.data);
        setClientes(resLoyalty.data);
        setPlatillos(resPlatillos.data);
      } catch (err) {
        console.error("Error cargando Atlas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Función para posicionar puntos de forma fija según su ID
  const getStaticPos = (id) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      top: `${(hash % 70) + 15}%`,
      left: `${((hash * 7) % 70) + 15}%`
    };
  };

  const handleGeoSearch = async () => {
    try {
      const res = await getRestaurantesCercanos(geoQuery.lng, geoQuery.lat);
      const newMarkers = res.data.map(rest => {
        const pos = getStaticPos(rest._id);
        return {
          ...pos,
          label: `${rest.nombre} (${Math.round(rest.distancia)}m)`
        };
      });
      setMarkers(newMarkers);
    } catch (err) {
      alert("Error en búsqueda espacial: " + err.message);
    }
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const maxVendido = platillos.length > 0 ? platillos[0].totalVendido : 1;

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
                  {loading ? (
                    <tr><td colSpan={4} style={{ textAlign: "center", padding: 30 }}>Consultando Atlas...</td></tr>
                  ) : (
                    topRestaurantes.map((m) => (
                      <tr key={m._id}>
                        <td className="td-bold">{m.nombre}</td>
                        <td className="text-muted text-sm">{Array.isArray(m.categorias) ? m.categorias[0] : "General"}</td>
                        <td>
                          <div className="rating">
                            <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>star</span>
                            {Number(m.promedioCalificacion || 0).toFixed(1)}
                          </div>
                        </td>
                        <td><TrendBadge rating={m.promedioCalificacion} /></td>
                      </tr>
                    ))
                  )}
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
              {platillos.map((d, i) => (
                <div key={i} className="bar-item">
                  <div className="bar-header">
                    <span style={{ fontSize: 12 }}>{d._id}</span>
                    <span className="bar-count">{d.totalVendido} units</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(d.totalVendido / maxVendido) * 100}%`, opacity: 1 - i * 0.15 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

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
                    <th style={{ textAlign: "right" }}>Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="customer-avatar">{getInitials(c.nombreCliente)}</div>
                          <span className="td-bold">{c.nombreCliente}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>{c.totalPedidos}</td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>Q{c.montoTotalGastado}</td>
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
                <input 
                   className="geo-input" 
                   value={geoQuery.lat} 
                   onChange={e => setGeoQuery({...geoQuery, lat: e.target.value})}
                   placeholder="Lat" 
                   style={{ width: 80, padding: '4px 8px', fontSize: 12, borderRadius: 4, border: '1px solid var(--slate-200)' }} 
                />
                <input 
                   className="geo-input" 
                   value={geoQuery.lng} 
                   onChange={e => setGeoQuery({...geoQuery, lng: e.target.value})}
                   placeholder="Lng" 
                   style={{ width: 80, padding: '4px 8px', fontSize: 12, borderRadius: 4, border: '1px solid var(--slate-200)' }} 
                />
                <button className="icon-btn" onClick={handleGeoSearch} style={{ background: "var(--primary-10)", color: "var(--primary)", border: 'none', borderRadius: 4, padding: '4px', cursor: 'pointer' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>search</span>
                </button>
              </div>
            </div>

            <div className="map-container" style={{ flex: 1, minHeight: 260, position: 'relative', background: '#f8fafc', overflow: 'hidden' }}>
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }}>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* PUNTO DE UBICACIÓN DEL USUARIO (AZUL FIJO) */}
              <div 
                style={{ 
                  position: 'absolute', 
                  top: '50%', // Centrado como punto de origen
                  left: '50%', 
                  transform: 'translate(-50%, -50%)', // Ajuste para centrar el div
                  width: '16px', 
                  height: '16px', 
                  background: '#3b82f6', // Azul para el usuario
                  borderRadius: '50%', 
                  border: '3px solid white',
                  zIndex: 200, // Por encima de los restaurantes
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              />

              {markers.map((m, i) => (
                <div 
                  key={i} 
                  className="map-marker pulse" 
                  style={{ 
                    position: 'absolute', 
                    top: m.top, 
                    left: m.left, 
                    width: '14px', 
                    height: '14px', 
                    background: 'var(--primary)', 
                    borderRadius: '50%', 
                    border: '2px solid white',
                    cursor: 'pointer',
                    zIndex: 100
                  }}
                >
                  <div className="map-tooltip">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .map-marker:hover .map-tooltip {
          visibility: visible;
          opacity: 1;
        }
        .map-tooltip {
          visibility: hidden;
          opacity: 0;
          background-color: #1e293b;
          color: #fff;
          text-align: center;
          border-radius: 4px;
          padding: 5px 10px;
          position: absolute;
          z-index: 101;
          bottom: 150%;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          font-size: 11px;
          transition: opacity 0.2s;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        .map-tooltip::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: #1e293b transparent transparent transparent;
        }
      `}</style>
    </>
  );
}