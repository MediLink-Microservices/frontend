import { useState, useEffect } from "react";
import { authAPI } from "../../services/api";

export default function OverviewPage({ onNavigate }) {
  const [statsData, setStatsData] = useState({ doctors: 0, patients: 0, admins: 0, pending: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await authAPI.adminStats();
        setStatsData(res.data.data); // Backend returns data inside data property Map
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    }
    fetchStats();
  }, []);

  const stats = [
    { label: "Total Doctors",     value: statsData.doctors, icon: "👨‍⚕️", color: "#6366f1", page: "doctors" },
    { label: "Total Patients",    value: statsData.patients, icon: "🧑‍⚕️", color: "#0ea5e9", page: "users" },
    { label: "Total Admins",      value: statsData.admins, icon: "🛡️",   color: "#8b5cf6", page: "users" },
    { label: "Pending Approvals", value: statsData.pending, icon: "⏳",   color: "#f59e0b", page: "doctors" },
  ];

  const quick = [
    { icon: "👨‍⚕️", label: "Add Doctor",      desc: "Create a new doctor account",   color: "#6366f1", page: "doctors" },
    { icon: "🛡️",   label: "Add Admin",       desc: "Create a new administrator",    color: "#8b5cf6", page: "users" },
    { icon: "👥",   label: "Manage Users",    desc: "View all patients & admins",    color: "#0ea5e9", page: "users" },
    { icon: "📈",   label: "View Analytics",  desc: "Platform usage & statistics",   color: "#10b981", page: "analytics" },
  ];

  return (
    <div style={s.page}>
      {/* Welcome banner */}
      <div style={s.banner}>
        <div>
          <h2 style={s.bannerTitle}>Welcome to MediLink Admin 👋</h2>
          <p style={s.bannerSub}>Here's a quick snapshot of your platform.</p>
        </div>
        <span style={{ fontSize: "52px" }}>🏥</span>
      </div>

      {/* Stats */}
      <div style={s.statsGrid}>
        {stats.map(st => (
          <button key={st.label} style={s.statCard} onClick={() => onNavigate(st.page)}>
            <div style={{ ...s.statIcon, background: st.color + "22" }}>
              <span style={{ fontSize: "22px" }}>{st.icon}</span>
            </div>
            <div>
              <p style={s.statVal}>{st.value}</p>
              <p style={s.statLabel}>{st.label}</p>
            </div>
            <span style={{ ...s.statArrow, color: st.color }}>→</span>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <h3 style={s.sectionTitle}>Quick Actions</h3>
      <div style={s.quickGrid}>
        {quick.map(q => (
          <button key={q.label} style={s.quickCard} onClick={() => onNavigate(q.page)}>
            <div style={{ ...s.quickIcon, background: q.color + "22" }}>
              <span style={{ fontSize: "26px" }}>{q.icon}</span>
            </div>
            <p style={{ ...s.quickLabel, color: q.color }}>{q.label}</p>
            <p style={s.quickDesc}>{q.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

const s = {
  page: { display: "flex", flexDirection: "column", gap: "24px" },
  banner: {
    background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(14,165,233,0.1) 100%)",
    border: "1px solid rgba(99,102,241,0.2)", borderRadius: "16px",
    padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  bannerTitle: { color: "#f1f5f9", fontSize: "20px", fontWeight: "700", margin: "0 0 4px 0" },
  bannerSub: { color: "#64748b", fontSize: "13px", margin: 0 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" },
  statCard: {
    background: "#1e293b", border: "1px solid #334155", borderRadius: "14px",
    padding: "18px", display: "flex", alignItems: "center", gap: "14px",
    cursor: "pointer", fontFamily: "'Poppins', sans-serif", textAlign: "left",
    transition: "border-color 0.15s, transform 0.15s",
  },
  statIcon: { width: "46px", height: "46px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statVal: { color: "#f1f5f9", fontSize: "22px", fontWeight: "700", margin: 0 },
  statLabel: { color: "#64748b", fontSize: "11px", margin: "2px 0 0 0" },
  statArrow: { marginLeft: "auto", fontSize: "16px", flexShrink: 0 },
  sectionTitle: { color: "#94a3b8", fontSize: "13px", fontWeight: "600", margin: 0, textTransform: "uppercase", letterSpacing: "0.8px" },
  quickGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px" },
  quickCard: {
    background: "#1e293b", border: "1px solid #334155", borderRadius: "14px",
    padding: "20px 16px", cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    textAlign: "left", display: "flex", flexDirection: "column", gap: "8px",
    transition: "border-color 0.15s, transform 0.15s",
  },
  quickIcon: { width: "50px", height: "50px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: "13px", fontWeight: "700", margin: 0 },
  quickDesc: { color: "#64748b", fontSize: "11px", margin: 0, lineHeight: "1.4" },
};
