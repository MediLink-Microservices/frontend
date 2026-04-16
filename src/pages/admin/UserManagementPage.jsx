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

const TABS = ["All Users", "Admins", "Patients"];

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState("All Users");
  const [showModal, setShowModal] = useState(false);
  const [modalRole, setModalRole] = useState("ADMIN");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      try {
        let roleFilter = "ALL";
        if (activeTab === "Admins") roleFilter = "ADMIN";
        if (activeTab === "Patients") roleFilter = "PATIENT";
        
        const res = await authAPI.adminUsers(roleFilter);
        // Exclude DOCTORs from this page since they have their own page
        const filtered = roleFilter === "ALL" 
          ? res.data.data.users.filter(u => u.role !== "DOCTOR")
          : res.data.data.users;
          
        setUsers(filtered);
      } catch (err) {
        console.error("Failed to load users", err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, [activeTab]);

  const openModal = (role) => { setModalRole(role); setShowModal(true); };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h2 style={s.heading}>Users</h2>
          <p style={s.sub}>Manage administrators and patients on the platform.</p>
        </div>
        <div style={s.btnGroup}>
          <button style={s.secondaryBtn} id="add-admin-btn" onClick={() => openModal("ADMIN")}>
            🛡️ Add Admin
          </button>
          <button style={s.primaryBtn} id="add-patient-btn" onClick={() => openModal("PATIENT")}>
            + Add Patient
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {TABS.map(tab => (
          <button key={tab} style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }}
            onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {/* Table / Empty state */}
      {loading ? (
        <div style={s.empty}>
          <Spinner />
        </div>
      ) : users.length === 0 ? (
        <div style={s.empty}>
          <span style={{ fontSize: "52px" }}>👥</span>
          <p style={s.emptyTitle}>No users found</p>
          <p style={s.emptySub}>Add an administrator or patient to get started.</p>
        </div>
      ) : (
        <div style={s.tableContainer}>
          <table style={s.tableDom}>
            <thead>
              <tr>
                <th style={s.th}>Name</th>
                <th style={s.th}>Email</th>
                <th style={s.th}>Role</th>
                <th style={s.th}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id || u.email} style={s.tr}>
                  <td style={s.td}><strong>{u.name}</strong></td>
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}>
                    {u.role === "ADMIN" ? (
                      <span style={{...s.badge, background:"rgba(139,92,246,0.1)", color:"#c4b5fd"}}>🛡️ Admin</span>
                    ) : (
                      <span style={{...s.badge, background:"rgba(14,165,233,0.1)", color:"#7dd3fc"}}>🧑‍⚕️ Patient</span>
                    )}
                  </td>
                  <td style={s.td}>{new Date(u.createdAt || Date.now()).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AddUserModal
          role={modalRole}
          onClose={() => setShowModal(false)}
          onSuccess={(user) => {
            setUsers(prev => [user, ...prev]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

// ── Add User Modal ───────────────────────────────────────────────────────────
function AddUserModal({ role, onClose, onSuccess }) {
  const isAdmin = role === "ADMIN";
  const [form, setForm] = useState({ name: "", email: "", password: "", phoneNumber: "" });
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
      const payload = { name: form.name, email: form.email, password: form.password, role };
      if (form.phoneNumber.trim()) payload.phoneNumber = form.phoneNumber;
      const res = await authAPI.adminRegister(payload);
      setSuccess(`${isAdmin ? "Admin" : "Patient"} account for ${form.name} created and is immediately active!`);
      setTimeout(() => onSuccess({ ...payload }), 1200);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const accentColor = isAdmin ? "#8b5cf6" : "#0ea5e9";
  const accentBg = isAdmin ? "rgba(139,92,246,0.1)" : "rgba(14,165,233,0.1)";

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.modalTop}>
          <div>
            <div style={{ ...s.roleBadge, background: accentBg, color: accentColor }}>
              {isAdmin ? "🛡️ Administrator" : "🧑‍⚕️ Patient"}
            </div>
            <h3 style={s.modalTitle}>{isAdmin ? "Add New Admin" : "Add New Patient"}</h3>
            <p style={s.modalSub}>Account will be <strong style={{color:"#10b981"}}>immediately active</strong>.</p>
          </div>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.grid2}>
            <div style={s.fieldGroup}>
              <label style={s.label} htmlFor="um-name">Full Name</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>👤</span>
                <input id="um-name" style={s.input} type="text" name="name" value={form.name}
                  onChange={handleChange} placeholder="Full name" required minLength={2}/>
              </div>
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label} htmlFor="um-phone">
                Phone <span style={s.optional}>optional</span>
              </label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>📞</span>
                <input id="um-phone" style={s.input} type="tel" name="phoneNumber" value={form.phoneNumber}
                  onChange={handleChange} placeholder="0771234567"/>
              </div>
            </div>
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label} htmlFor="um-email">Email Address</label>
            <div style={s.inputWrap}>
              <span style={s.inputIcon}>✉️</span>
              <input id="um-email" style={s.input} type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="user@medilink.com" required/>
            </div>
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label} htmlFor="um-pwd">Password</label>
            <div style={s.inputWrap}>
              <span style={s.inputIcon}>🔒</span>
              <input id="um-pwd" style={s.input} type={showPwd?"text":"password"} name="password"
                value={form.password} onChange={handleChange}
                placeholder="Min 8 chars, A-Z, 0-9, @#$%^&+=" required/>
              <button type="button" style={s.eyeBtn} onClick={() => setShowPwd(v=>!v)} tabIndex={-1}>
                {showPwd ? "🙈" : "👁️"}
              </button>
            </div>
            <p style={s.hint}>Must include uppercase, lowercase, number & special char (@#$%^&+=)</p>
          </div>

          <div style={{ ...s.infoBanner, background: accentBg, borderColor: accentColor + "33", color: accentColor }}>
            ✅ Created by admin — account is <strong>immediately active</strong>.
          </div>

          {error   && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          <div style={s.footer}>
            <button type="button" style={s.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit"
              style={{ ...s.submitBtn, background: `linear-gradient(135deg, ${accentColor}, #0ea5e9)`, opacity: loading ? 0.75 : 1 }}
              disabled={loading} id="um-submit">
              {loading && <Spinner/>}
              {loading ? "Creating..." : `Create ${isAdmin ? "Admin" : "Patient"}`}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        input:focus,select:focus{outline:none;border-color:#6366f1!important;box-shadow:0 0 0 3px rgba(99,102,241,0.15)}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
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

const s = {
  page: { display:"flex", flexDirection:"column", gap:"20px" },
  header: { display:"flex", alignItems:"center", justifyContent:"space-between" },
  heading: { color:"#f1f5f9", fontSize:"18px", fontWeight:"700", margin:0 },
  sub: { color:"#64748b", fontSize:"12px", margin:"3px 0 0 0" },
  btnGroup: { display:"flex", gap:"10px" },
  primaryBtn: { padding:"10px 18px", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", border:"none", borderRadius:"10px", color:"white", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"'Poppins',sans-serif" },
  secondaryBtn: { padding:"10px 18px", background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.3)", borderRadius:"10px", color:"#c4b5fd", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"'Poppins',sans-serif" },
  tabs: { display:"flex", gap:"4px", background:"#1e293b", padding:"4px", borderRadius:"10px", width:"fit-content" },
  tab: { padding:"7px 16px", borderRadius:"7px", background:"none", border:"none", color:"#64748b", fontSize:"12px", fontWeight:"500", cursor:"pointer", fontFamily:"'Poppins',sans-serif", transition:"all 0.15s" },
  tabActive: { background:"#334155", color:"#f1f5f9" },
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
  modal: { background:"#1e293b",borderRadius:"20px",width:"100%",maxWidth:"500px",border:"1px solid #334155",boxShadow:"0 40px 80px rgba(0,0,0,0.5)",maxHeight:"90vh",overflowY:"auto" },
  modalTop: { display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"22px 22px 0 22px" },
  roleBadge: { display:"inline-flex",alignItems:"center",gap:"6px",borderRadius:"20px",padding:"4px 12px",fontSize:"11px",fontWeight:"600",marginBottom:"8px" },
  modalTitle: { color:"#f1f5f9",fontSize:"18px",fontWeight:"700",margin:"0 0 4px 0" },
  modalSub: { color:"#64748b",fontSize:"12px",margin:0 },
  closeBtn: { background:"#0f172a",border:"1px solid #334155",color:"#94a3b8",width:"30px",height:"30px",borderRadius:"8px",cursor:"pointer",fontSize:"13px",flexShrink:0 },
  form: { padding:"18px 22px 22px",display:"flex",flexDirection:"column",gap:"14px" },
  grid2: { display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px" },
  fieldGroup: { display:"flex",flexDirection:"column",gap:"6px" },
  label: { color:"#94a3b8",fontSize:"12px",fontWeight:"500",display:"flex",alignItems:"center",gap:"6px" },
  optional: { color:"#475569",fontSize:"10px",background:"#0f172a",padding:"1px 5px",borderRadius:"3px" },
  inputWrap: { position:"relative",display:"flex",alignItems:"center" },
  inputIcon: { position:"absolute",left:"11px",fontSize:"14px",pointerEvents:"none" },
  input: { width:"100%",padding:"11px 12px 11px 34px",background:"#0f172a",border:"1.5px solid #334155",borderRadius:"10px",color:"#f1f5f9",fontSize:"13px",fontFamily:"'Poppins',sans-serif",boxSizing:"border-box" },
  eyeBtn: { position:"absolute",right:"10px",background:"none",border:"none",cursor:"pointer",fontSize:"14px" },
  hint: { color:"#475569",fontSize:"11px",margin:"2px 0 0 0" },
  infoBanner: { borderRadius:"10px",padding:"11px 14px",fontSize:"12px",border:"1px solid" },
  footer: { display:"flex",gap:"10px",justifyContent:"flex-end" },
  cancelBtn: { padding:"10px 18px",background:"#0f172a",border:"1.5px solid #334155",borderRadius:"10px",color:"#94a3b8",fontSize:"13px",fontWeight:"500",cursor:"pointer",fontFamily:"'Poppins',sans-serif" },
  submitBtn: { display:"flex",alignItems:"center",gap:"8px",padding:"10px 22px",border:"none",borderRadius:"10px",color:"white",fontSize:"13px",fontWeight:"600",cursor:"pointer",fontFamily:"'Poppins',sans-serif" },
};
