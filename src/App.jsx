import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ListarCliente from "./pages/Clientes/ListarCliente";
import ListarTarea from "./pages/Tareas/ListarTarea";
import ProtectedRoute from "./components/ProtectedRoute";
import ListarUsuarios from "./pages/Usuarios/ListarUsuario";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/listar-tarea"
        element={
          <ProtectedRoute>
            <ListarTarea />
          </ProtectedRoute>
        }
      />

      <Route
        path="/listar-cliente"
        element={
          <ProtectedRoute>
            <ListarCliente />
          </ProtectedRoute>
        }
      />

      <Route
        path="/listar-usuario"
        element={
          <ProtectedRoute>
            <ListarUsuarios />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;