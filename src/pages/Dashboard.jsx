import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const [datos, setDatos] = useState({
    tareasPendientes: 0,
    tareasEjecucion: 0,
    tareasRealizadas: 0,
  });

  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dashboard`
        );

        setDatos(response.data);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDashboard();
  }, []);

  return (
    <main className="safko-dashboard">

      {/* HEADER */}
      <header className="safko-dashboard__header">
        <div>
          <span className="safko-dashboard__eyebrow">
            PANEL DE CONTROL
          </span>

          <h1 className="safko-dashboard__title">
            Dashboard
          </h1>

          <p className="safko-dashboard__subtitle">
            Bienvenido al sistema de gestión SAFKO
          </p>
        </div>

        <div className="safko-dashboard__status">
          <span className="safko-dashboard__status-dot"></span>
          SISTEMA EN LÍNEA
        </div>
      </header>

      {/* RESUMEN */}
      <section className="safko-dashboard__section">
        <div className="safko-dashboard__section-header">
          <div>
            <h2>Resumen de tareas</h2>
            <p>Estado actual de los trabajos registrados</p>
          </div>
        </div>

        <div className="safko-dashboard__stats">

          {/* PENDIENTES */}
          <article className="safko-dashboard__card safko-dashboard__card--pending">
            <div className="safko-dashboard__card-top">
              <div className="safko-dashboard__icon">
                !
              </div>

              <span className="safko-dashboard__card-label">
                PENDIENTES
              </span>
            </div>

            <div className="safko-dashboard__number">
              {cargando ? "..." : datos.tareasPendientes}
            </div>

            <p>
              Trabajos pendientes de realizar
            </p>
          </article>

          {/* EN EJECUCIÓN */}
          <article className="safko-dashboard__card safko-dashboard__card--execution">
            <div className="safko-dashboard__card-top">
              <div className="safko-dashboard__icon">
                ↻
              </div>

              <span className="safko-dashboard__card-label">
                EN EJECUCIÓN
              </span>
            </div>

            <div className="safko-dashboard__number">
              {cargando ? "..." : datos.tareasEjecucion}
            </div>

            <p>
              Trabajos actualmente en ejecución
            </p>
          </article>

          {/* REALIZADAS */}
          <article className="safko-dashboard__card safko-dashboard__card--completed">
            <div className="safko-dashboard__card-top">
              <div className="safko-dashboard__icon">
                ✓
              </div>

              <span className="safko-dashboard__card-label">
                REALIZADAS
              </span>
            </div>

            <div className="safko-dashboard__number">
              {cargando ? "..." : datos.tareasRealizadas}
            </div>

            <p>
              Trabajos completados
            </p>
          </article>

        </div>
      </section>

      {/* ACCESOS */}
      <section className="safko-dashboard__section">
        <div className="safko-dashboard__section-header">
          <div>
            <h2>Accesos rápidos</h2>
            <p>Administración y consulta del sistema</p>
          </div>
        </div>

        <div className="safko-dashboard__actions">

          <button className="safko-dashboard__action">
            <span className="safko-dashboard__action-icon">
              +
            </span>

            <span>
              <strong>Clientes</strong>
              <small>Administración de clientes</small>
            </span>

            <span className="safko-dashboard__arrow">
              →
            </span>
          </button>

          <button className="safko-dashboard__action">
            <span className="safko-dashboard__action-icon">
              ≡
            </span>

            <span>
              <strong>Reportes</strong>
              <small>Estadísticas y análisis</small>
            </span>

            <span className="safko-dashboard__arrow">
              →
            </span>
          </button>

        </div>
      </section>

    </main>
  );
}

export default Dashboard;