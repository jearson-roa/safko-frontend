import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../../components/Loading";
import Sidebar from "../../components/Sidebar";

function ListarUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [empleados, setEmpleados] = useState([]); // Lo mantienes para el modal de creación (+ Nuevo Usuario)
    const [cargando, setCargando] = useState(true);
    const [modalOpen, setModalOpen] = useState(false); 

    useEffect(() => {
        const cargarDatosIniciales = async () => {
            try {
                setCargando(true);
                // Cargamos ambos en paralelo. 'usuarios' trae los datos combinados para la tabla,
                // y 'empleados' te servirá para listar las opciones en tu formulario/modal.
                await Promise.all([listarUsuarios(), listarEmpleados()]); 
            } catch (error) {
                console.error("Error cargando los datos iniciales", error);
            } finally {
                setCargando(false);
            }
        };
        cargarDatosIniciales();
    }, []);

    const listarUsuarios = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/usuarios`);
            setUsuarios(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error al cargar usuarios", error);
        }
    };

    const listarEmpleados = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/empleados`);
            setEmpleados(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error al cargar empleados", error);
        }
    };

    if (cargando) {
        return <Loading mensaje="Cargando usuarios..." />;
    }

    return (
        <>
            <Sidebar />
            <div style={styles.container}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Listado de Usuarios</h2>
                    <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                        + Nuevo Usuario
                    </button>
                </div>
                
                {usuarios.length === 0 ? (
                    <div className="alert alert-info" role="alert">
                        Usuarios no disponibles
                    </div>
                ) : (
                    <div className="table-responsive shadow-sm rounded">
                        <table className="table table-striped table-hover align-middle mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th scope="col" style={{ width: "10%" }}>ID</th>
                                    <th scope="col">Nombre Empleado</th> {/* 🆕 Columna para el Nombre */}
                                    <th scope="col">Direccion</th> 
                                    <th scope="col">Cargo</th> 
                                    <th scope="col">Email / Usuario</th>
                                    <th scope="col" style={{ width: "15%" }}>Rol</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((usuario) => (
                                    <tr key={usuario.empleado_id}>
                                        <td className="fw-bold text-secondary">
                                            #{usuario.empleado_id}
                                        </td>
                                        {/* 🆕 Renderizamos nombre y apellido del JSON del backend */}
                                        <td className="fw-semibold text-dark">
                                            {usuario.nombres} {usuario.apellido_paterno}
                                        </td>
                                        <td>
                                            {usuario.direccion}
                                        </td>
                                        <td>
                                            {usuario.cargo}
                                        </td>
                                        <td>
                                            {usuario.email}
                                        </td>
                                        <td>
                                            <span className={`badge ${usuario.rol === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                                                {usuario.rol}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
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

export default ListarUsuarios;