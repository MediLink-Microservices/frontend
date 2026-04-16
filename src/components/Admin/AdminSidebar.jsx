const NAV_ITEMS = [
  { id: "overview",   label: "Overview",            icon: "📊" },
  { id: "doctors",    label: "Doctor Management",   icon: "👨‍⚕️" },
  { id: "users",      label: "User Management",     icon: "👥" },
  { id: "analytics",  label: "Platform Analytics",  icon: "📈" },
];

export default function AdminSidebar({ activePage, setActivePage, collapsed, setCollapsed }) {
  return (
    <aside style={{ ...s.sidebar, width: collapsed ? "64px" : "240px" }}>
      {/* Top: logo + collapse */}
      <div style={s.top}>
        <div style={s.logo}>
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="9" fill="white" fillOpacity="0.15"/>
            <path d="M18 8v20M8 18h20" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          {!collapsed && <span style={s.logoText}>MediLink</span>}
        </div>
        <button style={s.collapseBtn} onClick={() => setCollapsed(v => !v)} title={collapsed ? "Expand" : "Collapse"}>
          {collapsed ? "▶" : "◀"}
        </button>
      </div>

      {/* Nav items */}
      <nav style={s.nav}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            style={{ ...s.navItem, ...(activePage === item.id ? s.active : {}) }}
            onClick={() => setActivePage(item.id)}
            title={item.label}
          >
            <span style={s.icon}>{item.icon}</span>
            {!collapsed && <span style={s.label}>{item.label}</span>}
            {!collapsed && activePage === item.id && <span style={s.activeDot} />}
          </button>
        ))}
      </nav>

      {/* Bottom divider info */}
      {!collapsed && (
        <div style={s.bottom}>
          <p style={s.bottomText}>MediLink Admin</p>
          <p style={s.bottomSub}>v1.0.0</p>
        </div>
      )}
    </aside>
  );
}

const s = {
  sidebar: {
    background: "linear-gradient(180deg, #1e1b4b 0%, #1e293b 100%)",
    display: "flex", flexDirection: "column",
    transition: "width 0.25s ease",
    overflow: "hidden", flexShrink: 0,
    borderRight: "1px solid #334155",
    height: "100vh",
  },
  top: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)",
    minHeight: "64px",
  },
  logo: { display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" },
  logoText: { color: "white", fontSize: "15px", fontWeight: "700", whiteSpace: "nowrap" },
  collapseBtn: {
    background: "rgba(255,255,255,0.08)", border: "none", color: "#94a3b8",
    cursor: "pointer", borderRadius: "6px", padding: "5px 7px", fontSize: "10px",
    flexShrink: 0,
  },
  nav: { flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: "3px" },
  navItem: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "10px 12px", borderRadius: "10px",
    background: "none", border: "none", color: "#94a3b8",
    cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    fontSize: "13px", fontWeight: "500",
    whiteSpace: "nowrap", width: "100%", textAlign: "left",
    transition: "all 0.15s", position: "relative",
  },
  active: {
    background: "rgba(99,102,241,0.18)",
    color: "#a5b4fc",
  },
  icon: { fontSize: "18px", flexShrink: 0 },
  label: { flex: 1, overflow: "hidden", textOverflow: "ellipsis" },
  activeDot: {
    width: "6px", height: "6px", borderRadius: "50%",
    background: "#6366f1", flexShrink: 0,
  },
  bottom: {
    padding: "16px", borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  bottomText: { color: "#475569", fontSize: "11px", margin: 0, fontWeight: "600" },
  bottomSub: { color: "#334155", fontSize: "10px", margin: "2px 0 0 0" },
};
