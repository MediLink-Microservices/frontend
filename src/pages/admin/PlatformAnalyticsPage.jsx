import { useState, useEffect, useMemo } from "react";
import { authAPI, appointmentAPI, doctorAPI } from "../../services/api";
import { 
  TrendingUp, Users, Calendar, DollarSign, 
  Activity, Award, PieChart, BarChart3,
  ArrowUpRight, ArrowDownRight, Download
} from "lucide-react";

export default function PlatformAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ doctors: 0, patients: 0, admins: 0, pending: 0 });
  const [appointments, setAppointments] = useState([]);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, appointmentsRes] = await Promise.all([
          authAPI.adminStats(),
          appointmentAPI.getAllAppointments()
        ]);
        setStats(statsRes.data.data);
        setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
      } catch (err) {
        console.error("Failed to fetch analytics data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Compute Analytics Data
  const analytics = useMemo(() => {
    if (!appointments.length) return null;

    const totalRevenue = appointments.reduce((sum, app) => sum + (app.consultationFee || 0), 0);
    const statusCounts = appointments.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    const specialtyCounts = appointments.reduce((acc, app) => {
      acc[app.doctorSpecialty] = (acc[app.doctorSpecialty] || 0) + 1;
      return acc;
    }, {});

    const hospitalCounts = appointments.reduce((acc, app) => {
      if (app.doctorHospital) {
        acc[app.doctorHospital] = (acc[app.doctorHospital] || 0) + 1;
      }
      return acc;
    }, {});

    // Monthly Growth (Real data from appointments)
    const monthlyData = new Array(12).fill(0);
    appointments.forEach(app => {
      const date = new Date(app.appointmentDateTime || app.createdAt);
      if (!isNaN(date.getTime())) {
        monthlyData[date.getMonth()] += 1;
      }
    });

    // Sort specialties/hospitals and take top entries
    const topSpecialties = Object.entries(specialtyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topHospitals = Object.entries(hospitalCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { totalRevenue, statusCounts, topSpecialties, topHospitals, monthlyData };
  }, [appointments]);

  if (loading) return <div style={s.loader}><Spinner /></div>;

  const totalUsers = stats.doctors + stats.patients + stats.admins;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h2 style={s.heading}>Platform Analytics</h2>
          <p style={s.sub}>Real-time performance metrics and usage statistics.</p>
        </div>
        <div style={s.actions}>
          <button style={s.exportBtn} onClick={() => window.print()}>
            <Download size={16} /> Export PDF Report
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div style={s.statsGrid}>
        <MetricCard 
          icon={<DollarSign size={20} />} 
          label="Total Revenue" 
          value={`Rs. ${analytics?.totalRevenue?.toLocaleString() || 0}`} 
          desc="Accumulated consultation fees"
          color="#10b981" 
        />
        <MetricCard 
          icon={<Users size={20} />} 
          label="Total Users" 
          value={totalUsers} 
          desc="Registered accounts on platform"
          color="#6366f1" 
        />
        <MetricCard 
          icon={<Calendar size={20} />} 
          label="Total Bookings" 
          value={appointments.length} 
          desc="Appointments across all time"
          color="#0ea5e9" 
        />
        <MetricCard 
          icon={<Activity size={20} />} 
          label="Pending Doctors" 
          value={stats.pending} 
          desc="Doctors awaiting verification"
          color="#f59e0b" 
        />
      </div>

      {/* Visualizations Row 1 */}
      <div style={s.chartsGrid}>
        {/* Appointment Status Pie Chart (SVG) */}
        <div style={s.chartCard}>
          <div style={s.cardHeader}>
            <PieChart size={18} color="#94a3b8" />
            <h4 style={s.cardTitle}>Appointment Status</h4>
          </div>
          <div style={s.pieContainer}>
            {appointments.length > 0 ? (
              <>
                <StatusPieChart counts={analytics?.statusCounts || {}} />
                <div style={s.legend}>
                  <LegendItem color="#10b981" label="Confirmed" value={analytics?.statusCounts?.['CONFIRMED'] || 0} />
                  <LegendItem color="#f59e0b" label="Pending" value={analytics?.statusCounts?.['PENDING_PAYMENT'] || 0} />
                  <LegendItem color="#ef4444" label="Cancelled" value={analytics?.statusCounts?.['CANCELLED'] || 0} />
                  <LegendItem color="#6366f1" label="Completed" value={analytics?.statusCounts?.['COMPLETED'] || 0} />
                </div>
              </>
            ) : (
              <p style={s.emptyText}>No appointments to analyze</p>
            )}
          </div>
        </div>

        {/* Top Specialties Bar Chart (Custom) */}
        <div style={s.chartCard}>
          <div style={s.cardHeader}>
            <BarChart3 size={18} color="#94a3b8" />
            <h4 style={s.cardTitle}>Top Medical Specialties</h4>
          </div>
          <div style={s.barContainer}>
            {analytics?.topSpecialties.length > 0 ? (
              analytics.topSpecialties.map(([spec, count], idx) => (
                <BarItem 
                  key={spec} 
                  label={spec} 
                  value={count} 
                  percent={(count / appointments.length) * 100} 
                  color={COLORS[idx % COLORS.length]} 
                />
              ))
            ) : (
              <p style={s.emptyText}>No specialty data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Visualizations Row 2 */}
      <div style={s.chartsGrid}>
        {/* Appointments by Hospital */}
        <div style={s.chartCard}>
          <div style={s.cardHeader}>
            <TrendingUp size={18} color="#94a3b8" />
            <h4 style={s.cardTitle}>Bookings by Hospital</h4>
          </div>
          <div style={s.barContainer}>
            {analytics?.topHospitals.length > 0 ? (
              analytics.topHospitals.map(([hosp, count], idx) => (
                <BarItem 
                  key={hosp} 
                  label={hosp} 
                  value={count} 
                  percent={(count / appointments.length) * 100} 
                  color={COLORS[(idx + 2) % COLORS.length]} 
                />
              ))
            ) : (
              <p style={s.emptyText}>No hospital data available</p>
            )}
          </div>
        </div>

        {/* User Distribution */}
        <div style={s.chartCard}>
          <div style={s.cardHeader}>
            <Award size={18} color="#94a3b8" />
            <h4 style={s.cardTitle}>User Role Distribution</h4>
          </div>
          <div style={s.barContainer}>
            <BarItem label="Patients" value={stats.patients} percent={(stats.patients / totalUsers) * 100 || 0} color="#0ea5e9" />
            <BarItem label="Doctors" value={stats.doctors} percent={(stats.doctors / totalUsers) * 100 || 0} color="#10b981" />
            <BarItem label="Administrators" value={stats.admins} percent={(stats.admins / totalUsers) * 100 || 0} color="#8b5cf6" />
          </div>
        </div>
      </div>

      {/* Activity Timeline / Table */}
      <div style={s.wideCard}>
        <div style={s.cardHeader}>
          <TrendingUp size={18} color="#94a3b8" />
          <h4 style={s.cardTitle}>Monthly Booking Trends</h4>
        </div>
        <div style={s.growthContainer}>
          <div style={s.growthGrid}>
            {(analytics?.monthlyData || new Array(12).fill(0)).map((val, i) => {
              const max = Math.max(...(analytics?.monthlyData || [1]), 1);
              const height = (val / max) * 100;
              return (
                <div key={i} style={s.growthColumn}>
                  <div style={{ ...s.growthBar, height: `${Math.max(height, 5)}%` }}>
                    <div style={s.growthTooltip}>{val} bookings</div>
                  </div>
                  <span style={s.growthLabel}>{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Components ───────────────────────────────────────────────────────────────

function MetricCard({ icon, label, value, desc, color }) {
  return (
    <div style={s.statCard}>
      <div style={{ ...s.statIcon, background: color + "15", color }}>{icon}</div>
      <div style={s.statInfo}>
        <p style={s.statLabel}>{label}</p>
        <h3 style={s.statValue}>{value}</h3>
        <p style={{ color: "#475569", fontSize: "10px", margin: 0 }}>{desc}</p>
      </div>
    </div>
  );
}

function StatusPieChart({ counts }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const colors = { CONFIRMED: "#10b981", PENDING_PAYMENT: "#f59e0b", CANCELLED: "#ef4444", COMPLETED: "#6366f1" };
  
  let currentAngle = 0;
  const paths = Object.entries(counts).map(([status, count]) => {
    const angle = (count / total) * 360;
    const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
    const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
    currentAngle += angle;
    const x2 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
    const y2 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
    
    const largeArc = angle > 180 ? 1 : 0;
    const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return <path key={status} d={pathData} fill={colors[status] || "#334155"} />;
  });

  return (
    <svg style={s.pieSvg} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="41" fill="#1e293b" />
      {paths}
      <circle cx="50" cy="50" r="28" fill="#1e293b" />
      <text x="50" y="50" textAnchor="middle" dy="4" fill="white" fontSize="8" fontWeight="bold">TOTAL</text>
    </svg>
  );
}

function LegendItem({ color, label, value }) {
  return (
    <div style={s.legendItem}>
      <div style={{ ...s.dot, background: color }} />
      <span style={s.legendLabel}>{label}</span>
      <span style={s.legendValue}>{value}</span>
    </div>
  );
}

function BarItem({ label, value, percent, color }) {
  return (
    <div style={s.barItem}>
      <div style={s.barInfo}>
        <span style={s.barLabel}>{label}</span>
        <span style={s.barValue}>{value}</span>
      </div>
      <div style={s.barTrack}>
        <div style={{ ...s.barFill, width: `${Math.max(percent, 2)}%`, background: color }} />
      </div>
    </div>
  );
}

function Spinner() {
  return <div style={s.spinner} />;
}

// ── Styles ───────────────────────────────────────────────────────────────────

const COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#8b5cf6", "#f43f5e"];

const s = {
  page: { display: "flex", flexDirection: "column", gap: "24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  heading: { color: "#f1f5f9", fontSize: "24px", fontWeight: "800", margin: 0 },
  sub: { color: "#64748b", fontSize: "14px", margin: "4px 0 0 0" },
  actions: { display: "flex", gap: "12px" },
  select: {
    background: "#1e293b", border: "1px solid #334155", borderRadius: "10px",
    color: "#f1f5f9", padding: "8px 12px", outline: "none", fontSize: "13px"
  },
  exportBtn: {
    display: "flex", alignItems: "center", gap: "8px", 
    background: "#6366f1", color: "white", border: "none", 
    borderRadius: "10px", padding: "8px 16px", fontSize: "13px", 
    fontWeight: "600", cursor: "pointer"
  },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" },
  statCard: {
    background: "#1e293b", border: "1px solid #334155", borderRadius: "20px",
    padding: "20px", display: "flex", alignItems: "flex-start", gap: "16px",
    position: "relative", overflow: "hidden"
  },
  statIcon: { width: "42px", height: "42px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statInfo: { display: "flex", flexDirection: "column", gap: "4px" },
  statLabel: { color: "#64748b", fontSize: "12px", fontWeight: "600", margin: 0 },
  statValue: { color: "#f1f5f9", fontSize: "22px", fontWeight: "800", margin: 0 },
  trendTag: { position: "absolute", top: "20px", right: "20px", display: "flex", alignItems: "center", gap: "2px", fontSize: "11px", fontWeight: "700", padding: "4px 8px", borderRadius: "8px" },
  
  chartsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "20px" },
  chartCard: { background: "#1e293b", border: "1px solid #334155", borderRadius: "20px", padding: "24px" },
  cardHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" },
  cardTitle: { color: "#f1f5f9", fontSize: "15px", fontWeight: "700", margin: 0 },
  
  pieContainer: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px" },
  pieSvg: { width: "160px", height: "160px", filter: "drop-shadow(0 0 20px rgba(0,0,0,0.3))" },
  legend: { display: "flex", flexDirection: "column", gap: "10px", flex: 1 },
  legendItem: { display: "flex", alignItems: "center", gap: "8px" },
  dot: { width: "8px", height: "8px", borderRadius: "50%" },
  legendLabel: { color: "#94a3b8", fontSize: "12px", flex: 1 },
  legendValue: { color: "#f1f5f9", fontSize: "12px", fontWeight: "600" },
  
  barContainer: { display: "flex", flexDirection: "column", gap: "18px" },
  barItem: { display: "flex", flexDirection: "column", gap: "8px" },
  barInfo: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  barLabel: { color: "#94a3b8", fontSize: "12px", fontWeight: "500" },
  barValue: { color: "#f1f5f9", fontSize: "12px", fontWeight: "700" },
  barTrack: { height: "10px", background: "#0f172a", borderRadius: "5px", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: "5px", transition: "width 0.8s ease-out" },
  
  wideCard: { background: "#1e293b", border: "1px solid #334155", borderRadius: "20px", padding: "24px" },
  growthContainer: { height: "200px", marginTop: "20px", position: "relative" },
  growthGrid: { display: "flex", alignItems: "flex-end", height: "160px", gap: "12px", paddingBottom: "30px" },
  growthColumn: { flex: 1, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", position: "relative" },
  growthBar: { 
    width: "100%", borderRadius: "6px 6px 0 0", 
    background: "linear-gradient(to top, #6366f1, #c084fc)", 
    position: "relative", cursor: "pointer", transition: "all 0.2s",
    ":hover": { opacity: 0.8 }
  },
  growthLabel: { color: "#64748b", fontSize: "10px", fontWeight: "600" },
  growthTooltip: { 
    position: "absolute", top: "-30px", left: "50%", transform: "translateX(-50%)",
    background: "#0f172a", color: "white", padding: "4px 8px", borderRadius: "6px",
    fontSize: "10px", opacity: 0, transition: "opacity 0.2s", pointerEvents: "none",
    border: "1px solid #334155"
  },
  
  loader: { height: "400px", display: "flex", alignItems: "center", justifyContent: "center" },
  spinner: { width: "40px", height: "40px", border: "3px solid #1e293b", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 1s linear infinite" },
  emptyText: { color: "#64748b", padding: "20px", textAlign: "center", fontSize: "14px" }
};
