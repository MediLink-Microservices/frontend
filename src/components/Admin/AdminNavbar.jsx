import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Profile from "../../pages/auth/Profile";
import { clearAuthSession } from "../../utils/authStorage";

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
  const [showProfile, setShowProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  const initials = (user?.name || "A").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <header style={s.navbar}>
        {/* Left: page title */}
        <div>
          <h1 style={s.title}>{title}</h1>
          <p style={s.subtitle}>{subtitle}</p>
        </div>

        {/* Right: user info + actions */}
        <div style={s.right}>
          {/* Clickable Avatar + User Info */}
          <div
            style={s.userInfo}
            onClick={() => setShowMenu((v) => !v)}
            title="Click to view profile or logout"
            id="admin-profile-trigger"
          >
            <div style={s.avatar}>{initials}</div>
            <div style={s.userText}>
              <p style={s.userName}>{user?.name || "Admin"}</p>
              <p style={s.userBadge}>Administrator</p>
            </div>
            <span style={s.chevron}>▾</span>
          </div>

          {/* Dropdown Menu */}
          {showMenu && (
            <div style={s.menu}>
              <button
                style={s.menuItem}
                id="admin-view-profile"
                onClick={() => { setShowProfile(true); setShowMenu(false); }}
              >
                <span>👤</span> View Profile
              </button>
              <button
                style={s.menuItem}
                id="admin-edit-profile"
                onClick={() => { setShowProfile(true); setShowMenu(false); }}
              >
                <span>✏️</span> Edit Profile
              </button>
              <div style={s.menuDivider} />
              <button
                style={{ ...s.menuItem, color: "#f87171" }}
                id="admin-logout"
                onClick={handleLogout}
              >
                <span>🚪</span> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 89 }}
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Profile Modal */}
      {showProfile && <Profile onClose={() => setShowProfile(false)} />}
    </>
  );
}

const s = {
  navbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 28px", height: "64px", flexShrink: 0,
    background: "#0f172a", borderBottom: "1px solid #1e293b",
    position: "relative", zIndex: 90,
  },
  title: { color: "#f1f5f9", fontSize: "18px", fontWeight: "700", margin: 0 },
  subtitle: { color: "#475569", fontSize: "12px", margin: "1px 0 0 0" },
  right: { display: "flex", alignItems: "center", gap: "16px", position: "relative" },
  userInfo: {
    display: "flex", alignItems: "center", gap: "10px",
    cursor: "pointer", padding: "6px 10px", borderRadius: "10px",
    border: "1px solid transparent",
    transition: "all 0.15s",
    userSelect: "none",
  },
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
  chevron: { color: "#64748b", fontSize: "12px" },
  // Dropdown
  menu: {
    position: "absolute", top: "calc(100% + 8px)", right: 0,
    background: "#1e293b", border: "1px solid #334155",
    borderRadius: "12px", boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
    minWidth: "180px", padding: "6px",
    zIndex: 100,
  },
  menuItem: {
    display: "flex", alignItems: "center", gap: "10px",
    width: "100%", padding: "10px 12px",
    background: "none", border: "none", borderRadius: "8px",
    color: "#cbd5e1", fontSize: "13px", fontWeight: "500",
    cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    textAlign: "left", transition: "background 0.15s",
  },
  menuDivider: { height: "1px", background: "#334155", margin: "4px 0" },
};
