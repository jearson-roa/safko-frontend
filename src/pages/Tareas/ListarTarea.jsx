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

  const [modalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();

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
          MODAL CREAR TAREA
      ===================================================== */}

      <ModalTarea
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        clientes={clientes}
        empleados={empleados}
        onSuccess={cargarTareas}
      />
    </>
  );
}

export default ListarTarea;