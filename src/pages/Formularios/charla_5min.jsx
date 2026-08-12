import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";
import { generarPDFCharla } from "../utils/Pdf_charla";

function VerCharla5Min() {

  const { id_tarea } = useParams();
  const navigate = useNavigate();

  const [charla, setCharla] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarCharla();
  }, [id_tarea]);

  const cargarCharla = async () => {
    try {
      setCargando(true);
      setError(null);

      const token = localStorage.getItem("token");

      const respuesta = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/charlas/tarea/${id_tarea}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCharla(respuesta.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.mensaje || "No se pudo cargar la charla de 5 min"
      );
    } finally {
      setCargando(false);
    }
  };

  // 1. Cargando
  if (cargando) {
    return (
      <>
        <style>{globalStyles}</style>
        <div style={styles.page}>
          <Loading mensaje="Cargando charla..." />
        </div>
      </>
    );
  }

  // 2. Error (backend caído, 404 porque aún no existe, 500, etc.)
  if (error) {
    return (
      <>
        <style>{globalStyles}</style>
        <div style={styles.page}>
          <div style={styles.centerState}>
            <div style={{ ...styles.centerIcon, background: "#FEE2E2" }}>
              <span style={{ fontSize: 26 }}>⚠️</span>
            </div>
            <h4 style={styles.centerTitle}>No se pudo cargar la charla</h4>
            <p style={styles.centerText}>{error}</p>
            <div className="d-flex gap-2">
              <button style={styles.btnPrimary} onClick={cargarCharla}>
                Reintentar
              </button>
              <button style={styles.btnGhost} onClick={() => navigate(-1)}>
                Volver
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 3. Sin datos
  if (!charla) {
    return (
      <>
        <style>{globalStyles}</style>
        <div style={styles.page}>
          <div style={styles.centerState}>
            <div style={{ ...styles.centerIcon, background: "#E2E8F0" }}>
              <span style={{ fontSize: 26 }}>📋</span>
            </div>
            <h4 style={styles.centerTitle}>Charla no encontrada</h4>
            <p style={styles.centerText}>
              No se encontraron datos para esta charla.
            </p>
            <button style={styles.btnGhost} onClick={() => navigate(-1)}>
              Volver
            </button>
          </div>
        </div>
      </>
    );
  }

  // 4. Todo ok
  return (
    <>
      <style>{globalStyles}</style>
      <div style={styles.page}>
        <div style={styles.wrap}>
          <button
            className="vc-back"
            style={styles.backLink}
            onClick={() => navigate(-1)}
          >
            ← Volver
          </button>

          {/* Layout de dos columnas: contenido a la izquierda, acción a la derecha */}
          <div style={styles.columns} className="vc-columns">
            {/* ===== Columna izquierda: contenido original ===== */}
            <div style={styles.mainCol}>
              <div style={styles.ticket}>
                <div style={styles.eyebrow}>CHARLA DE 5 MINUTOS</div>
                <h1 style={styles.titulo}>
                  {charla.tema || "Sin tema registrado"}
                </h1>

                <div style={styles.grid}>
                  <div style={styles.field}>
                    <span style={styles.label}>Fecha</span>
                    <span style={styles.value}>
                      {charla.fecha_charla || "—"}
                    </span>
                  </div>
                  <div style={styles.field}>
                    <span style={styles.label}>Ubicación (lat, long)</span>
                    <span style={styles.value}>
                      {charla.latitud && charla.longitud
                        ? `${charla.latitud}, ${charla.longitud}`
                        : "—"}
                    </span>
                  </div>
                </div>

                <div style={styles.divider} />

                <div style={styles.field}>
                  <span style={styles.label}>Trabajo a realizar</span>
                  <p style={styles.paragraph}>
                    {charla.trabajo_realizar || "Sin información."}
                  </p>
                </div>

                <div style={styles.field}>
                  <span style={styles.label}>Temas tratados</span>
                  <p style={styles.paragraph}>
                    {charla.temas_tratados || "Sin información."}
                  </p>
                </div>

                <div style={styles.field}>
                  <span style={styles.label}>Riesgos detectados</span>
                  <p style={styles.paragraph}>
                    {charla.riesgos_detectados || "Sin información."}
                  </p>
                </div>

                <div style={styles.field}>
                  <span style={styles.label}>Medidas preventivas</span>
                  <p style={styles.paragraph}>
                    {charla.medidas_preventivas || "Sin información."}
                  </p>
                </div>

                <div style={styles.field}>
                  <span style={styles.label}>Observaciones</span>
                  <p style={styles.paragraph}>
                    {charla.observaciones || "Sin observaciones."}
                  </p>
                </div>
              </div>

              {/* Asistentes */}
              <div style={styles.formsCard}>
                <h3 style={styles.formsTitle}>Asistentes</h3>
                {!charla.asistentes || charla.asistentes.length === 0 ? (
                  <p style={styles.centerText}>
                    No hay asistentes registrados para esta charla.
                  </p>
                ) : (
                  <ul style={styles.list}>
                    {charla.asistentes.map((asistente) => (
                      <li key={asistente.id_empleado} style={styles.listItem}>
                        <strong>
                          {asistente.nombres} {asistente.apellido_paterno}{" "}
                          {asistente.apellido_materno}{" "}
                        </strong>
                        <br />
                        RUT: {asistente.rut}
                        <br />
                        Cargo: {asistente.cargo}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* ===== Columna derecha: acción de descarga ===== */}
            <div style={styles.sideCol} className="vc-side">
              <div style={styles.actionCard}>
                <div style={styles.actionIcon}>📄</div>
                <h3 style={styles.actionTitle}>Reporte en PDF</h3>
                <p style={styles.actionText}>
                  Genera un documento con todos los datos de esta charla y el
                  registro de asistentes.
                </p>
                <button
                  style={styles.btnDownload}
                  onClick={() => generarPDFCharla(charla)}
                >
                  ⬇ Descargar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const globalStyles = `
  .vc-back:hover { color: #1E293B !important; }
  .vc-download:hover { background: #4338CA !important; }

  .vc-columns {
    display: flex;
    align-items: flex-start;
    gap: 24px;
  }

  .vc-side {
    position: sticky;
    top: 40px;
  }

  /* En pantallas angostas, la columna lateral pasa a ocupar todo el ancho
     y se ubica debajo del contenido principal */
  @media (max-width: 860px) {
    .vc-columns {
      flex-direction: column;
    }
    .vc-side {
      position: static;
      width: 100% !important;
    }
  }
`;

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F8FAFC",
    padding: "40px 32px",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  wrap: {
    maxWidth: 1040,
    margin: "0 auto",
  },
  backLink: {
    border: "none",
    background: "none",
    color: "#64748B",
    fontSize: 14,
    fontWeight: 600,
    padding: 0,
    marginBottom: 20,
    cursor: "pointer",
  },

  // ---- Layout de dos columnas ----
  columns: {
    // el display/gap real se aplica vía className "vc-columns" (ver globalStyles)
  },
  mainCol: {
    flex: "1 1 0%",
    minWidth: 0, // evita overflow en textos largos dentro de un flex item
  },
  sideCol: {
    flex: "0 0 300px",
    width: 300,
  },

  ticket: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 16,
    padding: "28px 32px 32px",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
    marginBottom: 24,
  },
  eyebrow: {
    fontFamily: "'JetBrains Mono', 'SFMono-Regular', Menlo, monospace",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: "#4F46E5",
    marginBottom: 6,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 700,
    color: "#1E293B",
    margin: "0 0 20px",
    lineHeight: 1.2,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px 28px",
    marginBottom: 8,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#94A3B8",
  },
  value: {
    fontSize: 15,
    color: "#1E293B",
    fontWeight: 500,
  },
  paragraph: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 1.6,
    margin: 0,
  },
  divider: {
    height: 1,
    background: "#E2E8F0",
    margin: "4px 0 20px",
  },
  formsCard: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 16,
    padding: "24px 32px 28px",
  },
  formsTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1E293B",
    margin: "0 0 16px",
  },
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  listItem: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #E2E8F0",
    background: "#F8FAFC",
    fontSize: 14,
    color: "#1E293B",
    fontWeight: 500,
  },

  // ---- Tarjeta de acción (columna derecha) ----
  actionCard: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 16,
    padding: "28px 24px",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
    textAlign: "center",
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "#EEF2FF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    margin: "0 auto 14px",
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1E293B",
    margin: "0 0 8px",
  },
  actionText: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 1.5,
    margin: "0 0 18px",
  },
  btnDownload: {
    width: "100%",
    background: "#4F46E5",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "12px 16px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s ease",
  },

  centerState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "80px 20px",
  },
  centerIcon: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  centerTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1E293B",
    margin: "0 0 8px",
  },
  centerText: {
    fontSize: 14,
    color: "#64748B",
    maxWidth: 380,
    margin: "0 0 20px",
  },
  btnPrimary: {
    background: "#4F46E5",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnGhost: {
    background: "#fff",
    color: "#1E293B",
    border: "1px solid #E2E8F0",
    borderRadius: 8,
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default VerCharla5Min;