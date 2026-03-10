import { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import client from "../api/client";
import { getRestaurantes, buscarRestaurantes, deleteRestaurante } from "../api/restaurantes";

const TABS = [
  { id: "restaurantes", icon: "restaurant", label: "Restaurantes" },
  { id: "usuarios", icon: "group", label: "Usuarios" },
  { id: "menu", icon: "menu_book", label: "Menú" },
  { id: "ordenes", icon: "receipt_long", label: "Órdenes" },
  { id: "resenas", icon: "reviews", label: "Reseñas" },
];

const STATUS_BADGE = {
  Online: "badge-green", Active: "badge-green", Available: "badge-green", entregado: "badge-green",
  Offline: "badge-slate", Inactive: "badge-slate", Unavailable: "badge-slate",
  Busy: "badge-amber", Pending: "badge-amber", pendiente: "badge-amber",
};

export default function Gestion() {
  const [tab, setTab] = useState("restaurantes");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteItem, setDeleteItem] = useState(null);
  const [inputPage, setInputPage] = useState("1");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // ESTADOS DE FORMULARIOS
  const [formDataRestaurante, setFormDataRestaurante] = useState({
    nombre: "", descripcion: "", categorias: [""],
    direcciones: [{ calle: "", zona: "", ciudad: "", lng: "", lat: "" }]
  });

  const [formDataUsuario, setFormDataUsuario] = useState({
    nombre: "", email: "", rol: "cliente",
    direccionesEnvio: [{ alias: "Casa", calle: "", zona: "", ciudad: "", lng: "", lat: "" }]
  });

  const [formDataMenu, setFormDataMenu] = useState({
    nombre: "", descripcion: "", categoria: "", precio: "", restauranteId: ""
  });

  const [formDataResena, setFormDataResena] = useState({
    usuarioId: "", restauranteId: "", ordenId: "", calificacion: 5, comentario: ""
  });

  useEffect(() => {
    fetchData();
    setInputPage(page.toString());
  }, [tab, page, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      if (tab === "restaurantes") {
        res = search ? await buscarRestaurantes(search) : await getRestaurantes(page, 10);
      } else {
        res = await client.get(`/${tab}?page=${page}&limit=10`);
      }
      const data = res.data.docs || res.data;
      setItems(Array.isArray(data) ? data : []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewClick = () => {
    setIsEditing(false);
    setCurrentId(null);
    if (tab === "usuarios") {
      setFormDataUsuario({ nombre: "", email: "", rol: "cliente", direccionesEnvio: [{ alias: "Casa", calle: "", zona: "", ciudad: "", lng: "", lat: "" }] });
    } else if (tab === "menu") {
      setFormDataMenu({ nombre: "", descripcion: "", categoria: "", precio: "", restauranteId: "" });
    } else if (tab === "resenas") {
      setFormDataResena({ usuarioId: "", restauranteId: "", ordenId: "", calificacion: 5, comentario: "" });
    } else {
      setFormDataRestaurante({ nombre: "", descripcion: "", categorias: [""], direcciones: [{ calle: "", zona: "", ciudad: "", lng: "", lat: "" }] });
    }
    setShowModal(true);
  };

  const handleEditClick = (item) => {
    setIsEditing(true);
    setCurrentId(item._id);
    if (tab === "usuarios") {
      setFormDataUsuario({
        nombre: item.nombre || "", email: item.email || "", rol: item.rol || "cliente",
        direccionesEnvio: item.direccionesEnvio?.map(dir => ({
          alias: dir.alias || "Casa", calle: dir.calle || "", zona: dir.zona || "", ciudad: dir.ciudad || "",
          lng: dir.ubicacion?.coordinates[0] || "", lat: dir.ubicacion?.coordinates[1] || ""
        })) || [{ alias: "Casa", calle: "", zona: "", ciudad: "", lng: "", lat: "" }]
      });
    } else if (tab === "menu") {
      setFormDataMenu({
        nombre: item.nombre || "", descripcion: item.descripcion || "",
        categoria: item.categoria || "", precio: item.precio || "", restauranteId: item.restauranteId || ""
      });
    } else if (tab === "resenas") {
      setFormDataResena({
        usuarioId: item.usuarioId || "", restauranteId: item.restauranteId || "",
        ordenId: item.ordenId || "", calificacion: item.calificacion || 5, comentario: item.comentario || ""
      });
    } else if (tab === "restaurantes") {
      setFormDataRestaurante({
        nombre: item.nombre || "", descripcion: item.descripcion || "", categorias: item.categorias || [""],
        direcciones: item.direcciones?.map(dir => ({
          calle: dir.calle, zona: dir.zona, ciudad: dir.ciudad,
          lng: dir.ubicacion?.coordinates[0] || "", lat: dir.ubicacion?.coordinates[1] || ""
        })) || [{ calle: "", zona: "", ciudad: "", lng: "", lat: "" }]
      });
    }
    setShowModal(true);
  };

  const addField = (type) => {
    if (tab === "restaurantes") {
      if (type === 'cat') setFormDataRestaurante({...formDataRestaurante, categorias: [...formDataRestaurante.categorias, ""]});
      else setFormDataRestaurante({...formDataRestaurante, direcciones: [...formDataRestaurante.direcciones, { calle: "", zona: "", ciudad: "", lng: "", lat: "" }]});
    } else if (tab === "usuarios") {
      setFormDataUsuario({...formDataUsuario, direccionesEnvio: [...formDataUsuario.direccionesEnvio, { alias: "", calle: "", zona: "", ciudad: "", lng: "", lat: "" }]});
    }
  };

  const removeDireccion = (index) => {
    if (tab === "restaurantes") {
      const filtered = formDataRestaurante.direcciones.filter((_, i) => i !== index);
      setFormDataRestaurante({...formDataRestaurante, direcciones: filtered});
    } else {
      const filtered = formDataUsuario.direccionesEnvio.filter((_, i) => i !== index);
      setFormDataUsuario({...formDataUsuario, direccionesEnvio: filtered});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = `/${tab}`;
      const data = tab === "usuarios" ? formDataUsuario : tab === "menu" ? formDataMenu : tab === "resenas" ? formDataResena : formDataRestaurante;
      if (isEditing) await client.put(`${endpoint}/${currentId}`, data);
      else await client.post(endpoint, data);
      setShowModal(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.error || "Error al procesar solicitud."); }
  };

  const handlePageJump = (e) => {
    if (e.key === 'Enter') {
      const p = parseInt(inputPage);
      if (p >= 1 && p <= totalPages) setPage(p);
      else setInputPage(page.toString());
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (tab === "restaurantes") await deleteRestaurante(deleteItem._id);
      else await client.delete(`/${tab}/${deleteItem._id}`);
      setDeleteItem(null);
      fetchData();
    } catch (err) { alert("Error al eliminar."); }
  };

  return (
    <>
      <Header title="Gestión de Base de Datos" icon="database">
        {(tab !== "ordenes") && (
          <button className="btn btn-primary btn-sm" onClick={handleAddNewClick}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            Nuevo {tab === "menu" ? "Producto" : tab === "resenas" ? "Comentario" : tab === "usuarios" ? "Usuario" : "Restaurante"}
          </button>
        )}
      </Header>

      <div className="page-body">
        <div style={{ marginBottom: 16 }}>
          <div className="search-bar" style={{ width: 350 }}>
            <span className="material-symbols-outlined">search</span>
            <input placeholder={`Buscar en ${tab}...`} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        <div className="tabs" style={{ marginBottom: 16 }}>
          {TABS.map((t) => (
            <button key={t.id} className={`tab-btn ${tab === t.id ? "active" : ""}`} onClick={() => { setTab(t.id); setPage(1); setSearch(""); }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div className="card" style={{ overflow: "hidden" }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 120 }}>ID ATLAS</th>
                  <th>DETALLES DEL DOCUMENTO</th>
                  <th style={{ width: 140 }}>ESTADO</th>
                  <th style={{ width: 140, textAlign: "right" }}>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: 40 }}>Consultando MongoDB Atlas...</td></tr>
                ) : (
                  items.map((row) => (
                    <tr key={row._id}>
                      <td className="td-mono" style={{ fontSize: '10px', color: 'var(--slate-400)' }}>{row._id}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--slate-800)' }}>
                          {tab !== "resenas" && (row.nombre || row.name || row.username || `Orden #${row._id.slice(-4)}`)}
                        </div>

                        {tab === "usuarios" && (
                          <div style={{ marginTop: '4px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--slate-500)' }}>{row.email}</div>
                            <div style={{ fontSize: '10px', background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px', display: 'inline-block', marginTop: 4 }}>{row.rol}</div>
                          </div>
                        )}

                        {tab === "menu" && (
                          <div style={{ marginTop: '4px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>store</span>
                                {row.restauranteInfo?.nombre || "ID: " + row.restauranteId}
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                <span style={{ fontSize: '10px', background: 'var(--slate-100)', padding: '1px 6px', borderRadius: 4 }}>{row.categoria}</span>
                                <span style={{ fontWeight: 700, color: 'var(--green-600)', fontSize: '12px' }}>Q{row.precio}</span>
                            </div>
                          </div>
                        )}

                        {tab === "ordenes" && (
                          <div style={{ marginTop: '4px' }}>
                            <div style={{ fontWeight: 600, fontSize: '12px' }}>{row.usuarioInfo?.nombre} → {row.restauranteInfo?.nombre}</div>
                            <div style={{ marginTop: 6, background: '#f8fafc', padding: 6, borderRadius: 4 }}>
                                {row.items?.map((item, i) => (
                                    <div key={i} style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{item.cantidad}x {item.nombre}</span>
                                        <span>Q{item.subtotal}</span>
                                    </div>
                                ))}
                                <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--green-600)', fontSize: 11, marginTop: 4 }}>TOTAL: Q{row.total}</div>
                            </div>
                          </div>
                        )}

                        {tab === "resenas" && (
                          <div style={{ marginTop: '4px' }}>
                            <div style={{ fontWeight: 700 }}>Reseña de {row.usuarioInfo?.nombre || "Anónimo"}</div>
                            <div style={{ fontSize: '12px', color: 'var(--slate-500)' }}>{row.restauranteInfo?.nombre}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--amber-400)' }}>star</span>
                              <span style={{ fontWeight: 700 }}>{row.calificacion}</span>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--slate-600)', background: '#f1f5f9', padding: '8px', borderRadius: '4px', fontStyle: 'italic' }}>"{row.comentario}"</div>
                          </div>
                        )}

                        {tab === "restaurantes" && (
                          <>
                            <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                                {row.categorias?.map((cat, i) => (
                                <span key={i} style={{ fontSize: '10px', background: 'var(--slate-100)', padding: '1px 6px', borderRadius: '4px' }}>{cat}</span>
                                ))}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--slate-500)', marginTop: 6 }}>⭐ {Number(row.promedioCalificacion || 0).toFixed(1)} • {row.totalResenas || 0} reseñas</div>
                          </>
                        )}
                      </td>
                      <td><span className={`badge ${STATUS_BADGE[row.status || row.estado] || "badge-slate"}`}>{row.status || row.estado || "Activo"}</span></td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          {(tab !== "ordenes") && <button className="btn-link" onClick={() => handleEditClick(row)}>Editar</button>}
                          <button className="btn-link" style={{ color: "var(--red-500)" }} onClick={() => setDeleteItem(row)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Paginación */}
          {!search && (
            <div className="pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--slate-200)' }}>
              <div style={{ fontSize: '13px' }}>Página <strong>{page}</strong> de {totalPages}</div>
              <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button className="page-btn" disabled={page === 1} onClick={() => setPage(1)}><span className="material-symbols-outlined">first_page</span></button>
                <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}><span className="material-symbols-outlined">chevron_left</span></button>
                <input type="text" value={inputPage} onChange={(e) => setInputPage(e.target.value)} onKeyDown={handlePageJump} style={{ width: '40px', textAlign: 'center', padding: '4px', borderRadius: '4px', border: '1px solid var(--slate-300)', fontSize: '12px' }} />
                <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><span className="material-symbols-outlined">chevron_right</span></button>
                <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(totalPages)}><span className="material-symbols-outlined">last_page</span></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL RESTAURANTES */}
      {showModal && tab === "restaurantes" && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 650, width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ padding: '20px', borderBottom: '1px solid var(--slate-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><span className="material-symbols-outlined">{isEditing ? "edit_note" : "add_business"}</span> {isEditing ? "Editar Restaurante" : "Nuevo Restaurante"}</h3>
              <button className="btn-link" onClick={() => setShowModal(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--slate-500)', marginBottom: 4 }}>Nombre</label>
                <input required className="input-field" value={formDataRestaurante.nombre} onChange={e => setFormDataRestaurante({...formDataRestaurante, nombre: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--slate-200)' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--slate-500)', marginBottom: 4 }}>Descripción</label>
                <textarea className="input-field" value={formDataRestaurante.descripcion} onChange={e => setFormDataRestaurante({...formDataRestaurante, descripcion: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--slate-200)', minHeight: 60 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate-500)' }}>Categorías</label>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => addField('cat')}>+ Añadir</button>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {formDataRestaurante.categorias.map((cat, i) => (
                    <input key={i} value={cat} onChange={(e) => { const nc = [...formDataRestaurante.categorias]; nc[i] = e.target.value; setFormDataRestaurante({...formDataRestaurante, categorias: nc}); }} style={{ padding: '6px 10px', fontSize: '12px', borderRadius: 20, border: '1px solid var(--slate-200)', width: '120px' }} required />
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate-500)' }}>Direcciones</label>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => addField('dir')}>+ Añadir</button>
                </div>
                {formDataRestaurante.direcciones.map((dir, i) => (
                  <div key={i} style={{ padding: '12px', background: 'var(--slate-50)', borderRadius: '8px', marginBottom: '8px', border: '1px solid var(--slate-200)', position: 'relative' }}>
                    <button type="button" onClick={() => removeDireccion(i)} style={{ position: 'absolute', right: 8, top: 8, color: 'var(--red-500)', background: 'none', border: 'none' }}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span></button>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px', paddingRight: '20px' }}>
                      <input placeholder="Calle" value={dir.calle} onChange={(e) => { const nd = [...formDataRestaurante.direcciones]; nd[i].calle = e.target.value; setFormDataRestaurante({...formDataRestaurante, direcciones: nd}); }} style={{ padding: '6px', fontSize: '12px', borderRadius: 4, border: '1px solid var(--slate-200)' }} required />
                      <input placeholder="Zona" value={dir.zona} onChange={(e) => { const nd = [...formDataRestaurante.direcciones]; nd[i].zona = e.target.value; setFormDataRestaurante({...formDataRestaurante, direcciones: nd}); }} style={{ padding: '6px', fontSize: '12px', borderRadius: 4, border: '1px solid var(--slate-200)' }} required />
                      <input placeholder="Ciudad" value={dir.ciudad} onChange={(e) => { const nd = [...formDataRestaurante.direcciones]; nd[i].ciudad = e.target.value; setFormDataRestaurante({...formDataRestaurante, direcciones: nd}); }} style={{ padding: '6px', fontSize: '12px', borderRadius: 4, border: '1px solid var(--slate-200)' }} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <input type="number" step="any" placeholder="Longitud" value={dir.lng} onChange={(e) => { const nd = [...formDataRestaurante.direcciones]; nd[i].lng = e.target.value; setFormDataRestaurante({...formDataRestaurante, direcciones: nd}); }} style={{ padding: '6px', fontSize: '12px', borderRadius: 4, border: '1px solid var(--slate-200)' }} required />
                      <input type="number" step="any" placeholder="Latitud" value={dir.lat} onChange={(e) => { const nd = [...formDataRestaurante.direcciones]; nd[i].lat = e.target.value; setFormDataRestaurante({...formDataRestaurante, direcciones: nd}); }} style={{ padding: '6px', fontSize: '12px', borderRadius: 4, border: '1px solid var(--slate-200)' }} required />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{isEditing ? "Actualizar" : "Guardar en Atlas"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL USUARIOS */}
      {showModal && tab === "usuarios" && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 650, width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ padding: '20px', borderBottom: '1px solid var(--slate-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><span className="material-symbols-outlined">{isEditing ? "manage_accounts" : "person_add"}</span> {isEditing ? "Editar Usuario" : "Nuevo Usuario"}</h3>
              <button className="btn-link" onClick={() => setShowModal(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--slate-500)', marginBottom: 4 }}>Nombre Completo</label>
                  <input required className="input-field" value={formDataUsuario.nombre} onChange={e => setFormDataUsuario({...formDataUsuario, nombre: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--slate-200)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--slate-500)', marginBottom: 4 }}>Email</label>
                  <input required type="email" className="input-field" value={formDataUsuario.email} onChange={e => setFormDataUsuario({...formDataUsuario, email: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--slate-200)' }} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--slate-500)', marginBottom: 4 }}>Rol</label>
                <select className="input-field" value={formDataUsuario.rol} onChange={e => setFormDataUsuario({...formDataUsuario, rol: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--slate-200)' }}>
                  <option value="cliente">Cliente</option>
                  <option value="invitado">Invitado</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate-500)' }}>Direcciones de Envío</label>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => addField('dir')}>+ Añadir</button>
                </div>
                {formDataUsuario.direccionesEnvio.map((dir, i) => (
                  <div key={i} style={{ padding: '12px', background: 'var(--slate-50)', borderRadius: '8px', marginBottom: '8px', border: '1px solid var(--slate-200)', position: 'relative' }}>
                    <button type="button" onClick={() => removeDireccion(i)} style={{ position: 'absolute', right: 8, top: 8, color: 'var(--red-500)', background: 'none', border: 'none' }}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span></button>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: '8px', marginBottom: '8px', paddingRight: '20px' }}>
                      <input placeholder="Alias" value={dir.alias} onChange={(e) => { const nd = [...formDataUsuario.direccionesEnvio]; nd[i].alias = e.target.value; setFormDataUsuario({...formDataUsuario, direccionesEnvio: nd}); }} style={{ padding: '6px', fontSize: '11px', borderRadius: 4, border: '1px solid var(--slate-200)' }} required />
                      <input placeholder="Calle" value={dir.calle} onChange={(e) => { const nd = [...formDataUsuario.direccionesEnvio]; nd[i].calle = e.target.value; setFormDataUsuario({...formDataUsuario, direccionesEnvio: nd}); }} style={{ padding: '6px', fontSize: '11px', borderRadius: 4, border: '1px solid var(--slate-200)' }} required />
                      <input placeholder="Zona" value={dir.zona} onChange={(e) => { const nd = [...formDataUsuario.direccionesEnvio]; nd[i].zona = e.target.value; setFormDataUsuario({...formDataUsuario, direccionesEnvio: nd}); }} style={{ padding: '6px', fontSize: '11px', borderRadius: 4, border: '1px solid var(--slate-200)' }} required />
                      <input placeholder="Ciudad" value={dir.ciudad} onChange={(e) => { const nd = [...formDataUsuario.direccionesEnvio]; nd[i].ciudad = e.target.value; setFormDataUsuario({...formDataUsuario, direccionesEnvio: nd}); }} style={{ padding: '6px', fontSize: '11px', borderRadius: 4, border: '1px solid var(--slate-200)' }} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <input type="number" step="any" placeholder="Longitud" value={dir.lng} onChange={(e) => { const nd = [...formDataUsuario.direccionesEnvio]; nd[i].lng = e.target.value; setFormDataUsuario({...formDataUsuario, direccionesEnvio: nd}); }} style={{ padding: '6px', fontSize: '11px', borderRadius: 4, border: '1px solid var(--slate-200)' }} required />
                      <input type="number" step="any" placeholder="Latitud" value={dir.lat} onChange={(e) => { const nd = [...formDataUsuario.direccionesEnvio]; nd[i].lat = e.target.value; setFormDataUsuario({...formDataUsuario, direccionesEnvio: nd}); }} style={{ padding: '6px', fontSize: '11px', borderRadius: 4, border: '1px solid var(--slate-200)' }} required />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{isEditing ? "Actualizar" : "Registrar en Atlas"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MENU */}
      {showModal && tab === "menu" && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 550, width: '95%' }}>
            <div className="modal-header" style={{ padding: '20px', borderBottom: '1px solid var(--slate-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><span className="material-symbols-outlined">{isEditing ? "edit_note" : "add_circle"}</span> {isEditing ? "Editar Producto" : "Nuevo Producto"}</h3>
              <button className="btn-link" onClick={() => setShowModal(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <input required placeholder="Nombre" className="input-field" value={formDataMenu.nombre} onChange={e => setFormDataMenu({...formDataMenu, nombre: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--slate-200)' }} />
                <input required placeholder="Categoría" className="input-field" value={formDataMenu.categoria} onChange={e => setFormDataMenu({...formDataMenu, categoria: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--slate-200)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <input required type="number" step="0.01" placeholder="Precio (Q)" className="input-field" value={formDataMenu.precio} onChange={e => setFormDataMenu({...formDataMenu, precio: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--slate-200)' }} />
                <input required placeholder="ID Restaurante" className="input-field" value={formDataMenu.restauranteId} onChange={e => setFormDataMenu({...formDataMenu, restauranteId: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--slate-200)' }} />
              </div>
              <textarea placeholder="Descripción" className="input-field" value={formDataMenu.descripcion} onChange={e => setFormDataMenu({...formDataMenu, descripcion: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--slate-200)', minHeight: 80 }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{isEditing ? "Actualizar" : "Crear en Atlas"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RESEÑAS */}
      {showModal && tab === "resenas" && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 550, width: '95%' }}>
            <div className="modal-header" style={{ padding: '20px', borderBottom: '1px solid var(--slate-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><span className="material-symbols-outlined">{isEditing ? "edit_note" : "rate_review"}</span> {isEditing ? "Editar Reseña" : "Nueva Reseña"}</h3>
              <button className="btn-link" onClick={() => setShowModal(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <input required placeholder="ID Usuario" className="input-field" value={formDataResena.usuarioId} onChange={e => setFormDataResena({...formDataResena, usuarioId: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--slate-200)' }} />
                <input required placeholder="ID Restaurante" className="input-field" value={formDataResena.restauranteId} onChange={e => setFormDataResena({...formDataResena, restauranteId: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--slate-200)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <input required type="number" min="1" max="5" placeholder="Calificación (1-5)" className="input-field" value={formDataResena.calificacion} onChange={e => setFormDataResena({...formDataResena, calificacion: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--slate-200)' }} />
                <input placeholder="ID Orden (Opcional)" className="input-field" value={formDataResena.ordenId} onChange={e => setFormDataResena({...formDataResena, ordenId: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--slate-200)' }} />
              </div>
              <textarea placeholder="Comentario" className="input-field" value={formDataResena.comentario} onChange={e => setFormDataResena({...formDataResena, comentario: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--slate-200)', minHeight: 80 }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{isEditing ? "Actualizar" : "Publicar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteItem && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-body" style={{ textAlign: "center", padding: "30px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--red-500)' }}>warning</span>
              <h3 style={{ marginTop: '10px' }}>¿Confirmar eliminación?</h3>
              <p style={{ fontSize: '13px', color: 'var(--slate-500)' }}>El documento se borrará permanentemente.</p>
              <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "center" }}>
                <button className="btn btn-ghost" onClick={() => setDeleteItem(null)}>Cancelar</button>
                <button className="btn btn-danger" onClick={handleDeleteConfirm}>Eliminar de Atlas</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}