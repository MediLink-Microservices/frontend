import { useState } from "react";
import { authAPI } from "../../services/api";

function getErrorMessage(error) {
  const data = error?.response?.data;
  if (data?.details && typeof data.details === "object") {
    const msgs = Object.values(data.details).filter(Boolean);
    if (msgs.length > 0) return msgs.join(" | ");
  }
  return data?.message || data?.error || error?.message || "Operation failed.";
}

export default function Profile({ onClose }) {
  const stored = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  })();

  const [mode, setMode] = useState("view"); // "view" | "edit"
  const [form, setForm] = useState({
    name: stored.name || "",
    email: stored.email || "",
    phoneNumber: stored.phoneNumber || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((c) => ({ ...c, [name]: value }));
    if (error) setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (form.newPassword && form.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      // Update localStorage with new name (in a real app you'd call a profile update endpoint)
      const updatedUser = { ...stored, name: form.name, phoneNumber: form.phoneNumber };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setSuccess("Profile updated successfully!");
      setTimeout(() => { setMode("view"); setSuccess(""); }, 1500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const initials = (stored.name || "A").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.avatarLarge}>{initials}</div>
          <div style={s.headerText}>
            <h2 style={s.headerName}>{stored.name || "Admin"}</h2>
            <span style={s.roleBadge}>🛡️ Administrator</span>
          </div>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Tab Switcher */}
        <div style={s.tabs}>
          <button
            style={{ ...s.tab, ...(mode === "view" ? s.tabActive : {}) }}
            onClick={() => { setMode("view"); setError(""); setSuccess(""); }}
          >
            👤 Profile Info
          </button>
          <button
            style={{ ...s.tab, ...(mode === "edit" ? s.tabActive : {}) }}
            onClick={() => { setMode("edit"); setError(""); setSuccess(""); }}
          >
            ✏️ Edit Profile
          </button>
        </div>

        {/* VIEW MODE */}
        {mode === "view" && (
          <div style={s.viewBody}>
            <InfoRow icon="👤" label="Full Name" value={stored.name || "—"} />
            <InfoRow icon="✉️" label="Email" value={stored.email || "—"} />
            <InfoRow icon="📞" label="Phone" value={stored.phoneNumber || "Not set"} />
            <InfoRow icon="🛡️" label="Role" value={stored.role || "ADMIN"} />
            <InfoRow icon="🆔" label="User ID" value={stored.userId || "—"} />
            <div style={s.viewActions}>
              <button style={s.editBtn} onClick={() => setMode("edit")}>
                ✏️ Edit Profile
              </button>
            </div>
          </div>
        )}

        {/* EDIT MODE */}
        {mode === "edit" && (
          <form style={s.form} onSubmit={handleSave}>
            <div style={s.grid2}>
              <div style={s.fieldGroup}>
                <label style={s.label} htmlFor="p-name">Full Name</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>👤</span>
                  <input id="p-name" style={s.input} type="text" name="name"
                    value={form.name} onChange={handleChange} placeholder="Your full name" required minLength={2} />
                </div>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label} htmlFor="p-phone">Phone</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>📞</span>
                  <input id="p-phone" style={s.input} type="tel" name="phoneNumber"
                    value={form.phoneNumber} onChange={handleChange} placeholder="0771234567" />
                </div>
              </div>
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label} htmlFor="p-email">Email Address <span style={s.optional}>read-only</span></label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>✉️</span>
                <input id="p-email" style={{ ...s.input, opacity: 0.5 }} type="email"
                  value={form.email} readOnly />
              </div>
            </div>

            <div style={s.divider}>
              <span style={s.dividerText}>Change Password <span style={s.optional}>optional</span></span>
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label} htmlFor="p-newpwd">New Password</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>🔒</span>
                <input id="p-newpwd" style={s.input}
                  type={showPwd ? "text" : "password"} name="newPassword"
                  value={form.newPassword} onChange={handleChange}
                  placeholder="Leave blank to keep current" />
                <button type="button" style={s.eyeBtn} onClick={() => setShowPwd(v => !v)} tabIndex={-1}>
                  {showPwd ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label} htmlFor="p-confirm">Confirm New Password</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>🔒</span>
                <input id="p-confirm" style={s.input}
                  type={showPwd ? "text" : "password"} name="confirmPassword"
                  value={form.confirmPassword} onChange={handleChange}
                  placeholder="Repeat new password" />
              </div>
            </div>

            {error   && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}

            <div style={s.footer}>
              <button type="button" style={s.cancelBtn}
                onClick={() => { setMode("view"); setError(""); setSuccess(""); }}
                disabled={loading}>
                Cancel
              </button>
              <button type="submit" style={{ ...s.saveBtn, opacity: loading ? 0.75 : 1 }}
                disabled={loading} id="profile-save">
                {loading && <Spinner />}
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { outline: none; border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
      `}</style>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }) {
  return (
    <div style={s.infoRow}>
      <div style={s.infoIcon}>{icon}</div>
      <div>
        <p style={s.infoLabel}>{label}</p>
        <p style={s.infoValue}>{value}</p>
      </div>
    </div>
  );
}

function Alert({ type, children }) {
  const isErr = type === "error";
  return (
    <div style={{
      display: "flex", gap: "8px", padding: "11px 14px", borderRadius: "10px",
      background: isErr ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
      border: `1px solid ${isErr ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`,
      color: isErr ? "#fca5a5" : "#6ee7b7", fontSize: "12px",
    }}>
      <span>{isErr ? "⚠️" : "✅"}</span><span>{children}</span>
    </div>
  );
}

function Spinner() {
  return <span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />;
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" },
  modal: { background: "#1e293b", borderRadius: "20px", width: "100%", maxWidth: "520px", border: "1px solid #334155", boxShadow: "0 40px 80px rgba(0,0,0,0.5)", maxHeight: "90vh", overflowY: "auto" },
  header: { display: "flex", alignItems: "center", gap: "16px", padding: "24px 24px 0 24px" },
  avatarLarge: { width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "22px", flexShrink: 0 },
  headerText: { flex: 1 },
  headerName: { color: "#f1f5f9", fontSize: "20px", fontWeight: "700", margin: "0 0 6px 0" },
  roleBadge: { background: "rgba(99,102,241,0.12)", color: "#a5b4fc", fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px" },
  closeBtn: { background: "#0f172a", border: "1px solid #334155", color: "#94a3b8", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", flexShrink: 0, alignSelf: "flex-start" },
  tabs: { display: "flex", gap: "4px", margin: "20px 24px 0", background: "#0f172a", padding: "4px", borderRadius: "10px" },
  tab: { flex: 1, padding: "8px", borderRadius: "7px", background: "none", border: "none", color: "#64748b", fontSize: "12px", fontWeight: "500", cursor: "pointer", fontFamily: "'Poppins',sans-serif", transition: "all 0.15s" },
  tabActive: { background: "#1e293b", color: "#f1f5f9" },
  // View
  viewBody: { padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: "4px" },
  infoRow: { display: "flex", alignItems: "flex-start", gap: "14px", padding: "14px 0", borderBottom: "1px solid #1e293b" },
  infoIcon: { fontSize: "20px", marginTop: "2px", width: "24px", textAlign: "center", flexShrink: 0 },
  infoLabel: { color: "#64748b", fontSize: "11px", fontWeight: "500", margin: "0 0 3px 0", textTransform: "uppercase", letterSpacing: "0.5px" },
  infoValue: { color: "#f1f5f9", fontSize: "14px", fontWeight: "500", margin: 0 },
  viewActions: { marginTop: "16px", display: "flex", justifyContent: "flex-end" },
  editBtn: { padding: "10px 20px", background: "linear-gradient(135deg,#6366f1,#0ea5e9)", border: "none", borderRadius: "10px", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Poppins',sans-serif" },
  // Form
  form: { padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: "14px" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { color: "#94a3b8", fontSize: "12px", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" },
  optional: { color: "#475569", fontSize: "10px", background: "#0f172a", padding: "1px 5px", borderRadius: "3px" },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute", left: "11px", fontSize: "14px", pointerEvents: "none" },
  input: { width: "100%", padding: "11px 12px 11px 34px", background: "#0f172a", border: "1.5px solid #334155", borderRadius: "10px", color: "#f1f5f9", fontSize: "13px", fontFamily: "'Poppins',sans-serif", boxSizing: "border-box", transition: "border-color 0.2s" },
  eyeBtn: { position: "absolute", right: "10px", background: "none", border: "none", cursor: "pointer", fontSize: "14px" },
  divider: { borderTop: "1px solid #334155", paddingTop: "14px" },
  dividerText: { color: "#475569", fontSize: "12px", fontWeight: "600" },
  footer: { display: "flex", gap: "10px", justifyContent: "flex-end" },
  cancelBtn: { padding: "10px 18px", background: "#0f172a", border: "1.5px solid #334155", borderRadius: "10px", color: "#94a3b8", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "'Poppins',sans-serif" },
  saveBtn: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 22px", background: "linear-gradient(135deg,#6366f1,#0ea5e9)", border: "none", borderRadius: "10px", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Poppins',sans-serif" },
};
