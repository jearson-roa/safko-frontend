import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Loading from "../../components/Loading";
import { useNavigate } from "react-router-dom";

import {
  Eye,
  PenLine,
  Plus,
  UserRound,
  X,
  EyeOff,
  Trash2,
} from "lucide-react";

import "./ListarEmpleado.css";

// =====================================================
// ESTADO INICIAL
// =====================================================

const initialFormState = {
  rut: "",
  nombres: "",
  apellido_paterno: "",
  apellido_materno: "",
  telefono: "",
  direccion: "",
  cargo: "",

  crear_usuario: false,
  email: "",
  password: "",
  rol: "tecnico en terreno",
};

// =====================================================
// COMPONENTE
// =====================================================

function ListarEmpleados() {
  const navigate = useNavigate();

  // =====================================================
  // ESTADOS
  // =====================================================

  const [empleados, setEmpleados] = useState([]);

  const [cargando, setCargando] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);

  const [guardando, setGuardando] = useState(false);

  const [eliminando, setEliminando] = useState(null);

  const [mostrarPassword, setMostrarPassword] =
    useState(false);

  const [formulario, setFormulario] =
    useState(initialFormState);

  // =====================================================
  // LISTAR EMPLEADOS
  // =====================================================

  const listarEmpleado = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/empleado`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEmpleados(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Error al cargar empleados:",
        error
      );

      setEmpleados([]);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.mensaje ||
          "No se pudieron cargar los empleados.",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#241ba6",
      });
    }
  };

  // =====================================================
  // CARGA INICIAL
  // =====================================================

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setCargando(true);

        await listarEmpleado();
      } catch (error) {
        console.error(
          "Error cargando empleados:",
          error
        );
      } finally {
        setCargando(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  // =====================================================
  // ABRIR MODAL
  // =====================================================

  const abrirModal = () => {
    setFormulario({
      ...initialFormState,
    });

    setMostrarPassword(false);

    setModalOpen(true);
  };

  // =====================================================
  // CERRAR MODAL
  // =====================================================

  const cerrarModal = () => {
    if (guardando) return;

    setModalOpen(false);

    setMostrarPassword(false);

    setFormulario({
      ...initialFormState,
    });
  };

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =====================================================
  // GUARDAR EMPLEADO
  // =====================================================

  const guardarEmpleado = async (e) => {
    e.preventDefault();

    if (guardando) return;

    // =================================================
    // VALIDACIONES EMPLEADO
    // =================================================

    if (!formulario.rut.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "Ingresa el RUT del empleado.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#241ba6",
      });

      return;
    }

    if (!formulario.nombres.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "Ingresa los nombres del empleado.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#241ba6",
      });

      return;
    }

    if (!formulario.apellido_paterno.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "Ingresa el apellido paterno.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#241ba6",
      });

      return;
    }

    if (!formulario.cargo.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "Ingresa el cargo.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#241ba6",
      });

      return;
    }

    // =================================================
    // VALIDACIONES USUARIO
    // =================================================

    if (formulario.crear_usuario) {
      if (!formulario.email.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Campo requerido",
          text: "Ingresa el email del usuario.",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#241ba6",
        });

        return;
      }

      if (!formulario.password.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Campo requerido",
          text: "Ingresa una contraseña para el usuario.",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#241ba6",
        });

        return;
      }

      if (formulario.password.length < 6) {
        Swal.fire({
          icon: "warning",
          title: "Contraseña inválida",
          text: "La contraseña debe tener al menos 6 caracteres.",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#241ba6",
        });

        return;
      }

      if (!formulario.rol.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Campo requerido",
          text: "Selecciona un rol para el usuario.",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#241ba6",
        });

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
        Swal.fire({
          icon: "warning",
          title: "Sesión expirada",
          text: "No hay una sesión activa. Inicia sesión nuevamente.",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#241ba6",
        });

        setGuardando(false);

        return;
      }

      // =================================================
      // PAYLOAD
      // =================================================

      const payload = {
        rut: formulario.rut.trim(),

        nombres:
          formulario.nombres.trim(),

        apellido_paterno:
          formulario.apellido_paterno.trim(),

        apellido_materno:
          formulario.apellido_materno.trim() ||
          null,

        telefono:
          formulario.telefono.trim() ||
          null,

        direccion:
          formulario.direccion.trim() ||
          null,

        cargo:
          formulario.cargo.trim(),

        crear_usuario:
          formulario.crear_usuario,

        email:
          formulario.crear_usuario
            ? formulario.email.trim()
            : null,

        password:
          formulario.crear_usuario
            ? formulario.password
            : null,

        rol:
          formulario.crear_usuario
            ? formulario.rol
            : null,
      };

      console.log(
        "Datos enviados:",
        payload
      );

      // =================================================
      // POST
      // =================================================

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/empleado`,
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

      // Guardar antes de limpiar formulario
      const usuarioCreado =
        formulario.crear_usuario;

      // =================================================
      // CERRAR MODAL
      // =================================================

      setModalOpen(false);

      setMostrarPassword(false);

      setFormulario({
        ...initialFormState,
      });

      // =================================================
      // ACTUALIZAR LISTADO
      // =================================================

      await listarEmpleado();

      // =================================================
      // ALERT ÉXITO
      // =================================================

      await Swal.fire({
        icon: "success",
        title: "Empleado creado",
        text: usuarioCreado
          ? "El empleado y su usuario fueron creados correctamente."
          : "El empleado fue creado correctamente.",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#241ba6",
        timer: 2500,
        timerProgressBar: true,
      });

    } catch (error) {
      console.error(
        "Error al crear empleado:",
        error
      );

      const mensaje =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "No se pudo crear el empleado.";

      Swal.fire({
        icon: "error",
        title: "No se pudo crear el empleado",
        text: mensaje,
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#241ba6",
      });

    } finally {
      setGuardando(false);
    }
  };

  // =====================================================
  // ELIMINAR EMPLEADO
  // =====================================================

  const eliminarEmpleado = async (empleado) => {
    if (eliminando) return;

    const nombreEmpleado =
      `${empleado.nombres || ""} ${
        empleado.apellido_paterno || ""
      } ${empleado.apellido_materno || ""}`.trim();

    // =================================================
    // CONFIRMACIÓN
    // =================================================

    const resultado = await Swal.fire({
      title: "¿Eliminar empleado?",
      html: `
        <div style="font-size: 15px; color: #64748b;">
          Estás a punto de eliminar a
          <strong style="color: #0f172a;">
            ${nombreEmpleado}
          </strong>
          <br />
          <span style="font-size: 13px;">
            Esta acción no se puede deshacer.
          </span>
        </div>
      `,
      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "Sí, eliminar",

      cancelButtonText: "Cancelar",

      reverseButtons: true,

      focusCancel: true,

      confirmButtonColor: "#dc2626",

      cancelButtonColor: "#64748b",

      buttonsStyling: true,
    });

    if (!resultado.isConfirmed) {
      return;
    }

    // =================================================
    // ELIMINANDO
    // =================================================

    try {
      setEliminando(empleado.id);

      const token =
        localStorage.getItem("token");

      if (!token) {
        Swal.fire({
          icon: "warning",
          title: "Sesión expirada",
          text: "No hay una sesión activa. Inicia sesión nuevamente.",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#241ba6",
        });

        return;
      }

      // =================================================
      // DELETE
      // =================================================

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/empleado/${empleado.id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      // =================================================
      // ACTUALIZAR LISTADO
      // =================================================

      setEmpleados((prev) =>
        prev.filter(
          (item) => item.id !== empleado.id
        )
      );

      // =================================================
      // ALERT ÉXITO
      // =================================================

      await Swal.fire({
        icon: "success",
        title: "Empleado eliminado",
        text: `${nombreEmpleado} fue eliminado correctamente.`,
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#241ba6",
        timer: 2200,
        timerProgressBar: true,
      });

    } catch (error) {
      console.error(
        "Error al eliminar empleado:",
        error
      );

      const mensaje =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "No se pudo eliminar el empleado.";

      Swal.fire({
        icon: "error",
        title: "No se pudo eliminar",
        text: mensaje,
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#241ba6",
      });

    } finally {
      setEliminando(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (cargando) {
    return (
      <div className="vt-page">
        <Loading mensaje="Cargando empleados..." />
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="vt-page">

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
              Listado de empleados
            </h1>

          </div>

          <button
            type="button"
            className="vt-btn-primary"
            onClick={abrirModal}
          >
            <Plus
              size={16}
              strokeWidth={2.5}
            />

            Nuevo empleado
          </button>

        </div>

        {/* =================================================
            LISTADO VACÍO
        ================================================= */}

        {empleados.length === 0 ? (

          <div className="vt-empty">

            <div className="vt-empty-icon">
              <UserRound size={26} />
            </div>

            <h4>
              No hay empleados registrados
            </h4>

            <p>
              Crea el primer empleado para verlo aquí.
            </p>

            <button
              type="button"
              className="vt-btn-primary"
              onClick={abrirModal}
            >
              <Plus
                size={16}
                strokeWidth={2.5}
              />

              Nuevo empleado
            </button>

          </div>

        ) : (

          /* =================================================
             TABLA
          ================================================= */

          <div className="vt-table-card">

            <div className="vt-table-scroll">

              <table className="vt-table">

                <thead>

                  <tr>

                    <th>
                      Nombre empleado
                    </th>

                    <th>
                      RUT
                    </th>

                    <th>
                      Cargo
                    </th>

                    <th>
                      Email / Usuario
                    </th>


                    <th>
                      Estado
                    </th>

                    <th className="vt-th-actions">
                      Acciones
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {empleados.map(
                    (empleado) => (

                      <tr
                        key={empleado.id}
                        className="vt-row"
                      >


                        <td className="vt-td-strong">

                          {empleado.nombres}{" "}

                          {empleado.apellido_paterno}{" "}

                          {empleado.apellido_materno ||
                            ""}

                        </td>

                        <td className="vt-td-muted">
                          {empleado.rut || "-"}
                        </td>

                        <td>
                          {empleado.cargo || "-"}
                        </td>

                        <td className="vt-td-muted">
                          {empleado.email || "-"}
                        </td>


                        <td>

                          <span
                            className={
                              empleado.activo
                                ? "vt-status-active"
                                : "vt-status-inactive"
                            }
                          >

                            {empleado.activo
                              ? "Activo"
                              : "Inactivo"}

                          </span>

                        </td>

                        <td className="vt-actions-cell">

                          <div className="vt-actions">

                            {/* =========================
                                VER
                            ========================= */}

                            <button
                              type="button"
                              className="vt-icon-btn"
                              title="Ver empleado"
                              onClick={() =>
                                navigate(
                                  `/empleados/ver/${empleado.id}`
                                )
                              }
                              disabled={
                                eliminando ===
                                empleado.id
                              }
                            >
                              <Eye size={15} />
                            </button>

                            {/* =========================
                                EDITAR
                            ========================= */}

                            <button
                              type="button"
                              className="vt-icon-btn vt-icon-btn-accent"
                              title="Editar empleado"
                              onClick={() =>
                                navigate(
                                  `/empleados/editar/${empleado.id}`
                                )
                              }
                              disabled={
                                eliminando ===
                                empleado.id
                              }
                            >
                              <PenLine size={15} />
                            </button>

                            {/* =========================
                                ELIMINAR
                            ========================= */}

                            <button
                              type="button"
                              className="vt-icon-btn vt-icon-btn-danger"
                              title="Eliminar empleado"
                              onClick={() =>
                                eliminarEmpleado(
                                  empleado
                                )
                              }
                              disabled={
                                eliminando ===
                                empleado.id
                              }
                            >

                              {eliminando ===
                              empleado.id ? (
                                <span className="vt-delete-loading">
                                  ...
                                </span>
                              ) : (
                                <Trash2
                                  size={15}
                                />
                              )}

                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>

      {/* =================================================
          MODAL
      ================================================= */}

      {modalOpen && (

        <div
          className="vt-modal-overlay"
          onClick={cerrarModal}
        >

          <div
            className="vt-modal-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="vt-modal-header">

              <div>

                <div className="vt-eyebrow-small">
                  GESTIÓN DE PERSONAL
                </div>

                <h2 className="vt-modal-title">
                  Nuevo empleado
                </h2>

              </div>

              <button
                type="button"
                onClick={cerrarModal}
                className="vt-modal-close"
                disabled={guardando}
              >
                <X size={20} />
              </button>

            </div>

            {/* =================================================
                FORMULARIO
            ================================================= */}

            <form
              onSubmit={guardarEmpleado}
            >

              <div className="vt-modal-body">

                {/* =================================================
                    INFORMACIÓN PERSONAL
                ================================================= */}

                <div className="vt-form-section">

                  <div className="vt-form-section-title">
                    Información personal
                  </div>

                  <div className="vt-form-grid">

                    {/* RUT */}

                    <div className="vt-form-field">

                      <label className="vt-form-label">
                        RUT *
                      </label>

                      <input
                        type="text"
                        name="rut"
                        value={
                          formulario.rut
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="12.345.678-9"
                        className="vt-form-input"
                        required
                        disabled={
                          guardando
                        }
                      />

                    </div>

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
                        disabled={
                          guardando
                        }
                      />

                    </div>

                    {/* APELLIDO PATERNO */}

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
                        disabled={
                          guardando
                        }
                      />

                    </div>

                    {/* APELLIDO MATERNO */}

                    <div className="vt-form-field">

                      <label className="vt-form-label">
                        Apellido materno
                      </label>

                      <input
                        type="text"
                        name="apellido_materno"
                        value={
                          formulario.apellido_materno
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="González"
                        className="vt-form-input"
                        disabled={
                          guardando
                        }
                      />

                    </div>

                    {/* TELÉFONO */}

                    <div className="vt-form-field">

                      <label className="vt-form-label">
                        Teléfono
                      </label>

                      <input
                        type="tel"
                        name="telefono"
                        value={
                          formulario.telefono
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="+56 9 1234 5678"
                        className="vt-form-input"
                        disabled={
                          guardando
                        }
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
                        disabled={
                          guardando
                        }
                      />

                    </div>

                    {/* DIRECCIÓN */}

                    <div className="vt-form-field vt-form-field-full">

                      <label className="vt-form-label">
                        Dirección
                      </label>

                      <input
                        type="text"
                        name="direccion"
                        value={
                          formulario.direccion
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Dirección del empleado"
                        className="vt-form-input"
                        disabled={
                          guardando
                        }
                      />

                    </div>

                  </div>

                </div>

                {/* =================================================
                    ACCESO AL SISTEMA
                ================================================= */}

                <div className="vt-form-section">

                  <div className="vt-form-section-title">
                    Acceso al sistema
                  </div>

                  <label className="vt-user-toggle">

                    <input
                      type="checkbox"
                      name="crear_usuario"
                      checked={
                        formulario.crear_usuario
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        guardando
                      }
                    />

                    <div>

                      <strong>
                        Crear usuario para este empleado
                      </strong>

                      <span>
                        El acceso al sistema es opcional.
                        Puedes crearlo ahora o posteriormente.
                      </span>

                    </div>

                  </label>

                  {/* CAMPOS USUARIO */}

                  {formulario.crear_usuario && (

                    <div className="vt-form-grid">

                      {/* EMAIL */}

                      <div className="vt-form-field">

                        <label className="vt-form-label">
                          Email / Usuario *
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
                          required={
                            formulario.crear_usuario
                          }
                          disabled={
                            guardando
                          }
                        />

                      </div>

                      {/* PASSWORD */}

                      <div className="vt-form-field">

                        <label className="vt-form-label">
                          Contraseña *
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
                            placeholder="Contraseña inicial"
                            className="vt-form-input"
                            minLength={6}
                            required={
                              formulario.crear_usuario
                            }
                            disabled={
                              guardando
                            }
                          />

                          <button
                            type="button"
                            className="vt-password-toggle"
                            onClick={() =>
                              setMostrarPassword(
                                (prev) =>
                                  !prev
                              )
                            }
                            disabled={
                              guardando
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
                          Mínimo 6 caracteres.
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
                          required={
                            formulario.crear_usuario
                          }
                          disabled={
                            guardando
                          }
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

                    </div>

                  )}

                </div>

              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="vt-modal-actions">

                <button
                  type="button"
                  onClick={cerrarModal}
                  className="vt-btn-ghost"
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="vt-btn-primary"
                  disabled={guardando}
                >

                  <Plus size={16} />

                  {guardando
                    ? "Guardando..."
                    : "Guardar empleado"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default ListarEmpleados;