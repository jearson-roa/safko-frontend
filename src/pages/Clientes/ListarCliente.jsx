import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";
import {
  Eye,
  PenLine,
  Trash2,
  Plus,
  Users,
  UserCheck,
  UserX,
  Search,
} from "lucide-react";

// Mismo lenguaje visual que ListarTarea: color de acento por estado.
const ESTADO_STYLES = {
  activo: { bg: "#D1FAE5", fg: "#065F46", dot: "#10B981" },
  inactivo: { bg: "#FEE2E2", fg: "#991B1B", dot: "#EF4444" },
};

function getEstadoStyle(estado) {
  const key = (estado || "").toLowerCase().trim();
  return ESTADO_STYLES[key] || { bg: "#E2E8F0", fg: "#475569", dot: "#64748B" };
}

function ListarCliente() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [clienteEditando, setClienteEditando] = useState(null);

  // Estados para los catálogos geográficos
  const [regiones, setRegiones] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [comunas, setComunas] = useState([]);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);

  const initialFormState = {
    razon_social: "",
    rut: "",
    giro_comercial: "",
    direccion: "",
    id_region: "",
    id_provincia: "",
    id_comuna: "",
    nombre_contacto: "",
    cargo_contacto: "",
    correo_contacto: "",
    telefono_contacto: "",
    estado: "Activo",
    observaciones: "",
  };

  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // Manejador de cambios adaptado para limpiar selects en cascada
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "id_region") {
      setForm({ ...form, id_region: value, id_provincia: "", id_comuna: "" });
    } else if (name === "id_provincia") {
      setForm({ ...form, id_provincia: value, id_comuna: "" });
    } else {
      setForm({ ...form, [name]: value });
    }

    setErrors({ ...errors, [name]: "" });
  };

  // 1. Cargar Regiones al montar el componente
  useEffect(() => {
    const cargarRegiones = async () => {
      try {
        const respuesta = await axios.get(`${import.meta.env.VITE_API_URL}/api/regiones`);
        setRegiones(respuesta.data);
      } catch (error) {
        console.error("Error al cargar regiones", error);
      }
    };
    cargarRegiones();
  }, []);

  // 2. Cargar Provincias solo si se encuentra seleccionada la región
  useEffect(() => {
    if (form.id_region) {
      axios.get(`${import.meta.env.VITE_API_URL}/api/provincias/region/${form.id_region}`)
        .then(respuesta => setProvincias(respuesta.data))
        .catch(error => console.error(error));
    } else {
      setProvincias([]);
    }
  }, [form.id_region]);

  // 3. Cargar Comunas únicamente si se selecciona una provincia
  useEffect(() => {
    if (form.id_provincia) {
      axios.get(`${import.meta.env.VITE_API_URL}/api/comunas/provincia/${form.id_provincia}`)
        .then(respuesta => setComunas(respuesta.data))
        .catch(error => console.error(error));
    } else {
      setComunas([]);
    }
  }, [form.id_provincia]);

  // Validación actualizada (exigiendo id_comuna)
  const validar = () => {
    let newErrors = {};
    if (!form.razon_social.trim()) newErrors.razon_social = "La razón social es obligatoria";
    if (!form.rut.trim()) {
      newErrors.rut = "El RUT es obligatorio";
    } else if (!/^[0-9]+-[0-9kK]{1}$/.test(form.rut)) {
      newErrors.rut = "Formato inválido. Ej: 12345678-9";
    }
    if (!form.direccion.trim()) newErrors.direccion = "La dirección es obligatoria";
    if (!form.id_comuna) newErrors.id_comuna = "Debes seleccionar una comuna";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const obtenerClientes = async () => {
    try {
      const respuesta = await axios.get("http://localhost:3000/api/clientes");
      setClientes(respuesta.data);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerClientes();
  }, []);

  const crearCliente = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    setCargando(true);
    try {
      await axios.post("http://localhost:3000/api/clientes", form);

      if (window.Swal) {
        window.Swal.fire({
          title: "¡Éxito!",
          text: "Cliente creado correctamente",
          icon: "success",
          confirmButtonColor: "#212529",
          timer: 2000,
          showConfirmButton: false,
        });
      }

      setModalOpen(false);
      setForm(initialFormState);
      setErrors({});
      await obtenerClientes();

    } catch (error) {
      console.error(error);
      if (window.Swal) {
        window.Swal.fire({
          title: "¡Error!",
          text: "Error al crear cliente",
          icon: "error",
          confirmButtonColor: "#dc3545"
        });
      }
    } finally {
      setCargando(false);
    }
  };

  const eliminarCliente = async (id) => {
    if (!window.Swal) return;

    const result = await window.Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará al cliente permanentemente",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      setCargando(true);
      try {
        await axios.delete(`http://localhost:3000/api/clientes/${id}`);
        window.Swal.fire({
          title: "¡Eliminado!",
          text: "El cliente ha sido eliminado correctamente",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        await obtenerClientes();
      } catch (error) {
        console.error(error);
        window.Swal.fire("ERROR", "No se puede eliminar cliente", "error");
      } finally {
        setCargando(false);
      }
    }
  };

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.razon_social?.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.rut?.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const clientesActivos = clientes.filter(c => c.estado === "Activo").length;
  const clientesInactivos = clientes.length - clientesActivos;

  if (cargando) {
    return (
      <>
        <style>{globalStyles}</style>
        <div style={styles.page}>
          <Loading mensaje="Cargando información..." />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div style={styles.page}>
        <div style={styles.wrap}>

          {/* Header */}
          <div style={styles.headerRow}>
            <div>
              <div style={styles.eyebrow}>GESTIÓN DE CLIENTES</div>
              <h1 style={styles.h1}>Clientes registrados</h1>
              <p style={styles.subtitle}>Administración de clientes de la empresa</p>
            </div>
            <button
              className="vt-btn-primary"
              style={styles.btnPrimary}
              onClick={() => setModalOpen(true)}
            >
              <Plus size={16} strokeWidth={2.5} />
              Nuevo cliente
            </button>
          </div>

          {/* Indicadores */}
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: "#EEF2FF" }}>
                <Users size={18} color="#4F46E5" />
              </div>
              <div>
                <div style={styles.statLabel}>Total clientes</div>
                <div style={styles.statValue}>{clientes.length}</div>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: "#D1FAE5" }}>
                <UserCheck size={18} color="#10B981" />
              </div>
              <div>
                <div style={styles.statLabel}>Clientes activos</div>
                <div style={{ ...styles.statValue, color: "#059669" }}>{clientesActivos}</div>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: "#FEE2E2" }}>
                <UserX size={18} color="#EF4444" />
              </div>
              <div>
                <div style={styles.statLabel}>Clientes inactivos</div>
                <div style={{ ...styles.statValue, color: "#DC2626" }}>{clientesInactivos}</div>
              </div>
            </div>
          </div>

          {/* Búsqueda */}
          <div style={styles.searchWrap}>
            <Search size={16} color="#94A3B8" style={styles.searchIcon} />
            <input
              type="text"
              className="vt-search-input"
              style={styles.searchInput}
              placeholder="Buscar por razón social o RUT..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Tabla */}
          {clientesFiltrados.length === 0 ? (
            <div style={styles.emptyCard}>
              <div style={styles.emptyIcon}>
                <Users size={26} color="#64748B" />
              </div>
              <h4 style={styles.centerTitle}>No hay clientes registrados</h4>
              <p style={styles.centerText}>
                No existen clientes o ninguno coincide con tu búsqueda.
              </p>
              <button
                className="vt-btn-primary"
                style={styles.btnPrimary}
                onClick={() => setModalOpen(true)}
              >
                <Plus size={16} strokeWidth={2.5} />
                Nuevo cliente
              </button>
            </div>
          ) : (
            <div style={styles.tableCard}>
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Razón social</th>
                      <th style={styles.th}>RUT</th>
                      <th style={styles.th}>Contacto</th>
                      <th style={styles.th}>Cargo</th>
                      <th style={styles.th}>Teléfono</th>
                      <th style={styles.th}>Correo</th>
                      <th style={styles.th}>Estado</th>
                      <th style={{ ...styles.th, textAlign: "right" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesFiltrados.map((cliente) => {
                      const estadoStyle = getEstadoStyle(cliente.estado || "Inactivo");
                      return (
                        <tr key={cliente.id_cliente} className="vt-row">
                          <td style={{ ...styles.td, fontWeight: 600 }}>
                            {cliente.razon_social}
                          </td>
                          <td style={styles.tdMuted}>{cliente.rut}</td>
                          <td style={styles.td}>{cliente.nombre_contacto || "—"}</td>
                          <td style={styles.tdMuted}>{cliente.cargo_contacto || "—"}</td>
                          <td style={styles.tdMuted}>{cliente.telefono_contacto || "—"}</td>
                          <td style={styles.tdMuted}>{cliente.correo_contacto || "—"}</td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.badge,
                                background: estadoStyle.bg,
                                color: estadoStyle.fg,
                              }}
                            >
                              <span
                                style={{
                                  ...styles.badgeDot,
                                  background: estadoStyle.dot,
                                }}
                              />
                              {cliente.estado || "Inactivo"}
                            </span>
                          </td>
                          <td style={{ ...styles.td, textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: 6 }}>
                              <button
                                type="button"
                                className="vt-icon-btn"
                                style={styles.iconBtn}
                                title="Ver"
                                onClick={() => navigate(`/clientes/ver/${cliente.id_cliente}`)}
                              >
                                <Eye width={15} height={15} style={styles.iconSvg} />
                              </button>

                              <button
                                type="button"
                                className="vt-icon-btn vt-icon-btn-accent"
                                style={styles.iconBtn}
                                title="Editar"
                                onClick={() => navigate(`/clientes/editar/${cliente.id_cliente}`)}
                              >
                                <PenLine width={15} height={15} style={styles.iconSvg} />
                              </button>

                              <button
                                type="button"
                                className="vt-icon-btn vt-icon-btn-danger"
                                style={styles.iconBtn}
                                title="Eliminar"
                                onClick={() => eliminarCliente(cliente.id_cliente)}
                              >
                                <Trash2 width={15} height={15} style={styles.iconSvg} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <>
          <div
            className="modal fade show vt-modal"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content" style={styles.modalContent}>
                <div className="modal-header" style={styles.modalHeader}>
                  <div>
                    <div style={styles.eyebrowSmall}>NUEVO REGISTRO</div>
                    <h5 className="modal-title" style={styles.modalTitle}>
                      Crear cliente
                    </h5>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => { setModalOpen(false); setErrors({}); }}
                  ></button>
                </div>

                <form onSubmit={crearCliente}>
                  <div className="modal-body" style={{ padding: "24px 28px" }}>
                    <div className="row g-3">

                      <div className="col-12 col-md-6">
                        <label style={styles.formLabel}>Razón social *</label>
                        <input
                          name="razon_social"
                          value={form.razon_social}
                          onChange={handleChange}
                          className={`form-control ${errors.razon_social ? "is-invalid" : ""}`}
                        />
                        {errors.razon_social && (
                          <div className="invalid-feedback">{errors.razon_social}</div>
                        )}
                      </div>

                      <div className="col-12 col-md-6">
                        <label style={styles.formLabel}>RUT *</label>
                        <input
                          name="rut"
                          placeholder="12345678-9"
                          value={form.rut}
                          onChange={handleChange}
                          className={`form-control ${errors.rut ? "is-invalid" : ""}`}
                        />
                        {errors.rut && <div className="invalid-feedback">{errors.rut}</div>}
                      </div>

                      <div className="col-12 col-md-6">
                        <label style={styles.formLabel}>Giro comercial</label>
                        <input
                          name="giro_comercial"
                          value={form.giro_comercial}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label style={styles.formLabel}>Dirección *</label>
                        <input
                          name="direccion"
                          value={form.direccion}
                          onChange={handleChange}
                          className={`form-control ${errors.direccion ? "is-invalid" : ""}`}
                        />
                        {errors.direccion && (
                          <div className="invalid-feedback">{errors.direccion}</div>
                        )}
                      </div>

                      {/* Región, Provincia, Comuna */}
                      <div className="col-12 col-md-4">
                        <label style={styles.formLabel}>Región *</label>
                        <select
                          name="id_region"
                          value={form.id_region}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value="">Seleccione región</option>
                          {regiones.map((region) => (
                            <option key={region.region_id} value={region.region_id}>
                              {region.region_nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12 col-md-4">
                        <label style={styles.formLabel}>Provincia *</label>
                        <select
                          name="id_provincia"
                          value={form.id_provincia}
                          onChange={handleChange}
                          className="form-select"
                          disabled={!form.id_region}
                        >
                          <option value="">Seleccione provincia</option>
                          {provincias.map((prov) => (
                            <option key={prov.provincia_id} value={prov.provincia_id}>
                              {prov.provincia_nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12 col-md-4">
                        <label style={styles.formLabel}>Comuna *</label>
                        <select
                          name="id_comuna"
                          value={form.id_comuna}
                          onChange={handleChange}
                          className={`form-select ${errors.id_comuna ? "is-invalid" : ""}`}
                          disabled={!form.id_provincia}
                        >
                          <option value="">Seleccione comuna</option>
                          {comunas.map((comuna) => (
                            <option key={comuna.comuna_id} value={comuna.comuna_id}>
                              {comuna.comuna_nombre}
                            </option>
                          ))}
                        </select>
                        {errors.id_comuna && (
                          <div className="invalid-feedback">{errors.id_comuna}</div>
                        )}
                      </div>

                      <div className="col-12 col-md-6">
                        <label style={styles.formLabel}>Nombre contacto</label>
                        <input
                          name="nombre_contacto"
                          value={form.nombre_contacto}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label style={styles.formLabel}>Cargo</label>
                        <input
                          name="cargo_contacto"
                          value={form.cargo_contacto}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label style={styles.formLabel}>Teléfono / celular</label>
                        <input
                          name="telefono_contacto"
                          value={form.telefono_contacto}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label style={styles.formLabel}>Correo</label>
                        <input
                          type="email"
                          name="correo_contacto"
                          value={form.correo_contacto}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>

                      <div className="col-12">
                        <label style={styles.formLabel}>Observaciones</label>
                        <input
                          name="observaciones"
                          value={form.observaciones}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer" style={styles.modalFooter}>
                    <button
                      type="button"
                      className="vt-btn-ghost"
                      style={styles.btnGhost}
                      onClick={() => {
                        setModalOpen(false);
                        setForm(initialFormState);
                        setErrors({});
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="vt-btn-primary"
                      style={styles.btnPrimary}
                    >
                      Guardar cliente
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop fade show"
            style={{ backgroundColor: "rgba(15, 23, 42, 0.5)" }}
          ></div>
        </>
      )}
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
  .vt-search-input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12); }
  .vt-modal .form-control, .vt-modal .form-select { border-radius: 8px; border-color: #E2E8F0; }
  .vt-modal .form-control:focus, .vt-modal .form-select:focus {
    border-color: #4F46E5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
  }
  .vt-modal .modal-content { border-radius: 16px; border: none; overflow: hidden; }
`;

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F8FAFC",
    padding: "0px 0px",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  wrap: {
    maxWidth: 1200,
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
  eyebrowSmall: {
    fontFamily: "'JetBrains Mono', 'SFMono-Regular', Menlo, monospace",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.07em",
    color: "#4F46E5",
    marginBottom: 2,
  },
  h1: {
    fontSize: 26,
    fontWeight: 700,
    color: "#1E293B",
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    margin: "4px 0 0",
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
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: "#fff",
    border: "1px solid #E2E8F0",
    borderRadius: 16,
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  statValue: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1E293B",
    marginTop: 2,
  },
  searchWrap: {
    position: "relative",
    marginBottom: 20,
    maxWidth: 420,
  },
  searchIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    padding: "11px 14px 11px 40px",
    fontSize: 14,
    borderRadius: 10,
    border: "1px solid #E2E8F0",
    background: "#fff",
    color: "#1E293B",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
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
    whiteSpace: "nowrap",
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
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    display: "inline-block",
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
  modalContent: {
    borderRadius: 16,
    border: "none",
  },
  modalHeader: {
    padding: "20px 28px",
    borderBottom: "1px solid #E2E8F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1E293B",
    margin: 0,
  },
  modalFooter: {
    padding: "16px 28px",
    borderTop: "1px solid #E2E8F0",
  },
  formLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "#334155",
    marginBottom: 6,
    display: "block",
  },
};

export default ListarCliente;