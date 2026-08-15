import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Home,
  Users,
  UserCog,
  Package,
  FileText,
  BarChart3,
  Settings,
  Menu,
  ChevronLeft,
  LogOut,
} from "lucide-react";

import "./Sidebar.css";

function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    navigate("/");
  };

  const menuItems = [
    {
      icon: Home,
      text: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: FileText,
      text: "Tarea",
      path: "/listar-tarea",
    },
    {
      icon: Users,
      text: "Clientes",
      path: "/listar-cliente",
    },
    {
      icon: UserCog,
      text: "Empleados",
      path: "/listar-empleado",
    },
    {
      icon: Package,
      text: "Inventario",
      path: "/inventario",
    },
    {
      icon: BarChart3,
      text: "Reportes",
      path: "/reportes",
    },
    {
      icon: Settings,
      text: "Configuración",
      path: "/configuracion",
    },
  ];

  return (
    <aside className={`safko-sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* HEADER */}
      <div className="safko-sidebar__header">
        {!collapsed && (
          <div className="safko-sidebar__brand">
            <div className="safko-sidebar__logo">
              S
            </div>

            <div className="safko-sidebar__brand-info">
              <h2>SAFKO</h2>
              <span>Sistema de Gestión</span>
            </div>
          </div>
        )}

        <button
          type="button"
          className="safko-sidebar__toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={
            collapsed ? "Expandir menú" : "Colapsar menú"
          }
        >
          {collapsed ? (
            <Menu size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* MENÚ */}
      <nav className="safko-sidebar__nav">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const active =
            location.pathname === item.path;

          return (
            <button
              type="button"
              key={item.path}
              className={`safko-sidebar__item ${
                active ? "active" : ""
              }`}
              title={collapsed ? item.text : undefined}
              onClick={() => navigate(item.path)}
            >
              {active && !collapsed && (
                <span className="safko-sidebar__active-bar" />
              )}

              <Icon
                size={19}
                strokeWidth={active ? 2.3 : 2}
              />

              {!collapsed && (
                <span className="safko-sidebar__item-text">
                  {item.text}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* CERRAR SESIÓN */}
      <div className="safko-sidebar__logout-wrapper">
        <button
          type="button"
          className="safko-sidebar__item safko-sidebar__logout"
          title={collapsed ? "Cerrar sesión" : undefined}
          onClick={cerrarSesion}
        >
          <LogOut size={19} />

          {!collapsed && (
            <span className="safko-sidebar__item-text">
              Cerrar sesión
            </span>
          )}
        </button>
      </div>

      {/* USUARIO */}
      <div className="safko-sidebar__user">
        <div className="safko-sidebar__avatar">
          {usuario?.nombres
            ? usuario.nombres.charAt(0).toUpperCase()
            : "A"}
        </div>

        {!collapsed && (
          <div className="safko-sidebar__user-info">
            <div className="safko-sidebar__user-name">
              {usuario?.nombres || "Administrador"}
            </div>

            <div className="safko-sidebar__user-email">
              {usuario?.email || ""}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;