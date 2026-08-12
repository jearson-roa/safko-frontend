import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function EditarCliente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    razon_social: "",
    rut: "",
    giro_comercial: "",
    direccion: "",
    nombre_contacto: "",
    cargo_contacto: "",
    telefono_contacto: "",
    correo_contacto: "", // Nombre corregido y consistente
    observaciones: ""
  });

  // 1. Cargar datos del cliente
  useEffect(() => {
    const cargarCliente = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/clientes/${id}`);
        setForm(res.data);
      } catch (error) {
        console.error("Error al cargar cliente", error);
      }
    };
    cargarCliente();
  }, [id]);

  // 2. Manejador de cambios
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 3. Envío de datos (PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3000/api/clientes/${id}`, form);
      window.Swal.fire("¡Éxito!", "Cliente actualizado", "success");
      navigate("/listar-cliente");
    } catch (error) {
      window.Swal.fire("Error", "No se pudo actualizar", "error");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Editar Cliente</h2>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            <label>Razón Social</label>
            <input 
              name="razon_social" 
              value={form.razon_social || ""} 
              onChange={handleChange} 
              className="form-control" 
            />
          </div>

          <div className="col-md-6">
            <label>RUT</label>
            <input 
              name="rut" 
              value={form.rut || ""} 
              onChange={handleChange} 
              className="form-control" 
            />
          </div>

          <div className="col-md-6">
            <label>Giro Comercial</label>
            <input 
              name="giro_comercial" 
              value={form.giro_comercial || ""} 
              onChange={handleChange} 
              className="form-control" 
            />
          </div>

          <div className="col-md-6">
            <label>Dirección</label>
            <input 
              name="direccion" 
              value={form.direccion || ""} 
              onChange={handleChange} 
              className="form-control" 
            />
          </div>

          {/* Espacio reservado para select de Región, Provincia y Comuna */}

          <div className="col-md-6">
            <label>Nombre contacto</label>
            <input 
              name="nombre_contacto" 
              value={form.nombre_contacto || ""} 
              onChange={handleChange} 
              className="form-control" 
            />
          </div>

          <div className="col-md-6">
            <label>Cargo</label>
            <input 
              name="cargo_contacto" 
              value={form.cargo_contacto || ""} 
              onChange={handleChange} 
              className="form-control" 
            />
          </div>

          <div className="col-md-6">
            <label>Teléfono / Celular</label>
            <input 
              name="telefono_contacto" 
              value={form.telefono_contacto || ""} 
              onChange={handleChange} 
              className="form-control" 
            />
          </div>

          <div className="col-md-6">
            <label>Correo</label>
            <input 
              name="correo_contacto" 
              value={form.correo_contacto || ""} 
              onChange={handleChange} 
              className="form-control" 
            />
          </div>

          <div className="col-md-6">
            <label>Observaciones</label>
            <input 
              name="observaciones" 
              value={form.observaciones || ""} 
              onChange={handleChange} 
              className="form-control" 
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-3">Guardar Cambios</button>
      </form>
    </div>
  );
}

export default EditarCliente;