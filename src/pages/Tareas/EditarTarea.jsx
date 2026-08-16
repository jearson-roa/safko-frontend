import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import Loading from "../../components/Loading";
import "./EditarTarea.css";

// =========================================================
// ESTADO INICIAL
// =========================================================

const initialFormState = {
  cliente_id: "",

  supervisor_id: "",
  tecnico_id: "",

  fecha_inicio: "",
  fecha_termino: "",

  titulo: "",

  tipo_actividad_rutina: false,

  nombre_contacto: "",
  telefono_contacto: "",

  direccion_trabajo: "",
  descripcion_trabajo: "",
  observaciones: "",
};

// =========================================================
// CONVERTIR FECHA A DATETIME-LOCAL
// =========================================================

function convertirFechaLocal(fecha) {
  if (!fecha) {
    return "";
  }

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  const hours = String(
    date.getHours()
  ).padStart(2, "0");

  const minutes = String(
    date.getMinutes()
  ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// =========================================================
// OBTENER ID DEL EMPLEADO
// =========================================================

function obtenerIdEmpleado(empleado) {
  if (!empleado) {
    return "";
  }

  return (
    empleado.id ||
    empleado.id_empleado ||
    empleado.empleado_id ||
    ""
  );
}

// =========================================================
// COMPONENTE
// =========================================================

function EditarTarea() {
  const { id } = useParams();
  const navigate = useNavigate();

  // =======================================================
  // ESTADOS
  // =======================================================

  const [formData, setFormData] =
    useState(initialFormState);

  const [clientes, setClientes] =
    useState([]);

  const [empleados, setEmpleados] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [errorCarga, setErrorCarga] =
    useState(null);

  // =======================================================
  // URL API
  // =======================================================

  const API_URL =
    import.meta.env.VITE_API_URL;

  // =======================================================
  // ALERTA
  // =======================================================

  const mostrarAlerta = async ({
    title,
    text,
    icon,
  }) => {
    if (window.Swal) {
      await window.Swal.fire({
        title,
        text,
        icon,
      });
    } else {
      window.alert(
        `${title}\n\n${text}`
      );
    }
  };

  // =======================================================
  // CARGAR DATOS
  // =======================================================

  useEffect(() => {
    cargarDatos();
  }, [id]);

  // =======================================================
  // CARGAR TODO
  // =======================================================

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setErrorCarga(null);

      const token =
        localStorage.getItem("token");

      if (!token) {
        setErrorCarga(
          "No hay una sesión activa. Inicia sesión nuevamente."
        );

        return;
      }

      const headers = {
        Authorization:
          `Bearer ${token}`,
      };

      const [
        tareaResponse,
        clientesResponse,
        empleadosResponse,
      ] = await Promise.all([
        axios.get(
          `${API_URL}/api/tareas/${id}`,
          {
            headers,
          }
        ),

        axios.get(
          `${API_URL}/api/clientes`,
          {
            headers,
          }
        ),

        axios.get(
          `${API_URL}/api/empleado`,
          {
            headers,
          }
        ),
      ]);

      // ===================================================
      // TAREA
      // ===================================================

      const dataTarea =
        tareaResponse.data;

      const tarea =
        dataTarea?.tarea ||
        dataTarea?.data ||
        dataTarea;

      if (!tarea) {
        throw new Error(
          "No se encontró la tarea."
        );
      }

      // ===================================================
      // CLIENTES
      // ===================================================

      const datosClientes =
        Array.isArray(
          clientesResponse.data
        )
          ? clientesResponse.data
          : clientesResponse.data?.clientes ||
            clientesResponse.data?.data ||
            [];

      // ===================================================
      // EMPLEADOS
      // ===================================================

      const datosEmpleados =
        Array.isArray(
          empleadosResponse.data
        )
          ? empleadosResponse.data
          : empleadosResponse.data?.empleados ||
            empleadosResponse.data?.data ||
            [];

      setClientes(
        Array.isArray(datosClientes)
          ? datosClientes
          : []
      );

      setEmpleados(
        Array.isArray(datosEmpleados)
          ? datosEmpleados
          : []
      );

      // ===================================================
      // OBTENER SUPERVISOR
      // ===================================================

      const supervisorId =
        tarea.supervisor_id ||
        tarea.id_supervisor ||
        tarea.supervisor?.id ||
        tarea.supervisor?.id_empleado ||
        "";

      // ===================================================
      // OBTENER TÉCNICO
      // ===================================================

      const tecnicoId =
        tarea.tecnico_id ||
        tarea.id_tecnico ||
        tarea.tecnico?.id ||
        tarea.tecnico?.id_empleado ||
        "";

      // ===================================================
      // CARGAR FORMULARIO
      // ===================================================

      setFormData({
        cliente_id:
          tarea.cliente_id
            ? String(
                tarea.cliente_id
              )
            : "",

        supervisor_id:
          supervisorId
            ? String(
                supervisorId
              )
            : "",

        tecnico_id:
          tecnicoId
            ? String(
                tecnicoId
              )
            : "",

        fecha_inicio:
          convertirFechaLocal(
            tarea.fecha_inicio
          ),

        fecha_termino:
          convertirFechaLocal(
            tarea.fecha_termino
          ),

        titulo:
          tarea.titulo || "",

        tipo_actividad_rutina:
          Boolean(
            tarea.tipo_actividad_rutina
          ),

        nombre_contacto:
          tarea.nombre_contacto ||
          "",

        telefono_contacto:
          tarea.telefono_contacto ||
          "",

        direccion_trabajo:
          tarea.direccion_trabajo ||
          "",

        descripcion_trabajo:
          tarea.descripcion_trabajo ||
          "",

        observaciones:
          tarea.observaciones ||
          "",
      });
    } catch (error) {
      let mensaje =
        "No se pudo cargar la información de la tarea.";

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        mensaje =
          "Tu sesión expiró o no tienes permisos para realizar esta acción.";
      } else if (
        error.response?.status === 404
      ) {
        mensaje =
          "La tarea que intentas editar no existe.";
      } else if (
        error.response?.data?.mensaje
      ) {
        mensaje =
          error.response.data.mensaje;
      }

      setErrorCarga(mensaje);
    } finally {
      setCargando(false);
    }
  };

  // =======================================================
  // HANDLE CHANGE
  // =======================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =======================================================
  // ACTIVIDAD RUTINA
  // =======================================================

  const handleActividadRutinaChange = (
    e
  ) => {
    const value =
      e.target.value === "true";

    setFormData((prev) => ({
      ...prev,
      tipo_actividad_rutina:
        value,
    }));
  };

  // =======================================================
  // VALIDACIONES
  // =======================================================

  const validarFormulario = async () => {
    if (!formData.cliente_id) {
      await mostrarAlerta({
        title: "Cliente requerido",
        text:
          "Debes seleccionar un cliente.",
        icon: "warning",
      });

      return false;
    }

    if (!formData.titulo.trim()) {
      await mostrarAlerta({
        title: "Título requerido",
        text:
          "Debes ingresar el título de la tarea.",
        icon: "warning",
      });

      return false;
    }

    if (!formData.direccion_trabajo.trim()) {
      await mostrarAlerta({
        title: "Dirección requerida",
        text:
          "Debes ingresar la dirección donde se realizará el trabajo.",
        icon: "warning",
      });

      return false;
    }

    if (!formData.supervisor_id) {
      await mostrarAlerta({
        title: "Supervisor requerido",
        text:
          "Debes seleccionar un supervisor responsable.",
        icon: "warning",
      });

      return false;
    }

    if (!formData.tecnico_id) {
      await mostrarAlerta({
        title: "Técnico requerido",
        text:
          "Debes seleccionar un técnico de terreno.",
        icon: "warning",
      });

      return false;
    }

    if (!formData.fecha_inicio) {
      await mostrarAlerta({
        title:
          "Fecha de inicio requerida",
        text:
          "Debes indicar la fecha y hora de inicio.",
        icon: "warning",
      });

      return false;
    }

    if (!formData.fecha_termino) {
      await mostrarAlerta({
        title:
          "Fecha de término requerida",
        text:
          "Debes indicar la fecha y hora de término.",
        icon: "warning",
      });

      return false;
    }

    const inicio =
      new Date(
        formData.fecha_inicio
      );

    const termino =
      new Date(
        formData.fecha_termino
      );

    if (
      Number.isNaN(
        inicio.getTime()
      ) ||
      Number.isNaN(
        termino.getTime()
      )
    ) {
      await mostrarAlerta({
        title: "Fechas inválidas",
        text:
          "Las fechas proporcionadas no son válidas.",
        icon: "warning",
      });

      return false;
    }

    if (termino <= inicio) {
      await mostrarAlerta({
        title: "Fechas inválidas",
        text:
          "La fecha y hora de término debe ser posterior a la fecha y hora de inicio.",
        icon: "warning",
      });

      return false;
    }

    if (
      !formData.descripcion_trabajo.trim()
    ) {
      await mostrarAlerta({
        title:
          "Descripción requerida",
        text:
          "Debes ingresar una descripción del trabajo.",
        icon: "warning",
      });

      return false;
    }

    return true;
  };

  // =======================================================
  // GUARDAR CAMBIOS
  // =======================================================

  const guardarCambios = async (e) => {
    e.preventDefault();

    if (guardando) {
      return;
    }

    const valido =
      await validarFormulario();

    if (!valido) {
      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      await mostrarAlerta({
        title: "Sesión expirada",
        text:
          "No hay una sesión activa. Inicia sesión nuevamente.",
        icon: "warning",
      });

      return;
    }

    // ===================================================
    // DATOS
    // ===================================================

    const datosTarea = {
      cliente_id:
        Number(formData.cliente_id),

      supervisor_id:
        Number(formData.supervisor_id),

      tecnico_id:
        Number(formData.tecnico_id),

      fecha_inicio:
        formData.fecha_inicio,

      fecha_termino:
        formData.fecha_termino,

      titulo:
        formData.titulo.trim(),

      tipo_actividad_rutina:
        Boolean(
          formData.tipo_actividad_rutina
        ),

      nombre_contacto:
        formData.nombre_contacto.trim() ||
        null,

      telefono_contacto:
        formData.telefono_contacto.trim() ||
        null,

      direccion_trabajo:
        formData.direccion_trabajo.trim(),

      descripcion_trabajo:
        formData.descripcion_trabajo.trim(),

      observaciones:
        formData.observaciones.trim() ||
        null,
    };

    try {
      setGuardando(true);

      const response =
        await axios.put(
          `${API_URL}/api/tareas/${id}`,
          datosTarea,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );

      if (window.Swal) {
        await window.Swal.fire({
          title:
            "¡Tarea actualizada!",
          text:
            "Los cambios fueron guardados correctamente.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        window.alert(
          "Tarea actualizada correctamente."
        );
      }

      navigate(
        `/tareas/ver_tarea/${id}`
      );
    } catch (error) {
      let mensaje =
        "No fue posible actualizar la tarea.";

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        mensaje =
          "Tu sesión expiró o no tienes permisos para modificar esta tarea.";
      } else if (
        error.response?.status === 404
      ) {
        mensaje =
          "La tarea que intentas modificar no existe.";
      } else if (
        error.response?.data?.mensaje
      ) {
        mensaje =
          error.response.data.mensaje;
      } else if (
        error.response?.data?.message
      ) {
        mensaje =
          error.response.data.message;
      } else if (
        error.response?.data?.error
      ) {
        mensaje =
          error.response.data.error;
      }

      if (window.Swal) {
        await window.Swal.fire({
          title:
            "Error al actualizar",
          text: mensaje,
          icon: "error",
        });
      } else {
        window.alert(mensaje);
      }
    } finally {
      setGuardando(false);
    }
  };

  // =======================================================
  // CARGANDO
  // =======================================================

  if (cargando) {
    return (
      <div className="vt-page">
        <Loading
          mensaje="Cargando tarea..."
        />
      </div>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (errorCarga) {
    return (
      <div className="vt-page">
        <div className="vt-wrap">

          <div className="vt-center-state">

            <div className="vt-center-icon vt-error-icon">
              <span>⚠️</span>
            </div>

            <h4 className="vt-center-title">
              No se pudo cargar la tarea
            </h4>

            <p className="vt-center-text">
              {errorCarga}
            </p>

            <div className="vt-actions">

              <button
                type="button"
                className="vt-btn-primary"
                onClick={cargarDatos}
              >
                Reintentar
              </button>

              <button
                type="button"
                className="vt-btn-ghost"
                onClick={() =>
                  navigate(-1)
                }
              >
                Volver
              </button>

            </div>

          </div>

        </div>
      </div>
    );
  }

  // =======================================================
  // SUPERVISORES
  // =======================================================

  const supervisores =
    empleados.filter(
      (empleado) => {
        const cargo =
          empleado.cargo
            ?.toLowerCase()
            .trim() || "";

        return cargo.includes(
          "supervisor"
        );
      }
    );

  // =======================================================
  // TÉCNICOS
  // =======================================================

  const tecnicos =
    empleados.filter(
      (empleado) => {
        const cargo =
          empleado.cargo
            ?.toLowerCase()
            .trim() || "";

        return !cargo.includes(
          "supervisor"
        );
      }
    );

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="vt-page">

      <div className="vt-wrap">

        {/* =================================================
            VOLVER
        ================================================= */}

        <button
          type="button"
          className="vt-back"
          onClick={() => navigate(-1)}
          disabled={guardando}
        >
          ← Volver
        </button>

        {/* =================================================
            CONTENEDOR
        ================================================= */}

        <div className="vt-ticket">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="vt-ticket-header">

            <div>

              <div className="vt-eyebrow">
                EDITAR ORDEN DE TRABAJO
              </div>

              <h1 className="vt-title">
                Modificar tarea
              </h1>

            </div>

          </div>

          {/* =================================================
              FORMULARIO
          ================================================= */}

          <form
            onSubmit={guardarCambios}
          >

            <div className="vt-modal-body">

              {/* =================================================
                  INFORMACIÓN GENERAL
              ================================================= */}

              <div className="vt-form-section">

                <div className="vt-form-section-title">
                  Información general
                </div>

                <div className="row">

                  {/* CLIENTE */}

                  <div className="col-md-6 mb-3">

                    <label className="vt-form-label">
                      Cliente *
                    </label>

                    <select
                      className="form-select"
                      name="cliente_id"
                      value={
                        formData.cliente_id
                      }
                      onChange={
                        handleChange
                      }
                      required
                      disabled={guardando}
                    >

                      <option value="">
                        Seleccione un cliente
                      </option>

                      {clientes.map(
                        (cliente) => (
                          <option
                            key={
                              cliente.id_cliente
                            }
                            value={
                              cliente.id_cliente
                            }
                          >
                            {
                              cliente.razon_social ||
                              cliente.nombre ||
                              "Cliente"
                            }
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  {/* TÍTULO */}

                  <div className="col-md-6 mb-3">

                    <label className="vt-form-label">
                      Título de la tarea *
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="titulo"
                      value={
                        formData.titulo
                      }
                      onChange={
                        handleChange
                      }
                      required
                      disabled={guardando}
                      maxLength="150"
                      placeholder="Ej: Mantención de sistema de seguridad"
                    />

                  </div>

                  {/* ACTIVIDAD RUTINA */}

                  <div className="col-md-6 mb-3">

                    <label className="vt-form-label">
                      ¿Actividad de rutina? *
                    </label>

                    <select
                      className="form-select"
                      name="tipo_actividad_rutina"
                      value={String(
                        formData.tipo_actividad_rutina
                      )}
                      onChange={
                        handleActividadRutinaChange
                      }
                      required
                      disabled={guardando}
                    >

                      <option value="false">
                        No
                      </option>

                      <option value="true">
                        Sí
                      </option>

                    </select>

                    <small className="vt-form-help">
                      Indica si corresponde a una
                      actividad rutinaria o programada.
                    </small>

                  </div>

                  {/* DIRECCIÓN */}

                  <div className="col-md-12 mb-3">

                    <label className="vt-form-label">
                      Dirección de obras *
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="direccion_trabajo"
                      value={
                        formData.direccion_trabajo
                      }
                      onChange={
                        handleChange
                      }
                      required
                      disabled={guardando}
                      maxLength="255"
                      placeholder="Dirección donde se realizará el trabajo"
                    />

                  </div>

                </div>

              </div>

              {/* =================================================
                  CONTACTO
              ================================================= */}

              <div className="vt-form-section">

                <div className="vt-form-section-title">
                  Contacto en terreno
                </div>

                <div className="row">

                  <div className="col-md-6 mb-3">

                    <label className="vt-form-label">
                      Nombre de contacto
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="nombre_contacto"
                      value={
                        formData.nombre_contacto
                      }
                      onChange={
                        handleChange
                      }
                      disabled={guardando}
                      maxLength="100"
                      placeholder="Nombre del contacto"
                    />

                  </div>

                  <div className="col-md-6 mb-3">

                    <label className="vt-form-label">
                      Teléfono de contacto
                    </label>

                    <input
                      type="tel"
                      className="form-control"
                      name="telefono_contacto"
                      value={
                        formData.telefono_contacto
                      }
                      onChange={
                        handleChange
                      }
                      disabled={guardando}
                      maxLength="20"
                      placeholder="+56 9 XXXX XXXX"
                    />

                  </div>

                </div>

              </div>

              {/* =================================================
                  PROGRAMACIÓN
              ================================================= */}

              <div className="vt-form-section">

                <div className="vt-form-section-title">
                  Programación de la tarea
                </div>

                <div className="row">

                  <div className="col-md-6 mb-3">

                    <label className="vt-form-label">
                      Fecha y hora de inicio *
                    </label>

                    <input
                      type="datetime-local"
                      className="form-control"
                      name="fecha_inicio"
                      value={
                        formData.fecha_inicio
                      }
                      onChange={
                        handleChange
                      }
                      required
                      disabled={guardando}
                    />

                  </div>

                  <div className="col-md-6 mb-3">

                    <label className="vt-form-label">
                      Fecha y hora de término *
                    </label>

                    <input
                      type="datetime-local"
                      className="form-control"
                      name="fecha_termino"
                      value={
                        formData.fecha_termino
                      }
                      onChange={
                        handleChange
                      }
                      required
                      disabled={guardando}
                    />

                  </div>

                </div>

              </div>

              {/* =================================================
                  PERSONAL
              ================================================= */}

              <div className="vt-form-section">

                <div className="vt-form-section-title">
                  Personal asignado
                </div>

                {/* SUPERVISOR */}

                <div className="mb-3">

                  <label className="vt-form-label">
                    Responsable / Supervisor *
                  </label>

                  <select
                    className="form-select"
                    name="supervisor_id"
                    value={
                      formData.supervisor_id
                    }
                    onChange={
                      handleChange
                    }
                    required
                    disabled={guardando}
                  >

                    <option value="">
                      Seleccione supervisor
                    </option>

                    {supervisores.map(
                      (empleado) => {

                        const empleadoId =
                          obtenerIdEmpleado(
                            empleado
                          );

                        return (
                          <option
                            key={
                              empleadoId
                            }
                            value={
                              empleadoId
                            }
                          >

                            {empleado.nombres || ""}{" "}
                            {empleado.apellido_paterno || ""}{" "}
                            {empleado.apellido_materno || ""}
                            {" — "}
                            {empleado.cargo ||
                              "Supervisor"}

                          </option>
                        );
                      }
                    )}

                  </select>

                  <small className="vt-form-help">
                    Responsable de supervisar la
                    ejecución de la orden.
                  </small>

                </div>

                {/* TÉCNICO */}

                <div className="mb-3">

                  <label className="vt-form-label">
                    Técnico de terreno *
                  </label>

                  <select
                    className="form-select"
                    name="tecnico_id"
                    value={
                      formData.tecnico_id
                    }
                    onChange={
                      handleChange
                    }
                    required
                    disabled={guardando}
                  >

                    <option value="">
                      Seleccione técnico de terreno
                    </option>

                    {tecnicos.map(
                      (empleado) => {

                        const empleadoId =
                          obtenerIdEmpleado(
                            empleado
                          );

                        return (
                          <option
                            key={
                              empleadoId
                            }
                            value={
                              empleadoId
                            }
                          >

                            {empleado.nombres || ""}{" "}
                            {empleado.apellido_paterno || ""}{" "}
                            {empleado.apellido_materno || ""}
                            {" — "}
                            {empleado.cargo ||
                              "Técnico"}

                          </option>
                        );
                      }
                    )}

                  </select>

                  <small className="vt-form-help">
                    Técnico responsable de ejecutar
                    la tarea en terreno.
                  </small>

                </div>

              </div>

              {/* =================================================
                  DETALLE
              ================================================= */}

              <div className="vt-form-section">

                <div className="vt-form-section-title">
                  Detalle del trabajo
                </div>

                <div className="mb-3">

                  <label className="vt-form-label">
                    Descripción del trabajo *
                  </label>

                  <textarea
                    className="form-control"
                    rows="4"
                    name="descripcion_trabajo"
                    value={
                      formData.descripcion_trabajo
                    }
                    onChange={
                      handleChange
                    }
                    required
                    disabled={guardando}
                    placeholder="Describa detalladamente el trabajo..."
                  />

                </div>

                <div className="mb-3">

                  <label className="vt-form-label">
                    Observaciones
                  </label>

                  <textarea
                    className="form-control"
                    rows="3"
                    name="observaciones"
                    value={
                      formData.observaciones
                    }
                    onChange={
                      handleChange
                    }
                    disabled={guardando}
                    placeholder="Información adicional, restricciones o indicaciones..."
                  />

                </div>

              </div>

            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="vt-modal-footer">

              <button
                type="button"
                className="vt-btn-ghost"
                onClick={() =>
                  navigate(-1)
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

                {guardando
                  ? "Guardando cambios..."
                  : "Guardar cambios"}

              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

export default EditarTarea;