import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../../components/Loading";
import { useNavigate } from "react-router-dom";
import { Eye, PenLine, Plus, UserRound, X } from "lucide-react";

function ListarEmpleados() {
  const navigate = useNavigate();

  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formulario, setFormulario] = useState({
    rut: "",
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    cargo: "",
    email: "",
  });

  const listarEmpleado = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/empleado`
      );

      setEmpleados(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
      setEmpleados([]);
    }
  };

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setCargando(true);
        await listarEmpleado();
      } catch (error) {
        console.error("Error cargando los datos iniciales:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  const cerrarModal = () => {
    setModalOpen(false);

    setFormulario({
      rut: "",
      nombres: "",
      apellido_paterno: "",
      apellido_materno: "",
      cargo: "",
      email: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const guardarEmpleado = async (e) => {
    e.preventDefault();

    console.log("Datos del empleado:", formulario);

    // Luego conectaremos esto con:
    // POST /api/empleado

    alert("Formulario listo para guardar");

    cerrarModal();
  };

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

          {/* HEADER */}
          <div style={styles.headerRow}>
            <div>
              <div style={styles.eyebrow}>
                GESTIÓN DE PERSONAL
              </div>

              <h1 style={styles.h1}>
                Listado de empleados
              </h1>
            </div>

            <button
              type="button"
              className="vt-btn-primary"
              style={styles.btnPrimary}
              onClick={() => setModalOpen(true)}
            >
              <Plus size={16} strokeWidth={2.5} />
              Nuevo empleado
            </button>
          </div>

          {/* LISTADO */}
          {empleados.length === 0 ? (
            <div style={styles.emptyCard}>

              <div style={styles.emptyIcon}>
                <UserRound
                  size={26}
                  color="#64748B"
                />
              </div>

              <h4 style={styles.centerTitle}>
                No hay empleados registrados
              </h4>

              <p style={styles.centerText}>
                Crea el primer empleado para verlo aquí.
              </p>

              <button
                type="button"
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

                      <th style={styles.th}>
                        Nombre empleado
                      </th>

                      <th style={styles.th}>
                        Cargo
                      </th>

                      <th style={styles.th}>
                        Email / Usuario
                      </th>

                      <th
                        style={{
                          ...styles.th,
                          textAlign: "right",
                        }}
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {empleados.map((empleado) => (
                      <tr
                        key={empleado.id}
                        className="vt-row"
                      >

                        <td
                          style={{
                            ...styles.tdMuted,
                            fontWeight: 700,
                          }}
                        >
                          #{empleado.id}
                        </td>

                        <td
                          style={{
                            ...styles.td,
                            fontWeight: 600,
                          }}
                        >
                          {empleado.nombres}{" "}
                          {empleado.apellido_paterno}
                        </td>

                        <td style={styles.td}>
                          {empleado.cargo}
                        </td>

                        <td style={styles.tdMuted}>
                          {empleado.email || "-"}
                        </td>

                        <td
                          style={{
                            ...styles.td,
                            textAlign: "right",
                          }}
                        >
                          <div
                            style={{
                              display: "inline-flex",
                              gap: 6,
                            }}
                          >

                            {/* VER */}
                            <button
                              type="button"
                              className="vt-icon-btn"
                              style={styles.iconBtn}
                              title="Ver"
                              onClick={() =>
                                navigate(
                                  `/empleados/ver/${empleado.id}`
                                )
                              }
                            >
                              <Eye
                                width={15}
                                height={15}
                                style={styles.iconSvg}
                              />
                            </button>

                            {/* EDITAR */}
                            <button
                              type="button"
                              className="vt-icon-btn vt-icon-btn-accent"
                              style={styles.iconBtn}
                              title="Editar"
                              onClick={() =>
                                navigate(
                                  `/empleados/editar/${empleado.id}`
                                )
                              }
                            >
                              <PenLine
                                width={15}
                                height={15}
                                style={styles.iconSvg}
                              />
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

      {/* =========================
          MODAL NUEVO EMPLEADO
         ========================= */}

      {modalOpen && (
        <div
          style={styles.modalOverlay}
          onClick={cerrarModal}
        >

          <div
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >

            {/* HEADER MODAL */}
            <div style={styles.modalHeader}>

              <div>
                <div style={styles.modalEyebrow}>
                  GESTIÓN DE PERSONAL
                </div>

                <h2 style={styles.modalTitle}>
                  Nuevo empleado
                </h2>
              </div>

              <button
                type="button"
                onClick={cerrarModal}
                style={styles.closeButton}
              >
                <X size={20} />
              </button>

            </div>

            {/* FORMULARIO */}
            <form onSubmit={guardarEmpleado}>

              <div style={styles.formGrid}>

                {/* RUT */}
                <div style={styles.field}>
                  <label style={styles.label}>
                    RUT
                  </label>

                  <input
                    type="text"
                    name="rut"
                    value={formulario.rut}
                    onChange={handleChange}
                    placeholder="12.345.678-9"
                    style={styles.input}
                    required
                  />
                </div>

                {/* NOMBRES */}
                <div style={styles.field}>
                  <label style={styles.label}>
                    Nombres
                  </label>

                  <input
                    type="text"
                    name="nombres"
                    value={formulario.nombres}
                    onChange={handleChange}
                    placeholder="Juan Carlos"
                    style={styles.input}
                    required
                  />
                </div>

                {/* APELLIDO PATERNO */}
                <div style={styles.field}>
                  <label style={styles.label}>
                    Apellido paterno
                  </label>

                  <input
                    type="text"
                    name="apellido_paterno"
                    value={formulario.apellido_paterno}
                    onChange={handleChange}
                    placeholder="Pérez"
                    style={styles.input}
                    required
                  />
                </div>

                {/* APELLIDO MATERNO */}
                <div style={styles.field}>
                  <label style={styles.label}>
                    Apellido materno
                  </label>

                  <input
                    type="text"
                    name="apellido_materno"
                    value={formulario.apellido_materno}
                    onChange={handleChange}
                    placeholder="González"
                    style={styles.input}
                  />
                </div>

                {/* CARGO */}
                <div style={styles.field}>
                  <label style={styles.label}>
                    Cargo
                  </label>

                  <input
                    type="text"
                    name="cargo"
                    value={formulario.cargo}
                    onChange={handleChange}
                    placeholder="Técnico en terreno"
                    style={styles.input}
                    required
                  />
                </div>

                {/* EMAIL */}
                <div style={styles.field}>
                  <label style={styles.label}>
                    Email / Usuario
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formulario.email}
                    onChange={handleChange}
                    placeholder="usuario@empresa.cl"
                    style={styles.input}
                  />
                </div>

              </div>

              {/* BOTONES */}
              <div style={styles.modalActions}>

                <button
                  type="button"
                  onClick={cerrarModal}
                  style={styles.btnCancel}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="vt-btn-primary"
                  style={styles.btnPrimary}
                >
                  <Plus size={16} />
                  Guardar empleado
                </button>

              </div>

            </form>

          </div>

        </div>
      )}
    </>
  );
}

/* =========================
   ESTILOS GLOBALES
========================= */

const globalStyles = `
  .vt-row:hover {
    background: #F8FAFC;
  }

  .vt-btn-primary:hover {
    background: #4338CA !important;
  }

  .vt-icon-btn:hover {
    background: #F1F5F9 !important;
    border-color: #CBD5E1 !important;
  }

  .vt-icon-btn-accent:hover {
    background: #EEF2FF !important;
    border-color: #4F46E5 !important;
    color: #4F46E5 !important;
  }

  .safko-modal-input:focus {
    outline: none;
    border-color: #4F46E5 !important;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`;

/* =========================
   ESTILOS
========================= */

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
    fontFamily:
      "'JetBrains Mono', 'SFMono-Regular', Menlo, monospace",
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
    justifyContent: "center",
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
    boxShadow:
      "0 1px 2px rgba(15, 23, 42, 0.04)",
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

  /* MODAL */

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 9999,
  },

  modal: {
    width: "100%",
    maxWidth: 650,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: 16,
    boxShadow:
      "0 25px 60px rgba(15, 23, 42, 0.25)",
    padding: 28,
  },

  modalHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 26,
  },

  modalEyebrow: {
    fontFamily:
      "'JetBrains Mono', 'SFMono-Regular', Menlo, monospace",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: "#4F46E5",
    marginBottom: 5,
  },

  modalTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: "#1E293B",
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "1px solid #E2E8F0",
    background: "#fff",
    color: "#64748B",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: 18,
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },

  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#334155",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #CBD5E1",
    borderRadius: 8,
    fontSize: 14,
    color: "#1E293B",
    background: "#fff",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 28,
    paddingTop: 20,
    borderTop: "1px solid #E2E8F0",
  },

  btnCancel: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 18px",
    borderRadius: 8,
    border: "1px solid #CBD5E1",
    background: "#fff",
    color: "#475569",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default ListarEmpleados;