import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";

function ListarCliente() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);

  const initialFormState = {
    razon_social: "",
    rut: "",
    giro_comercial: "",
    direccion: "",
    comuna: "",
    ciudad: "",
    region: "",
    nombre_contacto: "",
    cargo_contacto: "",
    correo_contacto: "",
    telefono_contacto: "",
    estado: "Activo",
    observaciones: "",
  };

  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validar = () => {
    let newErrors = {};
    if (!form.razon_social.trim()) newErrors.razon_social = "La razón social es obligatoria";
    if (!form.rut.trim()) {
      newErrors.rut = "El RUT es obligatorio";
    } else if (!/^[0-9]+-[0-9kK]{1}$/.test(form.rut)) {
      newErrors.rut = "Formato inválido. Ej: 12345678-9";
    }
    if (!form.direccion.trim()) newErrors.direccion = "La dirección es obligatoria";
    if (!form.ciudad.trim()) newErrors.ciudad = "La ciudad es obligatoria";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const obtenerClientes = async () => {
    try {
      const respuesta = await axios.get("http://localhost:3000/api/clientes");
      setClientes(respuesta.data);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerClientes();
  }, []);

  const crearCliente = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    setCargando(true);
    try {
      await axios.post("http://localhost:3000/api/clientes", form);
      
      if (window.Swal) {
        window.Swal.fire({
          title: "¡Éxito!",
          text: "Cliente creado correctamente",
          icon: "success",
          confirmButtonColor: "#212529",
          timer: 2000,
          showConfirmButton: false,
        });
      }

      setModalOpen(false);
      setForm(initialFormState);
      setErrors({});
      await obtenerClientes();

    } catch (error) {
      console.error(error);
      if (window.Swal) {
        window.Swal.fire({
          title: "¡Error!",
          text: "Error al crear cliente",
          icon: "error",
          confirmButtonColor: "#dc3545"
        });
      }
    } finally {
      setCargando(false);
    }
  };

  const eliminarCliente = async (id) => {
    if (!window.Swal) return;

    const result = await window.Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará al cliente permanentemente",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      setCargando(true);
      try {
        await axios.delete(`http://localhost:3000/api/clientes/${id}`);
        window.Swal.fire({
          title: "¡Eliminado!",
          text: "El cliente ha sido eliminado correctamente",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        await obtenerClientes();
      } catch (error) {
        console.error(error);
        window.Swal.fire("ERROR", "No se puede eliminar cliente", "error");
      } finally {
        boxSizing: "border-box"
        setCargando(false);
      }
    }
  };

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.razon_social?.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.rut?.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const clientesActivos = clientes.filter(c => c.estado === "Activo").length;

  if (cargando) {
    return <Loading mensaje="Cargando información..." />;
  }

  return (
    <div className="flex">
      <Sidebar />
      
      {/* Contenedor Principal (Simula el marginLeft previo desplazando el contenido tras el Sidebar) */}
      <div className="flex-grow-1 bg-light min-vh-100 p-4" style={{ marginLeft: "260px" }}>
        
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h2 text-dark mb-1fw-bold">Gestión de Clientes</h1>
            <p className="text-muted mb-0">Administración de clientes registrados</p>
          </div>
          <button className="btn btn-dark px-4 py-2" onClick={() => setModalOpen(true)}>
            + Nuevo Cliente
          </button>
        </div>

        {/* Indicadores (Tarjetas) */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="card shadow-sm border-0 p-3">
              <span className="text-muted small text-uppercase fw-bold">Total Clientes</span>
              <h2 className="display-6 fw-bold text-dark mt-2 mb-0">{clientes.length}</h2>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card shadow-sm border-0 p-3">
              <span className="text-muted small text-uppercase fw-bold">Clientes Activos</span>
              <h2 className="display-6 fw-bold text-success mt-2 mb-0">{clientesActivos}</h2>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card shadow-sm border-0 p-3">
              <span className="text-muted small text-uppercase fw-bold">Clientes Inactivos</span>
              <h2 className="display-6 fw-bold text-danger mt-2 mb-0">{clientes.length - clientesActivos}</h2>
            </div>
          </div>
        </div>

        {/* Barra de Búsqueda */}
        <div className="mb-4">
          <input
            type="text"
            className="form-control form-control-lg fs-6 shadow-sm"
            placeholder="Buscar por razón social o RUT..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Tabla */}
        <div className="card shadow-sm border-0 overflow-hidden">
          {clientesFiltrados.length === 0 ? (
            <div className="text-center p-5 text-muted">No existen clientes registrados</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-3 py-3 text-secondary small text-uppercase">Razón Social</th>
                    <th className="px-3 py-3 text-secondary small text-uppercase">RUT</th>
                    <th className="px-3 py-3 text-secondary small text-uppercase">Nombre contacto</th>
                    <th className="px-3 py-3 text-secondary small text-uppercase">Cargo</th>
                    <th className="px-3 py-3 text-secondary small text-uppercase">Teléfono</th>
                    <th className="px-3 py-3 text-secondary small text-uppercase">Correo</th>
                    <th className="px-3 py-3 text-secondary small text-uppercase">Ciudad</th>
                    <th className="px-3 py-3 text-secondary small text-uppercase">Obs.</th>
                    <th className="px-3 py-3 text-secondary small text-uppercase">Estado</th>
                    <th className="px-3 py-3 text-secondary small text-uppercase text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesFiltrados.map((cliente) => (
                    <tr key={cliente.id_cliente}>
                      <td className="px-3 py-3 fw-bold text-dark">{cliente.razon_social}</td>
                      <td className="px-3 py-3">{cliente.rut}</td>
                      <td className="px-3 py-3">{cliente.nombre_contacto}</td>
                      <td className="px-3 py-3">{cliente.cargo_contacto}</td>
                      <td className="px-3 py-3">{cliente.telefono_contacto}</td>
                      <td className="px-3 py-3">{cliente.correo_contacto}</td>
                      <td className="px-3 py-3">{cliente.ciudad}</td>
                      <td className="px-3 py-3 text-truncate" style={{ maxWidth: "150px" }}>{cliente.observaciones}</td>
                      <td className="px-3 py-3">
                        <span className={`badge rounded-pill px-3 py-2 ${cliente.estado === "Activo" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
                          {cliente.estado || "Inactivo"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-end">
                        <div className="d-inline-flex gap-1">
                          <button className="btn btn-sm btn-light border" onClick={() => navigate(`/clientes/ver/${cliente.id_cliente}`)}>Ver</button>
                          <button className="btn btn-sm btn-primary" onClick={() => navigate(`/clientes/editar/${cliente.id_cliente}`)}>Editar</button>
                          <button className="btn btn-sm btn-danger" onClick={() => eliminarCliente(cliente.id_cliente)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}  
        </div>
      </div>

      {/* Modal Estilo Bootstrap manual (evitando dependencias pesadas de JS de Bootstrap) */}
      {modalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold text-dark">Nuevo Cliente</h5>
                <button type="button" className="btn-close" onClick={() => { setModalOpen(false); setErrors({}); }}></button>
              </div>
              <form onSubmit={crearCliente}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-secondary">Razón Social *</label>
                      <input name="razon_social" value={form.razon_social} onChange={handleChange} className={`form-control ${errors.razon_social ? 'is-invalid' : ''}`} />
                      {errors.razon_social && <div className="invalid-feedback">{errors.razon_social}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-secondary">RUT *</label>
                      <input name="rut" placeholder="12345678-9" value={form.rut} onChange={handleChange} className={`form-control ${errors.rut ? 'is-invalid' : ''}`} />
                      {errors.rut && <div className="invalid-feedback">{errors.rut}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-secondary">Giro Comercial</label>
                      <input name="giro_comercial" value={form.giro_comercial} onChange={handleChange} className="form-control" />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-secondary">Dirección *</label>
                      <input name="direccion" value={form.direccion} onChange={handleChange} className={`form-control ${errors.direccion ? 'is-invalid' : ''}`} />
                      {errors.direccion && <div className="invalid-feedback">{errors.direccion}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-secondary">Ciudad *</label>
                      <input name="ciudad" value={form.ciudad} onChange={handleChange} className={`form-control ${errors.ciudad ? 'is-invalid' : ''}`} />
                      {errors.ciudad && <div className="invalid-feedback">{errors.ciudad}</div>}
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-secondary">Comuna</label>
                      <input name="comuna" value={form.comuna} onChange={handleChange} className="form-control" />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-secondary">Región</label>
                      <input name="region" value={form.region} onChange={handleChange} className="form-control" />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-secondary">Nombre Contacto</label>
                      <input name="nombre_contacto" value={form.nombre_contacto} onChange={handleChange} className="form-control" />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-secondary">Cargo</label>
                      <input name="cargo_contacto" value={form.cargo_contacto} onChange={handleChange} className="form-control" />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-secondary">Teléfono / Celular</label>
                      <input name="telefono_contacto" value={form.telefono_contacto} onChange={handleChange} className="form-control" />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-secondary">Correo</label>
                      <input type="email" name="correo_contacto" value={form.correo_contacto} onChange={handleChange} className="form-control" />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-secondary">Observaciones</label>
                      <input name="observaciones" value={form.observaciones} onChange={handleChange} className="form-control" />
                    </div>

                  </div>
                </div>
                <div className="modal-footer bg-light border-top-0">
                  <button type="button" className="btn btn-secondary" onClick={() => { setModalOpen(false); setForm(initialFormState); setErrors({}); }}>Cancelar</button>
                  <button type="submit" className="btn btn-dark">Guardar Cliente</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListarCliente;