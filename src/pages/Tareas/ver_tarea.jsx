import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";
import "./VerTarea.css";

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
};

function getEstadoStyle(estado) {
  const key = (estado || "").toLowerCase().trim();

  return (
    ESTADO_STYLES[key] || {
      bg: "#eef0f8",
      fg: "#241ba6",
      dot: "#4d68d8",
    }
  );
}

function VerTarea() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tarea, setTarea] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarTarea();
  }, [id]);

  const cargarTarea = async () => {
    try {
      setCargando(true);
      setError(null);

      const token = localStorage.getItem("token");

      const respuesta = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/tareas/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dataRecibida = respuesta.data;

      const tareaObj =
        dataRecibida?.tarea ||
        dataRecibida?.data ||
        dataRecibida;

      console.log("Datos de tarea cargados:", tareaObj);

      setTarea(tareaObj);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.mensaje ||
          "No se pudo cargar la tarea"
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
        <Loading mensaje="Cargando datos..." />
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

          <div className="vt-center-icon vt-error-icon">
            <span>⚠️</span>
          </div>

          <h4 className="vt-center-title">
            No se pudo cargar la tarea
          </h4>

          <p className="vt-center-text">
            {error}
          </p>

          <div className="vt-actions">
            <button
              className="vt-btn-primary"
              onClick={cargarTarea}
            >
              Reintentar
            </button>

            <button
              className="vt-btn-ghost"
              onClick={() => navigate(-1)}
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

          <div className="vt-center-icon vt-empty-icon">
            <span>📋</span>
          </div>

          <h4 className="vt-center-title">
            Tarea no encontrada
          </h4>

          <p className="vt-center-text">
            No se encontraron datos para esta tarea.
          </p>

          <button
            className="vt-btn-ghost"
            onClick={() => navigate(-1)}
          >
            Volver
          </button>

        </div>
      </div>
    );
  }

  // =====================================================
  // DATOS
  // =====================================================

  const estadoStyle = getEstadoStyle(
    tarea.estado
  );

  const formularios =
    tarea.formularios_habilitados
      ? Object.entries(
          tarea.formularios_habilitados
        ).filter(([, on]) => on)
      : [];

  const estaCompletado = (nombre) => {
    return Boolean(
      tarea.formularios_estado?.[nombre]
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="vt-page">

      <div className="vt-wrap">

        {/* VOLVER */}

        <button
          className="vt-back"
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>

        {/* =====================================================
            ORDEN DE TRABAJO
        ===================================================== */}

        <div className="vt-ticket">

          <div className="vt-ticket-header">

            <div>

              <div className="vt-eyebrow">
                ORDEN DE TRABAJO N°{" "}
                {tarea.numero_ot ||
                  tarea.id_trabajo ||
                  "S/N"}
              </div>

              <h1 className="vt-title">
                {tarea.titulo || "Sin título"}
              </h1>

            </div>

            {/* ESTADO */}

            <span
              className="vt-status"
              style={{
                background: estadoStyle.bg,
                color: estadoStyle.fg,
              }}
            >
              <span
                className="vt-status-dot"
                style={{
                  background: estadoStyle.dot,
                }}
              />

              {tarea.estado || "Pendiente"}
            </span>

          </div>

          {/* PERFORACIÓN */}

          <div className="vt-perforation">
            {Array.from({ length: 40 }).map(
              (_, i) => (
                <span
                  key={i}
                  className="vt-perf-dot"
                />
              )
            )}
          </div>

          {/* INFORMACIÓN */}

          <div className="vt-info-grid">

            <div className="vt-field">
              <span className="vt-label">
                Cliente
              </span>

              <span className="vt-value">
                {tarea.cliente ||
                  tarea.razon_social ||
                  "—"}
              </span>
            </div>

            <div className="vt-field">
              <span className="vt-label">
                Empleado asignado
              </span>

              <span className="vt-value">
                {tarea.empleado ||
                  tarea.empleado_nombres ||
                  "—"}
              </span>
            </div>

            <div className="vt-field">
              <span className="vt-label">
                Contacto
              </span>

              <span className="vt-value">
                {tarea.nombre_contacto || "—"}

                {tarea.telefono_contacto
                  ? ` · ${tarea.telefono_contacto}`
                  : ""}
              </span>
            </div>

            <div className="vt-field">
              <span className="vt-label">
                Dirección
              </span>

              <span className="vt-value">
                {tarea.direccion_trabajo || "—"}
              </span>
            </div>

            <div className="vt-field">
              <span className="vt-label">
                Fecha asignación
              </span>

              <span className="vt-value">
                {tarea.fecha_asignacion
                  ? new Date(
                      tarea.fecha_asignacion
                    ).toLocaleDateString(
                      "es-CL"
                    )
                  : "—"}
              </span>
            </div>

            <div className="vt-field">
              <span className="vt-label">
                Fecha término
              </span>

              <span className="vt-value">
                {tarea.fecha_termino
                  ? new Date(
                      tarea.fecha_termino
                    ).toLocaleDateString(
                      "es-CL"
                    )
                  : "—"}
              </span>
            </div>

          </div>

          {/* DIVISOR */}

          <div className="vt-divider" />

          {/* DESCRIPCIÓN */}

          <div className="vt-field vt-description">

            <span className="vt-label">
              Descripción del trabajo
            </span>

            <p className="vt-paragraph">
              {tarea.descripcion_trabajo ||
                "Sin descripción."}
            </p>

          </div>

          {/* OBSERVACIONES */}

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

              {formularios.map(([nombre]) => {

                const completado =
                  estaCompletado(nombre);

                return (
                  <button
                    key={nombre}
                    className={`vt-form-btn ${
                      completado
                        ? "vt-form-completed"
                        : "vt-form-disabled"
                    }`}
                    disabled={!completado}
                    onClick={() => {

                      if (!completado) return;

                      navigate(
                        `/formularios/${nombre}/${tarea.id_trabajo}`
                      );

                    }}
                  >

                    <span>
                      {nombre}
                    </span>

                    {completado ? (
                      <span className="vt-form-arrow">
                        →
                      </span>
                    ) : (
                      <span className="vt-pending-badge">
                        Pendiente
                      </span>
                    )}

                  </button>
                );

              })}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default VerTarea;