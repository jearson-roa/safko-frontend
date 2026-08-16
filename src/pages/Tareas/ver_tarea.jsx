import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

import Loading from "../../components/Loading";
import "./VerTarea.css";

// =====================================================
// ESTILOS DE ESTADO
// =====================================================

const ESTADO_STYLES = {
  pendiente: {
    bg: "#fff4d6",
    fg: "#241ba6",
    dot: "#fc5b20",
  },

  "en proceso": {
    bg: "#e8ebff",
    fg: "#241ba6",
    dot: "#4d68d8",
  },

  "en curso": {
    bg: "#e8ebff",
    fg: "#241ba6",
    dot: "#4d68d8",
  },

  "en traslado": {
    bg: "#fff0e8",
    fg: "#fc5b20",
    dot: "#fc5b20",
  },

  "en ejecución": {
    bg: "#e8ebff",
    fg: "#241ba6",
    dot: "#4d68d8",
  },

  "en ejecucion": {
    bg: "#e8ebff",
    fg: "#241ba6",
    dot: "#4d68d8",
  },

  finalizado: {
    bg: "#e9fbdc",
    fg: "#397000",
    dot: "#91f023",
  },

  completado: {
    bg: "#e9fbdc",
    fg: "#397000",
    dot: "#91f023",
  },

  terminado: {
    bg: "#e9fbdc",
    fg: "#397000",
    dot: "#91f023",
  },

  cancelado: {
    bg: "#ffe8e1",
    fg: "#fc5b20",
    dot: "#fc5b20",
  },

  cancelada: {
    bg: "#ffe8e1",
    fg: "#fc5b20",
    dot: "#fc5b20",
  },
};

// =====================================================
// OBTENER ESTILO ESTADO
// =====================================================

function getEstadoStyle(estado) {
  const key = String(estado || "")
    .toLowerCase()
    .trim();

  return (
    ESTADO_STYLES[key] || {
      bg: "#eef0f8",
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

  // Si el backend entrega directamente un string
  if (typeof empleado === "string") {
    return empleado;
  }

  const nombres =
    empleado.nombres || "";

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
// FORMATEAR FECHA
// =====================================================

function formatearFecha(fecha) {
  if (!fecha) {
    return "—";
  }

  const fechaObj =
    new Date(fecha);

  if (
    Number.isNaN(
      fechaObj.getTime()
    )
  ) {
    return "—";
  }

  return fechaObj.toLocaleDateString(
    "es-CL",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}

// =====================================================
// FORMATEAR FECHA Y HORA
// =====================================================

function formatearFechaHora(fecha) {
  if (!fecha) {
    return "—";
  }

  const fechaObj =
    new Date(fecha);

  if (
    Number.isNaN(
      fechaObj.getTime()
    )
  ) {
    return "—";
  }

  return fechaObj.toLocaleString(
    "es-CL",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

// =====================================================
// COMPONENTE
// =====================================================

function VerTarea() {
  const { id } = useParams();

  const navigate =
    useNavigate();

  const [tarea, setTarea] =
    useState(null);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState(null);

  // =====================================================
  // CARGAR TAREA
  // =====================================================

  useEffect(() => {
    cargarTarea();
  }, [id]);

  // =====================================================
  // FUNCIÓN CARGAR TAREA
  // =====================================================

  const cargarTarea = async () => {
    try {
      setCargando(true);
      setError(null);
      setTarea(null);

      // =================================================
      // TOKEN
      // =================================================

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError(
          "Tu sesión ha expirado. Inicia sesión nuevamente."
        );

        return;
      }

      // =================================================
      // API
      // =================================================

      const API_URL =
        import.meta.env.VITE_API_URL;

      if (!API_URL) {
        setError(
          "No se pudo conectar con el servidor."
        );

        return;
      }

      // =================================================
      // PETICIÓN
      // =================================================

      const respuesta =
        await axios.get(
          `${API_URL}/api/tareas/${encodeURIComponent(id)}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      // =================================================
      // OBTENER DATOS
      // =================================================

      const dataRecibida =
        respuesta.data;

      const tareaObj =
        dataRecibida?.tarea ||
        dataRecibida?.data ||
        dataRecibida;

      // =================================================
      // VALIDAR RESPUESTA
      // =================================================

      if (
        !tareaObj ||
        typeof tareaObj !== "object"
      ) {
        setError(
          "No se encontraron datos para esta tarea."
        );

        return;
      }

      setTarea(tareaObj);

    } catch (err) {
      // =================================================
      // NO MOSTRAR EL ERROR TÉCNICO
      // =================================================
      //
      // NO usamos:
      //
      // console.error(err)
      //
      // porque podría mostrar información
      // innecesaria en producción.
      //
      // =================================================

      const status =
        err.response?.status;

      if (status === 401) {
        setError(
          "Tu sesión ha expirado. Inicia sesión nuevamente."
        );

        return;
      }

      if (status === 403) {
        setError(
          "No tienes permisos para consultar esta tarea."
        );

        return;
      }

      if (status === 404) {
        setError(
          "La tarea no existe o ya no está disponible."
        );

        return;
      }

      if (status >= 500) {
        setError(
          "Ocurrió un error interno del servidor. Inténtalo nuevamente."
        );

        return;
      }

      if (err.request) {
        setError(
          "No se pudo conectar con el servidor. Verifica tu conexión."
        );

        return;
      }

      setError(
        "No se pudo cargar la tarea."
      );

    } finally {
      setCargando(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (cargando) {
    return (
      <div className="vt-page">

        <Loading
          mensaje="Cargando datos..."
        />

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="vt-page">

        <div className="vt-center-state">

          <div
            className="
              vt-center-icon
              vt-error-icon
            "
          >
            <span>⚠️</span>
          </div>

          <h4
            className="vt-center-title"
          >
            No se pudo cargar la tarea
          </h4>

          <p
            className="vt-center-text"
          >
            {error}
          </p>

          <div className="vt-actions">

            <button
              type="button"
              className="vt-btn-primary"
              onClick={cargarTarea}
            >
              Reintentar
            </button>

            <button
              type="button"
              className="vt-btn-ghost"
              onClick={() =>
                navigate(-1)
              }
            >
              Volver
            </button>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // SIN TAREA
  // =====================================================

  if (!tarea) {
    return (
      <div className="vt-page">

        <div className="vt-center-state">

          <div
            className="
              vt-center-icon
              vt-empty-icon
            "
          >
            <span>📋</span>
          </div>

          <h4
            className="vt-center-title"
          >
            Tarea no encontrada
          </h4>

          <p
            className="vt-center-text"
          >
            No se encontraron datos para esta tarea.
          </p>

          <button
            type="button"
            className="vt-btn-ghost"
            onClick={() =>
              navigate(-1)
            }
          >
            Volver
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // DATOS DE TAREA
  // =====================================================

  const estadoStyle =
    getEstadoStyle(
      tarea.estado
    );

  // =====================================================
  // FORMULARIOS HABILITADOS
  // =====================================================

  const formularios =
    tarea.formularios_habilitados
      ? Object.entries(
          tarea.formularios_habilitados
        ).filter(
          ([, habilitado]) =>
            habilitado
        )
      : [];

  // =====================================================
  // ESTADO FORMULARIO
  // =====================================================

  const estaCompletado = (
    nombre
  ) => {
    return Boolean(
      tarea.formularios_estado?.[
        nombre
      ]
    );
  };

  // =====================================================
  // CLIENTE
  // =====================================================

  const cliente =
    tarea.cliente ||
    tarea.cliente_nombre ||
    tarea.razon_social ||
    null;

  // =====================================================
  // EMPLEADO
  // =====================================================

  const empleado =
    tarea.empleado ||
    tarea.empleado_nombre ||
    tarea.empleado_nombres ||
    null;

  // =====================================================
  // SUPERVISOR
  // =====================================================

  const supervisor =
    tarea.supervisor ||
    tarea.supervisor_nombre ||
    null;

  // =====================================================
  // TÉCNICO
  // =====================================================

  const tecnico =
    tarea.tecnico ||
    tarea.tecnico_nombre ||
    null;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="vt-page">

      <div className="vt-wrap">

        {/* =================================================
            VOLVER
        ================================================= */}

        <button
          type="button"
          className="vt-back"
          onClick={() =>
            navigate(-1)
          }
        >
          ← Volver
        </button>

        {/* =================================================
            ORDEN DE TRABAJO
        ================================================= */}

        <div className="vt-ticket">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="vt-ticket-header">

            <div>

              <div className="vt-eyebrow">

                ORDEN DE TRABAJO N°{" "}

                {tarea.numero_ot ||
                  tarea.id_trabajo ||
                  "S/N"}

              </div>

              <h1 className="vt-title">
                {tarea.titulo ||
                  "Sin título"}
              </h1>

            </div>

            {/* ESTADO */}

            <span
              className="vt-status"
              style={{
                background:
                  estadoStyle.bg,
                color:
                  estadoStyle.fg,
              }}
            >

              <span
                className="vt-status-dot"
                style={{
                  background:
                    estadoStyle.dot,
                }}
              />

              {tarea.estado ||
                "Pendiente"}

            </span>

          </div>

          {/* =================================================
              PERFORACIÓN
          ================================================= */}

          <div className="vt-perforation">

            {Array.from({
              length: 40,
            }).map((_, i) => (
              <span
                key={i}
                className="vt-perf-dot"
              />
            ))}

          </div>

          {/* =================================================
              INFORMACIÓN
          ================================================= */}

          <div className="vt-info-grid">

            {/* CLIENTE */}

            <div className="vt-field">

              <span className="vt-label">
                Cliente
              </span>

              <span className="vt-value">

                {getNombreCliente(
                  cliente
                )}

              </span>

            </div>

            {/* EMPLEADO */}

            <div className="vt-field">

              <span className="vt-label">
                Empleado asignado
              </span>

              <span className="vt-value">

                {getNombreEmpleado(
                  empleado
                )}

              </span>

            </div>

            {/* SUPERVISOR */}

            <div className="vt-field">

              <span className="vt-label">
                Supervisor
              </span>

              <span className="vt-value">

                {getNombreEmpleado(
                  supervisor
                )}

              </span>

            </div>

            {/* TÉCNICO */}

            <div className="vt-field">

              <span className="vt-label">
                Técnico responsable
              </span>

              <span className="vt-value">

                {getNombreEmpleado(
                  tecnico
                )}

              </span>

            </div>

            {/* CONTACTO */}

            <div className="vt-field">

              <span className="vt-label">
                Contacto
              </span>

              <span className="vt-value">

                {tarea.nombre_contacto ||
                  "—"}

                {tarea.telefono_contacto
                  ? ` · ${tarea.telefono_contacto}`
                  : ""}

              </span>

            </div>

            {/* DIRECCIÓN */}

            <div className="vt-field">

              <span className="vt-label">
                Dirección
              </span>

              <span className="vt-value">

                {tarea.direccion_trabajo ||
                  "—"}

              </span>

            </div>

            {/* FECHA ASIGNACIÓN */}

            <div className="vt-field">

              <span className="vt-label">
                Fecha asignación
              </span>

              <span
                className="vt-value"
                title={formatearFechaHora(
                  tarea.fecha_asignacion
                )}
              >

                {formatearFecha(
                  tarea.fecha_asignacion
                )}

              </span>

            </div>

            {/* FECHA TÉRMINO */}

            <div className="vt-field">

              <span className="vt-label">
                Fecha término
              </span>

              <span
                className="vt-value"
                title={formatearFechaHora(
                  tarea.fecha_termino
                )}
              >

                {formatearFecha(
                  tarea.fecha_termino
                )}

              </span>

            </div>

          </div>

          {/* =================================================
              DIVISOR
          ================================================= */}

          <div className="vt-divider" />

          {/* =================================================
              DESCRIPCIÓN
          ================================================= */}

          <div
            className="
              vt-field
              vt-description
            "
          >

            <span className="vt-label">
              Descripción del trabajo
            </span>

            <p className="vt-paragraph">

              {tarea.descripcion_trabajo ||
                "Sin descripción."}

            </p>

          </div>

          {/* =================================================
              OBSERVACIONES
          ================================================= */}

          <div className="vt-field">

            <span className="vt-label">
              Observaciones
            </span>

            <p className="vt-paragraph">

              {tarea.observaciones ||
                "Sin observaciones."}

            </p>

          </div>

        </div>

        {/* =====================================================
            FORMULARIOS
        ===================================================== */}

        <div className="vt-forms-card">

          <h3 className="vt-forms-title">
            Formularios disponibles
          </h3>

          {formularios.length === 0 ? (

            <p className="vt-center-text">
              No hay formularios habilitados
              para esta tarea.
            </p>

          ) : (

            <div className="vt-forms-grid">

              {formularios.map(
                ([nombre]) => {

                  const completado =
                    estaCompletado(
                      nombre
                    );

                  return (
                    <button
                      key={nombre}
                      type="button"
                      className={`
                        vt-form-btn
                        ${
                          completado
                            ? "vt-form-completed"
                            : "vt-form-disabled"
                        }
                      `}
                      disabled={!completado}
                      onClick={() => {

                        if (
                          !completado
                        ) {
                          return;
                        }

                        navigate(
                          `/formularios/${encodeURIComponent(
                            nombre
                          )}/${encodeURIComponent(
                            tarea.id_trabajo
                          )}`
                        );

                      }}
                    >

                      <span>
                        {nombre}
                      </span>

                      {completado ? (

                        <span
                          className="
                            vt-form-arrow
                          "
                        >
                          →
                        </span>

                      ) : (

                        <span
                          className="
                            vt-pending-badge
                          "
                        >
                          Pendiente
                        </span>

                      )}

                    </button>
                  );
                }
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default VerTarea;