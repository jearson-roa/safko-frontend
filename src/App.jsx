import { Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import ListarCliente from "./pages/Clientes/ListarCliente";
import Editar from "./pages/Clientes/editar";

import ListarTarea from "./pages/Tareas/ListarTarea";
import VerTarea from "./pages/Tareas/ver_tarea";
import EditarTarea from "./pages/Tareas/EditarTarea";

import ListarEmpleado from "./pages/Empleados/ListarEmpleado";
import EditarEmpleado from "./pages/Empleados/editarEmpleado";

import Charla5Min from "./pages/Formularios/charla_5min";


function App() {
  return (
      <Routes>

        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Todo lo que requiere autenticación */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >

          <Route path="/dashboard" element={<Dashboard />} />

          {/* Tareas */}
          <Route path="/listar-tarea" element={<ListarTarea />} />
          <Route path="/tareas/ver_tarea/:id" element={<VerTarea />} />
          <Route path="/tareas/EditarTarea/:id" element={<EditarTarea/>}/>

          {/* Clientes */}
          <Route path="/listar-cliente" element={<ListarCliente />} />
          <Route path="/clientes/editar/:id" element={<Editar />} />

          {/* Empleados */}
          <Route path="/listar-empleado" element={<ListarEmpleado />} />
          <Route path="/empleados/editar/:id" element={<EditarEmpleado />} />

          {/* Formularios */}
          <Route path="/formularios/charla_5min/:id_tarea" element={<Charla5Min />} />

        </Route>

      </Routes>
  );
}

export default App;