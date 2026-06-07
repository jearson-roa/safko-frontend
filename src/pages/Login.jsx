import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "/src/App.css";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [cargando , setCargando] = useState("flase");
  const [showPassword , setShowPassword] = useState(false);

  const iniciarSesion = async (e) => {
    e.preventDefault();
    setCargando(true); //activamos el cargador de la pagina

    try {
      const respuesta = await axios.post(
        "http://localhost:3000/api/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", respuesta.data.token);
      localStorage.setItem(
        "usuario",
        JSON.stringify(respuesta.data.usuario)
      );

      navigate("/Dashboard");
    } catch (error) {
      alert("Credenciales inválidas");
    }finally{
      //se ejecuta falle o no la sesion
      setCargando(false); //desactiva el cargador de la pagina
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">

        <div className="empresa">
          <h1>Safko SpA</h1>
          <p>Sistema de Gestión</p>
        </div>

        <form onSubmit={iniciarSesion}>
          <h2>Acceso al Sistema</h2>

          <div className="campo">
            <label>Correo Electrónico</label>
            <input
              type="email"
              placeholder="usuario@empresa.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="campo">
            <label>Contraseña</label>
            <input
              type={showPassword ? "text": "password"}
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
          </div>

          <button type="submit">
            Ingresar
          </button>

          <div className="container">
            <p>Usuario de prueba</p>
              <p><strong>Email:</strong> admin@safko.cl</p>
            <p><strong>Contraseña:</strong> 123456</p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;