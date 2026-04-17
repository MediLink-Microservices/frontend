import { useState } from "react";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminNavbar from "../../components/Admin/AdminNavbar";

// Pages
import OverviewPage from "./OverviewPage";
import AdminAppointmentsPage from "./AdminAppointmentsPage";
import DoctorManagementPage from "./DoctorManagementPage";
import UserManagementPage from "./UserManagementPage";
import PlatformAnalytics from "./PlatformAnalyticsPage";
import { getStoredUser } from "../../utils/authStorage";

export default function AdminDashboard() {
  const user = getStoredUser();

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
          {activePage === "appointments" && <AdminAppointmentsPage />}
          {activePage === "doctors" && <DoctorManagementPage />}
          {activePage === "users" && <UserManagementPage />}
          {activePage === "analytics" && <PlatformAnalytics />}
        </div>
      </main>
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
