import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loading from "../components/loading";
import "/src/App.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const iniciarSesion = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      const respuesta = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          email,
          password,
          plataforma: 'web', 
        }
      );

      localStorage.setItem("token", respuesta.data.token);
      localStorage.setItem("usuario", JSON.stringify(respuesta.data.usuario));

      navigate("/Dashboard");
    } catch (error) {
      const mensajeError = error.response?.data?.mensaje || "Credenciales inválidas";
      alert(mensajeError);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return <Loading mensaje="Cargando..." />;
  }

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm border-0" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body p-4 p-md-5">
          
          <div className="text-center mb-4">
            <h1 className="h3 mb-1 fw-bold text-primary">Safko SpA</h1>
            <p className="text-muted small">Sistema de Gestión</p>
          </div>

          <form onSubmit={iniciarSesion}>
            <h2 className="h5 text-center mb-4 text-secondary">Acceso al Sistema</h2>

            {/* Campo: Correo Electrónico */}
            <div className="mb-3">
              <label className="form-label text-secondary small fw-semibold">Correo Electrónico</label>
              <input
                type="email"
                className="form-control"
                placeholder="usuario@empresa.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Campo: Contraseña (CORREGIDO) */}
            <div className="mb-4">
              <label className="form-label text-secondary small fw-semibold">Contraseña</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Ingrese su contraseña"
                  value={password} // <--- AQUÍ ESTABA EL ERROR, AHORA ES password
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  className="btn btn-outline-secondary" 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 py-2 mb-4 fw-bold" 
              disabled={cargando}
            >
              {cargando ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : null}
              Ingresar
            </button>

            <div className="alert alert-info text-center p-2 mb-0" style={{ fontSize: '0.85rem' }}>
              <p className="mb-1 fw-bold">Usuario de prueba</p>
              <p className="mb-1"><strong>Email:</strong> admin@safko.cl</p>
              <p className="mb-0"><strong>Contraseña:</strong> 123456</p>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

export default Login;