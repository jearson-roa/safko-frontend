import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CrearTarea from "./pages/Tareas/CrearTarea";
import ListarCliente from "./pages/Clientes/ListarCliente";
import ProtectedRoute from "./components/ProtectedRoute";

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
        path="/crear-tarea"
        element={
          <ProtectedRoute>
            <CrearTarea />
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

    </Routes>
  );
}

export default App;