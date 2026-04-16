import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";

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

const SPECIALIZATIONS = [
  "General Practitioner", "Cardiologist", "Dermatologist", "Pediatrician",
  "Neurologist", "Orthopedic Surgeon", "Gynecologist", "Psychiatrist",
  "Ophthalmologist", "ENT Specialist", "Radiologist", "Oncologist", "Other",
];

const STEPS = ["Personal Info", "Professional Info", "Credentials"];

export default function DoctorRegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", email: "", password: "", phoneNumber: "",
    role: "DOCTOR",
    // Extra fields (stored locally, backend only needs name/email/password/role/phoneNumber)
    specialization: "", licenseNumber: "", experience: "", hospital: "",
  });
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

  const handleNext = (e) => {
    e.preventDefault();
    setError("");
    if (step === 1) {
      if (!form.name.trim() || form.name.trim().length < 2) { setError("Name must be at least 2 characters."); return; }
      if (!form.email.trim()) { setError("Please enter your email."); return; }
    }
    if (step === 2) {
      if (!form.specialization) { setError("Please select your specialization."); return; }
    }
    setStep((s) => s + 1);
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
      // Only send fields the backend accepts
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: "DOCTOR",
        ...(form.phoneNumber.trim() ? { phoneNumber: form.phoneNumber } : {}),
      };
      const res = await authAPI.register(payload);
      setSuccess(res.data?.message || "Application submitted! An admin will review and approve your account.");
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
      <div style={s.blob3} />

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
            <div style={s.doctorBadge}>👨‍⚕️ Doctor Portal</div>
            <h2 style={s.heroTitle}>Join as a<br />Medical Professional</h2>
            <p style={s.heroSubtitle}>
              Register to manage patients, appointments, and consultations on the MediLink platform.
            </p>
          </div>

          {/* Step progress */}
          <div style={s.stepList}>
            {STEPS.map((label, i) => (
              <div key={label} style={s.stepRow}>
                <div style={{
                  ...s.stepDot,
                  background: step > i + 1 ? "#10b981" : step === i + 1 ? "#fff" : "rgba(255,255,255,0.25)",
                  color: step > i + 1 ? "white" : step === i + 1 ? "#0e7490" : "rgba(255,255,255,0.6)",
                }}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ ...s.stepLine, background: step > i + 1 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)" }} />
                )}
                <span style={{ ...s.stepLabelText, color: step === i + 1 ? "white" : "rgba(255,255,255,0.55)" }}>{label}</span>
              </div>
            ))}
          </div>

          <div style={s.approvalNote}>
            <span>⏳</span>
            <p style={s.approvalText}>Applications are reviewed by admins within 24–48 hours.</p>
          </div>
        </div>

        {/* Right Panel */}
        <div style={s.rightPanel}>
          <div style={s.formCard}>
            <div style={s.formHeader}>
              <div style={s.stepBadge}>Step {step} of {STEPS.length} — {STEPS[step - 1]}</div>
              <h1 style={s.formTitle}>
                {step === 1 && "Personal Details"}
                {step === 2 && "Professional Info"}
                {step === 3 && "Set Credentials"}
              </h1>
              <p style={s.formSubtitle}>
                {step === 1 && "Tell us about yourself"}
                {step === 2 && "Your medical background"}
                {step === 3 && "Create your login credentials"}
              </p>
            </div>

            {/* ── Step 1: Personal Info ── */}
            {step === 1 && (
              <form onSubmit={handleNext} style={s.form}>
                <div style={s.twoCol}>
                  <div style={s.fieldGroup}>
                    <label style={s.label} htmlFor="doc-name">Full Name</label>
                    <div style={s.inputWrapper}>
                      <span style={s.inputIcon}>👤</span>
                      <input id="doc-name" style={s.input} type="text" name="name" value={form.name}
                        onChange={handleChange} placeholder="Dr. John Smith" required minLength={2} />
                    </div>
                  </div>
                  <div style={s.fieldGroup}>
                    <label style={s.label} htmlFor="doc-phone">Phone <span style={s.optional}>optional</span></label>
                    <div style={s.inputWrapper}>
                      <span style={s.inputIcon}>📞</span>
                      <input id="doc-phone" style={s.input} type="tel" name="phoneNumber" value={form.phoneNumber}
                        onChange={handleChange} placeholder="0771234567" />
                    </div>
                  </div>
                </div>

                <div style={s.fieldGroup}>
                  <label style={s.label} htmlFor="doc-email">Email Address</label>
                  <div style={s.inputWrapper}>
                    <span style={s.inputIcon}>✉️</span>
                    <input id="doc-email" style={s.input} type="email" name="email" value={form.email}
                      onChange={handleChange} placeholder="doctor@example.com" required />
                  </div>
                </div>

                {error && <div style={s.errorBox}><span>⚠️</span><span>{error}</span></div>}
                <button type="submit" style={s.submitBtn} id="doc-next-1">Continue →</button>
              </form>
            )}

            {/* ── Step 2: Professional Info ── */}
            {step === 2 && (
              <form onSubmit={handleNext} style={s.form}>
                <div style={s.fieldGroup}>
                  <label style={s.label} htmlFor="doc-spec">Specialization</label>
                  <div style={s.inputWrapper}>
                    <span style={s.inputIcon}>🩺</span>
                    <select id="doc-spec" style={{ ...s.input, paddingLeft: "38px" }} name="specialization"
                      value={form.specialization} onChange={handleChange} required>
                      <option value="">Select your specialization...</option>
                      {SPECIALIZATIONS.map((sp) => (
                        <option key={sp} value={sp}>{sp}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={s.twoCol}>
                  <div style={s.fieldGroup}>
                    <label style={s.label} htmlFor="doc-license">License No. <span style={s.optional}>optional</span></label>
                    <div style={s.inputWrapper}>
                      <span style={s.inputIcon}>📋</span>
                      <input id="doc-license" style={s.input} type="text" name="licenseNumber"
                        value={form.licenseNumber} onChange={handleChange} placeholder="SLMC-12345" />
                    </div>
                  </div>
                  <div style={s.fieldGroup}>
                    <label style={s.label} htmlFor="doc-exp">Experience (yrs) <span style={s.optional}>optional</span></label>
                    <div style={s.inputWrapper}>
                      <span style={s.inputIcon}>🏅</span>
                      <input id="doc-exp" style={s.input} type="number" name="experience" min="0" max="60"
                        value={form.experience} onChange={handleChange} placeholder="5" />
                    </div>
                  </div>
                </div>

                <div style={s.fieldGroup}>
                  <label style={s.label} htmlFor="doc-hospital">Hospital / Clinic <span style={s.optional}>optional</span></label>
                  <div style={s.inputWrapper}>
                    <span style={s.inputIcon}>🏥</span>
                    <input id="doc-hospital" style={s.input} type="text" name="hospital"
                      value={form.hospital} onChange={handleChange} placeholder="National Hospital, Colombo" />
                  </div>
                </div>

                {error && <div style={s.errorBox}><span>⚠️</span><span>{error}</span></div>}

                <div style={s.btnRow}>
                  <button type="button" style={s.backBtn} onClick={() => { setStep(1); setError(""); }}>← Back</button>
                  <button type="submit" style={{ ...s.submitBtn, flex: 1 }} id="doc-next-2">Continue →</button>
                </div>
              </form>
            )}

            {/* ── Step 3: Credentials ── */}
            {step === 3 && (
              <form onSubmit={handleSubmit} style={s.form}>
                <div style={s.fieldGroup}>
                  <label style={s.label} htmlFor="doc-password">Password</label>
                  <div style={s.inputWrapper}>
                    <span style={s.inputIcon}>🔒</span>
                    <input id="doc-password" style={s.input} type={showPwd ? "text" : "password"}
                      name="password" value={form.password} onChange={handleChange}
                      placeholder="Create a strong password" required />
                    <button type="button" style={s.eyeBtn} onClick={() => setShowPwd((v) => !v)} tabIndex={-1}>
                      {showPwd ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {form.password && (
                    <div style={s.strengthRow}>
                      <div style={s.strengthBar}>
                        {[1,2,3,4,5].map((i) => (
                          <div key={i} style={{ ...s.seg, background: i <= pwdStrength.level ? pwdStrength.color : "#1e293b" }} />
                        ))}
                      </div>
                      <span style={{ ...s.strengthLabel, color: pwdStrength.color }}>{pwdStrength.label}</span>
                    </div>
                  )}
                  <p style={s.hint}>Min 8 chars, uppercase, lowercase, number & special char from: @ # $ % ^ &amp; + =</p>
                </div>

                {/* Summary card */}
                <div style={s.summaryCard}>
                  <p style={s.summaryTitle}>📋 Application Summary</p>
                  <div style={s.summaryGrid}>
                    <span style={s.summaryKey}>Name</span><span style={s.summaryVal}>{form.name}</span>
                    <span style={s.summaryKey}>Email</span><span style={s.summaryVal}>{form.email}</span>
                    <span style={s.summaryKey}>Specialization</span><span style={s.summaryVal}>{form.specialization}</span>
                    {form.licenseNumber && <><span style={s.summaryKey}>License</span><span style={s.summaryVal}>{form.licenseNumber}</span></>}
                    {form.hospital && <><span style={s.summaryKey}>Hospital</span><span style={s.summaryVal}>{form.hospital}</span></>}
                  </div>
                </div>

                <div style={s.infoBanner}>
                  <span>⏳</span>
                  <span>Your account will be <strong>pending review</strong>. An admin will approve your application before you can log in.</span>
                </div>

                {error && <div style={s.errorBox}><span>⚠️</span><span>{error}</span></div>}
                {success && <div style={s.successBox}><span>✅</span><span>{success}</span></div>}

                <div style={s.btnRow}>
                  <button type="button" style={s.backBtn} onClick={() => { setStep(2); setError(""); }} disabled={loading}>← Back</button>
                  <button type="submit" style={{ ...s.submitBtn, flex: 1, opacity: loading ? 0.75 : 1 }}
                    disabled={loading} id="doc-register-submit">
                    {loading && <span style={s.spinner} />}
                    {loading ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </form>
            )}

            <p style={s.switchText}>
              Already have an account? <Link to="/login" style={s.switchLink}>Sign in →</Link>
            </p>
            <p style={s.switchText}>
              Are you a patient? <Link to="/register" style={{ ...s.switchLink, color: "#0ea5e9" }}>Patient register →</Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
        @keyframes spin { to{transform:rotate(360deg)} }
        input:focus,select:focus{outline:none;border-color:#0ea5e9!important;box-shadow:0 0 0 3px rgba(14,165,233,0.15)}
        select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%2364748b' viewBox='0 0 20 20'%3E%3Cpath d='M7 7l3 3 3-3'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;background-size:20px}
        button[type=submit]:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 25px rgba(14,165,233,0.4)}
        button[type=submit]:active:not(:disabled){transform:translateY(0)}
        button[type=submit]{transition:all 0.2s ease}
      `}</style>
    </div>
  );
}

const s = {
  page: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#0f172a 0%,#082f49 50%,#0f172a 100%)", fontFamily:"'Poppins',sans-serif", position:"relative", overflow:"hidden", padding:"20px" },
  blob1: { position:"absolute", top:"-80px", right:"-80px", width:"450px", height:"450px", background:"radial-gradient(circle,rgba(14,165,233,0.15) 0%,transparent 70%)", animation:"blob 9s ease-in-out infinite", zIndex:0 },
  blob2: { position:"absolute", bottom:"-100px", left:"-50px", width:"500px", height:"500px", background:"radial-gradient(circle,rgba(16,185,129,0.1) 0%,transparent 70%)", animation:"blob 11s ease-in-out infinite reverse", zIndex:0 },
  blob3: { position:"absolute", top:"50%", left:"50%", width:"300px", height:"300px", background:"radial-gradient(circle,rgba(6,182,212,0.07) 0%,transparent 70%)", zIndex:0 },
  container: { display:"flex", width:"100%", maxWidth:"980px", minHeight:"600px", borderRadius:"24px", overflow:"hidden", boxShadow:"0 40px 80px rgba(0,0,0,0.5)", position:"relative", zIndex:1 },
  leftPanel: { flex:"0 0 300px", background:"linear-gradient(160deg,#0c4a6e 0%,#0369a1 50%,#0891b2 100%)", padding:"36px 28px", display:"flex", flexDirection:"column", gap:"20px" },
  logo: { display:"flex", alignItems:"center", gap:"10px" },
  logoText: { color:"white", fontSize:"18px", fontWeight:"700" },
  doctorBadge: { display:"inline-flex", alignItems:"center", gap:"6px", background:"rgba(255,255,255,0.15)", backdropFilter:"blur(8px)", borderRadius:"20px", padding:"6px 14px", color:"white", fontSize:"12px", fontWeight:"600", width:"fit-content" },
  heroContent: { flex:1, display:"flex", flexDirection:"column", gap:"10px", justifyContent:"center" },
  heroTitle: { color:"white", fontSize:"28px", fontWeight:"700", lineHeight:"1.2", margin:0 },
  heroSubtitle: { color:"rgba(255,255,255,0.75)", fontSize:"13px", lineHeight:"1.6", margin:0 },
  stepList: { display:"flex", flexDirection:"column", gap:"8px" },
  stepRow: { display:"flex", alignItems:"center", gap:"10px" },
  stepDot: { width:"26px", height:"26px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:"700", flexShrink:0, transition:"all 0.3s" },
  stepLine: { display:"none" },
  stepLabelText: { fontSize:"13px", fontWeight:"500", transition:"color 0.3s" },
  approvalNote: { display:"flex", gap:"8px", background:"rgba(255,255,255,0.1)", borderRadius:"12px", padding:"12px", alignItems:"flex-start" },
  approvalText: { color:"rgba(255,255,255,0.8)", fontSize:"12px", lineHeight:"1.5", margin:0 },
  rightPanel: { flex:1, background:"#0f172a", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px", overflowY:"auto" },
  formCard: { width:"100%", maxWidth:"400px" },
  stepBadge: { display:"inline-block", background:"rgba(14,165,233,0.15)", color:"#7dd3fc", borderRadius:"20px", padding:"4px 12px", fontSize:"11px", fontWeight:"600", marginBottom:"10px" },
  formHeader: { marginBottom:"26px" },
  formTitle: { color:"#f1f5f9", fontSize:"22px", fontWeight:"700", margin:"0 0 4px 0" },
  formSubtitle: { color:"#64748b", fontSize:"13px", margin:0 },
  form: { display:"flex", flexDirection:"column", gap:"16px" },
  twoCol: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" },
  fieldGroup: { display:"flex", flexDirection:"column", gap:"6px" },
  label: { color:"#94a3b8", fontSize:"12px", fontWeight:"500", display:"flex", alignItems:"center", gap:"6px" },
  optional: { color:"#475569", fontSize:"10px", background:"#1e293b", padding:"1px 5px", borderRadius:"3px" },
  inputWrapper: { position:"relative", display:"flex", alignItems:"center" },
  inputIcon: { position:"absolute", left:"12px", fontSize:"14px", pointerEvents:"none" },
  input: { width:"100%", padding:"12px 40px 12px 36px", background:"#1e293b", border:"1.5px solid #334155", borderRadius:"11px", color:"#f1f5f9", fontSize:"13px", fontFamily:"'Poppins',sans-serif", boxSizing:"border-box", transition:"border-color 0.2s,box-shadow 0.2s" },
  eyeBtn: { position:"absolute", right:"11px", background:"none", border:"none", cursor:"pointer", fontSize:"14px", padding:"4px" },
  hint: { color:"#475569", fontSize:"11px", margin:"2px 0 0 0", lineHeight:"1.5" },
  strengthRow: { display:"flex", alignItems:"center", gap:"10px", marginTop:"4px" },
  strengthBar: { display:"flex", gap:"4px", flex:1 },
  seg: { flex:1, height:"4px", borderRadius:"2px", transition:"background 0.3s" },
  strengthLabel: { fontSize:"11px", fontWeight:"600", minWidth:"44px", textAlign:"right" },
  summaryCard: { background:"#1e293b", border:"1px solid #334155", borderRadius:"12px", padding:"14px" },
  summaryTitle: { color:"#94a3b8", fontSize:"12px", fontWeight:"600", margin:"0 0 10px 0" },
  summaryGrid: { display:"grid", gridTemplateColumns:"auto 1fr", gap:"6px 16px", alignItems:"baseline" },
  summaryKey: { color:"#64748b", fontSize:"11px", whiteSpace:"nowrap" },
  summaryVal: { color:"#e2e8f0", fontSize:"12px", fontWeight:"500", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  infoBanner: { display:"flex", gap:"8px", background:"rgba(14,165,233,0.08)", border:"1px solid rgba(14,165,233,0.2)", borderRadius:"10px", padding:"12px", color:"#7dd3fc", fontSize:"12px", lineHeight:"1.5", alignItems:"flex-start" },
  errorBox: { display:"flex", gap:"8px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:"10px", padding:"12px", color:"#fca5a5", fontSize:"13px", alignItems:"flex-start" },
  successBox: { display:"flex", gap:"8px", background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:"10px", padding:"12px", color:"#6ee7b7", fontSize:"13px", alignItems:"center" },
  btnRow: { display:"flex", gap:"10px" },
  backBtn: { padding:"12px 16px", background:"#1e293b", border:"1.5px solid #334155", borderRadius:"11px", color:"#94a3b8", fontSize:"13px", fontWeight:"500", cursor:"pointer", fontFamily:"'Poppins',sans-serif" },
  submitBtn: { display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", width:"100%", padding:"13px", background:"linear-gradient(135deg,#0369a1 0%,#0ea5e9 100%)", border:"none", borderRadius:"11px", color:"white", fontSize:"14px", fontWeight:"600", cursor:"pointer", fontFamily:"'Poppins',sans-serif" },
  spinner: { width:"14px", height:"14px", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"white", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" },
  switchText: { marginTop:"14px", textAlign:"center", color:"#64748b", fontSize:"12px" },
  switchLink: { color:"#0ea5e9", fontWeight:"600", textDecoration:"none" },
};
