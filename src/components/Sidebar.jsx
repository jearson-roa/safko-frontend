import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Home,
  Users,
  Package,
  ShoppingCart,
  FileText,
  BarChart3,
  Settings,
  Menu,
  ChevronLeft,
  LogOut,
} from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const usuario = JSON.parse(
    localStorage.getItem("usuario") || "{}"
  );

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    navigate("/");
  };

  const menuItems = [
    {
      icon: <Home size={20} />,
      text: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <FileText size={20} />,
      text: "Tarea",
      path: "/listar-tarea",
    },
    {
      icon: <Users size={20} />,
      text: "Clientes",
      path: "/listar-cliente",
    },
    {
      icon: <ShoppingCart size={20} />,
      text: "Usuarios",
      path: "/listar-usuario",
    },
    {
      icon: <Package size={20} />,
      text: "Inventario",
      path: "/inventario",
    },
    {
      icon: <BarChart3 size={20} />,
      text: "Reportes",
      path: "/reportes",
    },
    {
      icon: <Settings size={20} />,
      text: "Configuración",
      path: "/configuracion",
    },
    {
      icon: <LogOut size={20} />,
      text: "Cerrar Sesión",
      action: cerrarSesion,
    },
  ];

  return (
    <div
      style={{
        width: collapsed ? "80px" : "260px",
        height: "100vh",
        backgroundColor: "#111827",
        color: "#ffffff",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        boxShadow: "3px 0 15px rgba(0,0,0,0.15)",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: "70px",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          borderBottom: "1px solid #374151",
        }}
      >
        {!collapsed && (
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              SAFKO
            </h2>

            <small
              style={{
                color: "#9CA3AF",
              }}
            >
              Sistema de Gestión
            </small>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {collapsed ? (
            <Menu size={24} />
          ) : (
            <ChevronLeft size={24} />
          )}
        </button>
      </div>

      {/* Menú */}
      <div
        style={{
          flex: 1,
          paddingTop: "15px",
        }}
      >
        {menuItems.map((item, index) => (
          <div
            key={index}
            onClick={() => {
              if (item.action) {
                item.action();
              } else {
                navigate(item.path);
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              padding: "14px 20px",
              cursor: "pointer",
              transition: "0.2s",
              margin: "4px 10px",
              borderRadius: "8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1F2937";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {item.icon}

            {!collapsed && (
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: "500",
                }}
              >
                {item.text}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Usuario */}
      <div
        style={{
          borderTop: "1px solid #374151",
          padding: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#2563EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            {usuario?.nombres
              ? usuario.nombres.charAt(0).toUpperCase()
              : "A"}
          </div>

          {!collapsed && (
            <div>
              <div
                style={{
                  fontWeight: "600",
                }}
              >
                {usuario?.nombres || "Administrador"}
              </div>

              <small
                style={{
                  color: "#9CA3AF",
                }}
              >
                {usuario?.email || ""}
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;