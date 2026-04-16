import { useNavigate } from "react-router-dom";

const PAGE_TITLES = {
  overview:  { title: "Overview",           subtitle: "Welcome back to your dashboard" },
  appointments: { title: "Appointments",    subtitle: "Review all patient bookings across the platform" },
  doctors:   { title: "Doctor Management",  subtitle: "Create and manage doctor accounts" },
  users:     { title: "User Management",    subtitle: "Manage admins and patients" },
  analytics: { title: "Platform Analytics", subtitle: "Insights and platform statistics" },
};

export default function AdminNavbar({ activePage, user }) {
  const navigate = useNavigate();
  const { title, subtitle } = PAGE_TITLES[activePage] || PAGE_TITLES.overview;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header style={s.navbar}>
      {/* Left: page title */}
      <div>
        <h1 style={s.title}>{title}</h1>
        <p style={s.subtitle}>{subtitle}</p>
      </div>

      {/* Right: user info + logout */}
      <div style={s.right}>
        <div style={s.userInfo}>
          <div style={s.avatar}>
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div style={s.userText}>
            <p style={s.userName}>{user?.name || "Admin"}</p>
            <p style={s.userBadge}>Administrator</p>
          </div>
        </div>
        <button style={s.logoutBtn} onClick={handleLogout} id="admin-logout">
          <span>🚪</span> Logout
        </button>
      </div>
    </header>
  );
}

const s = {
  navbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 28px", height: "64px", flexShrink: 0,
    background: "#0f172a", borderBottom: "1px solid #1e293b",
  },
  title: { color: "#f1f5f9", fontSize: "18px", fontWeight: "700", margin: 0 },
  subtitle: { color: "#475569", fontSize: "12px", margin: "1px 0 0 0" },
  right: { display: "flex", alignItems: "center", gap: "16px" },
  userInfo: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: {
    width: "36px", height: "36px", borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #0ea5e9)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "white", fontWeight: "700", fontSize: "14px", flexShrink: 0,
  },
  userText: {},
  userName: { color: "#f1f5f9", fontSize: "13px", fontWeight: "600", margin: 0 },
  userBadge: {
    color: "#6366f1", fontSize: "10px", fontWeight: "600",
    background: "rgba(99,102,241,0.12)", borderRadius: "4px",
    padding: "1px 6px", margin: "2px 0 0 0", display: "inline-block",
  },
  logoutBtn: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "8px 14px", background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.2)", borderRadius: "9px",
    color: "#f87171", fontSize: "12px", fontWeight: "600",
    cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    transition: "all 0.15s",
  },
};
