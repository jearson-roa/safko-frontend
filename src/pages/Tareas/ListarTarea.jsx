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
  RefreshCw,
} from "lucide-react";

import ModalTarea from "./ModalTarea";

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

  "en ejecucion": {
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

// =====================================================
// ESTILO ESTADO
// =====================================================

function getEstadoStyle(estado) {
  const key = String(estado || "")
    .toLowerCase()
    .trim();

  return (
    ESTADO_STYLES[key] || {
      bg: "rgba(77, 104, 216, 0.12)",
      fg: "#241ba6",
      dot: "#4d68d8",
    }
  );
}

// =====================================================
// NOMBRE EMPLEADO
// =====================================================

function getNombreEmpleado(empleado) {
  if (!empleado) {
    return "—";
  }

  if (typeof empleado === "string") {
    return empleado;
  }

  const nombres = empleado.nombres || "";

  const apellidoPaterno =
    empleado.apellido_paterno || "";

  const apellidoMaterno =
    empleado.apellido_materno || "";

  const nombreCompleto = [
    nombres,
    apellidoPaterno,
    apellidoMaterno,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    nombreCompleto ||
    empleado.nombre ||
    empleado.nombre_completo ||
    "—"
  );
}

// =====================================================
// NOMBRE CLIENTE
// =====================================================

function getNombreCliente(cliente) {
  if (!cliente) {
    return "—";
  }

  if (typeof cliente === "string") {
    return cliente;
  }

  return (
    cliente.razon_social ||
    cliente.nombre ||
    cliente.nombre_cliente ||
    cliente.empresa ||
    "—"
  );
}

// =====================================================
// FECHA
// =====================================================

function formatearFecha(fecha) {
  if (!fecha) {
    return "—";
  }

  const fechaObj = new Date(fecha);

  if (Number.isNaN(fechaObj.getTime())) {
    return "—";
  }

  return fechaObj.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// =====================================================
// FECHA + HORA
// =====================================================

function formatearFechaHora(fecha) {
  if (!fecha) {
    return "—";
  }

  const fechaObj = new Date(fecha);

  if (Number.isNaN(fechaObj.getTime())) {
    return "—";
  }

  return fechaObj.toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// =====================================================
// COMPONENTE
// =====================================================

function ListarTarea() {
  // =====================================================
  // ESTADOS
  // =====================================================

  const [tareas, setTareas] = useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [clientes, setClientes] =
    useState([]);

  const [empleados, setEmpleados] =
    useState([]);

  const [errorCarga, setErrorCarga] =
    useState(null);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [recargando, setRecargando] =
    useState(false);

  const navigate = useNavigate();

  // =====================================================
  // URL API
  // =====================================================

  const API_URL =
    import.meta.env.VITE_API_URL;

  // =====================================================
  // CARGAR DATOS INICIALES
  // =====================================================

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // =====================================================
  // CARGAR DATOS INICIALES
  // =====================================================

  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);
      setErrorCarga(null);

      await Promise.all([
        cargarTareas(),
        cargarClientes(),
        cargarEmpleados(),
      ]);
    } catch {
      setErrorCarga(
        "No se pudieron cargar todos los datos."
      );
    } finally {
      setCargando(false);
    }
  };

  // =====================================================
  // CARGAR CLIENTES
  // =====================================================

  const cargarClientes = async () => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      setClientes([]);
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/clientes`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const datos =
        Array.isArray(response.data)
          ? response.data
          : response.data?.clientes ||
            response.data?.data ||
            [];

      setClientes(
        Array.isArray(datos)
          ? datos
          : []
      );
    } catch {
      setClientes([]);
    }
  };

  // =====================================================
  // CARGAR EMPLEADOS
  // =====================================================

  const cargarEmpleados = async () => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      setEmpleados([]);
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/empleado`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const datos =
        Array.isArray(response.data)
          ? response.data
          : response.data?.empleados ||
            response.data?.data ||
            [];

      setEmpleados(
        Array.isArray(datos)
          ? datos
          : []
      );
    } catch {
      setEmpleados([]);
    }
  };

  // =====================================================
  // CARGAR TAREAS
  // =====================================================

  const cargarTareas = async () => {
    try {
      setErrorCarga(null);

      const token =
        localStorage.getItem("token");

      if (!token) {
        setErrorCarga(
          "No hay sesión activa. Vuelve a iniciar sesión."
        );

        setTareas([]);

        return;
      }

      const response = await axios.get(
        `${API_URL}/api/tareas`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      // =================================================
      // PROCESAR RESPUESTA
      // =================================================

      let datosTareas = [];

      if (Array.isArray(response.data)) {
        datosTareas =
          response.data;
      } else if (
        Array.isArray(
          response.data?.tareas
        )
      ) {
        datosTareas =
          response.data.tareas;
      } else if (
        Array.isArray(
          response.data?.data
        )
      ) {
        datosTareas =
          response.data.data;
      }

      setTareas(
        Array.isArray(datosTareas)
          ? datosTareas
          : []
      );
    } catch (error) {
      // =================================================
      // MANEJO DE ERRORES
      // =================================================

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
            error.response.data?.message ||
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
  // RECARGAR TODO
  // =====================================================

  const recargarDatos = async () => {
    try {
      setRecargando(true);

      await Promise.all([
        cargarTareas(),
        cargarClientes(),
        cargarEmpleados(),
      ]);
    } finally {
      setRecargando(false);
    }
  };

  // =====================================================
  // ELIMINAR TAREA
  // =====================================================

  const eliminarTarea = async (id) => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      if (window.Swal) {
        window.Swal.fire({
          title:
            "Sesión expirada",
          text:
            "No hay una sesión activa. Inicia sesión nuevamente.",
          icon:
            "warning",
        });
      } else {
        window.alert(
          "No hay una sesión activa. Inicia sesión nuevamente."
        );
      }

      return;
    }

    // =================================================
    // CONFIRMACIÓN SIN SWEETALERT
    // =================================================

    if (!window.Swal) {
      const confirmar =
        window.confirm(
          "¿Seguro que deseas eliminar esta tarea?"
        );

      if (!confirmar) {
        return;
      }

      try {
        setCargando(true);

        await axios.delete(
          `${API_URL}/api/tareas/${id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        window.alert(
          "Tarea eliminada con éxito."
        );

        await cargarTareas();
      } catch (error) {
        const mensaje =
          error.response?.data?.mensaje ||
          error.response?.data?.message ||
          "Error al eliminar la tarea.";

        window.alert(mensaje);
      } finally {
        setCargando(false);
      }

      return;
    }

    // =================================================
    // SWEETALERT
    // =================================================

    const result =
      await window.Swal.fire({
        title:
          "¿Estás seguro?",
        text:
          "Esta acción eliminará la tarea permanentemente.",
        icon:
          "warning",
        showCancelButton:
          true,
        confirmButtonColor:
          "#fc5b20",
        cancelButtonColor:
          "#4d68d8",
        confirmButtonText:
          "Sí, eliminar",
        cancelButtonText:
          "Cancelar",
      });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setCargando(true);

      await axios.delete(
        `${API_URL}/api/tareas/${id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      await window.Swal.fire({
        title:
          "¡Eliminado!",
        text:
          "La tarea ha sido eliminada correctamente.",
        icon:
          "success",
        timer:
          2000,
        showConfirmButton:
          false,
      });

      await cargarTareas();
    } catch (error) {
      const mensajeError =
        error.response?.data?.mensaje ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        "No se puede eliminar la tarea.";

      window.Swal.fire({
        title:
          "Error",
        text:
          mensajeError,
        icon:
          "error",
      });
    } finally {
      setCargando(false);
    }
  };

  // =====================================================
  // ABRIR NUEVA TAREA
  // =====================================================

  const abrirNuevaTarea = () => {
    setModalOpen(true);
  };

  // =====================================================
  // CERRAR MODAL
  // =====================================================

  const cerrarModal = () => {
    setModalOpen(false);
  };

  // =====================================================
  // ÉXITO CREAR TAREA
  // =====================================================

  const handleTareaCreada = async () => {
    await cargarTareas();
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (
    cargando &&
    tareas.length === 0
  ) {
    return (
      <div className="vt-page">
        <Loading
          mensaje="Cargando tareas..."
        />
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

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="vt-header">

            <div>

              <div className="vt-eyebrow">
                GESTIÓN DE ÓRDENES
              </div>

              <h1 className="vt-title">
                Listado de tareas
              </h1>

            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >

              {/* RECARGAR */}

              <button
                type="button"
                className="vt-icon-btn"
                title="Actualizar listado"
                onClick={
                  recargarDatos
                }
                disabled={
                  recargando
                }
              >

                <RefreshCw
                  size={16}
                  className={
                    recargando
                      ? "vt-spin"
                      : ""
                  }
                />

              </button>

              {/* NUEVA TAREA */}

              <button
                type="button"
                className="vt-btn-primary"
                onClick={
                  abrirNuevaTarea
                }
              >

                <Plus
                  size={16}
                  strokeWidth={2.5}
                />

                Nueva tarea

              </button>

            </div>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {errorCarga && (
            <div className="vt-error">

              <span>
                {errorCarga}
              </span>

              <button
                type="button"
                className="vt-error-retry"
                onClick={
                  cargarTareas
                }
              >
                Reintentar
              </button>

            </div>
          )}

          {/* =================================================
              SIN TAREAS
          ================================================= */}

          {tareas.length === 0 ? (

            <div className="vt-empty">

              <div className="vt-empty-icon">

                <ClipboardList
                  size={26}
                />

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

              {!errorCarga && (
                <button
                  type="button"
                  className="vt-btn-primary"
                  onClick={
                    abrirNuevaTarea
                  }
                >

                  <Plus
                    size={16}
                    strokeWidth={2.5}
                  />

                  Nueva tarea

                </button>
              )}

            </div>

          ) : (

            /* =================================================
               TABLA
            ================================================= */

            <div className="vt-table-card">

              <div className="vt-table-scroll">

                <table className="vt-table">

                  <thead>

                    <tr>

                      <th>
                        OT
                      </th>

                      <th>
                        Cliente
                      </th>


                      <th>
                        Técnico resp.
                      </th>

                      <th>
                        Asignación
                      </th>


                      <th>
                        Estado
                      </th>

                      <th className="vt-th-actions">
                        Acciones
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {tareas.map(
                      (tarea) => {

                        const estadoStyle =
                          getEstadoStyle(
                            tarea.estado
                          );

                        // =================================================
                        // SUPERVISOR
                        // =================================================

                        const supervisor =
                          tarea.supervisor ||
                          tarea.supervisor_nombre ||
                          tarea.supervisor_name ||
                          tarea.supervisor_id;

                        // =================================================
                        // TÉCNICO
                        // =================================================

                        const tecnico =
                          tarea.tecnico ||
                          tarea.tecnico_nombre ||
                          tarea.tecnico_name ||
                          tarea.tecnico_id;

                        // =================================================
                        // CLIENTE
                        // =================================================

                        const cliente =
                          tarea.cliente ||
                          tarea.cliente_nombre ||
                          tarea.razon_social ||
                          tarea.cliente_id;

                        return (
                          <tr
                            key={
                              tarea.id_trabajo
                            }
                            className="vt-row"
                          >

                            {/* OT */}

                            <td
                              className="
                                vt-td
                                vt-td-strong
                              "
                            >

                              {tarea.numero_ot ||
                                `#${tarea.id_trabajo}`}

                            </td>

                            {/* CLIENTE */}

                            <td className="vt-td">

                              {getNombreCliente(
                                cliente
                              )}

                            </td>

                            {/* TÉCNICO */}

                            <td className="vt-td">

                              {getNombreEmpleado(
                                tecnico
                              )}

                            </td>

                            {/* ASIGNACIÓN */}

                            <td
                              className="
                                vt-td
                                vt-td-muted
                              "
                              title={
                                formatearFechaHora(
                                  tarea.fecha_asignacion
                                )
                              }
                            >

                              {formatearFecha(
                                tarea.fecha_asignacion
                              )}

                            </td>


                            {/* ESTADO */}

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

                                {tarea.estado ||
                                  "Pendiente"}

                              </span>

                            </td>

                            {/* ACCIONES */}

                            <td
                              className="
                                vt-td
                                vt-actions-cell
                              "
                            >

                              <div className="vt-actions">

                                {/* VER */}

                                <button
                                  type="button"
                                  className="vt-icon-btn"
                                  title="Ver tarea"
                                  onClick={() =>
                                    navigate(
                                      `/tareas/ver_tarea/${tarea.id_trabajo}`
                                    )
                                  }
                                >

                                  <Eye
                                    size={15}
                                  />

                                </button>

                                {/* EDITAR */}

                                <button
                                  type="button"
                                  className="
                                    vt-icon-btn
                                    vt-icon-btn-accent
                                  "
                                  title="Editar tarea"
                                  onClick={() =>
                                    navigate(
                                      `/tareas/EditarTarea/${tarea.id_trabajo}`
                                    )
                                  }
                                >

                                  <PenLine
                                    size={15}
                                  />

                                </button>

                                {/* ELIMINAR */}

                                <button
                                  type="button"
                                  className="
                                    vt-icon-btn
                                    vt-icon-btn-danger
                                  "
                                  title="Eliminar tarea"
                                  onClick={() =>
                                    eliminarTarea(
                                      tarea.id_trabajo
                                    )
                                  }
                                >

                                  <Trash2
                                    size={15}
                                  />

                                </button>

                              </div>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* =====================================================
          MODAL CREAR TAREA
      ===================================================== */}

      <ModalTarea
        open={modalOpen}
        onClose={cerrarModal}
        clientes={clientes}
        empleados={empleados}
        onSuccess={
          handleTareaCreada
        }
      />
    </>
  );
}

export default ListarTarea;