import { useState } from "react";
import Header from "../components/layout/Header";
import { eliminarInvitados, actualizarPreciosCategoria } from "../api/operaciones";

const INITIAL_LOGS = [
  { time: "14:22:01", type: "success", msg: "Atlas Connection Cluster-0 Established." },
  { time: "14:20:12", type: "debug", msg: "Waiting for batch instructions..." },
];

function LogLine({ entry }) {
  const cls = { success: "log-success", info: "log-info", debug: "log-debug", alert: "log-alert" };
  const label = { success: "SUCCESS:", info: "INFO:", debug: "DEBUG:", alert: "ALERT:" };
  return (
    <div className="log-line">
      <span className="log-time">[{entry.time}]</span>
      <span className={cls[entry.type]}>{label[entry.type]}</span>
      <span>{entry.msg}</span>
    </div>
  );
}

export default function Operaciones() {
  const [category, setCategory] = useState("");
  const [increment, setIncrement] = useState(5.0);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [purgeConfirm, setPurgeConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  function addLog(type, msg) {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    setLogs((prev) => [{ time, type, msg }, ...prev]);
  }

  // --- LÓGICA DE ACTUALIZACIÓN DE PRECIOS ($inc) ---
  async function handleCommit() {
    if (!category) return alert("Por favor, escribe una categoría (ej: Pizza)");
    setIsProcessing(true);
    try {
      const res = await actualizarPreciosCategoria(category, increment);
      // MongoDB devuelve nModified o modifiedCount según el driver
      const count = res.data.modifiedCount || res.data.nModified || 0;
      addLog("success", `UpdateMany completado: ${count} productos actualizados en '${category}'.`);
    } catch (err) {
      addLog("alert", `Fallo en operación masiva: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }

  // --- LÓGICA DE PURGA DE INVITADOS (deleteMany) ---
  async function handlePurge() {
    if (!purgeConfirm) {
      setPurgeConfirm(true);
      return;
    }
    setIsProcessing(true);
    try {
      const res = await eliminarInvitados();
      const count = res.data.cantidadEliminada || 0;
      addLog("alert", `DeleteMany ejecutado: ${count} usuarios eliminados permanentemente.`);
    } catch (err) {
      addLog("alert", `Error en purga de base de datos: ${err.message}`);
    } finally {
      setPurgeConfirm(false);
      setIsProcessing(false);
    }
  }

  return (
    <>
      <Header title="SYSTEM OPERATIONS" icon="precision_manufacturing" />

      <div className="page-body">
        <p className="text-muted text-sm" style={{ marginBottom: 24 }}>
          Mantenimiento de infraestructura y procesamiento masivo de datos mediante operaciones Bulk Write en Atlas.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, marginBottom: 24 }}>

          {/* Card 1: Pricing Batch Update ($inc) */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div className="ops-module-header">
              <div className="ops-module-title">
                <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: 18 }}>sell</span>
                Batch Price Adjustment ($inc)
              </div>
              <span className="ops-badge">Aggregated Writes</span>
            </div>

            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Filtrar por Categoría</label>
                  <input
                    className="form-input"
                    placeholder="Ej: Bebidas, Postres..."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--slate-200)' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Incremento (Q)</label>
                  <div className="number-input">
                    <button onClick={() => setIncrement((v) => Math.max(0, v - 1))}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>remove</span>
                    </button>
                    <input
                      type="number"
                      value={increment}
                      onChange={(e) => setIncrement(parseFloat(e.target.value) || 0)}
                    />
                    <button onClick={() => setIncrement((v) => v + 1)}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px', background: 'var(--slate-50)', borderRadius: 8, fontSize: '12px', color: 'var(--slate-600)', border: '1px solid var(--slate-100)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>info</span>
                Esta operación ejecuta un <strong>updateMany</strong> directo en Atlas utilizando el operador atómico <strong>$inc</strong>.
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginTop: 4 }}>
                <button className="btn btn-primary" onClick={handleCommit} disabled={isProcessing}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>bolt</span>
                  {isProcessing ? "Ejecutando..." : "Aplicar Cambios"}
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Guest Purge (deleteMany) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card" style={{ overflow: "hidden" }}>
              <div className="ops-module-header">
                <div className="ops-module-title">
                  <span className="material-symbols-outlined" style={{ color: "var(--red-500)", fontSize: 18 }}>cleaning_services</span>
                  Account Lifecycle
                </div>
              </div>

              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="alert alert-warning">
                  <span className="material-symbols-outlined" style={{ fontSize: 18, flexShrink: 0 }}>warning</span>
                  Se eliminarán permanentemente los usuarios con rol <strong>'invitado'</strong>.
                </div>

                {purgeConfirm ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button className="btn btn-danger w-full" onClick={handlePurge} disabled={isProcessing}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete_forever</span>
                      CONFIRMAR ELIMINACIÓN
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setPurgeConfirm(false)}>Cancelar</button>
                  </div>
                ) : (
                  <button
                    className="btn w-full"
                    style={{ background: "var(--slate-900)", color: "white" }}
                    onClick={handlePurge}
                    disabled={isProcessing}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>auto_delete</span>
                    Purgar Invitados
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live Ops Log */}
        <div className="card">
          <div className="card-header">
            <div className="card-header-title">
              <span className="material-symbols-outlined">list_alt</span>
              Atlas Management Log
            </div>
          </div>
          <div className="card-body">
            <div className="log-console">
              {logs.map((l, i) => <LogLine key={i} entry={l} />)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}