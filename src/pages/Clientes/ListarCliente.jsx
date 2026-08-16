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
import "./ListarCliente.css";

const ESTADO_STYLES = {
  activo: {
    bg: "#D1FAE5",
    fg: "#065F46",
    dot: "#10B981",
  },
  inactivo: {
    bg: "#FEE2E2",
    fg: "#991B1B",
    dot: "#EF4444",
  },
};

function getEstadoStyle(estado) {
  const key = (estado || "").toLowerCase().trim();

  return (
    ESTADO_STYLES[key] || {
      bg: "#E2E8F0",
      fg: "#475569",
      dot: "#64748B",
    }
  );
}

function ListarCliente() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  const [cargando, setCargando] = useState(true);

  const [regiones, setRegiones] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [comunas, setComunas] = useState([]);

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

  /* =========================================================
     FORMULARIO
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "id_region") {
      setForm({
        ...form,
        id_region: value,
        id_provincia: "",
        id_comuna: "",
      });
    } else if (name === "id_provincia") {
      setForm({
        ...form,
        id_provincia: value,
        id_comuna: "",
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  /* =========================================================
     REGIONES
  ========================================================= */

  useEffect(() => {
    const cargarRegiones = async () => {
      try {
        const respuesta = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/regiones`
        );

        setRegiones(respuesta.data);
      } catch (error) {
        console.error("Error al cargar regiones:", error);
      }
    };

    cargarRegiones();
  }, []);

  /* =========================================================
     PROVINCIAS
  ========================================================= */

  useEffect(() => {
    if (!form.id_region) {
      setProvincias([]);
      return;
    }

    axios
      .get(
        `${import.meta.env.VITE_API_URL}/api/provincias/region/${form.id_region}`
      )
      .then((respuesta) => {
        setProvincias(respuesta.data);
      })
      .catch((error) => {
        console.error("Error al cargar provincias:", error);
        setProvincias([]);
      });
  }, [form.id_region]);

  /* =========================================================
     COMUNAS
  ========================================================= */

  useEffect(() => {
    if (!form.id_provincia) {
      setComunas([]);
      return;
    }

    axios
      .get(
        `${import.meta.env.VITE_API_URL}/api/comunas/provincia/${form.id_provincia}`
      )
      .then((respuesta) => {
        setComunas(respuesta.data);
      })
      .catch((error) => {
        console.error("Error al cargar comunas:", error);
        setComunas([]);
      });
  }, [form.id_provincia]);

  /* =========================================================
     VALIDACIÓN
  ========================================================= */

  const validar = () => {
    const newErrors = {};

    if (!form.razon_social.trim()) {
      newErrors.razon_social = "La razón social es obligatoria";
    }

    if (!form.rut.trim()) {
      newErrors.rut = "El RUT es obligatorio";
    } else if (!/^[0-9]+-[0-9kK]{1}$/.test(form.rut)) {
      newErrors.rut = "Formato inválido. Ej: 12345678-9";
    }

    if (!form.direccion.trim()) {
      newErrors.direccion = "La dirección es obligatoria";
    }

    if (!form.id_comuna) {
      newErrors.id_comuna = "Debes seleccionar una comuna";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* =========================================================
     OBTENER CLIENTES
  ========================================================= */

  const obtenerClientes = async () => {
    try {
      const respuesta = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/clientes`
      );

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

  /* =========================================================
     CREAR CLIENTE
  ========================================================= */

  const crearCliente = async (e) => {
    e.preventDefault();

    if (!validar()) return;

    setCargando(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/clientes`,
        form
      );

      if (window.Swal) {
        window.Swal.fire({
          title: "¡Éxito!",
          text: "Cliente creado correctamente",
          icon: "success",
          confirmButtonColor: "#241ba6",
          timer: 2000,
          showConfirmButton: false,
        });
      }

      setModalOpen(false);
      setForm(initialFormState);
      setErrors({});

      await obtenerClientes();
    } catch (error) {
      console.error("Error al crear cliente:", error);

      if (window.Swal) {
        window.Swal.fire({
          title: "¡Error!",
          text: "Error al crear cliente",
          icon: "error",
          confirmButtonColor: "#fc5b20",
        });
      }
    } finally {
      setCargando(false);
    }
  };

  /* =========================================================
     ELIMINAR CLIENTE
  ========================================================= */

  const eliminarCliente = async (id) => {
    if (!window.Swal) return;

    const result = await window.Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará al cliente permanentemente",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#fc5b20",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    setCargando(true);

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/clientes/${id}`
      );

      window.Swal.fire({
        title: "¡Eliminado!",
        text: "El cliente ha sido eliminado correctamente",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      await obtenerClientes();
    } catch (error) {
      console.error("Error al eliminar cliente:", error);

      window.Swal.fire(
        "ERROR",
        "No se puede eliminar cliente",
        "error"
      );
    } finally {
      setCargando(false);
    }
  };

  /* =========================================================
     FILTRO
  ========================================================= */

  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = busqueda.toLowerCase();

    return (
      cliente.razon_social?.toLowerCase().includes(texto) ||
      cliente.rut?.toLowerCase().includes(texto)
    );
  });

  const clientesActivos = clientes.filter(
    (cliente) => cliente.estado === "Activo"
  ).length;

  const clientesInactivos = clientes.length - clientesActivos;

  /* =========================================================
     LOADING
  ========================================================= */

  if (cargando) {
    return (
      <div className="vt-page">
        <Loading mensaje="Cargando información..." />
      </div>
    );
  }

  return (
    <div className="vt-page">
      <div className="vt-wrap">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="vt-header">
          <div>
            <div className="vt-eyebrow">
              GESTIÓN DE CLIENTES
            </div>

            <h1 className="vt-title">
              Clientes registrados
            </h1>

            <p className="vt-subtitle">
              Administración de clientes de la empresa
            </p>
          </div>

          <button
            className="vt-btn-primary"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={16} strokeWidth={2.5} />
            Nuevo cliente
          </button>
        </div>

        {/* =====================================================
            ESTADÍSTICAS
        ===================================================== */}

        <div className="vt-stats">
          <div className="vt-stat-card">
            <div className="vt-stat-icon vt-stat-icon-primary">
              <Users size={18} />
            </div>

            <div>
              <div className="vt-stat-label">
                Total clientes
              </div>

              <div className="vt-stat-value">
                {clientes.length}
              </div>
            </div>
          </div>

          <div className="vt-stat-card">
            <div className="vt-stat-icon vt-stat-icon-success">
              <UserCheck size={18} />
            </div>

            <div>
              <div className="vt-stat-label">
                Clientes activos
              </div>

              <div className="vt-stat-value vt-stat-value-success">
                {clientesActivos}
              </div>
            </div>
          </div>

          <div className="vt-stat-card">
            <div className="vt-stat-icon vt-stat-icon-danger">
              <UserX size={18} />
            </div>

            <div>
              <div className="vt-stat-label">
                Clientes inactivos
              </div>

              <div className="vt-stat-value vt-stat-value-danger">
                {clientesInactivos}
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            BUSCADOR
        ===================================================== */}

        <div className="vt-search">
          <Search
            size={16}
            className="vt-search-icon"
          />

          <input
            type="text"
            className="vt-search-input"
            placeholder="Buscar por razón social o RUT..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* =====================================================
            TABLA / EMPTY
        ===================================================== */}

        {clientesFiltrados.length === 0 ? (
          <div className="vt-empty">
            <div className="vt-empty-icon">
              <Users size={26} />
            </div>

            <h4>
              No hay clientes registrados
            </h4>

            <p>
              No existen clientes o ninguno coincide
              con tu búsqueda.
            </p>

            <button
              className="vt-btn-primary"
              onClick={() => setModalOpen(true)}
            >
              <Plus size={16} strokeWidth={2.5} />
              Nuevo cliente
            </button>
          </div>
        ) : (
          <div className="vt-table-card">
            <div className="vt-table-scroll">
              <table className="vt-table">
                <thead>
                  <tr>
                    <th>Razón social</th>
                    <th>RUT</th>
                    <th>Contacto</th>
                    <th>Teléfono / Correo</th>
                    <th>Estado</th>
                    <th className="vt-th-actions">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {clientesFiltrados.map((cliente) => {
                    const estadoStyle = getEstadoStyle(
                      cliente.estado || "Inactivo"
                    );

                    return (
                      <tr
                        key={cliente.id_cliente}
                        className="vt-row"
                      >
                        <td className="vt-td vt-td-strong">
                          {cliente.razon_social}
                        </td>

                        <td className="vt-td vt-td-muted">
                          {cliente.rut}
                        </td>

                        {/* Contacto: nombre + cargo apilados
                            en una sola celda */}
                        <td className="vt-td">
                          <div className="vt-td-stack">
                            <span className="vt-td-stack-primary">
                              {cliente.nombre_contacto || "—"}
                            </span>

                            {cliente.cargo_contacto && (
                              <span className="vt-td-stack-secondary">
                                {cliente.cargo_contacto}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Teléfono / correo: apilados en
                            una sola celda */}
                        <td className="vt-td">
                          <div className="vt-td-stack">
                            <span className="vt-td-stack-primary">
                              {cliente.telefono_contacto || "—"}
                            </span>

                            {cliente.correo_contacto && (
                              <span className="vt-td-stack-secondary">
                                {cliente.correo_contacto}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="vt-td">
                          <span
                            className="vt-badge"
                            style={{
                              background: estadoStyle.bg,
                              color: estadoStyle.fg,
                            }}
                          >
                            <span
                              className="vt-badge-dot"
                              style={{
                                background: estadoStyle.dot,
                              }}
                            />

                            {cliente.estado || "Inactivo"}
                          </span>
                        </td>

                        <td className="vt-td vt-actions-cell">
                          <div className="vt-actions">

                            <button
                              type="button"
                              className="vt-icon-btn"
                              title="Ver"
                              onClick={() =>
                                navigate(
                                  `/clientes/ver/${cliente.id_cliente}`
                                )
                              }
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              type="button"
                              className="vt-icon-btn vt-icon-btn-accent"
                              title="Editar"
                              onClick={() =>
                                navigate(
                                  `/clientes/editar/${cliente.id_cliente}`
                                )
                              }
                            >
                              <PenLine size={15} />
                            </button>

                            <button
                              type="button"
                              className="vt-icon-btn vt-icon-btn-danger"
                              title="Eliminar"
                              onClick={() =>
                                eliminarCliente(
                                  cliente.id_cliente
                                )
                              }
                            >
                              <Trash2 size={15} />
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

      {/* =======================================================
          MODAL
      ======================================================= */}

      {modalOpen && (
        <>
          <div className="vt-modal">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content vt-modal-content">

                <div className="modal-header vt-modal-header">
                  <div>
                    <div className="vt-eyebrow-small">
                      NUEVO REGISTRO
                    </div>

                    <h5 className="vt-modal-title">
                      Crear cliente
                    </h5>
                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setModalOpen(false);
                      setErrors({});
                    }}
                  />
                </div>

                <form onSubmit={crearCliente}>

                  <div className="modal-body vt-modal-body">
                    <div className="row g-4">

                      {/* Razón social */}

                      <div className="col-12 col-md-6">
                        <label className="vt-form-label">
                          Razón social *
                        </label>

                        <input
                          name="razon_social"
                          value={form.razon_social}
                          onChange={handleChange}
                          className={`form-control ${
                            errors.razon_social
                              ? "is-invalid"
                              : ""
                          }`}
                        />

                        {errors.razon_social && (
                          <div className="invalid-feedback">
                            {errors.razon_social}
                          </div>
                        )}
                      </div>

                      {/* RUT */}

                      <div className="col-12 col-md-6">
                        <label className="vt-form-label">
                          RUT *
                        </label>

                        <input
                          name="rut"
                          placeholder="12345678-9"
                          value={form.rut}
                          onChange={handleChange}
                          className={`form-control ${
                            errors.rut ? "is-invalid" : ""
                          }`}
                        />

                        {errors.rut && (
                          <div className="invalid-feedback">
                            {errors.rut}
                          </div>
                        )}
                      </div>

                      {/* Giro */}

                      <div className="col-12 col-md-6">
                        <label className="vt-form-label">
                          Giro comercial
                        </label>

                        <input
                          name="giro_comercial"
                          value={form.giro_comercial}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>

                      {/* Dirección */}

                      <div className="col-12 col-md-6">
                        <label className="vt-form-label">
                          Dirección *
                        </label>

                        <input
                          name="direccion"
                          value={form.direccion}
                          onChange={handleChange}
                          className={`form-control ${
                            errors.direccion
                              ? "is-invalid"
                              : ""
                          }`}
                        />

                        {errors.direccion && (
                          <div className="invalid-feedback">
                            {errors.direccion}
                          </div>
                        )}
                      </div>

                      {/* Región */}

                      <div className="col-12 col-md-4">
                        <label className="vt-form-label">
                          Región *
                        </label>

                        <select
                          name="id_region"
                          value={form.id_region}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value="">
                            Seleccione región
                          </option>

                          {regiones.map((region) => (
                            <option
                              key={region.region_id}
                              value={region.region_id}
                            >
                              {region.region_nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Provincia */}

                      <div className="col-12 col-md-4">
                        <label className="vt-form-label">
                          Provincia *
                        </label>

                        <select
                          name="id_provincia"
                          value={form.id_provincia}
                          onChange={handleChange}
                          className="form-select"
                          disabled={!form.id_region}
                        >
                          <option value="">
                            Seleccione provincia
                          </option>

                          {provincias.map((prov) => (
                            <option
                              key={prov.provincia_id}
                              value={prov.provincia_id}
                            >
                              {prov.provincia_nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Comuna */}

                      <div className="col-12 col-md-4">
                        <label className="vt-form-label">
                          Comuna *
                        </label>

                        <select
                          name="id_comuna"
                          value={form.id_comuna}
                          onChange={handleChange}
                          className={`form-select ${
                            errors.id_comuna
                              ? "is-invalid"
                              : ""
                          }`}
                          disabled={!form.id_provincia}
                        >
                          <option value="">
                            Seleccione comuna
                          </option>

                          {comunas.map((comuna) => (
                            <option
                              key={comuna.comuna_id}
                              value={comuna.comuna_id}
                            >
                              {comuna.comuna_nombre}
                            </option>
                          ))}
                        </select>

                        {errors.id_comuna && (
                          <div className="invalid-feedback">
                            {errors.id_comuna}
                          </div>
                        )}
                      </div>

                      {/* Contacto */}

                      <div className="col-12 col-md-6">
                        <label className="vt-form-label">
                          Nombre contacto
                        </label>

                        <input
                          name="nombre_contacto"
                          value={form.nombre_contacto}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>

                      {/* Cargo */}

                      <div className="col-12 col-md-6">
                        <label className="vt-form-label">
                          Cargo
                        </label>

                        <input
                          name="cargo_contacto"
                          value={form.cargo_contacto}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>

                      {/* Teléfono */}

                      <div className="col-12 col-md-6">
                        <label className="vt-form-label">
                          Teléfono / celular
                        </label>

                        <input
                          name="telefono_contacto"
                          value={form.telefono_contacto}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>

                      {/* Correo */}

                      <div className="col-12 col-md-6">
                        <label className="vt-form-label">
                          Correo
                        </label>

                        <input
                          type="email"
                          name="correo_contacto"
                          value={form.correo_contacto}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>

                      {/* Observaciones */}

                      <div className="col-12">
                        <label className="vt-form-label">
                          Observaciones
                        </label>

                        <textarea
                          name="observaciones"
                          value={form.observaciones}
                          onChange={handleChange}
                          className="form-control"
                          rows="3"
                        />
                      </div>

                    </div>
                  </div>

                  <div className="modal-footer vt-modal-footer">

                    <button
                      type="button"
                      className="vt-btn-ghost"
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
                    >
                      Guardar cliente
                    </button>

                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="vt-backdrop" />
        </>
      )}
    </div>
  );
}

export default ListarCliente;