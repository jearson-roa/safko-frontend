import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";

function ListarCliente() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  // Modal
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    razon_social: "",
    rut: "",
    giro_comercial: "",
    direccion: "",
    comuna: "",
    ciudad: "",
    region: "",
    nombre_contacto: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validar = () => {
    let newErrors = {};

    if (!form.razon_social.trim())
      newErrors.razon_social = "La razón social es obligatoria";

    if (!form.rut.trim()) {
      newErrors.rut = "El RUT es obligatorio";
    } else if (!/^[0-9]+-[0-9kK]{1}$/.test(form.rut)) {
      newErrors.rut = "Formato inválido. Ej: 12345678-9";
    }

    if (!form.direccion.trim())
      newErrors.direccion = "La dirección es obligatoria";

    if (!form.ciudad.trim())
      newErrors.ciudad = "La ciudad es obligatoria";

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
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerClientes();
  }, []);

  const crearCliente = async (e) => {
    e.preventDefault();

    if (!validar()) return;

    try {
      await axios.post("http://localhost:3000/api/clientes", form);

      alert("Cliente creado correctamente");
      setModalOpen(false);
      setForm({
        razon_social: "",
        rut: "",
        giro_comercial: "",
        direccion: "",
        comuna: "",
        ciudad: "",
        region: "",
        nombre_contacto: "",
      });
      setErrors({});
      obtenerClientes();
    } catch (error) {
      console.error(error);
      alert("Error al crear cliente");
    }
  };

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.razon_social?.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.rut?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const clientesActivos = clientes.filter(
    (cliente) => cliente.estado === "Activo"
  ).length;

  return (
    <>
      <Sidebar />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Gestión de Clientes</h1>
            <p style={styles.subtitle}>Administración de clientes registrados</p>
          </div>

          <button style={styles.newButton} onClick={() => setModalOpen(true)}>
            + Nuevo Cliente
          </button>
        </div>

        {/* Indicadores */}
        <div style={styles.cardsContainer}>
          <div style={styles.card}>
            <span style={styles.cardLabel}>Total Clientes</span>
            <h2 style={styles.cardNumber}>{clientes.length}</h2>
          </div>

          <div style={styles.card}>
            <span style={styles.cardLabel}>Clientes Activos</span>
            <h2 style={{ ...styles.cardNumber, color: "#16a34a" }}>
              {clientesActivos}
            </h2>
          </div>

          <div style={styles.card}>
            <span style={styles.cardLabel}>Clientes Inactivos</span>
            <h2 style={{ ...styles.cardNumber, color: "#dc2626" }}>
              {clientes.length - clientesActivos}
            </h2>
          </div>
        </div>

        {/* Buscador */}
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Buscar por razón social o RUT..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Tabla */}
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.loading}>Cargando clientes...</div>
          ) : clientesFiltrados.length === 0 ? (
            <div style={styles.loading}>No existen clientes registrados</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Razón Social</th>
                  <th style={styles.th}>RUT</th>
                  <th style={styles.th}>Giro</th>
                  <th style={styles.th}>Ciudad</th>
                  <th style={styles.th}>Contacto</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id_cliente} style={styles.tr}>
                    <td style={styles.td}>{cliente.id_cliente}</td>

                    <td style={{ ...styles.td, fontWeight: "600" }}>
                      {cliente.razon_social}
                    </td>

                    <td style={styles.td}>{cliente.rut}</td>
                    <td style={styles.td}>{cliente.giro_comercial}</td>
                    <td style={styles.td}>{cliente.ciudad}</td>
                    <td style={styles.td}>{cliente.nombre_contacto}</td>

                    <td style={styles.td}>
                      <span
                        style={
                          cliente.estado === "Activo"
                            ? styles.badgeActivo
                            : styles.badgeInactivo
                        }
                      >
                        {cliente.estado}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button style={styles.viewButton}>Ver</button>
                        <button style={styles.editButton}>Editar</button>
                        <button style={styles.deleteButton}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {modalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>

            {/* Header del modal */}
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Nuevo Cliente</h2>
              <button
                style={styles.closeBtn}
                onClick={() => {
                  setModalOpen(false);
                  setErrors({});
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={crearCliente}>
              <div style={styles.modalGrid}>

                {/* Razón Social */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Razón Social *</label>
                  <input
                    name="razon_social"
                    placeholder="Ej: Protelcon SpA"
                    value={form.razon_social}
                    onChange={handleChange}
                    style={{
                      ...styles.input,
                      ...(errors.razon_social ? styles.inputError : {}),
                    }}
                  />
                  {errors.razon_social && (
                    <span style={styles.errorText}>{errors.razon_social}</span>
                  )}
                </div>

                {/* RUT */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>RUT *</label>
                  <input
                    name="rut"
                    placeholder="Ej: 77123456-7"
                    value={form.rut}
                    onChange={handleChange}
                    style={{
                      ...styles.input,
                      ...(errors.rut ? styles.inputError : {}),
                    }}
                  />
                  <small style={styles.hint}>Formato: 12345678-9</small>
                  {errors.rut && (
                    <span style={styles.errorText}>{errors.rut}</span>
                  )}
                </div>

                {/* Giro Comercial */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Giro Comercial</label>
                  <input
                    name="giro_comercial"
                    placeholder="Ej: Telecomunicaciones"
                    value={form.giro_comercial}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                {/* Dirección */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Dirección *</label>
                  <input
                    name="direccion"
                    placeholder="Ej: Av. Providencia 1234"
                    value={form.direccion}
                    onChange={handleChange}
                    style={{
                      ...styles.input,
                      ...(errors.direccion ? styles.inputError : {}),
                    }}
                  />
                  {errors.direccion && (
                    <span style={styles.errorText}>{errors.direccion}</span>
                  )}
                </div>

                {/* Ciudad */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Ciudad *</label>
                  <input
                    name="ciudad"
                    placeholder="Ej: Santiago"
                    value={form.ciudad}
                    onChange={handleChange}
                    style={{
                      ...styles.input,
                      ...(errors.ciudad ? styles.inputError : {}),
                    }}
                  />
                  {errors.ciudad && (
                    <span style={styles.errorText}>{errors.ciudad}</span>
                  )}
                </div>

                {/* Región */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Región</label>
                  <input
                    name="region"
                    placeholder="Ej: Metropolitana"
                    value={form.region}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                {/* Comuna */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Comuna</label>
                  <input
                    name="comuna"
                    placeholder="Ej: Providencia"
                    value={form.comuna}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

                {/* Contacto - ocupa columna completa */}
                <div style={{ ...styles.fieldGroup, gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Nombre Contacto</label>
                  <input
                    name="nombre_contacto"
                    placeholder="Ej: Juan Pérez"
                    value={form.nombre_contacto}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </div>

              </div>

              {/* Botones */}
              <div style={styles.modalButtons}>
                <button type="submit" style={styles.saveBtn}>
                  Guardar Cliente
                </button>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => {
                    setModalOpen(false);
                    setErrors({});
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  container: {
    marginLeft: "260px",
    minHeight: "100vh",
    backgroundColor: "#f4f6f8",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  title: {
    fontSize: "32px",
    color: "#1f2937",
    marginBottom: "5px",
  },

  subtitle: {
    color: "#6b7280",
  },

  newButton: {
    backgroundColor: "#1f2937",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "10px",
    cursor: "pointer",
  },

  cardsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "25px",
  },

  card: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },

  cardLabel: {
    color: "#6b7280",
    fontSize: "14px",
  },

  cardNumber: {
    marginTop: "10px",
    fontSize: "32px",
    color: "#1f2937",
  },

  searchContainer: {
    marginBottom: "25px",
  },

  searchInput: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
  },

  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    backgroundColor: "#f9fafb",
    textAlign: "left",
    padding: "16px",
    fontSize: "14px",
    color: "#374151",
    borderBottom: "1px solid #e5e7eb",
  },

  tr: {
    borderBottom: "1px solid #e5e7eb",
  },

  td: {
    padding: "16px",
    fontSize: "14px",
    color: "#374151",
  },

  badgeActivo: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  badgeInactivo: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  actions: {
    display: "flex",
    gap: "5px",
  },

  viewButton: {
    backgroundColor: "#e5e7eb",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  editButton: {
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  deleteButton: {
    backgroundColor: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  loading: {
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
  },

  // ── Estilos del Modal ──────────────────────────────

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  modal: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "30px",
    width: "680px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  modalTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0",
  },

  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#6b7280",
  },

  modalGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
  },

  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },

  inputError: {
    borderColor: "#dc2626",
  },

  errorText: {
    fontSize: "12px",
    color: "#dc2626",
  },

  hint: {
    fontSize: "11px",
    color: "#9ca3af",
  },

  modalButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "24px",
  },

  saveBtn: {
    backgroundColor: "#1f2937",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },

  cancelBtn: {
    backgroundColor: "#e5e7eb",
    color: "#374151",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default ListarCliente;