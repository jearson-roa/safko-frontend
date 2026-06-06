import Sidebar from "../components/Sidebar";

function Dashboard() {
  return (
    <>
      <Sidebar />

      <div style={styles.container}>
        <h1 style={styles.title}>Safko Dashboard</h1>

        <p style={styles.subtitle}>
          Bienvenido al sistema de gestión
        </p>

        <div style={styles.cardContainer}>
          <div style={styles.card}>
            <h2>Usuarios</h2>
            <p>Gestión de usuarios del sistema</p>
          </div>

          <div style={styles.card}>
            <h2>Clientes</h2>
            <p>Administración de clientes</p>
          </div>

          <div style={styles.card}>
            <h2>Inventario</h2>
            <p>Control de productos y stock</p>
          </div>

          <div style={styles.card}>
            <h2>Reportes</h2>
            <p>Estadísticas y análisis</p>
          </div>
        </div>

        {/* Contenido extra para probar scroll */}
        <div style={{ marginTop: "40px" }}>
          {[...Array(20)].map((_, index) => (
            <div key={index} style={styles.listItem}>
              Registro de ejemplo #{index + 1}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    marginLeft: "260px", // mismo ancho del sidebar
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
    cursor: "pointer",
    transition: "0.2s",
  },

  listItem: {
    backgroundColor: "#fff",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "10px",
    boxShadow: "0 1px 5px rgba(0,0,0,0.08)",
  },
};

export default Dashboard;