import { useState } from "react";
import Header from "../components/layout/Header";

const TABS = [
  { id: "restaurants", icon: "restaurant", label: "Restaurants" },
  { id: "users", icon: "group", label: "Users" },
  { id: "menu", icon: "menu_book", label: "Menu" },
  { id: "orders", icon: "receipt_long", label: "Orders" },
  { id: "reviews", icon: "reviews", label: "Reviews" },
];

const RESTAURANTS = [
  { id: "RES-001", name: "The Burger Joint", status: "Online" },
  { id: "RES-002", name: "Pizza Heaven", status: "Offline" },
  { id: "RES-003", name: "Sushi Master", status: "Busy" },
  { id: "RES-004", name: "Taco Fiesta", status: "Online" },
  { id: "RES-005", name: "Wok N Roll", status: "Online" },
  { id: "RES-006", name: "Pasta Palace", status: "Busy" },
  { id: "RES-007", name: "Green Salad Co.", status: "Offline" },
  { id: "RES-008", name: "Donut Dreams", status: "Online" },
  { id: "RES-009", name: "Steakhouse Prime", status: "Online" },
  { id: "RES-010", name: "Curry House", status: "Busy" },
  { id: "RES-011", name: "Smoothie King", status: "Online" },
  { id: "RES-012", name: "Bagel Stop", status: "Offline" },
  { id: "RES-013", name: "Kebab Express", status: "Online" },
  { id: "RES-014", name: "Dim Sum Deli", status: "Busy" },
  { id: "RES-015", name: "Noodle Bar", status: "Online" },
];

const USERS = [
  { id: "USR-001", name: "John Doe", status: "Active" },
  { id: "USR-002", name: "Sarah Kim", status: "Active" },
  { id: "USR-003", name: "Mike Brown", status: "Inactive" },
  { id: "USR-004", name: "Emma Lee", status: "Active" },
  { id: "USR-005", name: "Carlos Ruiz", status: "Guest" },
];

const MENU = [
  { id: "MNU-001", name: "Classic Wagyu Burger", status: "Available", categoria: "Categoria 1" },
  { id: "MNU-002", name: "Spicy Salmon Roll", status: "Available", categoria: "Categoria 2" },
  { id: "MNU-003", name: "Truffle Fettuccine", status: "Unavailable", categoria: "Categoria 1" },
  { id: "MNU-004", name: "Quinoa Power Bowl", status: "Available", categoria: "Categoria 3" },
];

const ORDERS = [
  { id: "ORD-9021", name: "The Burger Joint → John Doe", status: "Pending" },
  { id: "ORD-9020", name: "Sushi Master → Emma Lee", status: "Delivered" },
  { id: "ORD-9019", name: "Pizza Heaven → Mike Brown", status: "In Transit" },
];

const REVIEWS = [
  { id: "REV-001", name: "The Burger Joint — John Doe", status: "5★" },
  { id: "REV-002", name: "Sushi Master — Sarah Kim", status: "4★" },
  { id: "REV-003", name: "Pasta Palace — Emma Lee", status: "3★" },
];

const DATA_MAP = { restaurants: RESTAURANTS, users: USERS, menu: MENU, orders: ORDERS, reviews: REVIEWS };

const STATUS_BADGE = {
  Online: "badge-green", Active: "badge-green", Available: "badge-green", Delivered: "badge-green", "5★": "badge-green",
  Offline: "badge-slate", Inactive: "badge-slate", Unavailable: "badge-slate",
  Busy: "badge-amber", Pending: "badge-amber", "3★": "badge-amber", Guest: "badge-amber", "In Transit": "badge-amber",
  "4★": "badge-slate",
};

function EditModal({ item, tab, onClose, onSave }) {
  const [name, setName] = useState(item ? item.name : "");
  const [status, setStatus] = useState(item ? item.status : "Online");
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{item ? "Edit Entry" : "New Entry"}</h3>
          <button className="modal-close" onClick={onClose}><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Name / Description</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Online</option><option>Offline</option><option>Busy</option>
              <option>Active</option><option>Inactive</option><option>Guest</option>
              <option>Available</option><option>Unavailable</option>
              <option>Pending</option><option>Delivered</option><option>In Transit</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave({ ...item, name, status })}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ item, onClose, onConfirm }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-body" style={{ paddingTop: 32 }}>
          <div className="confirm-icon danger">
            <span className="material-symbols-outlined">delete_forever</span>
          </div>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Delete Entry</h3>
            <p style={{ fontSize: 13, color: "var(--slate-500)", marginTop: 6 }}>
              Are you sure you want to delete <strong>{item?.name}</strong>? This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="modal-footer" style={{ justifyContent: "center" }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function PurgeGuestsModal({ count, onClose, onConfirm }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-body" style={{ paddingTop: 32 }}>
          <div className="confirm-icon danger">
            <span className="material-symbols-outlined">group_remove</span>
          </div>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Eliminar usuarios</h3>
            <p style={{ fontSize: 13, color: "var(--slate-500)", marginTop: 6 }}>
              Esta acción eliminará <strong>{count} usuario(s)</strong> con rol <strong>Guest</strong> de forma permanente. ¿Estás seguro?
            </p>
          </div>
        </div>
        <div className="modal-footer" style={{ justifyContent: "center" }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>Eliminar usuarios</button>
        </div>
      </div>
    </div>
  );
}

function UpdatePreciosModal({ categorias, onClose, onConfirm }) {
  const [categoria, setCategoria] = useState(categorias[0] || "");
  const [incremento, setIncremento] = useState("");
  const [error, setError] = useState("");

  function handleConfirm() {
    const val = parseFloat(incremento);
    if (!incremento || isNaN(val)) { setError("Ingresa un incremento válido."); return; }
    if (val === 0) { setError("El incremento no puede ser 0."); return; }
    onConfirm({ categoria, incremento: val });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Actualizar precios por categoría</h3>
          <button className="modal-close" onClick={onClose}><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: "var(--slate-500)", marginBottom: 16 }}>
            Sube o baja el precio de todos los artículos de una categoría. Usa valores negativos para reducir precios.
          </p>
          <div className="form-group">
            <label className="form-label">Categoría</label>
            <select className="form-input form-select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Incremento de precio (Q)</label>
            <input
              className="form-input"
              type="number"
              placeholder="Ej: 10 o -5"
              value={incremento}
              onChange={(e) => { setIncremento(e.target.value); setError(""); }}
            />
            {error && <p style={{ fontSize: 12, color: "var(--red-500)", marginTop: 4 }}>{error}</p>}
          </div>
          {incremento && !isNaN(parseFloat(incremento)) && (
            <div style={{ background: "var(--slate-50)", border: "1px solid var(--slate-200)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--slate-600)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15, verticalAlign: "middle", marginRight: 6 }}>info</span>
              Todos los artículos de <strong>{categoria}</strong> cambiarán <strong>{parseFloat(incremento) > 0 ? "+" : ""}{incremento}</strong> en su precio.
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleConfirm}>Aplicar cambio</button>
        </div>
      </div>
    </div>
  );
}

export default function Gestion() {
  const [tab, setTab] = useState("restaurants");
  const [data, setData] = useState(DATA_MAP);
  const [editItem, setEditItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [showPreciosModal, setShowPreciosModal] = useState(false);
  const [preciosResult, setPreciosResult] = useState(null);

  const rows = (data[tab] || []).filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const paginated = rows.slice((page - 1) * perPage, page * perPage);

  const menuCategorias = [...new Set((data.menu || []).map((m) => m.categoria).filter(Boolean))];
  const guestCount = (data.users || []).filter((u) => u.status === "Guest").length;

  function handleSave(updated) {
    setData((prev) => {
      const list = prev[tab];
      if (updated.id && list.find((r) => r.id === updated.id)) {
        return { ...prev, [tab]: list.map((r) => (r.id === updated.id ? updated : r)) };
      }
      return { ...prev, [tab]: [{ ...updated, id: `NEW-${Date.now()}` }, ...list] };
    });
    setShowModal(false);
    setEditItem(null);
  }

  function handleDelete() {
    setData((prev) => ({ ...prev, [tab]: prev[tab].filter((r) => r.id !== deleteItem.id) }));
    setDeleteItem(null);
  }

  function handlePurgeGuests() {
    // Conectar al backend: DELETE /api/usuarios/mantenimiento/invitados
    setData((prev) => ({ ...prev, users: prev.users.filter((u) => u.status !== "Guest") }));
    setShowPurgeModal(false);
  }

  function handleUpdatePrecios({ categoria, incremento }) {
    // Conectar al backend: PUT /api/menu/update-precios { categoria, incremento }
    setPreciosResult({ categoria, incremento });
    setShowPreciosModal(false);
  }

  return (
    <>
      <Header title="System Management" icon="verified_user">
        <button className="btn btn-primary btn-sm" onClick={() => { setEditItem(null); setShowModal(true); }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          New Entry
        </button>
      </Header>

      <div className="page-body">
        <div style={{ marginBottom: 16 }}>
          <div className="search-bar" style={{ width: 300 }}>
            <span className="material-symbols-outlined">search</span>
            <input
              placeholder="Search entries..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div className="tabs" style={{ marginBottom: 16 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${tab === t.id ? "active" : ""}`}
              onClick={() => { setTab(t.id); setPage(1); setSearch(""); setPreciosResult(null); }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Acción masiva: Users */}
        {tab === "users" && (
          <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setShowPurgeModal(true)}
              disabled={guestCount === 0}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>group_remove</span>
              Eliminar usuarios{guestCount > 0 ? ` (${guestCount})` : ""}
            </button>
            {guestCount === 0 && (
              <span style={{ fontSize: 12, color: "var(--slate-400)" }}>No hay usuarios invitados.</span>
            )}
          </div>
        )}

        {/* Acción masiva: Menu */}
        {tab === "menu" && (
          <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowPreciosModal(true)}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>price_change</span>
              Actualizar precios por categoría
            </button>
            {preciosResult && (
              <span style={{ fontSize: 12, color: "var(--slate-500)" }}>
                ✓ <strong>{preciosResult.categoria}</strong>: {preciosResult.incremento > 0 ? "+" : ""}{preciosResult.incremento} aplicado
              </span>
            )}
          </div>
        )}

        <div className="card" style={{ overflow: "hidden" }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 100 }}>ID</th>
                  <th>Name</th>
                  <th style={{ width: 140 }}>Status</th>
                  <th style={{ width: 140, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: 40, color: "var(--slate-400)" }}>No results found</td></tr>
                ) : (
                  paginated.map((row) => (
                    <tr key={row.id}>
                      <td className="td-mono">#{row.id}</td>
                      <td className="td-bold">
                        {row.name}
                        {row.categoria && (
                          <span style={{ fontSize: 11, color: "var(--slate-400)", marginLeft: 8 }}>{row.categoria}</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[row.status] || "badge-slate"}`}>{row.status}</span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <button className="btn-link" onClick={() => { setEditItem(row); setShowModal(true); }}>Edit</button>
                          <button className="btn-link" style={{ color: "var(--red-500)" }} onClick={() => setDeleteItem(row)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <div className="pagination-info">
              <span>Items per page: {perPage}</span>
              <span>Page {page} of {totalPages}</span>
            </div>
            <div className="pagination-controls">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(1)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>first_page</span>
              </button>
              <button className="page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1;
                return (
                  <button key={p} className={`page-btn ${page === p ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                );
              })}
              {totalPages > 5 && <span style={{ padding: "0 4px", color: "var(--slate-400)" }}>...</span>}
              {totalPages > 5 && (
                <button className={`page-btn ${page === totalPages ? "active" : ""}`} onClick={() => setPage(totalPages)}>{totalPages}</button>
              )}
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
              </button>
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(totalPages)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>last_page</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <EditModal item={editItem} tab={tab} onClose={() => { setShowModal(false); setEditItem(null); }} onSave={handleSave} />
      )}
      {deleteItem && (
        <ConfirmModal item={deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} />
      )}
      {showPurgeModal && (
        <PurgeGuestsModal count={guestCount} onClose={() => setShowPurgeModal(false)} onConfirm={handlePurgeGuests} />
      )}
      {showPreciosModal && (
        <UpdatePreciosModal categorias={menuCategorias} onClose={() => setShowPreciosModal(false)} onConfirm={handleUpdatePrecios} />
      )}
    </>
  );
}