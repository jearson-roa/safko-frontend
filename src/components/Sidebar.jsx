import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Home,
  Users,
  UserCog,
  Package,
  ShoppingCart,
  FileText,
  BarChart3,
  Settings,
  Menu,
  ChevronLeft,
  LogOut,
} from "lucide-react";

const ACCENT = "#4F46E5";

function Sidebar({ collapsed, setCollapsed}) {
  const navigate = useNavigate();
  const location = useLocation();

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    navigate("/");
  };

  const menuItems = [
    { icon: Home, text: "Dashboard", path: "/dashboard" },
    { icon: FileText, text: "Tarea", path: "/listar-tarea" },
    { icon: Users, text: "Clientes", path: "/listar-cliente" },
    { icon: UserCog, text: "Empleados", path: "/listar-empleado" },
    { icon: Package, text: "Inventario", path: "/inventario" },
    { icon: BarChart3, text: "Reportes", path: "/reportes" },
    { icon: Settings, text: "Configuración", path: "/configuracion" },
  ];

  return (
    <div
      style={{
        width: collapsed ? "80px" : "200px",
        height: "100vh",
        backgroundColor: "#111827",
        color: "#ffffff",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s ease",
        boxShadow: "3px 0 15px rgba(0,0,0,0.15)",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <style>{sidebarStyles}</style>

      {/* Header */}
      <div
        style={{
          height: "70px",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          borderBottom: "1px solid #1F2937",
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: ACCENT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                flexShrink: 0,
              }}
            >
              S
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 700,
                  lineHeight: 1.1,
                }}
              >
                SAFKO
              </h2>
              <small style={{ color: "#6B7280", fontSize: 11 }}>
                Sistema de Gestión
              </small>
            </div>
          </div>
        )}

        <button
          className="sb-toggle"
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "transparent",
            border: "none",
            color: "#9CA3AF",
            cursor: "pointer",
            display: "flex",
            padding: 6,
            borderRadius: 6,
          }}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menú */}
      <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto" }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <div
              key={item.path}
              className="sb-item"
              title={collapsed ? item.text : undefined}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 13,
                padding: collapsed ? "12px" : "11px 14px",
                justifyContent: collapsed ? "center" : "flex-start",
                cursor: "pointer",
                margin: "2px 0",
                borderRadius: 8,
                position: "relative",
                color: active ? "#fff" : "#9CA3AF",
                background: active ? "rgba(79, 70, 229, 0.18)" : "transparent",
              }}
            >
              {active && !collapsed && (
                <span
                  style={{
                    position: "absolute",
                    left: -10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 3,
                    height: 18,
                    borderRadius: 3,
                    background: ACCENT,
                  }}
                />
              )}
              <Icon size={19} color={active ? ACCENT : "currentColor"} />
              {!collapsed && (
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {item.text}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Cerrar sesión */}
      <div style={{ padding: "10px", borderTop: "1px solid #1F2937" }}>
        <div
          className="sb-item sb-logout"
          title={collapsed ? "Cerrar sesión" : undefined}
          onClick={cerrarSesion}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            padding: collapsed ? "12px" : "11px 14px",
            justifyContent: collapsed ? "center" : "flex-start",
            cursor: "pointer",
            borderRadius: 8,
            color: "#9CA3AF",
          }}
        >
          <LogOut size={19} />
          {!collapsed && (
            <span style={{ fontSize: 14, fontWeight: 500 }}>
              Cerrar sesión
            </span>
          )}
        </div>
      </div>

      {/* Usuario */}
      <div
        style={{
          borderTop: "1px solid #1F2937",
          padding: collapsed ? "16px 0" : "16px 20px",
          display: "flex",
          justifyContent: collapsed ? "center" : "flex-start",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${ACCENT}, #7C3AED)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {usuario?.nombres ? usuario.nombres.charAt(0).toUpperCase() : "A"}
          </div>

          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {usuario?.nombres || "Administrador"}
              </div>
              <small
                style={{
                  color: "#6B7280",
                  fontSize: 12,
                  display: "block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 160,
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

const sidebarStyles = `
  .sb-item:hover { background: #1F2937 !important; color: #fff !important; }
  .sb-item:hover svg { color: #fff; }
  .sb-logout:hover { background: rgba(239, 68, 68, 0.12) !important; color: #F87171 !important; }
  .sb-toggle:hover { background: #1F2937; color: #fff !important; }
`;

export default Sidebar;