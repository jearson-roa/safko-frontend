import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../../components/Loading";
import { useNavigate } from "react-router-dom";
import { Eye, PenLine, Plus, UserRound } from "lucide-react";

function ListarEmpleados() {
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const listarEmpleado = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/empleado`,
      );
      setEmpleados(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
      setEmpleados([]);
    }
  };

  //Editar empleado

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setCargando(true);

        await Promise.all([listarEmpleado()]);
      } catch (error) {
        console.error("Error cargando los datos iniciales:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  if (cargando) {
    return (
      <>
        <style>{globalStyles}</style>
        <div style={styles.page}>
          <Loading mensaje="Cargando empleados..." />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div style={styles.page}>
        <div style={styles.wrap}>
          <div style={styles.headerRow}>
            <div>
              <div style={styles.eyebrow}>GESTIÓN DE PERSONAL</div>
              <h1 style={styles.h1}>Listado de empleados</h1>
            </div>
            <button
              className="vt-btn-primary"
              style={styles.btnPrimary}
              onClick={() => setModalOpen(true)}
            >
              <Plus size={16} strokeWidth={2.5} />
              Nuevo empleado
            </button>
          </div>

          {empleados.length === 0 ? (
            <div style={styles.emptyCard}>
              <div style={styles.emptyIcon}>
                <UserRound size={26} color="#64748B" />
              </div>
              <h4 style={styles.centerTitle}>No hay empleados registrados</h4>
              <p style={styles.centerText}>
                Crea el primer empleado para verlo aquí.
              </p>
              <button
                className="vt-btn-primary"
                style={styles.btnPrimary}
                onClick={() => setModalOpen(true)}
              >
                <Plus size={16} strokeWidth={2.5} />
                Nuevo empleado
              </button>
            </div>
          ) : (
            <div style={styles.tableCard}>
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Nombre empleado</th>
                      <th style={styles.th}>Cargo</th>
                      <th style={styles.th}>Email / Usuario</th>
                      <th style={{ ...styles.th, textAlign: "right" }}>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {empleados.map((empleado) => (
                      <tr key={empleado.id} className="vt-row">
                        <td style={{ ...styles.tdMuted, fontWeight: 700 }}>
                          #{empleado.id}
                        </td>
                        <td style={{ ...styles.td, fontWeight: 600 }}>
                          {empleado.nombres}
                        </td>
                        <td style={styles.td}>{empleado.cargo}</td>
                        <td style={styles.tdMuted}>{empleado.email}</td>
                        <td style={{ ...styles.td, textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: 6 }}>
                            <button
                              type="button"
                              className="vt-icon-btn"
                              style={styles.iconBtn}
                              title="Ver"
                              onClick={() =>
                                navigate(`/empleados/ver/${empleado.id}`)
                              }
                            >
                              <Eye width={15} height={15} style={styles.iconSvg} />
                            </button>

                            <button
                              type="button"
                              className="vt-icon-btn vt-icon-btn-accent"
                              style={styles.iconBtn}
                              title="Editar"
                              onClick={() =>
                                navigate(`/empleados/editar/${empleado.id}`)
                              }
                            >
                              <PenLine width={15} height={15} style={styles.iconSvg} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const globalStyles = `
  .vt-row:hover { background: #F8FAFC; }
  .vt-btn-primary:hover { background: #4338CA !important; }
  .vt-btn-ghost:hover { background: #F1F5F9 !important; }
  .vt-icon-btn:hover { background: #F1F5F9 !important; border-color: #CBD5E1 !important; }
  .vt-icon-btn-accent:hover { background: #EEF2FF !important; border-color: #4F46E5 !important; color: #4F46E5 !important; }
  .vt-icon-btn-danger:hover { background: #FEF2F2 !important; border-color: #EF4444 !important; color: #EF4444 !important; }
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
    maxWidth: 1100,
    margin: "0 auto",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 16,
  },
  eyebrow: {
    fontFamily: "'JetBrains Mono', 'SFMono-Regular', Menlo, monospace",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: "#4F46E5",
    marginBottom: 4,
  },
  h1: {
    fontSize: 26,
    fontWeight: 700,
    color: "#1E293B",
    margin: 0,
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#4F46E5",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s ease",
  },
  tableCard: {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: 16,
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  },
  th: {
    textAlign: "left",
    padding: "14px 20px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: "#94A3B8",
    background: "#F8FAFC",
    borderBottom: "1px solid #E2E8F0",
  },
  td: {
    padding: "14px 20px",
    color: "#1E293B",
    borderBottom: "1px solid #F1F5F9",
  },
  tdMuted: {
    padding: "14px 20px",
    color: "#64748B",
    borderBottom: "1px solid #F1F5F9",
  },
  iconBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    minWidth: 30,
    minHeight: 30,
    borderRadius: 7,
    border: "1px solid #E2E8F0",
    background: "#fff",
    color: "#475569",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  iconSvg: {
    flexShrink: 0,
    width: 15,
    height: 15,
    minWidth: 15,
    minHeight: 15,
    display: "block",
  },
  emptyCard: {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: 16,
    padding: "64px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#F1F5F9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  centerTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1E293B",
    margin: "0 0 6px",
  },
  centerText: {
    fontSize: 14,
    color: "#64748B",
    margin: "0 0 20px",
  },
};

export default ListarEmpleados;