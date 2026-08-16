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

  // Información de la OT
  titulo: "",
  nombre_contacto: "",
  telefono_contacto: "",
  direccion_trabajo: "",
  descripcion_trabajo: "",
  observaciones: "",

  // Formularios habilitados
  formularios_habilitados: {
    checklist: false,
    charla_5min: false,
    lista_riesgos: false,
  },
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
  const [formData, setFormData] = useState(
    initialFormState
  );

  const [guardando, setGuardando] = useState(false);

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // HANDLE FORMULARIOS
  // =========================================================

  const handleFormularioChange = (
    nombre,
    valor
  ) => {
    setFormData((prev) => ({
      ...prev,
      formularios_habilitados: {
        ...prev.formularios_habilitados,
        [nombre]: valor,
      },
    }));
  };

  // =========================================================
  // CERRAR MODAL
  // =========================================================

  const cerrarModal = () => {
    if (guardando) return;

    onClose();
  };

  // =========================================================
  // GUARDAR TAREA
  // =========================================================

  const guardarTarea = async (e) => {
    e.preventDefault();

    if (guardando) return;

    // =======================================================
    // VALIDAR FECHAS
    // =======================================================

    if (
      formData.fecha_inicio &&
      formData.fecha_termino
    ) {
      const inicio = new Date(
        formData.fecha_inicio
      );

      const termino = new Date(
        formData.fecha_termino
      );

      if (termino <= inicio) {
        if (window.Swal) {
          window.Swal.fire({
            title: "Fechas inválidas",
            text:
              "La fecha y hora de término debe ser posterior a la fecha y hora de inicio.",
            icon: "warning",
          });
        } else {
          alert(
            "La fecha y hora de término debe ser posterior a la fecha y hora de inicio."
          );
        }

        return;
      }
    }

    // =======================================================
    // VALIDAR SUPERVISOR
    // =======================================================

    if (!formData.supervisor_id) {
      if (window.Swal) {
        window.Swal.fire({
          title: "Supervisor requerido",
          text:
            "Debes seleccionar un supervisor responsable.",
          icon: "warning",
        });
      } else {
        alert(
          "Debes seleccionar un supervisor responsable."
        );
      }

      return;
    }

    // =======================================================
    // VALIDAR TÉCNICO
    // =======================================================

    if (!formData.tecnico_id) {
      if (window.Swal) {
        window.Swal.fire({
          title: "Técnico requerido",
          text:
            "Debes seleccionar un técnico de terreno.",
          icon: "warning",
        });
      } else {
        alert(
          "Debes seleccionar un técnico de terreno."
        );
      }

      return;
    }

    // =======================================================
    // TOKEN
    // =======================================================

    const token =
      localStorage.getItem("token");

    if (!token) {
      if (window.Swal) {
        window.Swal.fire({
          title: "Sesión expirada",
          text:
            "No hay una sesión activa. Inicia sesión nuevamente.",
          icon: "warning",
        });
      } else {
        alert(
          "No hay una sesión activa. Inicia sesión nuevamente."
        );
      }

      return;
    }

    // =======================================================
    // GUARDAR
    // =======================================================

    try {
      setGuardando(true);

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/tareas`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // =====================================================
      // ÉXITO
      // =====================================================

      if (window.Swal) {
        await window.Swal.fire({
          title: "¡Tarea creada!",
          text:
            "La orden de trabajo fue creada correctamente.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        alert(
          "Tarea creada correctamente."
        );
      }

      // =====================================================
      // LIMPIAR FORMULARIO
      // =====================================================

      setFormData(
        structuredClone(initialFormState)
      );

      // =====================================================
      // CERRAR
      // =====================================================

      onClose();

      // =====================================================
      // ACTUALIZAR LISTADO
      // =====================================================

      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error(
        "Error al guardar tarea:",
        error
      );

      const mensaje =
        error.response?.data?.mensaje ||
        error.response?.data?.message ||
        "No fue posible crear la tarea.";

      if (window.Swal) {
        window.Swal.fire({
          title: "Error",
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
  // LISTAS DE PERSONAL
  // =========================================================

  const supervisores = empleados.filter(
    (empleado) =>
      empleado.cargo
        ?.toLowerCase()
        .includes("supervisor")
  );

  const tecnicos = empleados.filter(
    (empleado) =>
      !empleado.cargo
        ?.toLowerCase()
        .includes("supervisor")
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      {/* =====================================================
          MODAL
      ===================================================== */}

      <div
        className="modal fade show vt-modal"
        style={{ display: "block" }}
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content vt-modal-content">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="modal-header vt-modal-header">

              <div>
                <div className="vt-eyebrow-small">
                  NUEVA ORDEN DE TRABAJO
                </div>

                <h5 className="modal-title vt-modal-title">
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

              <div className="modal-body vt-modal-body">

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
                                cliente.razon_social
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
                        placeholder="Ej: Mantención de tablero eléctrico"
                      />

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

                    {/* NOMBRE */}

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
                        placeholder="Nombre del contacto"
                      />

                    </div>

                    {/* TELÉFONO */}

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

                    {/* FECHA INICIO */}

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

                      <small className="vt-form-help">
                        Inicio programado de la orden.
                      </small>

                    </div>

                    {/* FECHA TÉRMINO */}

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

                      <small className="vt-form-help">
                        Término programado de la orden.
                      </small>

                    </div>

                  </div>
                </div>

                {/* =================================================
                    PERSONAL ASIGNADO
                ================================================= */}

                <div className="vt-form-section">

                  <div className="vt-form-section-title">
                    Personal asignado
                  </div>

                  {/* =================================================
                      SUPERVISOR
                  ================================================= */}

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
                        (empleado) => (
                          <option
                            key={
                              empleado.id
                            }
                            value={
                              empleado.id
                            }
                          >
                            {empleado.nombres}{" "}
                            {empleado.apellido_paterno ||
                              ""}{" "}
                            {empleado.apellido_materno ||
                              ""}
                            {" — "}
                            {empleado.cargo ||
                              "Supervisor"}
                          </option>
                        )
                      )}

                    </select>

                    <small className="vt-form-help">
                      Responsable de supervisar la
                      ejecución de la orden de trabajo.
                    </small>

                  </div>

                  {/* =================================================
                      TÉCNICO
                  ================================================= */}

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
                        (empleado) => (
                          <option
                            key={
                              empleado.id
                            }
                            value={
                              empleado.id
                            }
                          >
                            {empleado.nombres}{" "}
                            {empleado.apellido_paterno ||
                              ""}{" "}
                            {empleado.apellido_materno ||
                              ""}
                            {" — "}
                            {empleado.cargo ||
                              "Técnico"}
                          </option>
                        )
                      )}

                    </select>

                    <small className="vt-form-help">
                      Técnico responsable de ejecutar la
                      tarea en terreno.
                    </small>

                  </div>

                </div>

                {/* =================================================
                    DETALLE DEL TRABAJO
                ================================================= */}

                <div className="vt-form-section">

                  <div className="vt-form-section-title">
                    Detalle del trabajo
                  </div>

                  {/* DESCRIPCIÓN */}

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
                      placeholder="Describa detalladamente el trabajo que debe realizarse..."
                    />

                  </div>

                  {/* OBSERVACIONES */}

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

                {/* =================================================
                    FORMULARIOS
                ================================================= */}

                <div className="vt-form-section">

                  <div className="vt-form-section-title">
                    Formularios para el técnico
                  </div>

                  <p className="vt-form-section-description">
                    Seleccione los formularios que estarán
                    disponibles para el técnico durante la
                    ejecución de la tarea.
                  </p>

                  <div className="vt-check-list">

                    {/* CHECKLIST */}

                    <label className="vt-check-item">

                      <input
                        type="checkbox"
                        checked={
                          formData
                            .formularios_habilitados
                            ?.checklist ||
                          false
                        }
                        onChange={(e) =>
                          handleFormularioChange(
                            "checklist",
                            e.target.checked
                          )
                        }
                        disabled={guardando}
                      />

                      <span>
                        Checklist
                      </span>

                    </label>

                    {/* CHARLA 5 MIN */}

                    <label className="vt-check-item">

                      <input
                        type="checkbox"
                        checked={
                          formData
                            .formularios_habilitados
                            ?.charla_5min ||
                          false
                        }
                        onChange={(e) =>
                          handleFormularioChange(
                            "charla_5min",
                            e.target.checked
                          )
                        }
                        disabled={guardando}
                      />

                      <span>
                        Charla 5 min
                      </span>

                    </label>

                    {/* LISTA DE RIESGOS */}

                    <label className="vt-check-item">

                      <input
                        type="checkbox"
                        checked={
                          formData
                            .formularios_habilitados
                            ?.lista_riesgos ||
                          false
                        }
                        onChange={(e) =>
                          handleFormularioChange(
                            "lista_riesgos",
                            e.target.checked
                          )
                        }
                        disabled={guardando}
                      />

                      <span>
                        Lista de riesgos
                      </span>

                    </label>

                  </div>

                </div>

              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="modal-footer vt-modal-footer">

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
        className="modal-backdrop fade show vt-backdrop"
      />
    </>
  );
}

export default ModalTarea;