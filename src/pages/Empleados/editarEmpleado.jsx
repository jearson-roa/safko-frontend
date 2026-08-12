import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function EditarEmpleado() {

    const { id } = useParams();
    const navigate = useNavigate();


    const [formulario, setFormulario] = useState({
        nombres: "",
        apellido_paterno: "",
        cargo: "",
        email: "",
        password: "",
        rol: "trabajador",
        activo: 1
    });


    const [cargando, setCargando] = useState(true);



    useEffect(() => {
        cargarEmpleado();
    }, [id]);



    const cargarEmpleado = async () => {

        try {

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/empleado/${id}`
            );


            console.log("Empleado cargado:", response.data);


            setFormulario({

                nombres:
                    response.data.nombres || "",


                apellido_paterno:
                    response.data.apellido_paterno || "",


                cargo:
                    response.data.cargo || "",


                email:
                    response.data.email || "",


                // dejamos vacío para no cambiar contraseña
                password:
                    "",


                rol:
                    response.data.rol || "trabajador",


                activo:
                    response.data.activo ?? 1

            });



        } catch(error) {

            console.error(
                "Error cargando empleado:",
                error
            );

            alert(
                "No se pudo cargar el empleado"
            );


        } finally {

            setCargando(false);

        }

    };





    const handleChange = (e) => {

        setFormulario({

            ...formulario,

            [e.target.name]: e.target.value

        });

    };





    const guardarCambios = async () => {


        try {


            console.log(
                "Datos enviados:",
                formulario
            );


            await axios.put(

                `${import.meta.env.VITE_API_URL}/api/empleado/${id}`,

                formulario

            );



            alert(
                "Empleado actualizado correctamente"
            );



            navigate("/listar-empleado");



        } catch(error) {


            console.error(
                "Error actualizando empleado:",
                error
            );


            alert(
                "Error al actualizar empleado"
            );


        }

    };





    if(cargando){

        return (

            <div className="container mt-5">

                <h3>
                    Cargando empleado...
                </h3>

            </div>

        );

    }





    return (

        <div className="container mt-5">


            <h2>
                Editar Empleado
            </h2>



            <div className="card shadow p-4">


                <label>
                    Nombres
                </label>

                <input

                    className="form-control mb-3"

                    name="nombres"

                    value={formulario.nombres}

                    onChange={handleChange}

                />



                <label>
                    Apellido paterno
                </label>

                <input

                    className="form-control mb-3"

                    name="apellido_paterno"

                    value={formulario.apellido_paterno}

                    onChange={handleChange}

                />



                <label>
                    Cargo
                </label>

                <input

                    className="form-control mb-3"

                    name="cargo"

                    value={formulario.cargo}

                    onChange={handleChange}

                />



                <label>
                    Correo
                </label>

                <input

                    className="form-control mb-3"

                    name="email"

                    value={formulario.email}

                    onChange={handleChange}

                />



                <label>
                    Nueva contraseña
                </label>

                <input

                    type="password"

                    className="form-control mb-3"

                    name="password"

                    placeholder="Dejar vacío para mantener actual"

                    value={formulario.password}

                    onChange={handleChange}

                />



                <label>
                    Rol
                </label>

                <select

                    className="form-control mb-3"

                    name="rol"

                    value={formulario.rol}

                    onChange={handleChange}

                >

                    <option value="admin">
                        Admin
                    </option>


                    <option value="supervisor">
                        Supervisor
                    </option>


                    <option value="trabajador">
                        Trabajador
                    </option>


                    <option value="tecnico">
                        Técnico
                    </option>


                </select>





                <label>
                    Estado
                </label>

                <select

                    className="form-control mb-3"

                    name="activo"

                    value={formulario.activo}

                    onChange={handleChange}

                >

                    <option value={1}>
                        Activo
                    </option>


                    <option value={0}>
                        Inactivo
                    </option>


                </select>





                <div>


                    <button

                        className="btn btn-secondary me-2"

                        onClick={() =>
                            navigate("/listar-empleado")
                        }

                    >

                        Cancelar

                    </button>




                    <button

                        className="btn btn-primary"

                        onClick={guardarCambios}

                    >

                        Guardar cambios

                    </button>


                </div>



            </div>


        </div>

    );

}


export default EditarEmpleado;