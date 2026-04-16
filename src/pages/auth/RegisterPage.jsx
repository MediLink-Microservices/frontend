import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";

// Backend returns: { status, message, errorCode, details: { fieldName: "error msg" } }
function getErrorMessage(error) {
  const data = error?.response?.data;
  // Validation errors come as details Map<String,String>
  if (data?.details && typeof data.details === "object" && !Array.isArray(data.details)) {
    const msgs = Object.values(data.details).filter(Boolean);
    if (msgs.length > 0) return msgs.join(" | ");
  }
  return data?.message || data?.error || error?.message || "Registration failed. Please try again.";
}

const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,}$/;

const ROLES = [
  { value: "PATIENT", label: "Patient", icon: "🧑‍⚕️", desc: "Book appointments & manage health" },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "PATIENT",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1 = personal info, 2 = account setup

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((curr) => ({ ...curr, [name]: value }));
    if (error) setError("");
  };

  const handleRoleSelect = (role) => {
    setForm((curr) => ({ ...curr, role }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleBack = () => {
    setError("");
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client-side password validation (mirrors backend @Pattern)
    if (!PASSWORD_REGEX.test(form.password)) {
      setError("Password must be 8+ characters and include uppercase, lowercase, a number, and a special character from: @ # $ % ^ & + =");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.phoneNumber.trim()) delete payload.phoneNumber;

      const res = await authAPI.register(payload);
      setSuccess(res.data?.message || "Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Password strength
  const getPasswordStrength = (pwd) => {
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
  };

  const pwdStrength = getPasswordStrength(form.password);

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      <div style={styles.container}>
        {/* Left Panel */}
        <div style={styles.leftPanel}>
          <div style={styles.logo}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="white" fillOpacity="0.15" />
              <path d="M18 8v20M8 18h20" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span style={styles.logoText}>MediLink</span>
          </div>

          <div style={styles.heroContent}>
            <h2 style={styles.heroTitle}>Join MediLink<br />Today</h2>
            <p style={styles.heroSubtitle}>
              Create your free account and start managing your healthcare journey with ease.
            </p>
          </div>

          {/* Step indicator */}
          <div style={styles.stepIndicator}>
            <div style={styles.stepRow}>
              <div style={{ ...styles.stepDot, background: "#fff", boxShadow: "0 0 0 3px rgba(255,255,255,0.3)" }}>
                {step > 1 ? "✓" : "1"}
              </div>
              <div style={{ ...styles.stepLine, background: step > 1 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)" }} />
              <div style={{
                ...styles.stepDot,
                background: step === 2 ? "#fff" : "rgba(255,255,255,0.3)",
                color: step === 2 ? "#6366f1" : "rgba(255,255,255,0.7)",
                boxShadow: step === 2 ? "0 0 0 3px rgba(255,255,255,0.3)" : "none",
              }}>
                2
              </div>
            </div>
            <div style={styles.stepLabels}>
              <span style={styles.stepLabel}>Personal Info</span>
              <span style={{ ...styles.stepLabel, marginLeft: "auto" }}>Account Setup</span>
            </div>
          </div>

          <div style={styles.features}>
            {[
              { icon: "🏥", text: "1000+ Doctors Available" },
              { icon: "📋", text: "Digital Health Records" },
              { icon: "🔐", text: "100% Data Privacy" },
            ].map((f) => (
              <div key={f.text} style={styles.featureItem}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <span style={styles.featureText}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div style={styles.rightPanel}>
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h1 style={styles.formTitle}>
                {step === 1 ? "Create account" : "Set up credentials"}
              </h1>
              <p style={styles.formSubtitle}>
                {step === 1
                  ? "Step 1 of 2 — Enter your personal details"
                  : "Step 2 of 2 — Choose your role & password"}
              </p>
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <form onSubmit={handleNext} style={styles.form}>
                {/* Name */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="reg-name">Full Name</label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      id="reg-name"
                      style={styles.input}
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      minLength={2}
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="reg-email">Email Address</label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </span>
                    <input
                      id="reg-email"
                      style={styles.input}
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="reg-phone">
                    Phone Number <span style={styles.optionalBadge}>optional</span>
                  </label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.59 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l1.62-1.62a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    <input
                      id="reg-phone"
                      style={styles.input}
                      type="tel"
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      placeholder="0771234567"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {error && (
                  <div style={styles.errorBox}>
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" style={styles.submitBtn} id="register-next">
                  Continue →
                </button>
              </form>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <form onSubmit={handleSubmit} style={styles.form}>
                {/* Role */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>I am a...</label>
                  <div style={styles.roleGrid}>
                    {ROLES.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => handleRoleSelect(r.value)}
                        style={{
                          ...styles.roleCard,
                          ...(form.role === r.value ? styles.roleCardActive : {}),
                        }}
                      >
                        <span style={styles.roleIcon}>{r.icon}</span>
                        <span style={styles.roleLabel}>{r.label}</span>
                        <span style={styles.roleDesc}>{r.desc}</span>
                        {form.role === r.value && (
                          <span style={styles.roleCheck}>✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Password */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="reg-password">Password</label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      id="reg-password"
                      style={styles.input}
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 8 chars, A-Z, 0-9, @#$..."
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      style={styles.eyeBtn}
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {form.password && (
                    <div style={styles.strengthWrapper}>
                      <div style={styles.strengthBar}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            style={{
                              ...styles.strengthSegment,
                              background: i <= pwdStrength.level ? pwdStrength.color : "#1e293b",
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ ...styles.strengthLabel, color: pwdStrength.color }}>
                        {pwdStrength.label}
                      </span>
                    </div>
                  )}

                  <p style={styles.hint}>
                    Must include: 8+ chars, uppercase (A-Z), lowercase (a-z), number (0-9), and a special character from: <strong style={{color:'#94a3b8'}}>@  #  $  %  ^  &  +  =</strong>
                  </p>
                </div>

                {error && (
                  <div style={styles.errorBox}>
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div style={styles.successBox}>
                    <span>✅</span>
                    <span>{success}</span>
                  </div>
                )}

                <div style={styles.btnRow}>
                  <button
                    type="button"
                    onClick={handleBack}
                    style={styles.backBtn}
                    disabled={loading}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    style={{ ...styles.submitBtn, flex: 1, opacity: loading ? 0.75 : 1 }}
                    disabled={loading}
                    id="register-submit"
                  >
                    {loading && <span style={styles.spinner} />}
                    {loading ? "Creating account..." : "Create Account"}
                  </button>
                </div>
              </form>
            )}

            <p style={styles.switchText}>
              Already have an account?{" "}
              <Link to="/login" style={styles.switchLink}>
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input:focus { outline: none; border-color: #0ea5e9 !important; box-shadow: 0 0 0 3px rgba(14,165,233,0.15); }
        button[type=submit]:hover:not(:disabled), #register-next:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(14,165,233,0.4);
        }
        button[type=submit]:active:not(:disabled) { transform: translateY(0); }
        button[type=submit], #register-next { transition: all 0.2s ease; }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    fontFamily: "'Poppins', sans-serif",
    position: "relative",
    overflow: "hidden",
    padding: "20px",
  },
  blob1: {
    position: "absolute",
    top: "-80px",
    right: "-80px",
    width: "450px",
    height: "450px",
    background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
    animation: "blob 9s ease-in-out infinite",
    zIndex: 0,
  },
  blob2: {
    position: "absolute",
    bottom: "-100px",
    left: "-50px",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)",
    animation: "blob 11s ease-in-out infinite reverse",
    zIndex: 0,
  },
  blob3: {
    position: "absolute",
    top: "40%",
    left: "60%",
    width: "300px",
    height: "300px",
    background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)",
    zIndex: 0,
  },
  container: {
    display: "flex",
    width: "100%",
    maxWidth: "1000px",
    minHeight: "600px",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
    position: "relative",
    zIndex: 1,
  },
  leftPanel: {
    flex: "0 0 320px",
    background: "linear-gradient(160deg, #6366f1 0%, #0ea5e9 60%, #10b981 100%)",
    padding: "40px 32px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoText: {
    color: "white",
    fontSize: "22px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
  },
  heroContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "24px 0",
  },
  heroTitle: {
    color: "white",
    fontSize: "32px",
    fontWeight: "700",
    lineHeight: "1.2",
    margin: "0 0 12px 0",
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: 0,
  },
  stepIndicator: {
    marginBottom: "24px",
  },
  stepRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "8px",
  },
  stepDot: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    color: "#6366f1",
    flexShrink: 0,
  },
  stepLine: {
    flex: 1,
    height: "2px",
    margin: "0 8px",
    transition: "background 0.3s",
  },
  stepLabels: {
    display: "flex",
    alignItems: "center",
  },
  stepLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: "11px",
    fontWeight: "500",
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "11px 14px",
    backdropFilter: "blur(10px)",
  },
  featureIcon: { fontSize: "18px" },
  featureText: {
    color: "white",
    fontSize: "13px",
    fontWeight: "500",
  },
  rightPanel: {
    flex: "1",
    background: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    overflowY: "auto",
  },
  formCard: {
    width: "100%",
    maxWidth: "400px",
  },
  formHeader: {
    marginBottom: "28px",
  },
  formTitle: {
    color: "#f1f5f9",
    fontSize: "26px",
    fontWeight: "700",
    margin: "0 0 6px 0",
  },
  formSubtitle: {
    color: "#64748b",
    fontSize: "13px",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: "500",
    letterSpacing: "0.3px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  optionalBadge: {
    background: "#1e293b",
    color: "#64748b",
    fontSize: "10px",
    padding: "2px 6px",
    borderRadius: "4px",
    fontWeight: "400",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    paddingLeft: "44px",
    paddingRight: "44px",
    paddingTop: "13px",
    paddingBottom: "13px",
    background: "#1e293b",
    border: "1.5px solid #334155",
    borderRadius: "12px",
    color: "#f1f5f9",
    fontSize: "14px",
    fontFamily: "'Poppins', sans-serif",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    padding: "4px",
    lineHeight: 1,
  },
  roleGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  roleCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "4px",
    padding: "14px",
    background: "#1e293b",
    border: "1.5px solid #334155",
    borderRadius: "14px",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    position: "relative",
    textAlign: "left",
    transition: "all 0.2s",
  },
  roleCardActive: {
    border: "1.5px solid #6366f1",
    background: "rgba(99,102,241,0.1)",
    boxShadow: "0 0 0 3px rgba(99,102,241,0.15)",
  },
  roleIcon: { fontSize: "22px", marginBottom: "2px" },
  roleLabel: {
    color: "#f1f5f9",
    fontSize: "13px",
    fontWeight: "600",
  },
  roleDesc: {
    color: "#64748b",
    fontSize: "11px",
    lineHeight: "1.3",
  },
  roleCheck: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "#6366f1",
    color: "white",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "700",
  },
  strengthWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "6px",
  },
  strengthBar: {
    display: "flex",
    gap: "4px",
    flex: 1,
  },
  strengthSegment: {
    flex: 1,
    height: "4px",
    borderRadius: "2px",
    transition: "background 0.3s",
  },
  strengthLabel: {
    fontSize: "12px",
    fontWeight: "600",
    minWidth: "44px",
    textAlign: "right",
  },
  hint: {
    color: "#475569",
    fontSize: "11px",
    margin: "4px 0 0 0",
    lineHeight: "1.5",
  },
  errorBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "10px",
    padding: "12px 14px",
    color: "#fca5a5",
    fontSize: "13px",
  },
  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(16,185,129,0.1)",
    border: "1px solid rgba(16,185,129,0.3)",
    borderRadius: "10px",
    padding: "12px 14px",
    color: "#6ee7b7",
    fontSize: "13px",
  },
  btnRow: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  backBtn: {
    padding: "14px 18px",
    background: "#1e293b",
    border: "1.5px solid #334155",
    borderRadius: "12px",
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    transition: "all 0.2s",
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    letterSpacing: "0.3px",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },
  switchText: {
    marginTop: "22px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "13px",
  },
  switchLink: {
    color: "#6366f1",
    fontWeight: "600",
    textDecoration: "none",
  },
};
