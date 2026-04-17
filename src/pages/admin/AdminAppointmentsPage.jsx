import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CreditCard,
  FileText,
  Hospital,
  LoaderCircle,
  Search,
  Stethoscope,
  UserRound,
  XCircle,
} from "lucide-react";
import { appointmentAPI } from "../../services/api";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await appointmentAPI.getAllAppointments();
      setAppointments(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Failed to load appointment records."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesSearch =
        !searchTerm ||
        [
          appointment.patientId,
          appointment.doctorId,
          appointment.doctorName,
          appointment.doctorSpecialty,
          appointment.doctorHospital,
          appointment.consultationType,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          );

      const matchesStatus =
        statusFilter === "ALL" || appointment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, statusFilter]);

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "Not scheduled";
    const parsed = new Date(dateTime);
    return Number.isNaN(parsed.getTime())
      ? dateTime
      : parsed.toLocaleString("en-LK");
  };

  const generatePDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
    
    doc.setFontSize(22);
    doc.text("MediLink - Appointments Overview", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Status Filter: ${statusFilter}`, 14, 36);
    doc.text(`Total Records: ${filteredAppointments.length}`, 14, 42);
    
    const tableData = filteredAppointments.map(a => [
      a.appointmentNumber || 'N/A',
      `Dr. ${a.doctorName}`,
      a.doctorSpecialty,
      a.patientId,
      new Date(a.appointmentDateTime).toLocaleString(),
      a.status,
      `Rs. ${a.consultationFee}`
    ]);
    
    doc.autoTable({
      startY: 48,
      head: [['ID', 'Doctor', 'Specialty', 'Patient ID', 'Date & Time', 'Status', 'Fee']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [14, 165, 233] },
      styles: { fontSize: 9 }
    });
    
    doc.save(`appointments-report-${new Date().getTime()}.pdf`);
  };

  return (
    <div style={s.page}>
      <div style={s.banner}>
        <div>
          <p style={s.eyebrow}>Admin Oversight</p>
          <h2 style={s.bannerTitle}>All appointment records</h2>
          <p style={s.bannerSub}>
            Review every booking across the platform, including doctor details,
            patient IDs, payment-related status, and consultation type.
          </p>
        </div>
        <div style={s.statCard}>
          <span style={s.statLabel}>Visible appointments</span>
          <span style={s.statValue}>{filteredAppointments.length}</span>
        </div>
      </div>

      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <Search size={16} color="#64748b" />
          <input
            style={s.searchInput}
            placeholder="Search by doctor, patient ID, hospital, or type..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <select
          style={s.select}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING_PAYMENT">Pending Payment</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button style={s.exportBtn} onClick={generatePDF}>
          <FileText size={16} />
          Export PDF
        </button>
      </div>

      {error && (
        <div style={s.errorBox}>
          <XCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={s.emptyState}>
          <LoaderCircle size={28} style={{ animation: "spin 1s linear infinite" }} />
          <p style={s.emptyTitle}>Loading appointments...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div style={s.emptyState}>
          <FileText size={36} color="#64748b" />
          <p style={s.emptyTitle}>No appointments found</p>
          <p style={s.emptyDesc}>Try changing the search term or status filter.</p>
        </div>
      ) : (
        <div style={s.grid}>
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} style={s.card}>
              <div style={s.cardTop}>
                <div>
                  <h3 style={s.cardTitle}>Dr. {appointment.doctorName}</h3>
                  <p style={s.cardSubtitle}>{appointment.doctorSpecialty}</p>
                </div>
                <span
                  style={{
                    ...s.statusPill,
                    ...(appointment.status === "CONFIRMED"
                      ? s.confirmed
                      : appointment.status === "PENDING_PAYMENT"
                        ? s.pending
                        : appointment.status === "CANCELLED"
                          ? s.cancelled
                          : s.neutral),
                  }}
                >
                  {appointment.status}
                </span>
              </div>

              <div style={s.infoGrid}>
                <InfoItem icon={<UserRound size={15} />} label="Patient ID" value={appointment.patientId} />
                <InfoItem icon={<Stethoscope size={15} />} label="Type" value={appointment.consultationType} />
                <InfoItem icon={<Hospital size={15} />} label="Hospital" value={appointment.doctorHospital} />
                <InfoItem
                  icon={<CalendarDays size={15} />}
                  label="Date & Time"
                  value={formatDateTime(appointment.appointmentDateTime)}
                />
                <InfoItem
                  icon={<CreditCard size={15} />}
                  label="Fee"
                  value={`Rs. ${appointment.consultationFee ?? 0}`}
                />
                <InfoItem
                  icon={<FileText size={15} />}
                  label="Appointment No"
                  value={appointment.appointmentNumber ?? "Not assigned"}
                />
              </div>

              {appointment.notes && (
                <div style={s.notesBox}>
                  <p style={s.notesLabel}>Notes</p>
                  <p style={s.notesValue}>{appointment.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div style={s.infoItem}>
      <span style={s.infoIcon}>{icon}</span>
      <div>
        <p style={s.infoLabel}>{label}</p>
        <p style={s.infoValue}>{value || "Not available"}</p>
      </div>
    </div>
  );
}

const s = {
  page: { display: "flex", flexDirection: "column", gap: "20px" },
  banner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "18px",
    padding: "24px 28px",
    borderRadius: "18px",
    background: "linear-gradient(135deg, rgba(14,165,233,0.18) 0%, rgba(99,102,241,0.18) 100%)",
    border: "1px solid rgba(99,102,241,0.22)",
  },
  eyebrow: {
    color: "#38bdf8",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    margin: 0,
  },
  bannerTitle: { color: "#f8fafc", fontSize: "24px", fontWeight: "700", margin: "8px 0 6px 0" },
  bannerSub: { color: "#94a3b8", fontSize: "13px", lineHeight: "1.6", margin: 0, maxWidth: "720px" },
  statCard: {
    minWidth: "180px",
    background: "rgba(15,23,42,0.45)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  statLabel: { color: "#94a3b8", fontSize: "12px", fontWeight: "600" },
  statValue: { color: "#f8fafc", fontSize: "28px", fontWeight: "700" },
  toolbar: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  searchWrap: {
    flex: 1,
    minWidth: "280px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#111827",
    border: "1px solid #334155",
    borderRadius: "14px",
    padding: "12px 14px",
  },
  searchInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#f8fafc",
    outline: "none",
    fontSize: "14px",
    fontFamily: "'Poppins', sans-serif",
  },
  select: {
    background: "#111827",
    border: "1px solid #334155",
    borderRadius: "14px",
    color: "#f8fafc",
    padding: "12px 14px",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "14px",
    minWidth: "180px",
  },
  exportBtn: {
    padding: "12px 20px",
    background: "rgba(14,165,233,0.12)",
    border: "1px solid rgba(14,165,233,0.22)",
    borderRadius: "14px",
    color: "#38bdf8",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.2s",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(239,68,68,0.12)",
    color: "#fca5a5",
    border: "1px solid rgba(239,68,68,0.22)",
    borderRadius: "14px",
    padding: "14px 16px",
    fontSize: "13px",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "64px 20px",
    background: "#111827",
    border: "1px solid #334155",
    borderRadius: "18px",
  },
  emptyTitle: { color: "#f8fafc", fontSize: "16px", fontWeight: "600", margin: 0 },
  emptyDesc: { color: "#64748b", fontSize: "13px", margin: 0 },
  grid: { display: "grid", gap: "16px" },
  card: {
    background: "#111827",
    border: "1px solid #334155",
    borderRadius: "18px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  cardTop: { display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start" },
  cardTitle: { color: "#f8fafc", fontSize: "20px", fontWeight: "700", margin: 0 },
  cardSubtitle: { color: "#94a3b8", fontSize: "13px", margin: "6px 0 0 0" },
  statusPill: {
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },
  confirmed: { background: "rgba(16,185,129,0.14)", color: "#6ee7b7" },
  pending: { background: "rgba(245,158,11,0.14)", color: "#fcd34d" },
  cancelled: { background: "rgba(239,68,68,0.14)", color: "#fca5a5" },
  neutral: { background: "rgba(59,130,246,0.14)", color: "#93c5fd" },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" },
  infoItem: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.04)",
    borderRadius: "14px",
    padding: "14px",
  },
  infoIcon: { color: "#38bdf8", marginTop: "2px" },
  infoLabel: { color: "#64748b", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", margin: 0 },
  infoValue: { color: "#e2e8f0", fontSize: "13px", margin: "4px 0 0 0", lineHeight: "1.5" },
  notesBox: {
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.04)",
    borderRadius: "14px",
    padding: "14px",
  },
  notesLabel: { color: "#94a3b8", fontSize: "12px", fontWeight: "700", margin: 0 },
  notesValue: { color: "#e2e8f0", fontSize: "13px", lineHeight: "1.6", margin: "8px 0 0 0" },
};
