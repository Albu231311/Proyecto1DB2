import { useState } from "react";
import Header from "../components/layout/Header";

const ASSETS = [
  {
    id: "507f1f",
    filename: "signature_ribeye_steak.webp",
    size: "1.2 MB",
    mime: "image/webp",
    dims: "3840 × 2160 px",
    bytes: "1,245,210 bytes",
    category: "Main Course",
    tags: ["Dinner", "Premium", "Summer Menu"],
    src: "https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=400&q=80",
  },
  {
    id: "614c2b",
    filename: "dining_room_main.jpg",
    size: "4.8 MB",
    mime: "image/jpeg",
    dims: "5120 × 3200 px",
    bytes: "5,033,164 bytes",
    category: "Ambience",
    tags: ["Interior", "Lighting"],
    src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80",
  },
  {
    id: "228a9c",
    filename: "salmon_tartare_v2.png",
    size: "850 KB",
    mime: "image/png",
    dims: "2400 × 1600 px",
    bytes: "870,400 bytes",
    category: "Main Course",
    tags: ["Seafood", "Premium"],
    src: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80",
  },
  {
    id: "991f03",
    filename: "kitchen_staff_action.jpg",
    size: "2.1 MB",
    mime: "image/jpeg",
    dims: "4000 × 2666 px",
    bytes: "2,202,214 bytes",
    category: "Ambience",
    tags: ["Kitchen", "Staff"],
    src: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&q=80",
  },
  {
    id: "884e12",
    filename: "cocktail_menu_cover.webp",
    size: "1.4 MB",
    mime: "image/webp",
    dims: "3200 × 2133 px",
    bytes: "1,468,006 bytes",
    category: "Menu Items",
    tags: ["Drinks", "Bar"],
    src: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&q=80",
  },
];

const FILTERS = ["All Assets", "Menu Items", "Ambience", "Main Course"];

export default function Imagenes() {
  const [selected, setSelected] = useState(ASSETS[0]);
  const [filter, setFilter] = useState("All Assets");
  const [assets, setAssets] = useState(ASSETS);
  const [search, setSearch] = useState("");

  const filtered = assets.filter((a) => {
    const matchFilter = filter === "All Assets" || a.category === filter;
    const matchSearch = a.filename.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  function handleDelete(id) {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    if (selected?.id === id) setSelected(assets.find((a) => a.id !== id) || null);
  }

  return (
    <>
      <Header title="Image Library">
        <div className="search-bar" style={{ width: 16 }}>
          <span className="material-symbols-outlined">search</span>
          <input
            placeholder="Search filenames..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Main grid area */}
        <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
          {/* Upload dropzone */}
          <div className="dropzone" style={{ marginBottom: 28 }}>
            <div className="dropzone-icon">
              <span className="material-symbols-outlined">cloud_upload</span>
            </div>
            <h3>Upload New Assets</h3>
            <p>Drag and drop high-resolution restaurant images here. GridFS supports files up to 16MB per chunk.</p>
            <button className="btn btn-primary" style={{ marginTop: 20 }}>Browse Files</button>
          </div>

          {/* Filters & View Toggle */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div className="filter-pills">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  className={`pill ${filter === f ? "active" : "inactive"}`}
                  onClick={() => setFilter(f)}
                >
                  {f} {f === "All Assets" ? `(${assets.length})` : ""}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="icon-btn">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>grid_view</span>
              </button>
              <button className="icon-btn">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>list</span>
              </button>
            </div>
          </div>

          {/* Asset Grid */}
          <div className="grid-auto">
            {filtered.map((asset) => (
              <div
                key={asset.id}
                className={`asset-card ${selected?.id === asset.id ? "selected" : ""}`}
                onClick={() => setSelected(asset)}
              >
                <div className="asset-thumb">
                  <img src={asset.src} alt={asset.filename} onError={(e) => { e.target.style.display = "none"; }} />
                  <div className="asset-actions">
                    <button
                      className="asset-action-btn"
                      onClick={(e) => { e.stopPropagation(); handleDelete(asset.id); }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                    </button>
                  </div>
                </div>
                <div className="asset-info">
                  <div className="asset-name">{asset.filename}</div>
                  <div className="asset-meta">
                    <span className="asset-size">{asset.size}</span>
                    <span className="asset-id">ID: {asset.id}...</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metadata Panel */}
        <aside style={{ width: 300, borderLeft: "1px solid var(--primary-20)", background: "white", display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--primary-20)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Metadata Viewer</span>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--slate-400)", cursor: "pointer" }}>info</span>
          </div>

          {selected ? (
            <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Preview */}
              <div>
                <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid var(--slate-200)", marginBottom: 12 }}>
                  <img src={selected.src} alt="" style={{ width: "100%", height: "auto", display: "block" }}
                    onError={(e) => { e.target.style.background = "#f1f5f9"; e.target.style.height = "120px"; }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: "center", borderColor: "var(--primary)", color: "var(--primary)" }}>Download</button>
                  <button className="icon-btn">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>share</span>
                  </button>
                </div>
              </div>

              {/* File Info */}
              <div>
                <div className="form-label" style={{ marginBottom: 8 }}>File Information</div>
                <div className="meta-panel">
                  {[
                    ["Filename", selected.filename],
                    ["MIME Type", selected.mime],
                    ["Filesize", selected.bytes],
                    ["Dimensions", selected.dims],
                  ].map(([k, v]) => (
                    <div key={k} className="meta-row">
                      <span className="meta-key">{k}</span>
                      <span className="meta-val">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* GridFS ID */}
              <div>
                <div className="form-label" style={{ marginBottom: 6 }}>GridFS Object ID</div>
                <div style={{ background: "var(--slate-50)", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--slate-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: "var(--slate-600)" }}>{selected.id}77bcf86cd799439011</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--slate-400)", cursor: "pointer" }}>content_copy</span>
                </div>
              </div>

              {/* Metadata */}
              <div>
                <div className="form-label" style={{ marginBottom: 8 }}>Custom Metadata</div>
                <div style={{ background: "var(--primary-10)", padding: "8px 10px", borderRadius: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 9, color: "var(--primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Category</div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{selected.category}</div>
                </div>
                <div style={{ background: "var(--primary-10)", padding: "8px 10px", borderRadius: 8 }}>
                  <div style={{ fontSize: 9, color: "var(--primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Tags</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {selected.tags.map((t) => (
                      <span key={t} style={{ background: "white", border: "1px solid var(--primary-20)", borderRadius: 4, padding: "2px 6px", fontSize: 10, fontWeight: 600 }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--slate-400)", fontSize: 13 }}>
              Select an asset to view metadata
            </div>
          )}

          {/* Delete button */}
          <div style={{ padding: 16, borderTop: "1px solid var(--primary-10)", background: "var(--slate-50)" }}>
            <button
              className="btn w-full"
              style={{ background: "var(--red-50)", color: "var(--red-600)", border: "1px solid var(--red-100)", justifyContent: "center", fontSize: 12 }}
              onClick={() => selected && handleDelete(selected.id)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete_forever</span>
              Permanent Delete
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}