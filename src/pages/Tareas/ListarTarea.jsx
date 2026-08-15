import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";

import {
  Eye,
  PenLine,
  Trash2,
  Plus,
  ClipboardList,
} from "lucide-react";

import "./ListarTarea.css";

// =====================================================
// ESTADOS
// =====================================================

const ESTADO_STYLES = {
  pendiente: {
    bg: "rgba(77, 104, 216, 0.12)",
    fg: "#241ba6",
    dot: "#4d68d8",
  },

  "en traslado": {
    bg: "rgba(252, 91, 32, 0.12)",
    fg: "#fc5b20",
    dot: "#fc5b20",
  },

  "en ejecución": {
    bg: "rgba(77, 104, 216, 0.15)",
    fg: "#241ba6",
    dot: "#4d68d8",
  },

  finalizado: {
    bg: "rgba(145, 240, 35, 0.18)",
    fg: "#4b790d",
    dot: "#91f023",
  },

  terminada: {
    bg: "rgba(252, 91, 32, 0.12)",
    fg: "#c23e0c",
    dot: "#fc5b20",
  },

  cancelada: {
    bg: "rgba(0, 0, 0, 0.06)",
    fg: "#333333",
    dot: "#666666",
  },
};

function getEstadoStyle(estado) {
  const key = (estado || "").toLowerCase().trim();

  return (
    ESTADO_STYLES[key] || {
      bg: "rgba(77, 104, 216, 0.12)",
      fg: "#241ba6",
      dot: "#4d68d8",
    }
  );
}

// =====================================================
// COMPONENTE
// =====================================================

function ListarTarea() {
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [errorCarga, setErrorCarga] = useState(null);

  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);

  // =====================================================
  // FORMULARIO INICIAL
  // =====================================================

  const initialFormState = {
    cliente_id: "",
    empleado_id: "",
    fecha_termino: "",
    titulo: "",
    nombre_contacto: "",
    telefono_contacto: "",
    descripcion_trabajo: "",
    observaciones: "",
    formularios_habilitados: {
      checklist: false,
      charla_5min: false,
      lista_riesgos: false,
    },
    direccion_trabajo: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  // =====================================================
  // CARGAR DATOS
  // =====================================================

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setCargando(true);

        await Promise.all([
          cargarTareas(),
          cargarClientes(),
          cargarEmpleados(),
        ]);
      } catch (error) {
        console.error(
          "Error cargando los datos iniciales:",
          error
        );
      } finally {
        setCargando(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  // =====================================================
  // CLIENTES
  // =====================================================

  const cargarClientes = async () => {
    const token = localStorage.getItem("token");

    try {
      if (!token) {
        console.warn("No existe token para cargar clientes");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/clientes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setClientes(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    }
  };

  // =====================================================
  // EMPLEADOS
  // =====================================================

  const cargarEmpleados = async () => {
    const token = localStorage.getItem("token");

    try {
      if (!token) {
        console.warn("No existe token para cargar empleados");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/empleado`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEmpleados(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    }
  };

  // =====================================================
  // TAREAS
  // =====================================================

  const cargarTareas = async () => {
    try {
      setErrorCarga(null);

      const token = localStorage.getItem("token");

      if (!token) {
        setErrorCarga(
          "No hay sesión activa. Vuelve a iniciar sesión."
        );

        setTareas([]);

        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/tareas`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const datosTareas = Array.isArray(response.data)
        ? response.data
        : response.data?.tareas ||
          response.data?.data ||
          [];

      setTareas(datosTareas);
    } catch (error) {
      console.error("Error al cargar tareas:", error);

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        setErrorCarga(
          "Sesión expirada o sin permisos. Inicia sesión nuevamente."
        );
      } else if (error.response) {
        setErrorCarga(
          error.response.data?.mensaje ||
            "Error del servidor al cargar tareas."
        );
      } else if (error.request) {
        setErrorCarga(
          "No se pudo conectar con el servidor. Verifica tu conexión o la URL de la API."
        );
      } else {
        setErrorCarga(
          "Ocurrió un error inesperado al cargar las tareas."
        );
      }

      setTareas([]);
    }
  };

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================================
  // GUARDAR TAREA
  // =====================================================

  const guardarTarea = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert(
          "No hay una sesión activa. Inicia sesión nuevamente."
        );

        return;
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/tareas`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (window.Swal) {
        window.Swal.fire({
          title: "¡Creado!",
          text: "Tarea creada correctamente",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        alert("Tarea creada correctamente");
      }

      setModalOpen(false);

      setFormData(
        structuredClone(initialFormState)
      );

      await cargarTareas();
    } catch (error) {
      console.error("Error al guardar tarea:", error);

      if (window.Swal) {
        window.Swal.fire(
          "Error",
          error.response?.data?.mensaje ||
            "Error al guardar tarea",
          "error"
        );
      } else {
        alert(
          error.response?.data?.mensaje ||
            "Error al guardar tarea"
        );
      }
    }
  };

  // =====================================================
  // ELIMINAR
  // =====================================================

  const eliminarTarea = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert(
        "No hay una sesión activa. Inicia sesión nuevamente."
      );

      return;
    }

    if (!window.Swal) {
      if (
        window.confirm(
          "¿Seguro que deseas eliminar esta tarea?"
        )
      ) {
        try {
          await axios.delete(
            `${import.meta.env.VITE_API_URL}/api/tareas/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          alert("Tarea eliminada con éxito");

          await cargarTareas();
        } catch (error) {
          console.error(error);

          alert(
            error.response?.data?.mensaje ||
              "Error al eliminar la tarea"
          );
        }
      }

      return;
    }

    const result = await window.Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la tarea permanentemente",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#fc5b20",
      cancelButtonColor: "#4d68d8",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      setCargando(true);

      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/tareas/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        window.Swal.fire({
          title: "¡Eliminado!",
          text: "La tarea ha sido eliminada correctamente",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

        await cargarTareas();
      } catch (error) {
        console.error(error);

        const mensajeError =
          error.response?.data?.mensaje ||
          "No se puede eliminar la tarea";

        window.Swal.fire(
          "Error",
          mensajeError,
          "error"
        );
      } finally {
        setCargando(false);
      }
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (cargando) {
    return (
      <div className="vt-page">
        <Loading mensaje="Cargando tareas..." />
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <div className="vt-page">
        <div className="vt-wrap">

          {/* HEADER */}

          <div className="vt-header">
            <div>
              <div className="vt-eyebrow">
                GESTIÓN DE ÓRDENES
              </div>

              <h1 className="vt-title">
                Listado de tareas
              </h1>
            </div>

            <button
              className="vt-btn-primary"
              onClick={() => setModalOpen(true)}
            >
              <Plus size={16} strokeWidth={2.5} />
              Nueva tarea
            </button>
          </div>

          {/* ERROR */}

          {errorCarga && (
            <div className="vt-error">
              <span>{errorCarga}</span>

              <button
                type="button"
                className="vt-error-retry"
                onClick={cargarTareas}
              >
                Reintentar
              </button>
            </div>
          )}

          {/* SIN TAREAS */}

          {tareas.length === 0 ? (
            <div className="vt-empty">
              <div className="vt-empty-icon">
                <ClipboardList size={26} />
              </div>

              <h4>
                {errorCarga
                  ? "No se pudieron cargar las tareas"
                  : "No hay tareas registradas"}
              </h4>

              <p>
                {errorCarga
                  ? "Revisa el mensaje de error arriba e inténtalo de nuevo."
                  : "Crea la primera orden de trabajo para verla aquí."}
              </p>

              <button
                className="vt-btn-primary"
                onClick={() => setModalOpen(true)}
              >
                <Plus size={16} strokeWidth={2.5} />
                Nueva tarea
              </button>
            </div>
          ) : (
            /* TABLA */

            <div className="vt-table-card">
              <div className="vt-table-scroll">
                <table className="vt-table">
                  <thead>
                    <tr>
                      <th>OT</th>
                      <th>Cliente</th>
                      <th>Técnico resp.</th>
                      <th>Asignación</th>
                      <th>Término</th>
                      <th>Estado</th>
                      <th className="vt-th-actions">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {tareas.map((tarea) => {
                      const estadoStyle =
                        getEstadoStyle(tarea.estado);

                      return (
                        <tr
                          key={tarea.id_trabajo}
                          className="vt-row"
                        >
                          <td className="vt-td vt-td-strong">
                            {tarea.numero_ot}
                          </td>

                          <td className="vt-td">
                            {tarea.cliente}
                          </td>

                          <td className="vt-td">
                            {tarea.empleado}
                          </td>

                          <td className="vt-td vt-td-muted">
                            {tarea.fecha_asignacion
                              ? new Date(
                                  tarea.fecha_asignacion
                                ).toLocaleDateString(
                                  "es-CL"
                                )
                              : "—"}
                          </td>

                          <td className="vt-td vt-td-muted">
                            {tarea.fecha_termino
                              ? new Date(
                                  tarea.fecha_termino
                                ).toLocaleDateString(
                                  "es-CL"
                                )
                              : "—"}
                          </td>

                          <td className="vt-td">
                            <span
                              className="vt-badge"
                              style={{
                                background:
                                  estadoStyle.bg,
                                color:
                                  estadoStyle.fg,
                              }}
                            >
                              <span
                                className="vt-badge-dot"
                                style={{
                                  background:
                                    estadoStyle.dot,
                                }}
                              />

                              {tarea.estado}
                            </span>
                          </td>

                          <td className="vt-td vt-actions-cell">
                            <div className="vt-actions">

                              {/* VER */}

                              <button
                                type="button"
                                className="vt-icon-btn"
                                title="Ver"
                                onClick={() =>
                                  navigate(
                                    `/tareas/ver_tarea/${tarea.id_trabajo}`
                                  )
                                }
                              >
                                <Eye size={15} />
                              </button>

                              {/* EDITAR */}

                              <button
                                type="button"
                                className="vt-icon-btn vt-icon-btn-accent"
                                title="Editar"
                                onClick={() =>
                                  navigate(
                                    `/tareas/editar/${tarea.id_trabajo}`
                                  )
                                }
                              >
                                <PenLine size={15} />
                              </button>

                              {/* ELIMINAR */}

                              <button
                                type="button"
                                className="vt-icon-btn vt-icon-btn-danger"
                                title="Eliminar"
                                onClick={() =>
                                  eliminarTarea(
                                    tarea.id_trabajo
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
      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {modalOpen && (
        <>
          <div
            className="modal fade show vt-modal"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content vt-modal-content">

                {/* HEADER */}

                <div className="modal-header vt-modal-header">
                  <div>
                    <div className="vt-eyebrow-small">
                      NUEVA ORDEN DE TRABAJO
                    </div>

                    <h5 className="modal-title vt-modal-title">
                      Crear tarea
                    </h5>
                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() =>
                      setModalOpen(false)
                    }
                  />
                </div>

                {/* FORMULARIO */}

                <form onSubmit={guardarTarea}>
                  <div className="modal-body vt-modal-body">
                    <div className="row">

                      {/* CLIENTE */}

                      <div className="col-md-6 mb-3">
                        <label className="vt-form-label">
                          Cliente *
                        </label>

                        <select
                          className="form-select"
                          name="cliente_id"
                          value={formData.cliente_id}
                          onChange={handleChange}
                          required
                        >
                          <option value="">
                            Seleccione un cliente
                          </option>

                          {clientes.map((cliente) => (
                            <option
                              value={cliente.id_cliente}
                              key={cliente.id_cliente}
                            >
                              {cliente.razon_social}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* CONTACTO */}

                      <div className="col-md-6 mb-3">
                        <label className="vt-form-label">
                          Nombre de contacto
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          name="nombre_contacto"
                          value={formData.nombre_contacto}
                          onChange={handleChange}
                        />
                      </div>

                      {/* TELEFONO */}

                      <div className="col-md-6 mb-3">
                        <label className="vt-form-label">
                          Teléfono del contacto
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          name="telefono_contacto"
                          value={formData.telefono_contacto}
                          onChange={handleChange}
                        />
                      </div>

                      {/* RESPONSABLE */}

                      <div className="col-md-6 mb-3">
                        <label className="vt-form-label">
                          Responsable *
                        </label>

                        <select
                          className="form-select"
                          name="empleado_id"
                          value={formData.empleado_id}
                          onChange={handleChange}
                          required
                        >
                          <option value="">
                            Seleccione un responsable
                          </option>

                          {empleados.map((empleado) => (
                            <option
                              value={empleado.id}
                              key={empleado.id}
                            >
                              {empleado.nombres}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* FECHA */}

                      <div className="col-md-6 mb-3">
                        <label className="vt-form-label">
                          Fecha término
                        </label>

                        <input
                          type="date"
                          className="form-control"
                          name="fecha_termino"
                          value={formData.fecha_termino}
                          onChange={handleChange}
                        />
                      </div>

                      {/* DIRECCION */}

                      <div className="col-md-12 mb-3">
                        <label className="vt-form-label">
                          Dirección de obras *
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          name="direccion_trabajo"
                          value={formData.direccion_trabajo}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {/* TITULO */}

                      <div className="col-md-12 mb-3">
                        <label className="vt-form-label">
                          Título *
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          name="titulo"
                          value={formData.titulo}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {/* DESCRIPCION */}

                      <div className="col-md-12 mb-3">
                        <label className="vt-form-label">
                          Descripción *
                        </label>

                        <textarea
                          className="form-control"
                          rows="4"
                          name="descripcion_trabajo"
                          value={formData.descripcion_trabajo}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {/* OBSERVACIONES */}

                      <div className="col-md-12 mb-3">
                        <label className="vt-form-label">
                          Observaciones
                        </label>

                        <textarea
                          className="form-control"
                          rows="3"
                          name="observaciones"
                          value={formData.observaciones}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* FORMULARIOS */}

                    <div className="vt-check-group">
                      <label className="vt-form-label">
                        Habilitar formularios para el técnico
                      </label>

                      <div className="vt-check-list">

                        <label className="vt-check-item">
                          <input
                            type="checkbox"
                            checked={
                              formData.formularios_habilitados
                                ?.checklist || false
                            }
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                formularios_habilitados: {
                                  ...prev.formularios_habilitados,
                                  checklist:
                                    e.target.checked,
                                },
                              }))
                            }
                          />

                          Checklist
                        </label>

                        <label className="vt-check-item">
                          <input
                            type="checkbox"
                            checked={
                              formData.formularios_habilitados
                                ?.charla_5min || false
                            }
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                formularios_habilitados: {
                                  ...prev.formularios_habilitados,
                                  charla_5min:
                                    e.target.checked,
                                },
                              }))
                            }
                          />

                          Charla 5 min
                        </label>

                        <label className="vt-check-item">
                          <input
                            type="checkbox"
                            checked={
                              formData.formularios_habilitados
                                ?.lista_riesgos || false
                            }
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                formularios_habilitados: {
                                  ...prev.formularios_habilitados,
                                  lista_riesgos:
                                    e.target.checked,
                                },
                              }))
                            }
                          />

                          Lista de riesgos
                        </label>

                      </div>
                    </div>
                  </div>

                  {/* FOOTER */}

                  <div className="modal-footer vt-modal-footer">
                    <button
                      type="button"
                      className="vt-btn-ghost"
                      onClick={() =>
                        setModalOpen(false)
                      }
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="vt-btn-primary"
                    >
                      Guardar tarea
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div
            className="modal-backdrop fade show vt-backdrop"
          />
        </>
      )}
    </>
  );
}

export default ListarTarea;