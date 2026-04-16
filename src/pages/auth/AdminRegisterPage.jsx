import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";

// The admin secret key — in production this should be env-controlled / one-time-use
const ADMIN_SECRET = "MEDILINK-ADMIN-2024";

// Backend returns: { status, message, errorCode, details: { fieldName: "error msg" } }
function getErrorMessage(error) {
  const data = error?.response?.data;
  if (data?.details && typeof data.details === "object" && !Array.isArray(data.details)) {
    const msgs = Object.values(data.details).filter(Boolean);
    if (msgs.length > 0) return msgs.join(" | ");
  }
  return data?.message || data?.error || error?.message || "Registration failed. Please try again.";
}

const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,}$/;

function getPasswordStrength(pwd) {
  if (!pwd) return { level: 0, label: "", color: "#334155" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[@#$%^&+=]/.test(pwd)) score++;
  if (score <= 2) return { level: score, label: "Weak", color: "#ef4444" };
  if (score === 3) return { level: score, label: "Fair", color: "#f59e0b" };
  if (score === 4) return { level: score, label: "Good", color: "#0ea5e9" };
  return { level: score, label: "Strong", color: "#10b981" };
}

export default function AdminRegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [secretKey, setSecretKey] = useState("");
  const [keyError, setKeyError] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "", phoneNumber: "", role: "ADMIN" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const pwdStrength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((c) => ({ ...c, [name]: value }));
    if (error) setError("");
  };

  const handleVerifyKey = (e) => {
    e.preventDefault();
    if (secretKey.trim() === ADMIN_SECRET) {
      setKeyError("");
      setStep(2);
    } else {
      setKeyError("Invalid admin secret key. Please contact your system administrator.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!PASSWORD_REGEX.test(form.password)) {
      setError("Password must be 8+ characters with uppercase, lowercase, a number, and a special character from: @ # $ % ^ & + =");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.phoneNumber.trim()) delete payload.phoneNumber;
      const res = await authAPI.register(payload);
      setSuccess(res.data?.message || "Admin account created! Note: you must manually approve it in the database.");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.blob1} />
      <div style={s.blob2} />

      <div style={s.container}>
        {/* Left Panel */}
        <div style={s.leftPanel}>
          <div style={s.logo}>
            <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="white" fillOpacity="0.15" />
              <path d="M18 8v20M8 18h20" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span style={s.logoText}>MediLink</span>
          </div>

          <div style={s.heroContent}>
            <div style={s.adminBadge}>🔐 Admin Access</div>
            <h2 style={s.heroTitle}>Administrator<br />Registration</h2>
            <p style={s.heroSubtitle}>
              Admin accounts have full system access. A secret key is required to prevent unauthorized registrations.
            </p>
          </div>

          {/* Step indicator */}
          <div style={s.steps}>
            {["Verify Identity", "Create Account"].map((label, i) => (
              <div key={label} style={s.stepRow}>
                <div style={{
                  ...s.stepDot,
                  background: step > i + 1 ? "#a855f7" : step === i + 1 ? "#fff" : "rgba(255,255,255,0.3)",
                  color: step === i + 1 ? "#7c3aed" : "rgba(255,255,255,0.7)",
                }}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span style={{ ...s.stepLabel, color: step === i + 1 ? "white" : "rgba(255,255,255,0.6)" }}>{label}</span>
              </div>
            ))}
          </div>

          <div style={s.notice}>
            <span style={s.noticeIcon}>⚠️</span>
            <p style={s.noticeText}>Admin accounts require <strong>manual DB approval</strong> after registration.</p>
          </div>
        </div>

        {/* Right Panel */}
        <div style={s.rightPanel}>
          <div style={s.formCard}>

            {/* ── Step 1: Secret Key ── */}
            {step === 1 && (
              <>
                <div style={s.formHeader}>
                  <div style={s.stepBadge}>Step 1 of 2</div>
                  <h1 style={s.formTitle}>Verify Access Key</h1>
                  <p style={s.formSubtitle}>Enter the administrator secret key to proceed.</p>
                </div>

                <form onSubmit={handleVerifyKey} style={s.form}>
                  <div style={s.fieldGroup}>
                    <label style={s.label} htmlFor="admin-secret">Admin Secret Key</label>
                    <div style={s.inputWrapper}>
                      <span style={s.inputIcon}>🔑</span>
                      <input
                        id="admin-secret"
                        style={s.input}
                        type={showSecret ? "text" : "password"}
                        value={secretKey}
                        onChange={(e) => { setSecretKey(e.target.value); setKeyError(""); }}
                        placeholder="Enter admin secret key"
                        required
                      />
                      <button type="button" style={s.eyeBtn} onClick={() => setShowSecret((v) => !v)} tabIndex={-1}>
                        {showSecret ? "🙈" : "👁️"}
                      </button>
                    </div>
                    {keyError && <p style={s.fieldError}>⚠️ {keyError}</p>}
                    <p style={s.hint}>Contact your system administrator if you don't have the key.</p>
                  </div>

                  <button type="submit" style={s.submitBtn} id="verify-key-btn">
                    Verify Key →
                  </button>
                </form>
              </>
            )}

            {/* ── Step 2: Account Details ── */}
            {step === 2 && (
              <>
                <div style={s.formHeader}>
                  <div style={s.stepBadge}>Step 2 of 2</div>
                  <h1 style={s.formTitle}>Create Admin Account</h1>
                  <p style={s.formSubtitle}>Fill in your administrator details.</p>
                </div>

                <form onSubmit={handleSubmit} style={s.form}>
                  <div style={s.twoCol}>
                    <div style={s.fieldGroup}>
                      <label style={s.label} htmlFor="admin-name">Full Name</label>
                      <div style={s.inputWrapper}>
                        <span style={s.inputIcon}>👤</span>
                        <input id="admin-name" style={s.input} type="text" name="name"
                          value={form.name} onChange={handleChange} placeholder="Admin Name" required minLength={2} />
                      </div>
                    </div>
                    <div style={s.fieldGroup}>
                      <label style={s.label} htmlFor="admin-phone">
                        Phone <span style={s.optional}>optional</span>
                      </label>
                      <div style={s.inputWrapper}>
                        <span style={s.inputIcon}>📞</span>
                        <input id="admin-phone" style={s.input} type="tel" name="phoneNumber"
                          value={form.phoneNumber} onChange={handleChange} placeholder="0771234567" />
                      </div>
                    </div>
                  </div>

                  <div style={s.fieldGroup}>
                    <label style={s.label} htmlFor="admin-email">Email Address</label>
                    <div style={s.inputWrapper}>
                      <span style={s.inputIcon}>✉️</span>
                      <input id="admin-email" style={s.input} type="email" name="email"
                        value={form.email} onChange={handleChange} placeholder="admin@medilink.com" required />
                    </div>
                  </div>

                  <div style={s.fieldGroup}>
                    <label style={s.label} htmlFor="admin-password">Password</label>
                    <div style={s.inputWrapper}>
                      <span style={s.inputIcon}>🔒</span>
                      <input id="admin-password" style={s.input} type={showPwd ? "text" : "password"}
                        name="password" value={form.password} onChange={handleChange}
                        placeholder="Strong password" required />
                      <button type="button" style={s.eyeBtn} onClick={() => setShowPwd((v) => !v)} tabIndex={-1}>
                        {showPwd ? "🙈" : "👁️"}
                      </button>
                    </div>
                    {form.password && (
                      <div style={s.strengthRow}>
                        <div style={s.strengthBar}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} style={{ ...s.seg, background: i <= pwdStrength.level ? pwdStrength.color : "#1e293b" }} />
                          ))}
                        </div>
                        <span style={{ ...s.strengthLabel, color: pwdStrength.color }}>{pwdStrength.label}</span>
                      </div>
                    )}
                    <p style={s.hint}>Min 8 chars, uppercase, lowercase, number & special char (@#$%^&+=)</p>
                  </div>

                  <div style={s.infoBanner}>
                    <span>ℹ️</span>
                    <span>After registering, set <code>isApproved: true</code> in MongoDB to activate this admin account.</span>
                  </div>

                  {error && <div style={s.errorBox}><span>⚠️</span><span>{error}</span></div>}
                  {success && <div style={s.successBox}><span>✅</span><span>{success}</span></div>}

                  <div style={s.btnRow}>
                    <button type="button" style={s.backBtn} onClick={() => setStep(1)} disabled={loading}>← Back</button>
                    <button type="submit" style={{ ...s.submitBtn, flex: 1, opacity: loading ? 0.75 : 1 }}
                      disabled={loading} id="admin-register-submit">
                      {loading && <span style={s.spinner} />}
                      {loading ? "Creating account..." : "Create Admin Account"}
                    </button>
                  </div>
                </form>
              </>
            )}

            <p style={s.switchText}>
              Already have an account? <Link to="/login" style={s.switchLink}>Sign in →</Link>
            </p>
            <p style={s.switchText} hidden={step !== 1}>
              Are you a patient? <Link to="/register" style={{ ...s.switchLink, color: "#0ea5e9" }}>Register here →</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
        @keyframes spin { to{transform:rotate(360deg)} }
        input:focus{outline:none;border-color:#a855f7!important;box-shadow:0 0 0 3px rgba(168,85,247,0.15)}
        button[type=submit]:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 25px rgba(124,58,237,0.4)}
        button[type=submit]:active:not(:disabled){transform:translateY(0)}
        button[type=submit]{transition:all 0.2s ease}
      `}</style>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)", fontFamily: "'Poppins',sans-serif", position: "relative", overflow: "hidden", padding: "20px" },
  blob1: { position: "absolute", top: "-80px", left: "-80px", width: "400px", height: "400px", background: "radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)", animation: "blob 9s ease-in-out infinite", zIndex: 0 },
  blob2: { position: "absolute", bottom: "-100px", right: "-50px", width: "500px", height: "500px", background: "radial-gradient(circle,rgba(168,85,247,0.12) 0%,transparent 70%)", animation: "blob 11s ease-in-out infinite reverse", zIndex: 0 },
  container: { display: "flex", width: "100%", maxWidth: "960px", minHeight: "580px", borderRadius: "24px", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.5)", position: "relative", zIndex: 1 },
  leftPanel: { flex: "0 0 320px", background: "linear-gradient(160deg,#4c1d95 0%,#6d28d9 50%,#7c3aed 100%)", padding: "40px 32px", display: "flex", flexDirection: "column", gap: "24px" },
  logo: { display: "flex", alignItems: "center", gap: "12px" },
  logoText: { color: "white", fontSize: "20px", fontWeight: "700" },
  adminBadge: { display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", borderRadius: "20px", padding: "6px 14px", color: "white", fontSize: "12px", fontWeight: "600", width: "fit-content" },
  heroContent: { flex: 1, display: "flex", flexDirection: "column", gap: "12px", justifyContent: "center" },
  heroTitle: { color: "white", fontSize: "30px", fontWeight: "700", lineHeight: "1.2", margin: 0 },
  heroSubtitle: { color: "rgba(255,255,255,0.75)", fontSize: "13px", lineHeight: "1.6", margin: 0 },
  steps: { display: "flex", flexDirection: "column", gap: "10px" },
  stepRow: { display: "flex", alignItems: "center", gap: "12px" },
  stepDot: { width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", flexShrink: 0, transition: "all 0.3s" },
  stepLabel: { fontSize: "13px", fontWeight: "500", transition: "color 0.3s" },
  notice: { display: "flex", gap: "10px", background: "rgba(255,255,255,0.1)", borderRadius: "12px", padding: "14px", alignItems: "flex-start" },
  noticeIcon: { fontSize: "18px", flexShrink: 0 },
  noticeText: { color: "rgba(255,255,255,0.85)", fontSize: "12px", lineHeight: "1.5", margin: 0 },
  rightPanel: { flex: 1, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", overflowY: "auto" },
  formCard: { width: "100%", maxWidth: "380px" },
  stepBadge: { display: "inline-block", background: "rgba(124,58,237,0.2)", color: "#c4b5fd", borderRadius: "20px", padding: "4px 12px", fontSize: "11px", fontWeight: "600", marginBottom: "10px" },
  formHeader: { marginBottom: "28px" },
  formTitle: { color: "#f1f5f9", fontSize: "24px", fontWeight: "700", margin: "0 0 6px 0" },
  formSubtitle: { color: "#64748b", fontSize: "13px", margin: 0 },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { color: "#94a3b8", fontSize: "12px", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" },
  optional: { color: "#475569", fontSize: "10px", background: "#1e293b", padding: "1px 5px", borderRadius: "3px" },
  inputWrapper: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute", left: "13px", fontSize: "14px", pointerEvents: "none" },
  input: { width: "100%", padding: "12px 40px 12px 38px", background: "#1e293b", border: "1.5px solid #334155", borderRadius: "11px", color: "#f1f5f9", fontSize: "13px", fontFamily: "'Poppins',sans-serif", boxSizing: "border-box", transition: "border-color 0.2s,box-shadow 0.2s" },
  eyeBtn: { position: "absolute", right: "11px", background: "none", border: "none", cursor: "pointer", fontSize: "15px", padding: "4px" },
  fieldError: { color: "#fca5a5", fontSize: "12px", margin: "2px 0 0 0" },
  hint: { color: "#475569", fontSize: "11px", margin: "2px 0 0 0", lineHeight: "1.5" },
  strengthRow: { display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" },
  strengthBar: { display: "flex", gap: "4px", flex: 1 },
  seg: { flex: 1, height: "4px", borderRadius: "2px", transition: "background 0.3s" },
  strengthLabel: { fontSize: "11px", fontWeight: "600", minWidth: "44px", textAlign: "right" },
  infoBanner: { display: "flex", gap: "8px", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: "10px", padding: "12px", color: "#c4b5fd", fontSize: "12px", lineHeight: "1.5", alignItems: "flex-start" },
  errorBox: { display: "flex", gap: "8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "12px", color: "#fca5a5", fontSize: "13px", alignItems: "flex-start" },
  successBox: { display: "flex", gap: "8px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "10px", padding: "12px", color: "#6ee7b7", fontSize: "13px", alignItems: "center" },
  btnRow: { display: "flex", gap: "10px" },
  backBtn: { padding: "12px 16px", background: "#1e293b", border: "1.5px solid #334155", borderRadius: "11px", color: "#94a3b8", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "'Poppins',sans-serif" },
  submitBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "13px", background: "linear-gradient(135deg,#7c3aed 0%,#a855f7 100%)", border: "none", borderRadius: "11px", color: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "'Poppins',sans-serif" },
  spinner: { width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" },
  switchText: { marginTop: "16px", textAlign: "center", color: "#64748b", fontSize: "12px" },
  switchLink: { color: "#a855f7", fontWeight: "600", textDecoration: "none" },
};
