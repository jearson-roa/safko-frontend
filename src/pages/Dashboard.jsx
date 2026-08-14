import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [datos, setDatos] = useState({
    tareasPendientes: 0,
    tareasEjecucion: 0,
    tareasRealizadas: 0
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
    <div style={styles.container}>

      <h1 style={styles.title}>
        Safko Dashboard
      </h1>

      <p style={styles.subtitle}>
        Bienvenido al sistema de gestión
      </p>

      <div style={styles.cardContainer}>

        {/* TAREAS PENDIENTES */}
        <div style={styles.card}>
          <h2>Tareas pendientes</h2>

          <p style={styles.number}>
            {cargando ? "..." : datos.tareasPendientes}
          </p>

          <p>Trabajos pendientes de realizar</p>
        </div>

        {/* TAREAS EN EJECUCIÓN */}
        <div style={styles.card}>
          <h2>Tareas en ejecución</h2>

          <p style={styles.number}>
            {cargando ? "..." : datos.tareasEjecucion}
          </p>

          <p>Trabajos actualmente en ejecución</p>
        </div>

        {/* TAREAS REALIZADAS */}
        <div style={styles.card}>
          <h2>Tareas realizadas</h2>

          <p style={styles.number}>
            {cargando ? "..." : datos.tareasRealizadas}
          </p>

          <p>Trabajos completados</p>
        </div>

        {/* CLIENTES */}
        <div style={styles.card}>
          <h2>Clientes</h2>
          <p>Administración de clientes</p>
        </div>

        {/* REPORTES */}
        <div style={styles.card}>
          <h2>Reportes</h2>
          <p>Estadísticas y análisis</p>
        </div>

      </div>

    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f4f6f8",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
  },

  title: {
    fontSize: "32px",
    marginBottom: "10px",
    color: "#1f2937",
  },

  subtitle: {
    fontSize: "16px",
    marginBottom: "30px",
    color: "#6b7280",
  },

  cardContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },

  card: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },

  number: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#4f46e5",
    margin: "10px 0",
  },
};

export default Dashboard;