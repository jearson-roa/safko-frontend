import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";

function ListarTarea() {
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const initialFormState = {
    cliente_id: "",
    usuario_id: "",
    fecha_asignacion: "",
    fecha_termino: "",
    descripcion_trabajo: "",
    estado: "Pendiente",
    observaciones: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setCargando(true);
        await Promise.all([cargarTareas(), cargarClientes(), cargarUsuarios()]);
      } catch (error) {
        console.error("Error cargando los datos iniciales:", error);
      } finally {
        setCargando(false);
      }
    };
    
    cargarDatosIniciales();
  }, []);

  const cargarClientes = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/clientes");
      setClientes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/usuarios");
      setUsuarios(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  const cargarTareas = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/tareas");
      setTareas(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error al cargar tareas:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const guardarTarea = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/api/tareas", formData);
      alert("Tarea creada correctamente");
      setModalOpen(false);
      setFormData(initialFormState);
      cargarTareas();
    } catch (error) {
      console.error(error);
      alert("Error al guardar tarea");
    }
  };

  const eliminarTarea = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta tarea?")) {
      try {
        await axios.delete(`http://localhost:3000/api/tareas/${id}`);
        alert("Tarea eliminada con éxito");
        cargarTareas();
      } catch (error) {
        console.error("Error al eliminar la tarea:", error);
        alert("Error al eliminar la tarea");
      }
    }
  };

  if (cargando) {
    return (
      <div style={styles.container}>
        <h3>Cargando tareas...</h3>
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <div style={styles.container}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Listado de Tareas</h2>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            + Nueva Tarea
          </button>
        </div>

        {tareas.length === 0 ? (
          <div className="alert alert-info">No existen tareas registradas</div>
        ) : (
          <div className="table-responsive card-body">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-3 py-3 text-secondary small text-uppercase">OT</th>
                  <th className="px-3 py-3 text-secondary small text-uppercase">Cliente</th>
                  <th className="px-3 py-3 text-secondary small text-uppercase">Responsable</th>
                  <th className="px-3 py-3 text-secondary small text-uppercase">Fecha Asignación</th>
                  <th className="px-3 py-3 text-secondary small text-uppercase">Fecha Termino</th>
                  <th className="px-3 py-3 text-secondary small text-uppercase">Estado</th>
                  <th className="px-3 py-3 text-secondary small text-uppercase text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tareas.map((tarea) => (
                  <tr key={tarea.id_trabajo}>
                    <td>{tarea.numero_ot || `#${tarea.id_trabajo}`}</td>
                    <td>{tarea.razon_social}</td>
                    <td>{tarea.nombres}</td>
                    <td>
                      {tarea.fecha_asignacion
                        ? new Date(tarea.fecha_asignacion).toLocaleDateString("es-CL")
                        : "-"}
                    </td>
                    <td>
                      {tarea.fecha_termino
                        ? new Date(tarea.fecha_termino).toLocaleDateString("es-CL")
                        : "-"}
                    </td>
                    <td>
                      <span className="badge bg-primary">{tarea.estado}</span>
                    </td>
                    <td className="px-3 py-3 text-end">
                      <div className="d-inline-flex gap-1">
                        <button className="btn btn-sm btn-light border" onClick={() => navigate(`/tareas/ver/${tarea.id_trabajo}`)}>Ver</button>
                        <button className="btn btn-sm btn-primary" onClick={() => navigate(`/tareas/editar/${tarea.id_trabajo}`)}>Editar</button>
                        <button className="btn btn-sm btn-danger" onClick={() => eliminarTarea(tarea.id_trabajo)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <>
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Nueva Tarea</h5>
                  <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
                </div>

                <form onSubmit={guardarTarea}>
                  <div className="modal-body">
                    <div className="row">
                      
                      {/* Select Cliente */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Cliente *</label>
                        <select className="form-select" name="cliente_id" value={formData.cliente_id} onChange={handleChange} required>
                          <option value="">Seleccione un cliente</option>
                          {clientes.map((cliente) => (
                            <option value={cliente.id_cliente} key={cliente.id_cliente}>
                              {cliente.razon_social}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Select Responsable */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Responsable *</label>
                        <select className="form-select" name="usuario_id" value={formData.usuario_id} onChange={handleChange} required>
                          <option value="">Seleccione un responsable</option>
                          {usuarios.map((usuario) => (
                            <option value={usuario.usuario_id} key={usuario.usuario_id}>
                              {usuario.nombres}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Fecha Asignación *</label>
                        <input type="date" className="form-control" name="fecha_asignacion" value={formData.fecha_asignacion} onChange={handleChange} required />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Fecha Término</label>
                        <input type="date" className="form-control" name="fecha_termino" value={formData.fecha_termino} onChange={handleChange} />
                      </div>

                      <div className="col-md-12 mb-3">
                        <label className="form-label">Estado</label>
                        <select className="form-select" name="estado" value={formData.estado} onChange={handleChange}>
                          <option value="Pendiente">Pendiente</option>
                          <option value="Asignado">Asignado</option>
                          <option value="En Proceso">En Proceso</option>
                          <option value="Finalizado">Finalizado</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      </div>

                      <div className="col-md-12 mb-3">
                        <label className="form-label">Descripción *</label>
                        <textarea className="form-control" rows="4" name="descripcion_trabajo" value={formData.descripcion_trabajo} onChange={handleChange} required />
                      </div>

                      <div className="col-md-12 mb-3">
                        <label className="form-label">Observaciones</label>
                        <textarea className="form-control" rows="3" name="observaciones" value={formData.observaciones} onChange={handleChange} />
                      </div>

                    </div>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary">Guardar</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}></div>
        </>
      )}
    </>
  );
}

const styles = {
  container: {
    marginLeft: "260px",
    minHeight: "100vh",
    backgroundColor: "#f4f6f8",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
  },
};

export default ListarTarea;