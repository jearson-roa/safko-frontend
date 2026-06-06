import { useState } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar";

function CrearTarea() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState("Media");

  const crearTarea = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:3000/api/tareas/crear",
        {
          titulo,
          descripcion,
          prioridad,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Tarea creada correctamente");

      setTitulo("");
      setDescripcion("");
      setPrioridad("Media");
    } catch (error) {
      console.error(error);
      alert("Error al crear tarea");
    }
  };

  return (
    <>
      <Sidebar />

      <div
        style={{
          marginLeft: "280px",
          padding: "20px",
        }}
      >
        <h2>Crear Tarea</h2>

        <form onSubmit={crearTarea}>
          <div style={{ marginBottom: "15px" }}>
            <label>Título</label>
            <br />

            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              style={{
                width: "100%",
                maxWidth: "500px",
                padding: "10px",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>Descripción</label>
            <br />

            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows="5"
              style={{
                width: "100%",
                maxWidth: "500px",
                padding: "10px",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>Prioridad</label>
            <br />

            <select
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value)}
              style={{
                width: "200px",
                padding: "10px",
              }}
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: "#2563EB",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Guardar Tarea
          </button>
        </form>
      </div>
    </>
  );
}

export default CrearTarea;