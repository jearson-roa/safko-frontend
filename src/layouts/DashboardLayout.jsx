import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import "./DashboardLayout.css";

function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="safko-layout">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main
        className={`safko-layout__main ${
          collapsed ? "safko-layout__main--collapsed" : ""
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;