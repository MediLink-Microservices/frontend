import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Login failed. Please try again."
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((curr) => ({ ...curr, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authAPI.login(form);
      const { token, refreshToken, role, approved, isApproved, userId, email, name, expiresIn } = res.data;
      
      const userApprovedStatus = approved !== undefined ? approved : isApproved;

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken || "");
      localStorage.setItem("role", role);
      localStorage.setItem("user", JSON.stringify({ userId, email, name, role, isApproved: userApprovedStatus }));

      if (role === "DOCTOR" && !userApprovedStatus) {
        setError("Your account is pending admin approval. Please try again later.");
        localStorage.clear();
        return;
      }

      if (role === "ADMIN") navigate("/admin");
      else if (role === "DOCTOR") navigate("/doctor/dashboard");
      else navigate("/patient/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Animated background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      <div style={styles.container}>
        {/* Left panel */}
        <div style={styles.leftPanel}>
          <div style={styles.logo}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="white" fillOpacity="0.15" />
              <path d="M18 8v20M8 18h20" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span style={styles.logoText}>MediLink</span>
          </div>

          <div style={styles.heroContent}>
            <h2 style={styles.heroTitle}>Your Health,<br />Our Priority</h2>
            <p style={styles.heroSubtitle}>
              Connect with doctors, manage appointments, and access your health records — all in one place.
            </p>
          </div>

          <div style={styles.features}>
            {[
              { icon: "🩺", text: "Expert Doctors" },
              { icon: "📅", text: "Easy Scheduling" },
              { icon: "🔒", text: "Secure & Private" },
            ].map((f) => (
              <div key={f.text} style={styles.featureItem}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <span style={styles.featureText}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div style={styles.rightPanel}>
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h1 style={styles.formTitle}>Welcome back</h1>
              <p style={styles.formSubtitle}>Sign in to your MediLink account</p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Email */}
              <div style={styles.fieldGroup}>
                <label style={styles.label} htmlFor="login-email">Email address</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    id="login-email"
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

              {/* Password */}
              <div style={styles.fieldGroup}>
                <label style={styles.label} htmlFor="login-password">Password</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="login-password"
                    style={styles.input}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
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
              </div>

              {/* Error */}
              {error && (
                <div style={styles.errorBox}>
                  <span style={styles.errorIcon}>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                style={{ ...styles.submitBtn, opacity: loading ? 0.75 : 1 }}
                disabled={loading}
                id="login-submit"
              >
                {loading ? (
                  <span style={styles.spinner} />
                ) : null}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p style={styles.switchText}>
              Don't have an account?{" "}
              <Link to="/register" style={styles.switchLink}>
                Create one →
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
        button[type=submit]:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(14,165,233,0.4); }
        button[type=submit]:active:not(:disabled) { transform: translateY(0); }
        button[type=submit] { transition: all 0.2s ease; }
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
    top: "-100px",
    left: "-100px",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)",
    animation: "blob 8s ease-in-out infinite",
    zIndex: 0,
  },
  blob2: {
    position: "absolute",
    bottom: "-100px",
    right: "-50px",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
    animation: "blob 10s ease-in-out infinite reverse",
    zIndex: 0,
  },
  blob3: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)",
    zIndex: 0,
  },
  container: {
    display: "flex",
    width: "100%",
    maxWidth: "960px",
    minHeight: "580px",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
    position: "relative",
    zIndex: 1,
  },
  leftPanel: {
    flex: "1",
    background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 60%, #8b5cf6 100%)",
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minWidth: "300px",
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
    padding: "32px 0",
  },
  heroTitle: {
    color: "white",
    fontSize: "36px",
    fontWeight: "700",
    lineHeight: "1.2",
    margin: "0 0 16px 0",
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: "15px",
    lineHeight: "1.6",
    margin: 0,
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "12px 16px",
    backdropFilter: "blur(10px)",
  },
  featureIcon: {
    fontSize: "20px",
  },
  featureText: {
    color: "white",
    fontSize: "14px",
    fontWeight: "500",
  },
  rightPanel: {
    flex: "1",
    background: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
  },
  formCard: {
    width: "100%",
    maxWidth: "380px",
  },
  formHeader: {
    marginBottom: "32px",
  },
  formTitle: {
    color: "#f1f5f9",
    fontSize: "28px",
    fontWeight: "700",
    margin: "0 0 8px 0",
  },
  formSubtitle: {
    color: "#64748b",
    fontSize: "14px",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
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
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "10px",
    padding: "12px 14px",
    color: "#fca5a5",
    fontSize: "13px",
  },
  errorIcon: {
    fontSize: "16px",
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontSize: "15px",
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
    marginTop: "24px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "13px",
  },
  switchLink: {
    color: "#0ea5e9",
    fontWeight: "600",
    textDecoration: "none",
  },
};
