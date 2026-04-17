import { useState, useEffect } from "react";
import { authAPI } from "../../services/api";

const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,}$/;

function getErrorMessage(error) {
  const data = error?.response?.data;
  if (data?.details && typeof data.details === "object" && !Array.isArray(data.details)) {
    const msgs = Object.values(data.details).filter(Boolean);
    if (msgs.length > 0) return msgs.join(" | ");
  }
  return data?.message || data?.error || error?.message || "Operation failed.";
}

const SPECIALIZATIONS = [
  "General Practitioner","Cardiologist","Dermatologist","Pediatrician",
  "Neurologist","Orthopedic Surgeon","Gynecologist","Psychiatrist",
  "Ophthalmologist","ENT Specialist","Radiologist","Oncologist","Other",
];

export default function DoctorManagementPage() {
  const [showModal, setShowModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadDoctors() {
      try {
        const res = await authAPI.adminUsers("DOCTOR");
        setDoctors(res.data.data.users);
      } catch (err) {
        console.error("Failed to load doctors", err);
      } finally {
        setLoading(false);
      }
    }
    loadDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.specialization && doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const generatePDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("MediLink - Doctors Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    const tableData = filteredDoctors.map(d => [
      d.name,
      d.email,
      d.isApproved ? "Active" : "Pending",
      new Date(d.createdAt).toLocaleDateString()
    ]);
    
    doc.autoTable({
      startY: 35,
      head: [['Name', 'Email', 'Status', 'Joined']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
    });
    
    doc.save(`doctors-report-${new Date().getTime()}.pdf`);
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h2 style={s.heading}>Doctors</h2>
          <p style={s.sub}>All doctor accounts — created by admin are immediately active.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={s.secondaryBtn} onClick={generatePDF}>
            📄 Export PDF
          </button>
          <button style={s.primaryBtn} id="add-doctor-btn" onClick={() => setShowModal(true)}>
            + Add Doctor
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={s.searchContainer}>
        <span style={s.searchIcon}>🔍</span>
        <input
          style={s.searchInput}
          placeholder="Search by name, email or specialization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table / Empty state */}
      {loading ? (
        <div style={s.empty}>
          <Spinner />
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div style={s.empty}>
          <span style={{ fontSize: "52px" }}>👨‍⚕️</span>
          <p style={s.emptyTitle}>{searchTerm ? "No results found" : "No doctors registered yet"}</p>
          <p style={s.emptySub}>
            {searchTerm ? "Try a different search term." : "Click \"Add Doctor\" to create the first doctor account."}
          </p>
        </div>
      ) : (
        <div style={s.tableContainer}>
          <table style={s.tableDom}>
            <thead>
              <tr>
                <th style={s.th}>Name</th>
                <th style={s.th}>Email</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map(doc => (
                <tr key={doc.id || doc.email} style={s.tr}>
                  <td style={s.td}><strong>{doc.name}</strong></td>
                  <td style={s.td}>{doc.email}</td>
                  <td style={s.td}>
                    {doc.isApproved ? (
                      <span style={{...s.badge, background:"rgba(16,185,129,0.1)", color:"#10b981"}}>Active</span>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{...s.badge, background:"rgba(245,158,11,0.1)", color:"#f59e0b"}}>Pending</span>
                        <button
                          style={s.approveBtn}
                          onClick={async () => {
                            try {
                              await authAPI.approveUser(doc.id, true);
                              setDoctors(prev => prev.map(d => d.id === doc.id ? { ...d, isApproved: true } : d));
                            } catch (err) {
                              alert("Failed to approve: " + getErrorMessage(err));
                            }
                          }}
                        >
                          Approve
                        </button>
                      </div>
                    )}
                  </td>
                  <td style={s.td}>{new Date(doc.createdAt || Date.now()).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AddDoctorModal
          onClose={() => setShowModal(false)}
          onSuccess={(doctor) => {
            setDoctors(prev => [doctor, ...prev]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

// ── Add Doctor Modal ─────────────────────────────────────────────────────────
function AddDoctorModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "", email: "", password: "", phoneNumber: "",
    role: "DOCTOR", specialization: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(c => ({ ...c, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!PASSWORD_REGEX.test(form.password)) {
      setError("Password must be 8+ chars with uppercase, lowercase, number & special char (@#$%^&+=)");
      return;
    }
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role: "DOCTOR" };
      if (form.phoneNumber.trim()) payload.phoneNumber = form.phoneNumber;
      const res = await authAPI.adminRegister(payload);
      setSuccess(`Dr. ${form.name} has been registered and is immediately active!`);
      setTimeout(() => {
        onSuccess({ name: form.name, email: form.email, specialization: form.specialization, role: "DOCTOR" });
      }, 1200);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.modalTop}>
          <div>
            <h3 style={s.modalTitle}>Register New Doctor</h3>
            <p style={s.modalSub}>Account will be <strong style={{color:"#10b981"}}>immediately active</strong> — no approval needed.</p>
          </div>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.grid2}>
            <Field label="Full Name" id="dm-name">
              <InputRow icon="👤">
                <input id="dm-name" style={s.input} type="text" name="name" value={form.name}
                  onChange={handleChange} placeholder="Dr. Jane Smith" required minLength={2}/>
              </InputRow>
            </Field>
            <Field label="Phone" id="dm-phone" optional>
              <InputRow icon="📞">
                <input id="dm-phone" style={s.input} type="tel" name="phoneNumber" value={form.phoneNumber}
                  onChange={handleChange} placeholder="0771234567"/>
              </InputRow>
            </Field>
          </div>

          <Field label="Email Address" id="dm-email">
            <InputRow icon="✉️">
              <input id="dm-email" style={s.input} type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="doctor@medilink.com" required/>
            </InputRow>
          </Field>

          <Field label="Specialization" id="dm-spec" optional>
            <InputRow icon="🩺">
              <select id="dm-spec" style={{ ...s.input, paddingLeft: "36px" }} name="specialization"
                value={form.specialization} onChange={handleChange}>
                <option value="">Select specialization...</option>
                {SPECIALIZATIONS.map(sp => <option key={sp} value={sp}>{sp}</option>)}
              </select>
            </InputRow>
          </Field>

          <Field label="Temporary Password" id="dm-pwd">
            <InputRow icon="🔒" extra={
              <button type="button" style={s.eyeBtn} onClick={() => setShowPwd(v=>!v)} tabIndex={-1}>
                {showPwd ? "🙈" : "👁️"}
              </button>
            }>
              <input id="dm-pwd" style={s.input} type={showPwd?"text":"password"} name="password"
                value={form.password} onChange={handleChange}
                placeholder="Min 8 chars, A-Z, 0-9, @#$%^&+=" required/>
            </InputRow>
            <p style={s.hint}>Share this temporary password with the doctor after creation.</p>
          </Field>

          <div style={s.infoBanner}>
            ✅ Created by admin — doctor can <strong>login immediately</strong>, no approval required.
          </div>

          {error   && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          <div style={s.footer}>
            <button type="button" style={s.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" style={{ ...s.submitBtn, opacity: loading?.75:1 }} disabled={loading} id="dm-submit">
              {loading && <Spinner/>}
              {loading ? "Creating..." : "Create Doctor"}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        select{appearance:none}
        input:focus,select:focus{outline:none;border-color:#6366f1!important;box-shadow:0 0 0 3px rgba(99,102,241,0.15)}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function Field({ label, id, optional, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
      <label style={s.label} htmlFor={id}>
        {label} {optional && <span style={s.optional}>optional</span>}
      </label>
      {children}
    </div>
  );
}

function InputRow({ icon, extra, children }) {
  return (
    <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
      <span style={s.inputIcon}>{icon}</span>
      {children}
      {extra}
    </div>
  );
}

function Alert({ type, children }) {
  const isErr = type === "error";
  return (
    <div style={{
      display:"flex", gap:"8px", padding:"11px 14px", borderRadius:"10px",
      background: isErr ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
      border: `1px solid ${isErr ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`,
      color: isErr ? "#fca5a5" : "#6ee7b7", fontSize:"12px",
    }}>
      <span>{isErr ? "⚠️" : "✅"}</span><span>{children}</span>
    </div>
  );
}

function Spinner() {
  return <span style={{ width:"14px",height:"14px",border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"white",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite" }}/>;
}

// ── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: { display:"flex", flexDirection:"column", gap:"20px" },
  header: { display:"flex", alignItems:"center", justifyContent:"space-between" },
  heading: { color:"#f1f5f9", fontSize:"18px", fontWeight:"700", margin:0 },
  sub: { color:"#64748b", fontSize:"12px", margin:"3px 0 0 0" },
  primaryBtn: {
    padding:"10px 20px", background:"linear-gradient(135deg,#6366f1,#0ea5e9)",
    border:"none", borderRadius:"10px", color:"white", fontSize:"13px",
    fontWeight:"600", cursor:"pointer", fontFamily:"'Poppins',sans-serif",
  },
  secondaryBtn: {
    padding:"10px 20px", background:"rgba(14,165,233,0.1)",
    border:"1px solid rgba(14,165,233,0.2)", borderRadius:"10px", color:"#0ea5e9", fontSize:"13px",
    fontWeight:"600", cursor:"pointer", fontFamily:"'Poppins',sans-serif",
    display: "flex", alignItems: "center", gap: "8px"
  },
  searchContainer: {
    display: "flex", alignItems: "center", gap: "10px",
    background: "#111827", border: "1px solid #334155",
    borderRadius: "14px", padding: "10px 14px", marginBottom: "10px"
  },
  searchIcon: { fontSize: "16px", color: "#64748b" },
  searchInput: {
    flex: 1, background: "transparent", border: "none",
    color: "#f8fafc", outline: "none", fontSize: "14px",
    fontFamily: "'Poppins', sans-serif",
  },
  approveBtn: {
    padding: "4px 10px", background: "rgba(16,185,129,0.15)",
    border: "1px solid rgba(16,185,129,0.3)", borderRadius: "6px",
    color: "#10b981", fontSize: "11px", fontWeight: "600",
    cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    transition: "all 0.15s",
  },
  empty: { display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 20px",gap:"12px" },
  emptyTitle: { color:"#f1f5f9",fontSize:"16px",fontWeight:"600",margin:0 },
  emptySub: { color:"#64748b",fontSize:"13px",margin:0 },
  // Table
  tableContainer: { background:"#1e293b", border:"1px solid #334155", borderRadius:"12px", overflow:"hidden" },
  tableDom: { width:"100%", borderCollapse:"collapse", textAlign:"left", fontSize:"13px", fontFamily:"'Poppins',sans-serif" },
  th: { padding:"14px 20px", color:"#94a3b8", fontWeight:"600", borderBottom:"1px solid #334155", background:"#0f172a" },
  tr: { borderBottom:"1px solid #334155" },
  td: { padding:"14px 20px", color:"#f1f5f9" },
  badge: { padding:"4px 10px", borderRadius:"6px", fontSize:"11px", fontWeight:"600", display:"inline-block" },
  // Modal
  overlay: { position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:"20px" },
  modal: { background:"#1e293b",borderRadius:"20px",width:"100%",maxWidth:"520px",border:"1px solid #334155",boxShadow:"0 40px 80px rgba(0,0,0,0.5)",maxHeight:"90vh",overflowY:"auto" },
  modalTop: { display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"22px 22px 0 22px" },
  modalTitle: { color:"#f1f5f9",fontSize:"18px",fontWeight:"700",margin:"0 0 4px 0" },
  modalSub: { color:"#64748b",fontSize:"12px",margin:0 },
  closeBtn: { background:"#0f172a",border:"1px solid #334155",color:"#94a3b8",width:"30px",height:"30px",borderRadius:"8px",cursor:"pointer",fontSize:"13px",flexShrink:0 },
  form: { padding:"18px 22px 22px",display:"flex",flexDirection:"column",gap:"14px" },
  grid2: { display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px" },
  label: { color:"#94a3b8",fontSize:"12px",fontWeight:"500",display:"flex",alignItems:"center",gap:"6px" },
  optional: { color:"#475569",fontSize:"10px",background:"#0f172a",padding:"1px 5px",borderRadius:"3px" },
  inputIcon: { position:"absolute",left:"11px",fontSize:"14px",pointerEvents:"none" },
  input: { width:"100%",padding:"11px 12px 11px 34px",background:"#0f172a",border:"1.5px solid #334155",borderRadius:"10px",color:"#f1f5f9",fontSize:"13px",fontFamily:"'Poppins',sans-serif",boxSizing:"border-box",transition:"border-color 0.2s" },
  eyeBtn: { position:"absolute",right:"10px",background:"none",border:"none",cursor:"pointer",fontSize:"14px" },
  hint: { color:"#475569",fontSize:"11px",margin:"2px 0 0 0" },
  infoBanner: { background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:"10px",padding:"11px 14px",color:"#6ee7b7",fontSize:"12px" },
  footer: { display:"flex",gap:"10px",justifyContent:"flex-end",paddingTop:"4px" },
  cancelBtn: { padding:"10px 18px",background:"#0f172a",border:"1.5px solid #334155",borderRadius:"10px",color:"#94a3b8",fontSize:"13px",fontWeight:"500",cursor:"pointer",fontFamily:"'Poppins',sans-serif" },
  submitBtn: { display:"flex",alignItems:"center",gap:"8px",padding:"10px 22px",background:"linear-gradient(135deg,#6366f1,#0ea5e9)",border:"none",borderRadius:"10px",color:"white",fontSize:"13px",fontWeight:"600",cursor:"pointer",fontFamily:"'Poppins',sans-serif" },
};
