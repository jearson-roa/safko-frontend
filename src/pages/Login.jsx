import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import "./Login.css";

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
          plataforma: "web",
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
    <div className="safko-login">
      {/* Panel izquierdo: identidad del sistema */}
      <div className="safko-login__brand">
        <div className="safko-login__grid" aria-hidden="true"></div>

        <div className="safko-login__brand-content">
          <div className="safko-login__mark">SAFKO</div>
          <div className="safko-login__submark">SpA</div>

          <p className="safko-login__tagline">Sistema de Gestión</p>

          <div className="safko-login__status">
            <span className="safko-login__dot" aria-hidden="true"></span>
            TERMINAL DE ACCESO — EN LÍNEA
          </div>
        </div>

        <div className="safko-login__footnote">SAFKO · CONSOLA V.2026.08</div>
      </div>

      {/* Panel derecho: formulario */}
      <div className="safko-login__panel">
        <form className="safko-login__form" onSubmit={iniciarSesion}>
          <div className="safko-login__form-header">
            <span className="safko-login__eyebrow">Acceso restringido</span>
            <h2 className="safko-login__title">Ingresar al sistema</h2>
          </div>

          <div className="safko-field">
            <label className="safko-field__label" htmlFor="safko-email">
              Correo electrónico
            </label>
            <input
              id="safko-email"
              type="email"
              className="safko-field__input"
              placeholder="usuario@empresa.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="safko-field">
            <label className="safko-field__label" htmlFor="safko-password">
              Contraseña
            </label>
            <div className="safko-field__row">
              <input
                id="safko-password"
                type={showPassword ? "text" : "password"}
                className="safko-field__input"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="safko-field__toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          <button type="submit" className="safko-submit" disabled={cargando}>
            {cargando ? (
              <span className="safko-submit__spinner" role="status" aria-hidden="true"></span>
            ) : null}
            Ingresar
          </button>

          <div className="safko-note">
            <span className="safko-note__label">Credenciales de prueba</span>
            <span className="safko-note__row">
              <strong>Email</strong> admin@safko.cl
            </span>
            <span className="safko-note__row">
              <strong>Contraseña</strong> 123456
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;