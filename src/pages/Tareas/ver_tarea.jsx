import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";

const ESTADO_STYLES = {
  pendiente: { bg: "#FEF3C7", fg: "#92400E", dot: "#F59E0B" },
  "en proceso": { bg: "#DBEAFE", fg: "#1E40AF", dot: "#3B82F6" },
  "en curso": { bg: "#DBEAFE", fg: "#1E40AF", dot: "#3B82F6" },
  finalizado: { bg: "#D1FAE5", fg: "#065F46", dot: "#10B981" },
  completado: { bg: "#D1FAE5", fg: "#065F46", dot: "#10B981" },
  terminado: { bg: "#D1FAE5", fg: "#065F46", dot: "#10B981" },
  cancelado: { bg: "#FEE2E2", fg: "#991B1B", dot: "#EF4444" },
};

function getEstadoStyle(estado) {
  const key = (estado || "").toLowerCase().trim();
  return ESTADO_STYLES[key] || { bg: "#E2E8F0", fg: "#475569", dot: "#64748B" };
}

function VerTarea() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tarea, setTarea] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarTarea();
  }, [id]);

  const cargarTarea = async () => {
    try {
      setCargando(true);
      setError(null);

      const token = localStorage.getItem("token");

      const respuesta = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/tareas/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // CORRECCIÓN CLAVE: Extrae la tarea si viene encapsulada (ej. respuesta.data.tarea)
      const dataRecibida = respuesta.data;
      const tareaObj = dataRecibida?.tarea || dataRecibida?.data || dataRecibida;

      console.log("Datos de tarea cargados:", tareaObj); // Revisa esto en la consola (F12)
      setTarea(tareaObj);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.mensaje || "No se pudo cargar la tarea");
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <>
        <style>{globalStyles}</style>
        <div style={styles.page}>
          <Loading mensaje="Cargando datos..." />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{globalStyles}</style>
        <div style={styles.page}>
          <div style={styles.centerState}>
            <div style={{ ...styles.centerIcon, background: "#FEE2E2" }}>
              <span style={{ fontSize: 26 }}>⚠️</span>
            </div>
            <h4 style={styles.centerTitle}>No se pudo cargar la tarea</h4>
            <p style={styles.centerText}>{error}</p>
            <div className="d-flex gap-2">
              <button style={styles.btnPrimary} onClick={cargarTarea}>
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

  if (!tarea) {
    return (
      <>
        <style>{globalStyles}</style>
        <div style={styles.page}>
          <div style={styles.centerState}>
            <div style={{ ...styles.centerIcon, background: "#E2E8F0" }}>
              <span style={{ fontSize: 26 }}>📋</span>
            </div>
            <h4 style={styles.centerTitle}>Tarea no encontrada</h4>
            <p style={styles.centerText}>
              No se encontraron datos para esta tarea.
            </p>
            <button style={styles.btnGhost} onClick={() => navigate(-1)}>
              Volver
            </button>
          </div>
        </div>
      </>
    );
  }

  const estadoStyle = getEstadoStyle(tarea.estado);
  
  // Manejo seguro por si formularios_habilitados viene nulo o vacío
  const formularios = tarea.formularios_habilitados
    ? Object.entries(tarea.formularios_habilitados).filter(([, on]) => on)
    : [];

  const estaCompletado = (nombre) => {
    return Boolean(tarea.formularios_estado?.[nombre]);
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div style={styles.page}>
        <div style={styles.wrap}>
          <button
            className="vt-back"
            style={styles.backLink}
            onClick={() => navigate(-1)}
          >
            ← Volver
          </button>

          <div style={styles.ticket}>
            <div style={styles.ticketHeader}>
              <div>
                <div style={styles.eyebrow}>
                  ORDEN DE TRABAJO N° {tarea.numero_ot || tarea.id_trabajo || "S/N"}
                </div>
                <h1 style={styles.titulo}>{tarea.titulo || "Sin título"}</h1>
              </div>
              <span
                style={{
                  ...styles.badge,
                  background: estadoStyle.bg,
                  color: estadoStyle.fg,
                }}
              >
                <span
                  style={{ ...styles.badgeDot, background: estadoStyle.dot }}
                />
                {tarea.estado || "Pendiente"}
              </span>
            </div>

            <div style={styles.perforation}>
              {Array.from({ length: 40 }).map((_, i) => (
                <span key={i} style={styles.perfDot} />
              ))}
            </div>

            <div style={styles.grid}>
              <div style={styles.field}>
                <span style={styles.label}>Cliente</span>
                <span style={styles.value}>{tarea.cliente || tarea.razon_social || "—"}</span>
              </div>
              <div style={styles.field}>
                <span style={styles.label}>Empleado asignado</span>
                <span style={styles.value}>{tarea.empleado || tarea.empleado_nombres || "—"}</span>
              </div>
              <div style={styles.field}>
                <span style={styles.label}>Contacto</span>
                <span style={styles.value}>
                  {tarea.nombre_contacto || "—"}
                  {tarea.telefono_contacto ? ` · ${tarea.telefono_contacto}` : ""}
                </span>
              </div>
              <div style={styles.field}>
                <span style={styles.label}>Dirección</span>
                <span style={styles.value}>{tarea.direccion_trabajo || "—"}</span>
              </div>
              <div style={styles.field}>
                <span style={styles.label}>Fecha asignación</span>
                <span style={styles.value}>{tarea.fecha_asignacion ? new Date(tarea.fecha_asignacion).toLocaleDateString("es-CL") : "—"}</span>
              </div>
              <div style={styles.field}>
                <span style={styles.label}>Fecha término</span>
                <span style={styles.value}>{tarea.fecha_termino ? new Date(tarea.fecha_termino).toLocaleDateString("es-CL") : "—"}</span>
              </div>
            </div>

            <div style={styles.divider} />

            <div style={styles.field}>
              <span style={styles.label}>Descripción del trabajo</span>
              <p style={styles.paragraph}>
                {tarea.descripcion_trabajo || "Sin descripción."}
              </p>
            </div>

            <div style={styles.field}>
              <span style={styles.label}>Observaciones</span>
              <p style={styles.paragraph}>
                {tarea.observaciones || "Sin observaciones."}
              </p>
            </div>
          </div>

          <div style={styles.formsCard}>
            <h3 style={styles.formsTitle}>Formularios disponibles</h3>
            {formularios.length === 0 ? (
              <p style={styles.centerText}>
                No hay formularios habilitados para esta tarea.
              </p>
            ) : (
              <div style={styles.formsGrid}>
                {formularios.map(([nombre]) => {
                  const completado = estaCompletado(nombre);

                  return (
                    <button
                      key={nombre}
                      className={completado ? "vt-forms-hover" : ""}
                      style={{
                        ...styles.formBtn,
                        ...(completado ? {} : styles.formBtnDisabled),
                      }}
                      disabled={!completado}
                      onClick={() => {
                        if (!completado) return;
                        navigate(`/formularios/${nombre}/${tarea.id_trabajo}`);
                      }}
                    >
                      <span>{nombre}</span>
                      {completado ? (
                        <span aria-hidden>→</span>
                      ) : (
                        <span style={styles.pendingBadge}>Pendiente</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const globalStyles = `
  .vt-forms-hover:hover { border-color: #4F46E5 !important; background: #EEF2FF !important; }
  .vt-back:hover { color: #1E293B !important; }
`;

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F8FAFC",
    padding: "40px 32px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  wrap: { maxWidth: 780, margin: "0 auto" },
  backLink: { border: "none", background: "none", color: "#64748B", fontSize: 14, fontWeight: 600, padding: 0, marginBottom: 20, cursor: "pointer" },
  ticket: { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: "28px 32px 32px", boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)", marginBottom: 24 },
  ticketHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" },
  eyebrow: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: "#4F46E5", marginBottom: 6 },
  titulo: { fontSize: 26, fontWeight: 700, color: "#1E293B", margin: 0, lineHeight: 1.2 },
  badge: { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" },
  badgeDot: { width: 7, height: 7, borderRadius: "50%", display: "inline-block" },
  perforation: { display: "flex", gap: 6, overflow: "hidden", margin: "22px -32px 22px", padding: "0 32px" },
  perfDot: { width: 4, height: 4, borderRadius: "50%", background: "#E2E8F0", flexShrink: 0 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 28px", marginBottom: 24 },
  field: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 18 },
  label: { fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#94A3B8" },
  value: { fontSize: 15, color: "#1E293B", fontWeight: 500 },
  paragraph: { fontSize: 15, color: "#334155", lineHeight: 1.6, margin: 0 },
  divider: { height: 1, background: "#E2E8F0", margin: "4px 0 20px" },
  formsCard: { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: "24px 32px 28px" },
  formsTitle: { fontSize: 16, fontWeight: 700, color: "#1E293B", margin: "0 0 16px" },
  formsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 },
  formBtn: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 10, border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#1E293B", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease" },
  formBtnDisabled: { cursor: "not-allowed", opacity: 0.6, background: "#F1F5F9", color: "#94A3B8" },
  pendingBadge: { fontSize: 11, fontWeight: 700, color: "#B45309", background: "#FEF3C7", padding: "3px 8px", borderRadius: 999 },
  centerState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 20px" },
  centerIcon: { width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  centerTitle: { fontSize: 18, fontWeight: 700, color: "#1E293B", margin: "0 0 8px" },
  centerText: { fontSize: 14, color: "#64748B", maxWidth: 380, margin: "0 0 20px" },
  btnPrimary: { background: "#4F46E5", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnGhost: { background: "#fff", color: "#1E293B", border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
};

export default VerTarea;