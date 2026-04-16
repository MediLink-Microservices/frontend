import { useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";

// Pages
import OverviewPage from "./OverviewPage";
import DoctorManagementPage from "./DoctorManagementPage";
import UserManagementPage from "./UserManagementPage";

export default function AdminDashboard() {
  const user = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();

  const [activePage, setActivePage] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={s.shell}>
      {/* ── Sidebar ── */}
      <AdminSidebar
        activePage={activePage}
        setActivePage={setActivePage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* ── Main content area ── */}
      <main style={s.main}>
        {/* Navbar */}
        <AdminNavbar activePage={activePage} user={user} />

        {/* Page Content */}
        <div style={s.content}>
          {activePage === "overview" && <OverviewPage onNavigate={(page) => setActivePage(page)} />}
          {activePage === "doctors" && <DoctorManagementPage />}
          {activePage === "users" && <UserManagementPage />}
          {activePage === "analytics" && <PlaceholderPage icon="📈" title="Platform Analytics" desc="Analytics and statistics coming soon." />}
        </div>
      </main>
    </div>
  );
}

function PlaceholderPage({ icon, title, desc }) {
  return (
    <div style={s.emptyState}>
      <span style={{ fontSize: "56px" }}>{icon}</span>
      <p style={s.emptyTitle}>{title}</p>
      <p style={s.emptyDesc}>{desc}</p>
    </div>
  );
}

const s = {
  shell: { 
    display: "flex", 
    height: "100vh", 
    background: "#0f172a", 
    fontFamily: "'Poppins', sans-serif", 
    overflow: "hidden" 
  },
  main: { 
    flex: 1, 
    display: "flex", 
    flexDirection: "column", 
    overflow: "hidden" 
  },
  content: { 
    flex: 1, 
    overflowY: "auto", 
    padding: "28px 32px" 
  },
  emptyState: { 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center", 
    justifyContent: "center", 
    padding: "80px 20px", 
    gap: "12px" 
  },
  emptyTitle: { 
    color: "#f1f5f9", 
    fontSize: "18px", 
    fontWeight: "600", 
    margin: 0 
  },
  emptyDesc: { 
    color: "#64748b", 
    fontSize: "13px", 
    margin: 0 
  },
};
