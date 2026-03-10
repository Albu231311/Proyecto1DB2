import { useState } from "react";
import Header from "../components/layout/Header";
import { subirImagenPrueba, getUrlImagen } from "../api/archivos";

export default function Archivos() {
  const [imagenes, setImagenes] = useState([]); // Lista de IDs de GridFS
  const [subiendo, setSubiendo] = useState(false);

  const handleUploadTest = async () => {
    setSubiendo(true);
    try {
      const res = await subirImagenPrueba();
      // Agregamos el nuevo ID al estado para mostrar la imagen de inmediato
      setImagenes([...imagenes, res.data.fileId]);
      alert("¡Imagen test.jpg subida con éxito a GridFS!");
    } catch (err) {
      alert("Error al subir: " + (err.response?.data?.error || err.message));
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <>
      <Header title="Gestión de Archivos (GridFS)" icon="upload_file">
        <button 
          className="btn btn-primary btn-sm" 
          onClick={handleUploadTest}
          disabled={subiendo}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>upload</span>
          {subiendo ? "Subiendo..." : "Subir test.jpg"}
        </button>
      </Header>

      <div className="page-body">
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--slate-800)' }}>Galería de Imágenes en Atlas</h3>
            <p style={{ fontSize: '13px', color: 'var(--slate-500)' }}>
              Estas imágenes están almacenadas en los chunks de GridFS
            </p>
          </div>

          {imagenes.length === 0 ? (
            <div style={{ 
              border: '2px dashed var(--slate-200)', 
              borderRadius: '12px', 
              padding: '60px', 
              textAlign: 'center',
              color: 'var(--slate-400)'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>image_not_supported</span>
              <p>No hay imágenes cargadas en esta sesión.</p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '20px' 
            }}>
              {imagenes.map((id) => (
                <div key={id} className="card" style={{ overflow: 'hidden', border: '1px solid var(--slate-200)' }}>
                  <div style={{ height: '160px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src={getUrlImagen(id)} 
                      alt="GridFS Content" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      // Por si la imagen tarda o falla
                      onError={(e) => { e.target.src = "https://via.placeholder.com/200?text=Error+Carga"; }}
                    />
                  </div>
                  <div style={{ padding: '12px', background: 'white' }}>
                    <div style={{ fontSize: '10px', color: 'var(--slate-400)', fontFamily: 'monospace' }}>ID: {id}</div>
                    <button 
                      className="btn-link" 
                      style={{ fontSize: '11px', marginTop: '8px', color: 'var(--primary)' }}
                      onClick={() => window.open(getUrlImagen(id), '_blank')}
                    >
                      Ver pantalla completa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .btn-primary:disabled {
          background: var(--slate-300);
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}