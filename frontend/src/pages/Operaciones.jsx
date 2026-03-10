import { useState } from "react";
import Header from "../components/layout/Header";

const CATEGORIES = [
  "Premium Grills & Steaks",
  "Artisanal Beverages",
  "Continental Breakfast",
  "Dessert Portfolio",
];

const PREVIEW_ITEMS = [
  { name: "Dry-Aged Ribeye", current: 42.0 },
  { name: "Wagyu Burger", current: 28.0 },
  { name: "Lobster Tail", current: 54.0 },
];

const INITIAL_LOGS = [
  { time: "14:22:01", type: "success", msg: "Region-West-04 load balancer initialized." },
  { time: "14:21:44", type: "info", msg: "Pricing update projected for category 'Drinks'." },
  { time: "14:20:12", type: "debug", msg: "Cache invalidate sequence triggered by Admin_9921." },
  { time: "14:18:55", type: "alert", msg: "Inactivity threshold reached for 1,202 guest nodes." },
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
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [increment, setIncrement] = useState(4.5);
  const [guestCount] = useState(12482);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [purgeConfirm, setPurgeConfirm] = useState(false);
  const [purgeConfirm2, setPurgeConfirm2] = useState(false);
  const [loadFactor] = useState(67.2);

  function addLog(type, msg) {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    setLogs((prev) => [{ time, type, msg }, ...prev]);
  }

  function handleCommit() {
    addLog("success", `Pricing batch committed for '${category}'. ${increment}% applied to 142 items.`);
    addLog("info", `Audit trail entry created by Admin_9921.`);
  }

  function handlePurge() {
    if (!purgeConfirm) {
      setPurgeConfirm(true);
      return;
    }
    if (!purgeConfirm2) {
      setPurgeConfirm2(true);
      return;
    }
    addLog("alert", `Guest purge initialized. ${guestCount.toLocaleString()} accounts scheduled for deletion.`);
    addLog("info", "Purge job queued. ETA: 3-5 minutes.");
    setPurgeConfirm(false);
    setPurgeConfirm2(false);
  }

  const preview = PREVIEW_ITEMS.map((item) => ({
    ...item,
    projected: (item.current * (1 + increment / 100)).toFixed(2),
    delta: (item.current * increment / 100).toFixed(2),
  }));

  return (
    <>
      <Header title="SYSTEM OPERATIONS" icon="precision_manufacturing" />

      <div className="page-body">
        <p className="text-muted text-sm" style={{ marginBottom: 24 }}>
          Global batch processing and environment infrastructure maintenance.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, marginBottom: 24 }}>

          {/* Card 1: Pricing Batch Update */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div className="ops-module-header">
              <div className="ops-module-title">
                <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: 18 }}>sell</span>
                Pricing Batch Update
              </div>
              <span className="ops-badge">Active Module</span>
            </div>

            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Controls */}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Target Category</label>
                  <select
                    className="form-input form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price Increment (%)</label>
                  <div className="number-input">
                    <button onClick={() => setIncrement((v) => Math.max(0, parseFloat((v - 0.5).toFixed(1))))}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>remove</span>
                    </button>
                    <input
                      type="number"
                      step="0.5"
                      value={increment}
                      onChange={(e) => setIncrement(parseFloat(e.target.value) || 0)}
                    />
                    <button onClick={() => setIncrement((v) => parseFloat((v + 0.5).toFixed(1)))}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Table */}
              <div className="ops-preview-table">
                <table>
                  <thead>
                    <tr>
                      <th>Item Description</th>
                      <th>Current</th>
                      <th>Projected</th>
                      <th>Delta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((item) => (
                      <tr key={item.name}>
                        <td className="td-bold">{item.name}</td>
                        <td className="text-muted">${item.current.toFixed(2)}</td>
                        <td style={{ fontWeight: 700, color: "var(--primary)" }}>${item.projected}</td>
                        <td style={{ fontWeight: 600, color: "var(--green-600)" }}>+{item.delta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--slate-500)", fontSize: 12 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>info</span>
                  Preview based on 142 affected items
                </div>
                <button className="btn btn-primary" onClick={handleCommit}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
                  Commit Batch
                </button>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Card 2: Guest Purge */}
            <div className="card" style={{ overflow: "hidden" }}>
              <div className="ops-module-header">
                <div className="ops-module-title">
                  <span className="material-symbols-outlined" style={{ color: "var(--red-500)", fontSize: 18 }}>cleaning_services</span>
                  Account Lifecycle
                </div>
              </div>

              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ textAlign: "center", padding: "16px 12px", background: "var(--slate-50)", borderRadius: 8, border: "1px dashed var(--slate-300)" }}>
                  <div className="stat-big-label">Inactive Guest Nodes</div>
                  <div className="stat-big" style={{ marginTop: 4 }}>{guestCount.toLocaleString()}</div>
                  <div style={{ marginTop: 12, fontSize: 10, fontWeight: 700, color: "var(--slate-400)", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, textTransform: "uppercase" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>history</span>
                    Last Purge: 14 Days Ago
                  </div>
                </div>

                <div className="alert alert-warning">
                  <span className="material-symbols-outlined" style={{ fontSize: 18, flexShrink: 0 }}>warning</span>
                  Initializing purge will permanently remove all guest sessions older than 90 days. This action is irreversible.
                </div>

                {purgeConfirm2 ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => { setPurgeConfirm(false); setPurgeConfirm2(false); }}>
                      Cancel
                    </button>
                    <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={handlePurge}>
                      Confirm Delete
                    </button>
                  </div>
                ) : purgeConfirm ? (
                  <button className="btn btn-danger w-full" onClick={handlePurge}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>bolt</span>
                    Are you sure? Click again
                  </button>
                ) : (
                  <button
                    className="btn w-full"
                    style={{ background: "var(--slate-900)", color: "white", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 12 }}
                    onClick={handlePurge}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>bolt</span>
                    Initialize Purge
                  </button>
                )}
              </div>
            </div>

            {/* System Status */}
            <div style={{ background: "var(--primary-10)", border: "1px solid var(--primary-20)", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Core Engine</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div className="status-indicator status-green" />
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--green-600)", textTransform: "uppercase" }}>Stable</span>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${loadFactor}%` }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, fontWeight: 700, color: "var(--slate-500)", textTransform: "uppercase" }}>
                <span>Load factor</span>
                <span>{loadFactor}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ops Log */}
        <div className="card">
          <div className="card-header">
            <div className="card-header-title">
              <span className="material-symbols-outlined">list_alt</span>
              Live Operations Log
            </div>
            <button className="btn-link" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Download Report
            </button>
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