import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";
import { generarPDFCharla } from "../utils/Pdf_charla";

import "./charla_5min.css";

function VerCharla5Min() {
  const { id_tarea } = useParams();
  const navigate = useNavigate();

  const [charla, setCharla] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // =====================================================
  // CARGAR CHARLA
  // =====================================================

  useEffect(() => {
    cargarCharla();
  }, [id_tarea]);

  const cargarCharla = async () => {
    try {
      setCargando(true);
      setError(null);

      const token = localStorage.getItem("token");

      const respuesta = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/charlas/tarea/${id_tarea}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCharla(respuesta.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.mensaje ||
          "No se pudo cargar la charla de 5 min"
      );
    } finally {
      setCargando(false);
    }
  };

  // =====================================================
  // CARGANDO
  // =====================================================

  if (cargando) {
    return (
      <div className="vc-page">
        <Loading mensaje="Cargando charla..." />
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="vc-page">
        <div className="vc-center-state">
          <div className="vc-center-icon vc-error-icon">
            <span>⚠️</span>
          </div>

          <h4 className="vc-center-title">
            No se pudo cargar la charla
          </h4>

          <p className="vc-center-text">
            {error}
          </p>

          <div className="vc-center-actions">
            <button
              className="vc-btn-primary"
              onClick={cargarCharla}
            >
              Reintentar
            </button>

            <button
              className="vc-btn-ghost"
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
  // SIN DATOS
  // =====================================================

  if (!charla) {
    return (
      <div className="vc-page">
        <div className="vc-center-state">
          <div className="vc-center-icon vc-empty-icon">
            <span>📋</span>
          </div>

          <h4 className="vc-center-title">
            Charla no encontrada
          </h4>

          <p className="vc-center-text">
            No se encontraron datos para esta charla.
          </p>

          <button
            className="vc-btn-ghost"
            onClick={() => navigate(-1)}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // TODO OK
  // =====================================================

  return (
    <div className="vc-page">
      <div className="vc-wrap">

        {/* VOLVER */}

        <button
          className="vc-back"
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>

        {/* =================================================
            COLUMNAS
        ================================================= */}

        <div className="vc-columns">

          {/* =================================================
              COLUMNA PRINCIPAL
          ================================================= */}

          <div className="vc-main-col">

            {/* =================================================
                INFORMACIÓN DE LA CHARLA
            ================================================= */}

            <div className="vc-ticket">

              <div className="vc-eyebrow">
                CHARLA DE 5 MINUTOS
              </div>

              <h1 className="vc-title">
                {charla.tema || "Sin tema registrado"}
              </h1>

              {/* INFORMACIÓN */}

              <div className="vc-grid">

                <div className="vc-field">
                  <span className="vc-label">
                    Fecha
                  </span>

                  <span className="vc-value">
                    {charla.fecha_charla || "—"}
                  </span>
                </div>

                <div className="vc-field">
                  <span className="vc-label">
                    Ubicación (lat, long)
                  </span>

                  <span className="vc-value">
                    {charla.latitud &&
                    charla.longitud
                      ? `${charla.latitud}, ${charla.longitud}`
                      : "—"}
                  </span>
                </div>

              </div>

              <div className="vc-divider" />

              {/* TRABAJO */}

              <div className="vc-field">
                <span className="vc-label">
                  Trabajo a realizar
                </span>

                <p className="vc-paragraph">
                  {charla.trabajo_realizar ||
                    "Sin información."}
                </p>
              </div>

              {/* TEMAS */}

              <div className="vc-field">
                <span className="vc-label">
                  Temas tratados
                </span>

                <p className="vc-paragraph">
                  {charla.temas_tratados ||
                    "Sin información."}
                </p>
              </div>

              {/* RIESGOS */}

              <div className="vc-field">
                <span className="vc-label">
                  Riesgos detectados
                </span>

                <p className="vc-paragraph">
                  {charla.riesgos_detectados ||
                    "Sin información."}
                </p>
              </div>

              {/* MEDIDAS */}

              <div className="vc-field">
                <span className="vc-label">
                  Medidas preventivas
                </span>

                <p className="vc-paragraph">
                  {charla.medidas_preventivas ||
                    "Sin información."}
                </p>
              </div>

              {/* OBSERVACIONES */}

              <div className="vc-field">
                <span className="vc-label">
                  Observaciones
                </span>

                <p className="vc-paragraph">
                  {charla.observaciones ||
                    "Sin observaciones."}
                </p>
              </div>

            </div>

            {/* =================================================
                ASISTENTES
            ================================================= */}

            <div className="vc-forms-card">

              <h3 className="vc-forms-title">
                Asistentes
              </h3>

              {!charla.asistentes ||
              charla.asistentes.length === 0 ? (
                <p className="vc-center-text">
                  No hay asistentes registrados
                  para esta charla.
                </p>
              ) : (
                <ul className="vc-list">
                  {charla.asistentes.map(
                    (asistente) => (
                      <li
                        key={asistente.id_empleado}
                        className="vc-list-item"
                      >
                        <strong>
                          {asistente.nombres}{" "}
                          {asistente.apellido_paterno}{" "}
                          {asistente.apellido_materno}
                        </strong>

                        <span>
                          RUT: {asistente.rut}
                        </span>

                        <span>
                          Cargo: {asistente.cargo}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              )}

            </div>
          </div>

          {/* =================================================
              COLUMNA DERECHA
          ================================================= */}

          <div className="vc-side">

            <div className="vc-action-card">

              <div className="vc-action-icon">
                📄
              </div>

              <h3 className="vc-action-title">
                Reporte en PDF
              </h3>

              <p className="vc-action-text">
                Genera un documento con todos los
                datos de esta charla y el registro
                de asistentes.
              </p>

              <button
                className="vc-btn-download"
                onClick={() =>
                  generarPDFCharla(charla)
                }
              >
                ⬇ Descargar PDF
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default VerCharla5Min;