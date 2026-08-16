import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  Save,
  UserRound,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import Loading from "../../components/Loading";

import "./EditarEmpleado.css";

// =====================================================
// ESTADO INICIAL
// =====================================================

const initialFormState = {
  nombres: "",
  apellido_paterno: "",
  cargo: "",
  email: "",
  password: "",
  rol: "tecnico en terreno",
  activo: 1,
};

// =====================================================
// COMPONENTE
// =====================================================

function EditarEmpleado() {
  const { id } = useParams();
  const navigate = useNavigate();

  // =====================================================
  // ESTADOS
  // =====================================================

  const [formulario, setFormulario] =
    useState(initialFormState);

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [mostrarPassword, setMostrarPassword] =
    useState(false);

  const [mensajeExito, setMensajeExito] =
    useState("");

  const [mensajeError, setMensajeError] =
    useState("");

  // =====================================================
  // MENSAJE ÉXITO
  // =====================================================

  const mostrarMensajeExito = (mensaje) => {
    setMensajeExito(mensaje);
    setMensajeError("");

    setTimeout(() => {
      setMensajeExito("");
    }, 3000);
  };

  // =====================================================
  // MENSAJE ERROR
  // =====================================================

  const mostrarMensajeError = (mensaje) => {
    setMensajeError(mensaje);
    setMensajeExito("");

    setTimeout(() => {
      setMensajeError("");
    }, 4000);
  };

  // =====================================================
  // CARGAR EMPLEADO
  // =====================================================

  useEffect(() => {
    cargarEmpleado();
  }, [id]);

  const cargarEmpleado = async () => {
    try {
      setCargando(true);

      const token =
        localStorage.getItem("token");

      if (!token) {
        mostrarMensajeError(
          "No hay una sesión activa. Inicia sesión nuevamente."
        );

        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/empleado/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Empleado cargado:",
        response.data
      );

      setFormulario({
        nombres:
          response.data.nombres || "",

        apellido_paterno:
          response.data.apellido_paterno || "",

        cargo:
          response.data.cargo || "",

        email:
          response.data.email || "",

        // Se mantiene vacío para no modificar
        // la contraseña si el usuario no escribe una nueva.
        password: "",

        rol:
          response.data.rol ||
          "tecnico en terreno",

        activo:
          response.data.activo ?? 1,
      });
    } catch (error) {
      console.error(
        "Error cargando empleado:",
        error
      );

      const mensaje =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "No se pudo cargar el empleado.";

      if (window.Swal) {
        await window.Swal.fire({
          title: "Error",
          text: mensaje,
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      } else {
        mostrarMensajeError(mensaje);
      }

      navigate("/listar-empleado");
    } finally {
      setCargando(false);
    }
  };

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // GUARDAR CAMBIOS
  // =====================================================

  const guardarCambios = async (e) => {
    e.preventDefault();

    if (guardando) return;

    // =================================================
    // VALIDACIONES
    // =================================================

    if (!formulario.nombres.trim()) {
      mostrarMensajeError(
        "Ingresa los nombres del empleado."
      );
      return;
    }

    if (!formulario.apellido_paterno.trim()) {
      mostrarMensajeError(
        "Ingresa el apellido paterno."
      );
      return;
    }

    if (!formulario.cargo.trim()) {
      mostrarMensajeError(
        "Ingresa el cargo del empleado."
      );
      return;
    }

    if (!formulario.email.trim()) {
      mostrarMensajeError(
        "Ingresa el correo del empleado."
      );
      return;
    }

    if (
      formulario.password &&
      formulario.password.length < 6
    ) {
      mostrarMensajeError(
        "La nueva contraseña debe tener al menos 6 caracteres."
      );
      return;
    }

    // =================================================
    // CONFIRMACIÓN
    // =================================================

    if (window.Swal) {
      const resultado =
        await window.Swal.fire({
          title: "¿Guardar cambios?",
          text: "Se actualizará la información del empleado.",
          icon: "question",
          showCancelButton: true,
          confirmButtonText:
            "Sí, guardar cambios",
          cancelButtonText: "Cancelar",
          reverseButtons: true,
        });

      if (!resultado.isConfirmed) {
        return;
      }
    }

    // =================================================
    // GUARDAR
    // =================================================

    try {
      setGuardando(true);

      const token =
        localStorage.getItem("token");

      if (!token) {
        mostrarMensajeError(
          "No hay una sesión activa. Inicia sesión nuevamente."
        );

        return;
      }

      // =================================================
      // PAYLOAD
      // =================================================
      //
      // No enviamos password si está vacío.
      // Así el backend puede mantener la contraseña actual.
      //
      // =================================================

      const payload = {
        nombres:
          formulario.nombres.trim(),

        apellido_paterno:
          formulario.apellido_paterno.trim(),

        cargo:
          formulario.cargo.trim(),

        email:
          formulario.email.trim(),

        rol:
          formulario.rol,

        activo:
          Number(formulario.activo),
      };

      if (formulario.password.trim()) {
        payload.password =
          formulario.password;
      }

      console.log(
        "Datos enviados:",
        payload
      );

      // =================================================
      // PUT
      // =================================================

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/empleado/${id}`,
        payload,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },
        }
      );

      // =================================================
      // ÉXITO
      // =================================================

      if (window.Swal) {
        await window.Swal.fire({
          title: "¡Empleado actualizado!",
          text: "Los cambios fueron guardados correctamente.",
          icon: "success",
          timer: 2200,
          showConfirmButton: false,
        });
      } else {
        mostrarMensajeExito(
          "Empleado actualizado correctamente."
        );
      }

      // =================================================
      // VOLVER AL LISTADO
      // =================================================

      navigate("/listar-empleado");
    } catch (error) {
      console.error(
        "Error actualizando empleado:",
        error
      );

      const mensaje =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "No se pudo actualizar el empleado.";

      if (window.Swal) {
        window.Swal.fire({
          title: "No se pudo actualizar",
          text: mensaje,
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      } else {
        mostrarMensajeError(mensaje);
      }
    } finally {
      setGuardando(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (cargando) {
    return (
      <div className="vt-page">
        <Loading mensaje="Cargando empleado..." />
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="vt-page">

      {/* =================================================
          MENSAJE ÉXITO
      ================================================= */}

      {mensajeExito && (
        <div className="vt-success-message">

          <CheckCircle2
            size={19}
            strokeWidth={2.5}
          />

          <span>
            {mensajeExito}
          </span>

        </div>
      )}

      {/* =================================================
          MENSAJE ERROR
      ================================================= */}

      {mensajeError && (
        <div className="vt-error-message">

          <AlertCircle
            size={19}
            strokeWidth={2.5}
          />

          <span>
            {mensajeError}
          </span>

        </div>
      )}

      <div className="vt-wrap">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="vt-header">

          <div>

            <div className="vt-eyebrow">
              GESTIÓN DE PERSONAL
            </div>

            <h1 className="vt-title">
              Editar empleado
            </h1>

            <p className="vt-subtitle">
              Actualiza la información y los
              permisos del empleado.
            </p>

          </div>

          <button
            type="button"
            className="vt-btn-ghost"
            onClick={() =>
              navigate("/listar-empleado")
            }
            disabled={guardando}
          >
            <ArrowLeft size={16} />

            Volver
          </button>

        </div>

        {/* =================================================
            FORMULARIO
        ================================================= */}

        <form
          className="vt-edit-card"
          onSubmit={guardarCambios}
        >

          {/* =================================================
              INFORMACIÓN PERSONAL
          ================================================= */}

          <div className="vt-form-section">

            <div className="vt-form-section-heading">

              <div className="vt-form-section-icon">
                <UserRound size={18} />
              </div>

              <div>

                <div className="vt-form-section-title">
                  Información del empleado
                </div>

                <div className="vt-form-section-description">
                  Modifica los datos principales
                  del empleado.
                </div>

              </div>

            </div>

            <div className="vt-form-grid">

              {/* NOMBRES */}

              <div className="vt-form-field">

                <label className="vt-form-label">
                  Nombres *
                </label>

                <input
                  type="text"
                  name="nombres"
                  value={
                    formulario.nombres
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Juan Carlos"
                  className="vt-form-input"
                  required
                  disabled={guardando}
                />

              </div>

              {/* APELLIDO */}

              <div className="vt-form-field">

                <label className="vt-form-label">
                  Apellido paterno *
                </label>

                <input
                  type="text"
                  name="apellido_paterno"
                  value={
                    formulario.apellido_paterno
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Pérez"
                  className="vt-form-input"
                  required
                  disabled={guardando}
                />

              </div>

              {/* CARGO */}

              <div className="vt-form-field">

                <label className="vt-form-label">
                  Cargo *
                </label>

                <input
                  type="text"
                  name="cargo"
                  value={
                    formulario.cargo
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Supervisor"
                  className="vt-form-input"
                  required
                  disabled={guardando}
                />

              </div>

              {/* EMAIL */}

              <div className="vt-form-field">

                <label className="vt-form-label">
                  Correo electrónico *
                </label>

                <input
                  type="email"
                  name="email"
                  value={
                    formulario.email
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="usuario@empresa.cl"
                  className="vt-form-input"
                  required
                  disabled={guardando}
                />

              </div>

            </div>

          </div>

          {/* =================================================
              ACCESO
          ================================================= */}

          <div className="vt-form-section">

            <div className="vt-form-section-title">
              Acceso al sistema
            </div>

            <div className="vt-form-grid">

              {/* PASSWORD */}

              <div className="vt-form-field">

                <label className="vt-form-label">
                  Nueva contraseña
                </label>

                <div className="vt-password-wrapper">

                  <input
                    type={
                      mostrarPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={
                      formulario.password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Dejar vacío para mantener actual"
                    className="vt-form-input"
                    minLength={6}
                    disabled={guardando}
                  />

                  <button
                    type="button"
                    className="vt-password-toggle"
                    onClick={() =>
                      setMostrarPassword(
                        (prev) => !prev
                      )
                    }
                    disabled={guardando}
                    title={
                      mostrarPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {mostrarPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

                <small className="vt-form-help">
                  Déjalo vacío si no deseas
                  cambiar la contraseña.
                </small>

              </div>

              {/* ROL */}

              <div className="vt-form-field">

                <label className="vt-form-label">
                  Rol *
                </label>

                <select
                  name="rol"
                  value={
                    formulario.rol
                  }
                  onChange={
                    handleChange
                  }
                  className="vt-form-input"
                  required
                  disabled={guardando}
                >

                  <option value="tecnico en terreno">
                    Técnico en terreno
                  </option>

                  <option value="supervisor">
                    Supervisor
                  </option>

                  <option value="acceso terreno">
                    Acceso terreno
                  </option>

                  <option value="admin">
                    Administrador
                  </option>

                </select>

              </div>

              {/* ESTADO */}

              <div className="vt-form-field">

                <label className="vt-form-label">
                  Estado *
                </label>

                <select
                  name="activo"
                  value={
                    formulario.activo
                  }
                  onChange={
                    handleChange
                  }
                  className="vt-form-input"
                  required
                  disabled={guardando}
                >

                  <option value={1}>
                    Activo
                  </option>

                  <option value={0}>
                    Inactivo
                  </option>

                </select>

              </div>

            </div>

          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="vt-edit-actions">

            <button
              type="button"
              className="vt-btn-ghost"
              onClick={() =>
                navigate(
                  "/listar-empleado"
                )
              }
              disabled={guardando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="vt-btn-primary"
              disabled={guardando}
            >

              <Save size={16} />

              {guardando
                ? "Guardando..."
                : "Guardar cambios"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditarEmpleado;