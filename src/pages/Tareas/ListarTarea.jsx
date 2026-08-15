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

// =====================================================
// ESTILOS SEGÚN ESTADO
// =====================================================

const ESTADO_STYLES = {
  pendiente: {
    bg: "#E2E8F0",
    fg: "#475569",
    dot: "#64748B",
  },
  "en traslado": {
    bg: "#FEF3C7",
    fg: "#92400E",
    dot: "#F59E0B",
  },
  "en ejecución": {
    bg: "#DBEAFE",
    fg: "#1E40AF",
    dot: "#3B82F6",
  },
  finalizado: {
    bg: "#D1FAE5",
    fg: "#065F46",
    dot: "#10B981",
  },
  terminada: {
    bg: "#FEE2E2",
    fg: "#991B1B",
    dot: "#EF4444",
  },
  cancelada: {
    bg: "#E2E8F0",
    fg: "#1E293B",
    dot: "#1E293B",
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
  // CARGAR DATOS INICIALES
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
  // CARGAR CLIENTES
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
      console.error(
        "Error al cargar clientes:",
        error
      );
    }
  };

  // =====================================================
  // CARGAR EMPLEADOS
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
      console.error(
        "Error al cargar empleados:",
        error
      );
    }
  };

  // =====================================================
  // CARGAR TAREAS
  // =====================================================

  const cargarTareas = async () => {
    try {
      setErrorCarga(null);

      const token = localStorage.getItem("token");

      // Verificar token
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
            // IMPORTANTE:
            // Debe ser Bearer con B MAYÚSCULA
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
      console.error(
        "Error al cargar tareas:",
        error
      );

      // =====================================================
      // ERROR 401 / 403
      // =====================================================

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        setErrorCarga(
          "Sesión expirada o sin permisos. Inicia sesión nuevamente."
        );
      }

      // =====================================================
      // ERROR DEL SERVIDOR
      // =====================================================

      else if (error.response) {
        setErrorCarga(
          error.response.data?.mensaje ||
            "Error del servidor al cargar tareas."
        );
      }

      // =====================================================
      // ERROR DE CONEXIÓN
      // =====================================================

      else if (error.request) {
        setErrorCarga(
          "No se pudo conectar con el servidor. Verifica tu conexión o la URL de la API."
        );
      }

      // =====================================================
      // ERROR DESCONOCIDO
      // =====================================================

      else {
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
      console.error(
        "Error al guardar tarea:",
        error
      );

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
  // ELIMINAR TAREA
  // =====================================================

  const eliminarTarea = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert(
        "No hay una sesión activa. Inicia sesión nuevamente."
      );

      return;
    }

    // =====================================================
    // SIN SWEETALERT
    // =====================================================

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

    // =====================================================
    // SWEETALERT
    // =====================================================

    const result = await window.Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la tarea permanentemente",
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
      <>
        <style>{globalStyles}</style>

        <div style={styles.page}>
          <Loading mensaje="Cargando tareas..." />
        </div>
      </>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <style>{globalStyles}</style>

      <div style={styles.page}>
        <div style={styles.wrap}>

          {/* =====================================================
              HEADER
          ===================================================== */}

          <div style={styles.headerRow}>
            <div>
              <div style={styles.eyebrow}>
                GESTIÓN DE ÓRDENES
              </div>

              <h1 style={styles.h1}>
                Listado de tareas
              </h1>
            </div>

            <button
              className="vt-btn-primary"
              style={styles.btnPrimary}
              onClick={() => setModalOpen(true)}
            >
              <Plus
                size={16}
                strokeWidth={2.5}
              />

              Nueva tarea
            </button>
          </div>

          {/* =====================================================
              ERROR
          ===================================================== */}

          {errorCarga && (
            <div style={styles.errorBanner}>
              <span>{errorCarga}</span>

              <button
                type="button"
                style={styles.errorRetryBtn}
                onClick={cargarTareas}
              >
                Reintentar
              </button>
            </div>
          )}

          {/* =====================================================
              SIN TAREAS
          ===================================================== */}

          {tareas.length === 0 ? (
            <div style={styles.emptyCard}>
              <div style={styles.emptyIcon}>
                <ClipboardList
                  size={26}
                  color="#64748B"
                />
              </div>

              <h4 style={styles.centerTitle}>
                {errorCarga
                  ? "No se pudieron cargar las tareas"
                  : "No hay tareas registradas"}
              </h4>

              <p style={styles.centerText}>
                {errorCarga
                  ? "Revisa el mensaje de error arriba e inténtalo de nuevo."
                  : "Crea la primera orden de trabajo para verla aquí."}
              </p>

              <button
                className="vt-btn-primary"
                style={styles.btnPrimary}
                onClick={() => setModalOpen(true)}
              >
                <Plus
                  size={16}
                  strokeWidth={2.5}
                />

                Nueva tarea
              </button>
            </div>
          ) : (
            // =====================================================
            // TABLA
            // =====================================================

            <div style={styles.tableCard}>
              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>
                        OT
                      </th>

                      <th style={styles.th}>
                        Cliente
                      </th>

                      <th style={styles.th}>
                        Técnico resp.
                      </th>

                      <th style={styles.th}>
                        Asignación
                      </th>

                      <th style={styles.th}>
                        Término
                      </th>

                      <th style={styles.th}>
                        Estado
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
                    {tareas.map((tarea) => {
                      const estadoStyle =
                        getEstadoStyle(
                          tarea.estado
                        );

                      return (
                        <tr
                          key={tarea.id_trabajo}
                          className="vt-row"
                        >
                          <td
                            style={{
                              ...styles.td,
                              fontWeight: 600,
                            }}
                          >
                            {tarea.numero_ot}
                          </td>

                          <td style={styles.td}>
                            {tarea.cliente}
                          </td>

                          <td style={styles.td}>
                            {tarea.empleado}
                          </td>

                          <td style={styles.tdMuted}>
                            {tarea.fecha_asignacion
                              ? new Date(
                                  tarea.fecha_asignacion
                                ).toLocaleDateString(
                                  "es-CL"
                                )
                              : "—"}
                          </td>

                          <td style={styles.tdMuted}>
                            {tarea.fecha_termino
                              ? new Date(
                                  tarea.fecha_termino
                                ).toLocaleDateString(
                                  "es-CL"
                                )
                              : "—"}
                          </td>

                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.badge,
                                background:
                                  estadoStyle.bg,
                                color:
                                  estadoStyle.fg,
                              }}
                            >
                              <span
                                style={{
                                  ...styles.badgeDot,
                                  background:
                                    estadoStyle.dot,
                                }}
                              />

                              {tarea.estado}
                            </span>
                          </td>

                          <td
                            style={{
                              ...styles.td,
                              textAlign: "right",
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "inline-flex",
                                gap: 6,
                              }}
                            >
                              {/* VER */}

                              <button
                                type="button"
                                className="vt-icon-btn"
                                style={
                                  styles.iconBtn
                                }
                                title="Ver"
                                onClick={() =>
                                  navigate(
                                    `/tareas/ver_tarea/${tarea.id_trabajo}`
                                  )
                                }
                              >
                                <Eye
                                  width={15}
                                  height={15}
                                  style={
                                    styles.iconSvg
                                  }
                                />
                              </button>

                              {/* EDITAR */}

                              <button
                                type="button"
                                className="vt-icon-btn vt-icon-btn-accent"
                                style={
                                  styles.iconBtn
                                }
                                title="Editar"
                                onClick={() =>
                                  navigate(
                                    `/tareas/editar/${tarea.id_trabajo}`
                                  )
                                }
                              >
                                <PenLine
                                  width={15}
                                  height={15}
                                  style={
                                    styles.iconSvg
                                  }
                                />
                              </button>

                              {/* ELIMINAR */}

                              <button
                                type="button"
                                className="vt-icon-btn vt-icon-btn-danger"
                                style={
                                  styles.iconBtn
                                }
                                title="Eliminar"
                                onClick={() =>
                                  eliminarTarea(
                                    tarea.id_trabajo
                                  )
                                }
                              >
                                <Trash2
                                  width={15}
                                  height={15}
                                  style={
                                    styles.iconSvg
                                  }
                                />
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
            style={{
              display: "block",
            }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div
                className="modal-content"
                style={styles.modalContent}
              >
                {/* HEADER */}

                <div
                  className="modal-header"
                  style={styles.modalHeader}
                >
                  <div>
                    <div
                      style={
                        styles.eyebrowSmall
                      }
                    >
                      NUEVA ORDEN DE TRABAJO
                    </div>

                    <h5
                      className="modal-title"
                      style={styles.modalTitle}
                    >
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
                  <div
                    className="modal-body"
                    style={{
                      padding: "24px 28px",
                    }}
                  >
                    <div className="row">

                      {/* CLIENTE */}

                      <div className="col-md-6 mb-3">
                        <label
                          style={
                            styles.formLabel
                          }
                        >
                          Cliente *
                        </label>

                        <select
                          className="form-select"
                          name="cliente_id"
                          value={
                            formData.cliente_id
                          }
                          onChange={
                            handleChange
                          }
                          required
                        >
                          <option value="">
                            Seleccione un cliente
                          </option>

                          {clientes.map(
                            (cliente) => (
                              <option
                                value={
                                  cliente.id_cliente
                                }
                                key={
                                  cliente.id_cliente
                                }
                              >
                                {
                                  cliente.razon_social
                                }
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      {/* CONTACTO */}

                      <div className="col-md-6 mb-3">
                        <label
                          style={
                            styles.formLabel
                          }
                        >
                          Nombre de contacto
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          name="nombre_contacto"
                          value={
                            formData.nombre_contacto
                          }
                          onChange={
                            handleChange
                          }
                        />
                      </div>

                      {/* TELEFONO */}

                      <div className="col-md-6 mb-3">
                        <label
                          style={
                            styles.formLabel
                          }
                        >
                          Teléfono del contacto
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          name="telefono_contacto"
                          value={
                            formData.telefono_contacto
                          }
                          onChange={
                            handleChange
                          }
                        />
                      </div>

                      {/* RESPONSABLE */}

                      <div className="col-md-6 mb-3">
                        <label
                          style={
                            styles.formLabel
                          }
                        >
                          Responsable *
                        </label>

                        <select
                          className="form-select"
                          name="empleado_id"
                          value={
                            formData.empleado_id
                          }
                          onChange={
                            handleChange
                          }
                          required
                        >
                          <option value="">
                            Seleccione un responsable
                          </option>

                          {empleados.map(
                            (empleado) => (
                              <option
                                value={
                                  empleado.id
                                }
                                key={
                                  empleado.id
                                }
                              >
                                {empleado.nombres}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      {/* FECHA */}

                      <div className="col-md-6 mb-3">
                        <label
                          style={
                            styles.formLabel
                          }
                        >
                          Fecha término
                        </label>

                        <input
                          type="date"
                          className="form-control"
                          name="fecha_termino"
                          value={
                            formData.fecha_termino
                          }
                          onChange={
                            handleChange
                          }
                        />
                      </div>

                      {/* DIRECCION */}

                      <div className="col-md-12 mb-3">
                        <label
                          style={
                            styles.formLabel
                          }
                        >
                          Dirección de obras *
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          name="direccion_trabajo"
                          value={
                            formData.direccion_trabajo
                          }
                          onChange={
                            handleChange
                          }
                          required
                        />
                      </div>

                      {/* TITULO */}

                      <div className="col-md-12 mb-3">
                        <label
                          style={
                            styles.formLabel
                          }
                        >
                          Título *
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          name="titulo"
                          value={
                            formData.titulo
                          }
                          onChange={
                            handleChange
                          }
                          required
                        />
                      </div>

                      {/* DESCRIPCION */}

                      <div className="col-md-12 mb-3">
                        <label
                          style={
                            styles.formLabel
                          }
                        >
                          Descripción *
                        </label>

                        <textarea
                          className="form-control"
                          rows="4"
                          name="descripcion_trabajo"
                          value={
                            formData.descripcion_trabajo
                          }
                          onChange={
                            handleChange
                          }
                          required
                        />
                      </div>

                      {/* OBSERVACIONES */}

                      <div className="col-md-12 mb-3">
                        <label
                          style={
                            styles.formLabel
                          }
                        >
                          Observaciones
                        </label>

                        <textarea
                          className="form-control"
                          rows="3"
                          name="observaciones"
                          value={
                            formData.observaciones
                          }
                          onChange={
                            handleChange
                          }
                        />
                      </div>
                    </div>

                    {/* FORMULARIOS */}

                    <div
                      style={
                        styles.checkGroup
                      }
                    >
                      <label
                        style={
                          styles.formLabel
                        }
                      >
                        Habilitar formularios para
                        el técnico
                      </label>

                      <div
                        style={{
                          display: "flex",
                          gap: 20,
                          flexWrap: "wrap",
                        }}
                      >
                        {/* CHECKLIST */}

                        <label
                          style={
                            styles.checkItem
                          }
                        >
                          <input
                            type="checkbox"
                            checked={
                              formData
                                .formularios_habilitados
                                ?.checklist ||
                              false
                            }
                            onChange={(e) =>
                              setFormData(
                                (prev) => ({
                                  ...prev,
                                  formularios_habilitados:
                                    {
                                      ...prev.formularios_habilitados,
                                      checklist:
                                        e.target
                                          .checked,
                                    },
                                })
                              )
                            }
                          />

                          Checklist
                        </label>

                        {/* CHARLA */}

                        <label
                          style={
                            styles.checkItem
                          }
                        >
                          <input
                            type="checkbox"
                            checked={
                              formData
                                .formularios_habilitados
                                ?.charla_5min ||
                              false
                            }
                            onChange={(e) =>
                              setFormData(
                                (prev) => ({
                                  ...prev,
                                  formularios_habilitados:
                                    {
                                      ...prev.formularios_habilitados,
                                      charla_5min:
                                        e.target
                                          .checked,
                                    },
                                })
                              )
                            }
                          />

                          Charla 5 min
                        </label>

                        {/* RIESGOS */}

                        <label
                          style={
                            styles.checkItem
                          }
                        >
                          <input
                            type="checkbox"
                            checked={
                              formData
                                .formularios_habilitados
                                ?.lista_riesgos ||
                              false
                            }
                            onChange={(e) =>
                              setFormData(
                                (prev) => ({
                                  ...prev,
                                  formularios_habilitados:
                                    {
                                      ...prev.formularios_habilitados,
                                      lista_riesgos:
                                        e.target
                                          .checked,
                                    },
                                })
                              )
                            }
                          />

                          Lista de riesgos
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* FOOTER */}

                  <div
                    className="modal-footer"
                    style={
                      styles.modalFooter
                    }
                  >
                    <button
                      type="button"
                      className="vt-btn-ghost"
                      style={styles.btnGhost}
                      onClick={() =>
                        setModalOpen(false)
                      }
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="vt-btn-primary"
                      style={styles.btnPrimary}
                    >
                      Guardar tarea
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div
            className="modal-backdrop fade show"
            style={{
              backgroundColor:
                "rgba(15, 23, 42, 0.5)",
            }}
          />
        </>
      )}
    </>
  );
}

// =====================================================
// ESTILOS GLOBALES
// =====================================================

const globalStyles = `
  .vt-row:hover {
    background: #F8FAFC;
  }

  .vt-btn-primary:hover {
    background: #4338CA !important;
  }

  .vt-btn-ghost:hover {
    background: #F1F5F9 !important;
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

  .vt-icon-btn-danger:hover {
    background: #FEF2F2 !important;
    border-color: #EF4444 !important;
    color: #EF4444 !important;
  }

  .vt-modal .form-control,
  .vt-modal .form-select {
    border-radius: 8px;
    border-color: #E2E8F0;
  }

  .vt-modal .form-control:focus,
  .vt-modal .form-select:focus {
    border-color: #4F46E5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
  }
`;

// =====================================================
// ESTILOS
// =====================================================

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F8FAFC",
    padding: "0px 32px",
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

  eyebrowSmall: {
    fontFamily:
      "'JetBrains Mono', 'SFMono-Regular', Menlo, monospace",
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
    borderBottom:
      "1px solid #E2E8F0",
  },

  td: {
    padding: "14px 20px",
    color: "#1E293B",
    borderBottom:
      "1px solid #F1F5F9",
  },

  tdMuted: {
    padding: "14px 20px",
    color: "#64748B",
    borderBottom:
      "1px solid #F1F5F9",
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
    borderBottom:
      "1px solid #E2E8F0",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1E293B",
    margin: 0,
  },

  modalFooter: {
    padding: "16px 28px",
    borderTop:
      "1px solid #E2E8F0",
  },

  formLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "#334155",
    marginBottom: 6,
    display: "block",
  },

  checkGroup: {
    marginTop: 8,
    paddingTop: 16,
    borderTop:
      "1px solid #F1F5F9",
  },

  checkItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    color: "#334155",
    fontWeight: 500,
  },

  errorBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    background: "#FEE2E2",
    color: "#991B1B",
    padding: "12px 16px",
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 14,
    fontWeight: 500,
  },

  errorRetryBtn: {
    background: "#991B1B",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "6px 12px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
};

export default ListarTarea;