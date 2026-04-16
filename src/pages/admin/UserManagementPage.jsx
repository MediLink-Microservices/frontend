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
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      try {
        let roleFilter = "ALL";
        if (activeTab === "Admins") roleFilter = "ADMIN";
        if (activeTab === "Patients") roleFilter = "PATIENT";
        
        const res = await authAPI.adminUsers(roleFilter);
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

      {/* Table */}
      {loading ? (
        <div style={s.empty}><Spinner /></div>
      ) : users.length === 0 ? (
        <div style={s.empty}>
          <span style={{ fontSize: "52px" }}>👥</span>
          <p style={s.emptyTitle}>No users found</p>
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
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id || u.email} style={s.tr}>
                  <td style={s.td}><strong>{u.name}</strong></td>
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}>
                    <span style={{
                      ...s.badge, 
                      background: u.role === "ADMIN" ? "rgba(139,92,246,0.1)" : "rgba(14,165,233,0.1)",
                      color: u.role === "ADMIN" ? "#c4b5fd" : "#7dd3fc"
                    }}>
                      {u.role === "ADMIN" ? "🛡️ Admin" : "🧑‍⚕️ Patient"}
                    </span>
                  </td>
                  <td style={s.td}>{new Date(u.createdAt || Date.now()).toLocaleDateString()}</td>
                  <td style={s.td}>
                    <button style={s.editBtn} onClick={() => setEditingUser(u)}>
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <AddUserModal
          role={modalRole}
          onClose={() => setShowModal(false)}
          onSuccess={(user) => { setUsers(prev => [user, ...prev]); setShowModal(false); }}
        />
      )}

      {/* Edit Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            // Reload users
            setActiveTab(prev => prev === activeTab ? activeTab : activeTab);
          }}
        />
      )}
    </div>
  );
}

// ── Modals ───────────────────────────────────────────────────────────────────

function EditUserModal({ user, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: user.name, phoneNumber: user.phoneNumber || "", role: user.role });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.updateUserDetails(user.id, form);
      onSuccess();
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
          <h3 style={s.modalTitle}>Edit User Details</h3>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.fieldGroup}>
            <label style={s.label}>Email (Read-only)</label>
            <input style={{...s.input, opacity: 0.6}} value={user.email} readOnly />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Full Name</label>
            <input style={s.input} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Phone Number</label>
            <input style={s.input} value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Role</label>
            <select style={s.input} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="ADMIN">ADMIN</option>
              <option value="PATIENT">PATIENT</option>
            </select>
          </div>
          {error && <div style={s.errorBox}>{error}</div>}
          <div style={s.footer}>
            <button type="button" style={s.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={s.primaryBtn} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddUserModal({ role, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", phoneNumber: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!PASSWORD_REGEX.test(form.password)) {
      setError("Password too weak");
      return;
    }
    setLoading(true);
    try {
      await authAPI.adminRegister({ ...form, role });
      onSuccess({ ...form, role, createdAt: new Date().toISOString() });
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
          <h3 style={s.modalTitle}>Add New {role}</h3>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.grid2}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Name</label>
              <input style={s.input} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Phone</label>
              <input style={s.input} value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} />
            </div>
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Password</label>
            <div style={{position:"relative"}}>
              <input style={s.input} type={showPwd?"text":"password"} value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              <button type="button" style={s.eyeBtn} onClick={() => setShowPwd(!showPwd)}>{showPwd?"🙈":"👁️"}</button>
            </div>
          </div>
          {error && <div style={s.errorBox}>{error}</div>}
          <div style={s.footer}>
            <button type="button" style={s.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={s.primaryBtn} disabled={loading}>Create Account</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const Spinner = () => <div style={{width:"20px",height:"20px",border:"2px solid #334155",borderTopColor:"#6366f1",borderRadius:"50%",animation:"spin 0.6s linear infinite"}}/>;

const s = {
  page: { display:"flex", flexDirection:"column", gap:"20px" },
  header: { display:"flex", alignItems:"center", justifyContent:"space-between" },
  heading: { color:"#f1f5f9", fontSize:"18px", fontWeight:"700", margin:0 },
  sub: { color:"#64748b", fontSize:"12px", margin:"3px 0 0 0" },
  btnGroup: { display:"flex", gap:"10px" },
  primaryBtn: { padding:"10px 18px", background:"linear-gradient(135deg,#6366f1,#0ea5e9)", border:"none", borderRadius:"10px", color:"white", fontSize:"13px", fontWeight:"600", cursor:"pointer" },
  secondaryBtn: { padding:"10px 18px", background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.3)", borderRadius:"10px", color:"#c4b5fd", fontSize:"13px", fontWeight:"600", cursor:"pointer" },
  tabs: { display:"flex", gap:"4px", background:"#1e293b", padding:"4px", borderRadius:"10px", width:"fit-content" },
  tab: { padding:"7px 16px", borderRadius:"7px", background:"none", border:"none", color:"#64748b", fontSize:"12px", fontWeight:"500", cursor:"pointer" },
  tabActive: { background:"#334155", color:"#f1f5f9" },
  tableContainer: { background:"#1e293b", border:"1px solid #334155", borderRadius:"12px", overflow:"hidden" },
  tableDom: { width:"100%", borderCollapse:"collapse", textAlign:"left", fontSize:"13px" },
  th: { padding:"14px 20px", color:"#94a3b8", fontWeight:"600", borderBottom:"1px solid #334155", background:"#0f172a" },
  tr: { borderBottom:"1px solid #334155" },
  td: { padding:"14px 20px", color:"#f1f5f9" },
  badge: { padding:"4px 10px", borderRadius:"6px", fontSize:"11px", fontWeight:"600", display:"inline-block" },
  editBtn: { background:"rgba(14,165,233,0.1)", border:"1px solid rgba(14,165,233,0.2)", color:"#0ea5e9", padding:"4px 10px", borderRadius:"6px", cursor:"pointer", fontSize:"11px" },
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 },
  modal: { background:"#1e293b", borderRadius:"20px", width:"400px", border:"1px solid #334155", padding:"20px" },
  modalTop: { display:"flex", justifyContent:"space-between", marginBottom:"20px" },
  modalTitle: { color:"#f1f5f9", margin:0, fontSize:"18px" },
  closeBtn: { background:"none", border:"none", color:"#64748b", fontSize:"18px", cursor:"pointer" },
  form: { display:"flex", flexDirection:"column", gap:"15px" },
  fieldGroup: { display:"flex", flexDirection:"column", gap:"5px" },
  label: { color:"#94a3b8", fontSize:"12px" },
  input: { background:"#0f172a", border:"1px solid #334155", borderRadius:"8px", color:"#f1f5f9", padding:"10px", fontSize:"13px" },
  grid2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" },
  eyeBtn: { position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer" },
  errorBox: { color:"#ef4444", fontSize:"12px" },
  footer: { display:"flex", justifyContent:"flex-end", gap:"10px", marginTop:"10px" },
  cancelBtn: { background:"none", border:"1px solid #334155", color:"#94a3b8", padding:"8px 15px", borderRadius:"8px", cursor:"pointer" },
  empty: { padding:"40px", textAlign:"center", color:"#64748b" }
};
