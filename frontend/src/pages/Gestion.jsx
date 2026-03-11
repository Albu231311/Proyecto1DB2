import { useState, useEffect, useCallback } from "react";
import Header from "../components/layout/Header";
import { getOrdenes, crearOrden, updateOrden, deleteOrden } from "../api/ordenes";

const TABS = [
  { id: "restaurants", icon: "restaurant", label: "Restaurants" },
  { id: "users",       icon: "group",         label: "Users" },
  { id: "menu",        icon: "menu_book",      label: "Menu" },
  { id: "orders",      icon: "receipt_long",   label: "Orders" },
  { id: "reviews",     icon: "reviews",        label: "Reviews" },
];

// ─── Datos locales (tabs aún no conectados al backend) ───────────────────────
const RESTAURANTS = [
  { id: "RES-001", name: "The Burger Joint", status: "Online" },
  { id: "RES-002", name: "Pizza Heaven",     status: "Offline" },
  { id: "RES-003", name: "Sushi Master",     status: "Busy" },
  { id: "RES-004", name: "Taco Fiesta",      status: "Online" },
  { id: "RES-005", name: "Wok N Roll",       status: "Online" },
];

const USERS = [
  { id: "USR-001", name: "John Doe",    status: "Active" },
  { id: "USR-002", name: "Sarah Kim",   status: "Active" },
  { id: "USR-003", name: "Mike Brown",  status: "Inactive" },
  { id: "USR-004", name: "Emma Lee",    status: "Active" },
  { id: "USR-005", name: "Carlos Ruiz", status: "Guest" },
];

const MENU = [
  { id: "MNU-001", name: "Classic Wagyu Burger", status: "Available",   categoria: "Categoria 1" },
  { id: "MNU-002", name: "Spicy Salmon Roll",    status: "Available",   categoria: "Categoria 2" },
  { id: "MNU-003", name: "Truffle Fettuccine",   status: "Unavailable", categoria: "Categoria 1" },
  { id: "MNU-004", name: "Quinoa Power Bowl",    status: "Available",   categoria: "Categoria 3" },
];

const REVIEWS = [
  { id: "REV-001", name: "The Burger Joint — John Doe",  status: "5★" },
  { id: "REV-002", name: "Sushi Master — Sarah Kim",     status: "4★" },
  { id: "REV-003", name: "Pasta Palace — Emma Lee",      status: "3★" },
];

const LOCAL_DATA = { restaurants: RESTAURANTS, users: USERS, menu: MENU, reviews: REVIEWS };

// ─── Badges ──────────────────────────────────────────────────────────────────
const STATUS_BADGE = {
  Online: "badge-green", Active: "badge-green", Available: "badge-green",
  Delivered: "badge-green", entregado: "badge-green", "5★": "badge-green",
  Offline: "badge-slate", Inactive: "badge-slate", Unavailable: "badge-slate", "4★": "badge-slate",
  Busy: "badge-amber", Pending: "badge-amber", pendiente: "badge-amber",
  "3★": "badge-amber", Guest: "badge-amber", "In Transit": "badge-amber",
  confirmado: "badge-amber", preparando: "badge-amber", en_camino: "badge-amber",
};

// ─── Modales ─────────────────────────────────────────────────────────────────
function EditModal({ item, isOrder, onClose, onSave }) {
  const [name,   setName]   = useState(item?.name   ?? item?.estado ?? "");
  const [status, setStatus] = useState(item?.status ?? item?.estado ?? "pendiente");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{item ? "Editar" : "Nueva entrada"}</h3>
          <button className="modal-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="modal-body">
          {!isOrder && (
            <div className="form-group">
              <label className="form-label">Nombre / Descripción</label>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select className="form-input form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {isOrder ? (
                <>
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="preparando">Preparando</option>
                  <option value="en_camino">En camino</option>
                  <option value="entregado">Entregado</option>
                </>
              ) : (
                <>
                  <option>Online</option><option>Offline</option><option>Busy</option>
                  <option>Active</option><option>Inactive</option><option>Guest</option>
                  <option>Available</option><option>Unavailable</option>
                </>
              )}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => onSave({ ...item, name, status, estado: status })}>
            Guardar
          </button>
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
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Eliminar entrada</h3>
            <p style={{ fontSize: 13, color: "var(--slate-500)", marginTop: 6 }}>
              ¿Seguro que quieres eliminar <strong>{item?.name || item?._id}</strong>? Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
        <div className="modal-footer" style={{ justifyContent: "center" }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>Eliminar</button>
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
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Eliminar usuarios invitados</h3>
            <p style={{ fontSize: 13, color: "var(--slate-500)", marginTop: 6 }}>
              Esta acción eliminará <strong>{count} usuario(s)</strong> con rol <strong>Guest</strong> de forma permanente.
            </p>
          </div>
        </div>
        <div className="modal-footer" style={{ justifyContent: "center" }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>Eliminar invitados</button>
        </div>
      </div>
    </div>
  );
}

function UpdatePreciosModal({ categorias, onClose, onConfirm }) {
  const [categoria,  setCategoria]  = useState(categorias[0] || "");
  const [incremento, setIncremento] = useState("");
  const [error,      setError]      = useState("");

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
          <button className="modal-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: "var(--slate-500)", marginBottom: 16 }}>
            Usa valores negativos para reducir precios.
          </p>
          <div className="form-group">
            <label className="form-label">Categoría</label>
            <select className="form-input form-select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Incremento (Q)</label>
            <input
              className="form-input" type="number" placeholder="Ej: 10 o -5"
              value={incremento}
              onChange={(e) => { setIncremento(e.target.value); setError(""); }}
            />
            {error && <p style={{ fontSize: 12, color: "var(--red-500)", marginTop: 4 }}>{error}</p>}
          </div>
          {incremento && !isNaN(parseFloat(incremento)) && (
            <div style={{ background: "var(--slate-50)", border: "1px solid var(--slate-200)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--slate-600)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 15, verticalAlign: "middle", marginRight: 6 }}>info</span>
              <strong>{categoria}</strong>: {parseFloat(incremento) > 0 ? "+" : ""}{incremento} en cada precio.
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleConfirm}>Aplicar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente de tabla para órdenes (datos reales del backend) ──────────────
function OrdersTable() {
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [editItem,    setEditItem]    = useState(null);
  const [deleteItem,  setDeleteItem]  = useState(null);
  const [saving,      setSaving]      = useState(false);

  const fetchOrders = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrdenes(p, 10);
      setOrders(data.docs || []);
      setTotalPages(data.totalPages || 1);
      setPage(p);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(1); }, [fetchOrders]);

  async function handleSave(updated) {
    setSaving(true);
    try {
      await updateOrden(updated._id, { estado: updated.estado });
      await fetchOrders(page);
      setEditItem(null);
    } catch (e) {
      alert("Error al guardar: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await deleteOrden(deleteItem._id);
      await fetchOrders(page);
      setDeleteItem(null);
    } catch (e) {
      alert("Error al eliminar: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--slate-400)" }}>
      <span className="material-symbols-outlined" style={{ fontSize: 32, marginBottom: 8, display: "block" }}>hourglass_empty</span>
      Cargando órdenes...
    </div>
  );

  if (error) return (
    <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--red-500)" }}>
      <span className="material-symbols-outlined" style={{ fontSize: 32, marginBottom: 8, display: "block" }}>error</span>
      Error: {error}
      <br />
      <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={() => fetchOrders(page)}>Reintentar</button>
    </div>
  );

  return (
    <>
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 160 }}>ID</th>
                <th>Cliente</th>
                <th>Restaurante</th>
                <th style={{ width: 80, textAlign: "right" }}>Total</th>
                <th style={{ width: 140 }}>Estado</th>
                <th style={{ width: 140, textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--slate-400)" }}>Sin resultados</td></tr>
              ) : orders.map((row) => (
                <tr key={row._id}>
                  <td className="td-mono" style={{ fontSize: 11 }}>#{String(row._id).slice(-8)}</td>
                  <td className="td-bold">{row.usuarioInfo?.nombre ?? "—"}</td>
                  <td style={{ color: "var(--slate-500)", fontSize: 13 }}>{row.restauranteInfo?.nombre ?? "—"}</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>Q{row.total?.toFixed(2) ?? "—"}</td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[row.estado] || "badge-slate"}`}>{row.estado}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button className="btn-link" onClick={() => setEditItem(row)}>Editar</button>
                      <button className="btn-link" style={{ color: "var(--red-500)" }} onClick={() => setDeleteItem(row)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="pagination">
          <div className="pagination-info">
            <span>Página {page} de {totalPages}</span>
          </div>
          <div className="pagination-controls">
            <button className="page-btn" disabled={page === 1} onClick={() => fetchOrders(1)}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>first_page</span>
            </button>
            <button className="page-btn" disabled={page === 1} onClick={() => fetchOrders(page - 1)}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} className={`page-btn ${page === p ? "active" : ""}`} onClick={() => fetchOrders(p)}>{p}</button>
            ))}
            {totalPages > 5 && <span style={{ padding: "0 4px", color: "var(--slate-400)" }}>...</span>}
            {totalPages > 5 && (
              <button className={`page-btn ${page === totalPages ? "active" : ""}`} onClick={() => fetchOrders(totalPages)}>{totalPages}</button>
            )}
            <button className="page-btn" disabled={page === totalPages} onClick={() => fetchOrders(page + 1)}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
            </button>
            <button className="page-btn" disabled={page === totalPages} onClick={() => fetchOrders(totalPages)}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>last_page</span>
            </button>
          </div>
        </div>
      </div>

      {editItem && (
        <EditModal
          item={editItem}
          isOrder={true}
          onClose={() => setEditItem(null)}
          onSave={handleSave}
        />
      )}
      {deleteItem && (
        <ConfirmModal
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Gestion() {
  const [tab,             setTab]             = useState("restaurants");
  const [localData,       setLocalData]       = useState(LOCAL_DATA);
  const [editItem,        setEditItem]        = useState(null);
  const [showModal,       setShowModal]       = useState(false);
  const [deleteItem,      setDeleteItem]      = useState(null);
  const [page,            setPage]            = useState(1);
  const [search,          setSearch]          = useState("");
  const [showPurgeModal,  setShowPurgeModal]  = useState(false);
  const [showPreciosModal,setShowPreciosModal]= useState(false);
  const [preciosResult,   setPreciosResult]   = useState(null);

  const isOrders = tab === "orders";
  const rows = isOrders ? [] : (localData[tab] || []).filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );
  const perPage    = 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const paginated  = rows.slice((page - 1) * perPage, page * perPage);

  const menuCategorias = [...new Set((localData.menu || []).map((m) => m.categoria).filter(Boolean))];
  const guestCount     = (localData.users || []).filter((u) => u.status === "Guest").length;

  function handleSaveLocal(updated) {
    setLocalData((prev) => {
      const list = prev[tab];
      if (updated.id && list.find((r) => r.id === updated.id)) {
        return { ...prev, [tab]: list.map((r) => (r.id === updated.id ? updated : r)) };
      }
      return { ...prev, [tab]: [{ ...updated, id: `NEW-${Date.now()}` }, ...list] };
    });
    setShowModal(false);
    setEditItem(null);
  }

  function handleDeleteLocal() {
    setLocalData((prev) => ({ ...prev, [tab]: prev[tab].filter((r) => r.id !== deleteItem.id) }));
    setDeleteItem(null);
  }

  function handlePurgeGuests() {
    // TODO: conectar → DELETE /api/usuarios/mantenimiento/invitados
    setLocalData((prev) => ({ ...prev, users: prev.users.filter((u) => u.status !== "Guest") }));
    setShowPurgeModal(false);
  }

  function handleUpdatePrecios({ categoria, incremento }) {
    // TODO: conectar → PUT /api/menu/update-precios { categoria, incremento }
    setPreciosResult({ categoria, incremento });
    setShowPreciosModal(false);
  }

  return (
    <>
      <Header title="System Management" icon="verified_user">
        {!isOrders && (
          <button className="btn btn-primary btn-sm" onClick={() => { setEditItem(null); setShowModal(true); }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            New Entry
          </button>
        )}
      </Header>

      <div className="page-body">
        {/* Search (solo tabs locales) */}
        {!isOrders && (
          <div style={{ marginBottom: 16 }}>
            <div className="search-bar" style={{ width: 300 }}>
              <span className="material-symbols-outlined">search</span>
              <input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
        )}

        {/* Tabs */}
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

        {/* Acciones masivas */}
        {tab === "users" && (
          <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <button className="btn btn-danger btn-sm" onClick={() => setShowPurgeModal(true)} disabled={guestCount === 0}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>group_remove</span>
              Eliminar invitados{guestCount > 0 ? ` (${guestCount})` : ""}
            </button>
            {guestCount === 0 && <span style={{ fontSize: 12, color: "var(--slate-400)" }}>No hay usuarios invitados.</span>}
          </div>
        )}

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

        {/* Tabla órdenes (backend real) */}
        {isOrders ? <OrdersTable /> : (
          <div className="card" style={{ overflow: "hidden" }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 100 }}>ID</th>
                    <th>Nombre</th>
                    <th style={{ width: 140 }}>Estado</th>
                    <th style={{ width: 140, textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: "center", padding: 40, color: "var(--slate-400)" }}>Sin resultados</td></tr>
                  ) : paginated.map((row) => (
                    <tr key={row.id}>
                      <td className="td-mono">#{row.id}</td>
                      <td className="td-bold">
                        {row.name}
                        {row.categoria && <span style={{ fontSize: 11, color: "var(--slate-400)", marginLeft: 8 }}>{row.categoria}</span>}
                      </td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[row.status] || "badge-slate"}`}>{row.status}</span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <button className="btn-link" onClick={() => { setEditItem(row); setShowModal(true); }}>Editar</button>
                          <button className="btn-link" style={{ color: "var(--red-500)" }} onClick={() => setDeleteItem(row)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <div className="pagination-info">
                <span>Items por página: {perPage}</span>
                <span>Página {page} de {totalPages}</span>
              </div>
              <div className="pagination-controls">
                <button className="page-btn" disabled={page === 1} onClick={() => setPage(1)}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>first_page</span>
                </button>
                <button className="page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={`page-btn ${page === p ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                ))}
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
        )}
      </div>

      {showModal && (
        <EditModal item={editItem} isOrder={false} onClose={() => { setShowModal(false); setEditItem(null); }} onSave={handleSaveLocal} />
      )}
      {deleteItem && (
        <ConfirmModal item={deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDeleteLocal} />
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