import { useState } from "react";
import axios from "axios";

import "./ModalTarea.css";

// =========================================================
// ESTADO INICIAL
// =========================================================

const initialFormState = {
  // Cliente
  cliente_id: "",

  // Personal asignado
  supervisor_id: "",
  tecnico_id: "",

  // Programación
  fecha_inicio: "",
  fecha_termino: "",

  // Información OT
  titulo: "",
  tipo_actividad_rutina: false,

  // Contacto
  nombre_contacto: "",
  telefono_contacto: "",

  // Trabajo
  direccion_trabajo: "",
  descripcion_trabajo: "",
  observaciones: "",
};

// =========================================================
// COMPONENTE
// =========================================================

function ModalTarea({
  open,
  onClose,
  clientes = [],
  empleados = [],
  onSuccess,
}) {
  const [formData, setFormData] =
    useState(initialFormState);

  const [guardando, setGuardando] =
    useState(false);

  // =======================================================
  // MOSTRAR ALERTA
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
      alert(`${title}\n\n${text}`);
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
  // HANDLE ACTIVIDAD RUTINA
  // =======================================================

  const handleActividadRutinaChange = (e) => {
    const value =
      e.target.value === "true";

    setFormData((prev) => ({
      ...prev,
      tipo_actividad_rutina: value,
    }));
  };

  // =======================================================
  // CERRAR MODAL
  // =======================================================

  const cerrarModal = () => {
    if (guardando) {
      return;
    }

    setFormData(initialFormState);

    onClose();
  };

  // =======================================================
  // GUARDAR TAREA
  // =======================================================

  const guardarTarea = async (e) => {
    e.preventDefault();

    if (guardando) {
      return;
    }

    // =====================================================
    // VALIDAR CLIENTE
    // =====================================================

    if (!formData.cliente_id) {
      await mostrarAlerta({
        title: "Cliente requerido",
        text: "Debes seleccionar un cliente.",
        icon: "warning",
      });

      return;
    }

    // =====================================================
    // VALIDAR TÍTULO
    // =====================================================

    if (!formData.titulo.trim()) {
      await mostrarAlerta({
        title: "Título requerido",
        text: "Debes ingresar el título de la tarea.",
        icon: "warning",
      });

      return;
    }

    // =====================================================
    // VALIDAR DIRECCIÓN
    // =====================================================

    if (!formData.direccion_trabajo.trim()) {
      await mostrarAlerta({
        title: "Dirección requerida",
        text:
          "Debes ingresar la dirección donde se realizará el trabajo.",
        icon: "warning",
      });

      return;
    }

    // =====================================================
    // VALIDAR SUPERVISOR
    // =====================================================

    if (!formData.supervisor_id) {
      await mostrarAlerta({
        title: "Supervisor requerido",
        text:
          "Debes seleccionar un supervisor responsable.",
        icon: "warning",
      });

      return;
    }

    // =====================================================
    // VALIDAR TÉCNICO
    // =====================================================

    if (!formData.tecnico_id) {
      await mostrarAlerta({
        title: "Técnico requerido",
        text:
          "Debes seleccionar un técnico de terreno.",
        icon: "warning",
      });

      return;
    }

    // =====================================================
    // VALIDAR FECHA INICIO
    // =====================================================

    if (!formData.fecha_inicio) {
      await mostrarAlerta({
        title: "Fecha de inicio requerida",
        text:
          "Debes indicar la fecha y hora de inicio.",
        icon: "warning",
      });

      return;
    }

    // =====================================================
    // VALIDAR FECHA TÉRMINO
    // =====================================================

    if (!formData.fecha_termino) {
      await mostrarAlerta({
        title: "Fecha de término requerida",
        text:
          "Debes indicar la fecha y hora de término.",
        icon: "warning",
      });

      return;
    }

    // =====================================================
    // VALIDAR FECHAS
    // =====================================================

    const inicio =
      new Date(formData.fecha_inicio);

    const termino =
      new Date(formData.fecha_termino);

    if (
      Number.isNaN(inicio.getTime()) ||
      Number.isNaN(termino.getTime())
    ) {
      await mostrarAlerta({
        title: "Fechas inválidas",
        text:
          "Las fechas proporcionadas no son válidas.",
        icon: "warning",
      });

      return;
    }

    if (termino <= inicio) {
      await mostrarAlerta({
        title: "Fechas inválidas",
        text:
          "La fecha y hora de término debe ser posterior a la fecha y hora de inicio.",
        icon: "warning",
      });

      return;
    }

    // =====================================================
    // VALIDAR DESCRIPCIÓN
    // =====================================================

    if (!formData.descripcion_trabajo.trim()) {
      await mostrarAlerta({
        title: "Descripción requerida",
        text:
          "Debes ingresar una descripción del trabajo.",
        icon: "warning",
      });

      return;
    }

    // =====================================================
    // TOKEN
    // =====================================================

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

    // =====================================================
    // URL API
    // =====================================================

    const API_URL =
      import.meta.env.VITE_API_URL;

    if (!API_URL) {
      await mostrarAlerta({
        title: "Error de configuración",
        text:
          "No se pudo configurar la conexión con el servidor.",
        icon: "error",
      });

      return;
    }

    // =====================================================
    // PREPARAR DATOS
    // =====================================================
    //
    // IMPORTANTE:
    //
    // Tu tabla tareas tiene:
    //
    // fecha_asignacion
    // fecha_termino
    // act_rutina
    //
    // NO tiene:
    //
    // fecha_inicio
    // tipo_actividad_rutina
    //
    // Por eso se transforman aquí.
    //
    // =====================================================

    const datosTarea = {
      cliente_id:
        Number(formData.cliente_id),

      supervisor_id:
        Number(formData.supervisor_id),

      tecnico_id:
        Number(formData.tecnico_id),

      fecha_asignacion:
        inicio.toISOString(),

      fecha_termino:
        termino.toISOString(),

      titulo:
        formData.titulo.trim(),

      act_rutina:
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

    // =====================================================
    // GUARDAR
    // =====================================================

    try {
      setGuardando(true);

      const response =
        await axios.post(
          `${API_URL}/api/tareas`,
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

      // ===================================================
      // ÉXITO
      // ===================================================

      if (window.Swal) {
        await window.Swal.fire({
          title: "¡Tarea creada!",
          html: `
            <p>
              La orden de trabajo fue creada correctamente.
            </p>

            ${
              response.data?.numero_ot
                ? `
                  <strong>
                    ${response.data.numero_ot}
                  </strong>
                `
                : ""
            }
          `,
          icon: "success",
          timer: 2500,
          showConfirmButton: false,
        });
      } else {
        alert(
          `Tarea creada correctamente.${
            response.data?.numero_ot
              ? `\n\nOT: ${response.data.numero_ot}`
              : ""
          }`
        );
      }

      // ===================================================
      // LIMPIAR FORMULARIO
      // ===================================================

      setFormData(initialFormState);

      // ===================================================
      // CERRAR MODAL
      // ===================================================

      onClose();

      // ===================================================
      // ACTUALIZAR LISTADO
      // ===================================================

      if (onSuccess) {
        await onSuccess();
      }

    } catch (error) {
      // ===================================================
      // NO MOSTRAR INFORMACIÓN TÉCNICA EN PRODUCCIÓN
      // ===================================================
      //
      // NO hacemos:
      //
      // console.error(error)
      // console.log(error.config)
      // console.log(error.response)
      // console.log(datosTarea)
      // console.log(token)
      //
      // El usuario solamente recibe el mensaje necesario.
      //
      // ===================================================

      const status =
        error.response?.status;

      let mensaje =
        "No fue posible crear la tarea.";

      if (status === 400) {
        mensaje =
          error.response?.data?.mensaje ||
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Los datos enviados no son válidos.";
      }

      else if (status === 401) {
        mensaje =
          "Tu sesión ha expirado. Inicia sesión nuevamente.";
      }

      else if (status === 403) {
        mensaje =
          "No tienes permisos para crear tareas.";
      }

      else if (status === 409) {
        mensaje =
          error.response?.data?.mensaje ||
          error.response?.data?.message ||
          error.response?.data?.error ||
          "La tarea ya existe.";
      }

      else if (status >= 500) {
        mensaje =
          "Ocurrió un error interno del servidor. Inténtalo nuevamente.";
      }

      else if (error.request) {
        mensaje =
          "No se pudo conectar con el servidor. Verifica tu conexión.";
      }

      // ===================================================
      // MOSTRAR ERROR
      // ===================================================

      if (window.Swal) {
        await window.Swal.fire({
          title: "Error al crear tarea",
          text: mensaje,
          icon: "error",
        });
      } else {
        alert(mensaje);
      }

    } finally {
      setGuardando(false);
    }
  };

  // =========================================================
  // NO MOSTRAR
  // =========================================================

  if (!open) {
    return null;
  }

  // =========================================================
  // SUPERVISORES
  // =========================================================

  const supervisores =
    empleados.filter((empleado) => {
      const cargo =
        empleado.cargo
          ?.toLowerCase()
          .trim() || "";

      return cargo.includes("supervisor");
    });

  // =========================================================
  // TÉCNICOS
  // =========================================================

  const tecnicos =
    empleados.filter((empleado) => {
      const cargo =
        empleado.cargo
          ?.toLowerCase()
          .trim() || "";

      return !cargo.includes("supervisor");
    });

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      {/* =====================================================
          MODAL
      ===================================================== */}

      <div
        className="
          modal
          fade
          show
          vt-modal
        "
        style={{
          display: "block",
        }}
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="
            modal-dialog
            modal-lg
            modal-dialog-centered
          "
        >
          <div
            className="
              modal-content
              vt-modal-content
            "
          >

            {/* =================================================
                HEADER
            ================================================= */}

            <div
              className="
                modal-header
                vt-modal-header
              "
            >
              <div>

                <div
                  className="
                    vt-eyebrow-small
                  "
                >
                  NUEVA ORDEN DE TRABAJO
                </div>

                <h5
                  className="
                    modal-title
                    vt-modal-title
                  "
                >
                  Crear tarea
                </h5>

              </div>

              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar"
                onClick={cerrarModal}
                disabled={guardando}
              />
            </div>

            {/* =================================================
                FORMULARIO
            ================================================= */}

            <form onSubmit={guardarTarea}>

              <div
                className="
                  modal-body
                  vt-modal-body
                "
              >

                {/* =================================================
                    INFORMACIÓN GENERAL
                ================================================= */}

                <div
                  className="
                    vt-form-section
                  "
                >

                  <div
                    className="
                      vt-form-section-title
                    "
                  >
                    Información general
                  </div>

                  <div className="row">

                    {/* CLIENTE */}

                    <div
                      className="
                        col-md-6
                        mb-3
                      "
                    >

                      <label
                        className="
                          vt-form-label
                        "
                      >
                        Cliente *
                      </label>

                      <select
                        className="form-select"
                        name="cliente_id"
                        value={
                          formData.cliente_id
                        }
                        onChange={handleChange}
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
                                cliente.razon_social
                              }
                            </option>
                          )
                        )}

                      </select>

                    </div>

                    {/* TÍTULO */}

                    <div
                      className="
                        col-md-6
                        mb-3
                      "
                    >

                      <label
                        className="
                          vt-form-label
                        "
                      >
                        Título de la tarea *
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        name="titulo"
                        value={
                          formData.titulo
                        }
                        onChange={handleChange}
                        required
                        disabled={guardando}
                        maxLength="150"
                        placeholder="Ej: Mantención de tablero eléctrico"
                      />

                    </div>

                    {/* ACTIVIDAD RUTINA */}

                    <div
                      className="
                        col-md-6
                        mb-3
                      "
                    >

                      <label
                        className="
                          vt-form-label
                        "
                      >
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

                      <small
                        className="
                          vt-form-help
                        "
                      >
                        Indica si esta actividad
                        corresponde a una tarea
                        rutinaria o programada
                        periódicamente.
                      </small>

                    </div>

                    {/* DIRECCIÓN */}

                    <div
                      className="
                        col-md-12
                        mb-3
                      "
                    >

                      <label
                        className="
                          vt-form-label
                        "
                      >
                        Dirección de obras *
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        name="direccion_trabajo"
                        value={
                          formData.direccion_trabajo
                        }
                        onChange={handleChange}
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

                <div
                  className="
                    vt-form-section
                  "
                >

                  <div
                    className="
                      vt-form-section-title
                    "
                  >
                    Contacto en terreno
                  </div>

                  <div className="row">

                    {/* NOMBRE */}

                    <div
                      className="
                        col-md-6
                        mb-3
                      "
                    >

                      <label
                        className="
                          vt-form-label
                        "
                      >
                        Nombre de contacto
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        name="nombre_contacto"
                        value={
                          formData.nombre_contacto
                        }
                        onChange={handleChange}
                        disabled={guardando}
                        maxLength="100"
                        placeholder="Nombre del contacto"
                      />

                    </div>

                    {/* TELÉFONO */}

                    <div
                      className="
                        col-md-6
                        mb-3
                      "
                    >

                      <label
                        className="
                          vt-form-label
                        "
                      >
                        Teléfono de contacto
                      </label>

                      <input
                        type="tel"
                        className="form-control"
                        name="telefono_contacto"
                        value={
                          formData.telefono_contacto
                        }
                        onChange={handleChange}
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

                <div
                  className="
                    vt-form-section
                  "
                >

                  <div
                    className="
                      vt-form-section-title
                    "
                  >
                    Programación de la tarea
                  </div>

                  <div className="row">

                    {/* FECHA INICIO */}

                    <div
                      className="
                        col-md-6
                        mb-3
                      "
                    >

                      <label
                        className="
                          vt-form-label
                        "
                      >
                        Fecha y hora de inicio *
                      </label>

                      <input
                        type="datetime-local"
                        className="form-control"
                        name="fecha_inicio"
                        value={
                          formData.fecha_inicio
                        }
                        onChange={handleChange}
                        required
                        disabled={guardando}
                      />

                      <small
                        className="
                          vt-form-help
                        "
                      >
                        Inicio programado de la orden.
                      </small>

                    </div>

                    {/* FECHA TÉRMINO */}

                    <div
                      className="
                        col-md-6
                        mb-3
                      "
                    >

                      <label
                        className="
                          vt-form-label
                        "
                      >
                        Fecha y hora de término *
                      </label>

                      <input
                        type="datetime-local"
                        className="form-control"
                        name="fecha_termino"
                        value={
                          formData.fecha_termino
                        }
                        onChange={handleChange}
                        required
                        disabled={guardando}
                      />

                      <small
                        className="
                          vt-form-help
                        "
                      >
                        Término programado de la orden.
                      </small>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    PERSONAL
                ================================================= */}

                <div
                  className="
                    vt-form-section
                  "
                >

                  <div
                    className="
                      vt-form-section-title
                    "
                  >
                    Personal asignado
                  </div>

                  {/* SUPERVISOR */}

                  <div className="mb-3">

                    <label
                      className="
                        vt-form-label
                      "
                    >
                      Responsable / Supervisor *
                    </label>

                    <select
                      className="form-select"
                      name="supervisor_id"
                      value={
                        formData.supervisor_id
                      }
                      onChange={handleChange}
                      required
                      disabled={guardando}
                    >

                      <option value="">
                        Seleccione supervisor
                      </option>

                      {supervisores.map(
                        (empleado) => (
                          <option
                            key={empleado.id}
                            value={empleado.id}
                          >
                            {empleado.nombres}{" "}
                            {empleado.apellido_paterno || ""}{" "}
                            {empleado.apellido_materno || ""}
                            {" — "}
                            {empleado.cargo || "Supervisor"}
                          </option>
                        )
                      )}

                    </select>

                    <small
                      className="
                        vt-form-help
                      "
                    >
                      Responsable de supervisar la
                      ejecución de la orden de trabajo.
                    </small>

                  </div>

                  {/* TÉCNICO */}

                  <div className="mb-3">

                    <label
                      className="
                        vt-form-label
                      "
                    >
                      Técnico de terreno *
                    </label>

                    <select
                      className="form-select"
                      name="tecnico_id"
                      value={
                        formData.tecnico_id
                      }
                      onChange={handleChange}
                      required
                      disabled={guardando}
                    >

                      <option value="">
                        Seleccione técnico de terreno
                      </option>

                      {tecnicos.map(
                        (empleado) => (
                          <option
                            key={empleado.id}
                            value={empleado.id}
                          >
                            {empleado.nombres}{" "}
                            {empleado.apellido_paterno || ""}{" "}
                            {empleado.apellido_materno || ""}
                            {" — "}
                            {empleado.cargo || "Técnico"}
                          </option>
                        )
                      )}

                    </select>

                    <small
                      className="
                        vt-form-help
                      "
                    >
                      Técnico responsable de ejecutar
                      la tarea en terreno.
                    </small>

                  </div>

                </div>

                {/* =================================================
                    DETALLE DEL TRABAJO
                ================================================= */}

                <div
                  className="
                    vt-form-section
                  "
                >

                  <div
                    className="
                      vt-form-section-title
                    "
                  >
                    Detalle del trabajo
                  </div>

                  {/* DESCRIPCIÓN */}

                  <div className="mb-3">

                    <label
                      className="
                        vt-form-label
                      "
                    >
                      Descripción del trabajo *
                    </label>

                    <textarea
                      className="form-control"
                      rows="4"
                      name="descripcion_trabajo"
                      value={
                        formData.descripcion_trabajo
                      }
                      onChange={handleChange}
                      required
                      disabled={guardando}
                      placeholder="Describa detalladamente el trabajo que debe realizarse..."
                    />

                  </div>

                  {/* OBSERVACIONES */}

                  <div className="mb-3">

                    <label
                      className="
                        vt-form-label
                      "
                    >
                      Observaciones
                    </label>

                    <textarea
                      className="form-control"
                      rows="3"
                      name="observaciones"
                      value={
                        formData.observaciones
                      }
                      onChange={handleChange}
                      disabled={guardando}
                      placeholder="Información adicional, restricciones o indicaciones..."
                    />

                  </div>

                </div>

              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <div
                className="
                  modal-footer
                  vt-modal-footer
                "
              >

                <button
                  type="button"
                  className="vt-btn-ghost"
                  onClick={cerrarModal}
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
                    ? "Guardando..."
                    : "Guardar tarea"}
                </button>

              </div>

            </form>

          </div>
        </div>
      </div>

      {/* =====================================================
          BACKDROP
      ===================================================== */}

      <div
        className="
          modal-backdrop
          fade
          show
          vt-backdrop
        "
      />
    </>
  );
}

export default ModalTarea;