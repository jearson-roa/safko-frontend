import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main
        style={{
          marginLeft: collapsed ? "80px" : "200px", // 👈 dinámico
          minHeight: "100vh",
          background: "#F8FAFC",
          padding: "40px 32px",
          position: "relative",
          transition: "margin-left 0.2s ease", // 👈 mismo timing que el sidebar
        }}
      >
        <Outlet />
      </main>
    </>
  );
}

export default DashboardLayout;