
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI, doctorAPI, patientAPI } from "../../services/api";

function getErrorMessage(error) {
  const data = error?.response?.data;
  if (data?.details && typeof data.details === "object" && !Array.isArray(data.details)) {
    const msgs = Object.values(data.details).filter(Boolean);
    if (msgs.length > 0) return msgs.join(" | ");
  }
  return data?.message || data?.error || error?.message || "Registration failed. Please try again.";
}

const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,}$/;
const PHONE_REGEX = /^[+]?[0-9]{10,15}$/;

const ROLES = [
  { value: "PATIENT", label: "Patient", desc: "Book appointments and manage health records." },
  { value: "DOCTOR", label: "Doctor", desc: "Create a professional account and manage consultations." },
];

const DOCTOR_SPECIALTIES = [
  "GENERAL_PRACTICE",
  "CARDIOLOGY",
  "NEUROLOGY",
  "PEDIATRICS",
  "ORTHOPEDICS",
  "DERMATOLOGY",
  "PSYCHIATRY",
  "GYNECOLOGY",
  "OPHTHALMOLOGY",
];

const initialFormState = {
  name: "",
  email: "",
  password: "",
  phoneNumber: "",
  address: "",
  role: "PATIENT",
  licenseNumber: "",
  yearsOfExperience: "",
  specialty: "",
  hospitalIds: [],
  fee: "",
  availableForTelemedicine: false,
};

function splitName(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function strengthForPassword(password) {
  if (!password) return { level: 0, label: "", color: "#334155" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[@#$%^&+=]/.test(password)) score++;
  if (score <= 2) return { level: score, label: "Weak", color: "#ef4444" };
  if (score === 3) return { level: score, label: "Fair", color: "#f59e0b" };
  if (score === 4) return { level: score, label: "Good", color: "#0ea5e9" };
  return { level: score, label: "Strong", color: "#10b981" };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialFormState);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadHospitals() {
      if (form.role !== "DOCTOR") return;
      setHospitalsLoading(true);
      try {
        const res = await doctorAPI.getHospitals();
        if (!active) return;
        setHospitals(res.data || []);
      } catch {
        if (active) setHospitals([]);
      } finally {
        if (active) setHospitalsLoading(false);
      }
    }

    loadHospitals();
    return () => {
      active = false;
    };
  }, [form.role]);

  const passwordStrength = useMemo(() => strengthForPassword(form.password), [form.password]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const handleRoleSelect = (role) => {
    setForm((current) => ({
      ...current,
      role,
      hospitalIds: role === "DOCTOR" ? current.hospitalIds : [],
      licenseNumber: role === "DOCTOR" ? current.licenseNumber : "",
      yearsOfExperience: role === "DOCTOR" ? current.yearsOfExperience : "",
      specialty: role === "DOCTOR" ? current.specialty : "",
      fee: role === "DOCTOR" ? current.fee : "",
      availableForTelemedicine: role === "DOCTOR" ? current.availableForTelemedicine : false,
    }));
  };

  const handleHospitalToggle = (hospitalId) => {
    setForm((current) => {
      const alreadySelected = current.hospitalIds.includes(hospitalId);
      return {
        ...current,
        hospitalIds: alreadySelected
          ? current.hospitalIds.filter((id) => id !== hospitalId)
          : [...current.hospitalIds, hospitalId],
      };
    });
  };

  const handleNext = (event) => {
    event.preventDefault();
    if (!form.name.trim() || form.name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!form.phoneNumber.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    if (!PHONE_REGEX.test(form.phoneNumber.trim())) {
      setError("Phone number must be 10 to 15 digits and may start with +.");
      return;
    }

    setError("");
    setStep(2);
  };

  const handleBack = () => {
    setError("");
    setStep(1);
  };

  const validateDoctorFields = () => {
    if (!form.licenseNumber.trim()) return "Doctor registration requires a license number.";
    if (!form.specialty) return "Please choose a specialty.";
    if (!form.yearsOfExperience || Number(form.yearsOfExperience) < 0) {
      return "Please enter valid years of experience.";
    }
    if (!form.fee || Number(form.fee) <= 0) {
      return "Please enter a consultation fee greater than 0.";
    }
    if (form.hospitalIds.length === 0) {
      return "Please select at least one hospital or medical location.";
    }
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!PASSWORD_REGEX.test(form.password)) {
      setError("Password must be 8+ characters and include uppercase, lowercase, a number, and a special character from: @ # $ % ^ & + =");
      return;
    }

    if (form.role === "PATIENT" && !form.address.trim()) {
      setError("Please enter your address.");
      return;
    }

    if (form.role === "DOCTOR") {
      const doctorValidationError = validateDoctorFields();
      if (doctorValidationError) {
        setError(doctorValidationError);
        return;
      }
    }

    setLoading(true);
    try {
      const authPayload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        phoneNumber: form.phoneNumber.trim(),
      };

      const authResponse = await authAPI.register(authPayload);
      const registeredUserId = authResponse.data?.data?.userId;

      if (form.role === "PATIENT" && registeredUserId) {
        const { firstName, lastName } = splitName(form.name);
        await patientAPI.createOrUpdatePatientProfile({
          authUserId: registeredUserId,
          NIC: "",
          firstName,
          lastName,
          email: form.email,
          phone: form.phoneNumber || "",
          address: form.address || "",
          dateOfBirth: "",
          medicalReports: [],
        });
      }

      if (form.role === "PATIENT" && !form.address.trim()) {
      setError("Please enter your address.");
      return;
    }

    if (form.role === "DOCTOR") {
        await doctorAPI.createDoctor({
          name: form.name,
          email: form.email,
          phone: form.phoneNumber,
          licenseNumber: form.licenseNumber,
          yearsOfExperience: Number(form.yearsOfExperience),
          specialty: form.specialty,
          hospitalIds: form.hospitalIds,
          fee: Number(form.fee),
          availableForTelemedicine: form.availableForTelemedicine,
        });
      }

      setSuccess(
        form.role === "DOCTOR"
          ? "Doctor account created. Your professional profile is saved and the account can now go through approval."
          : "Account created successfully! Redirecting to login..."
      );
      setTimeout(() => navigate("/login"), 1800);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      <div style={styles.container} className="register-container">
        <div style={styles.leftPanel}>
          <div style={styles.logo}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="white" fillOpacity="0.15" />
              <path d="M18 8v20M8 18h20" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span style={styles.logoText}>MediLink</span>
          </div>

          <div style={styles.heroContent}>
            <h2 style={styles.heroTitle}>Join MediLink Today</h2>
            <p style={styles.heroSubtitle}>
              Create your account and set up the right profile for your healthcare journey or doctor practice.
            </p>
          </div>

          <div style={styles.stepIndicator}>
            <div style={styles.stepRow}>
              <div style={{ ...styles.stepDot, background: "#fff", boxShadow: "0 0 0 3px rgba(255,255,255,0.3)" }}>
                {step > 1 ? "OK" : "1"}
              </div>
              <div style={{ ...styles.stepLine, background: step > 1 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)" }} />
              <div
                style={{
                  ...styles.stepDot,
                  background: step === 2 ? "#fff" : "rgba(255,255,255,0.3)",
                  color: step === 2 ? "#6366f1" : "rgba(255,255,255,0.7)",
                  boxShadow: step === 2 ? "0 0 0 3px rgba(255,255,255,0.3)" : "none",
                }}
              >
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
              "Doctor onboarding with professional details",
              "Patient records linked to login identity",
              "Secure appointments, payment, and telemedicine",
            ].map((text) => (
              <div key={text} style={styles.featureItem}>
                <span style={styles.featureText}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.rightPanel}>
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h1 style={styles.formTitle}>{step === 1 ? "Create account" : "Set up credentials"}</h1>
              <p style={styles.formSubtitle}>
                {step === 1 ? "Step 1 of 2 - Enter your personal details" : "Step 2 of 2 - Choose your role and complete setup"}
              </p>
            </div>

            {step === 1 && (
              <form onSubmit={handleNext} style={styles.form}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="reg-name">Full Name</label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>User</span>
                    <input
                      id="reg-name"
                      style={styles.input}
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="reg-email">Email Address</label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>Mail</span>
                    <input
                      id="reg-email"
                      style={styles.input}
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                </div>

                <div style={styles.fieldRow}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label} htmlFor="reg-phone">Phone Number</label>
                    <div style={styles.inputWrapper}>
                      <span style={styles.inputIcon}>Phone</span>
                      <input
                        id="reg-phone"
                        style={styles.input}
                        type="tel"
                        name="phoneNumber"
                        value={form.phoneNumber}
                        onChange={handleChange}
                        placeholder="+94771234567"
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label} htmlFor="reg-address">
                      Address <span style={styles.optionalBadge}>optional for doctors</span>
                    </label>
                    <div style={styles.inputWrapper}>
                      <span style={styles.inputIcon}>Addr</span>
                      <input
                        id="reg-address"
                        style={styles.input}
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Street, city"
                      />
                    </div>
                  </div>
                </div>

                {error && <div style={styles.errorBox}>{error}</div>}

                <div style={styles.btnRow}>
                  <div />
                  <button type="submit" style={styles.submitBtn}>Continue</button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>I am a...</label>
                  <div style={styles.roleGrid}>
                    {ROLES.map((role) => {
                      const active = form.role === role.value;
                      return (
                        <button
                          key={role.value}
                          type="button"
                          style={{ ...styles.roleCard, ...(active ? styles.roleCardActive : {}) }}
                          onClick={() => handleRoleSelect(role.value)}
                        >
                          <div style={styles.roleLabel}>{role.label}</div>
                          <div style={styles.roleDesc}>{role.desc}</div>
                          {active && <span style={styles.roleCheck}>Selected</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {form.role === "DOCTOR" && (
                  <>
                    <div style={styles.sectionBanner}>
                      Doctor profile details
                      <span style={styles.sectionBannerText}>These details are needed to create the doctor-service profile together with the auth account.</span>
                    </div>

                    <div style={styles.fieldRow}>
                      <div style={styles.fieldGroup}>
                        <label style={styles.label} htmlFor="reg-license">License Number</label>
                        <div style={styles.inputWrapper}>
                          <span style={styles.inputIcon}>ID</span>
                          <input
                            id="reg-license"
                            style={styles.input}
                            type="text"
                            name="licenseNumber"
                            value={form.licenseNumber}
                            onChange={handleChange}
                            placeholder="DOC123456"
                          />
                        </div>
                      </div>

                      <div style={styles.fieldGroup}>
                        <label style={styles.label} htmlFor="reg-specialty">Specialty</label>
                        <div style={styles.inputWrapper}>
                          <span style={styles.inputIcon}>Spec</span>
                          <select
                            id="reg-specialty"
                            style={{ ...styles.input, ...styles.select }}
                            name="specialty"
                            value={form.specialty}
                            onChange={handleChange}
                          >
                            <option value="">Select specialty</option>
                            {DOCTOR_SPECIALTIES.map((specialty) => (
                              <option key={specialty} value={specialty}>
                                {specialty.replaceAll("_", " ")}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div style={styles.fieldRow}>
                      <div style={styles.fieldGroup}>
                        <label style={styles.label} htmlFor="reg-experience">Years of Experience</label>
                        <div style={styles.inputWrapper}>
                          <span style={styles.inputIcon}>Exp</span>
                          <input
                            id="reg-experience"
                            style={styles.input}
                            type="number"
                            min="0"
                            name="yearsOfExperience"
                            value={form.yearsOfExperience}
                            onChange={handleChange}
                            placeholder="5"
                          />
                        </div>
                      </div>

                      <div style={styles.fieldGroup}>
                        <label style={styles.label} htmlFor="reg-fee">Consultation Fee (LKR)</label>
                        <div style={styles.inputWrapper}>
                          <span style={styles.inputIcon}>Fee</span>
                          <input
                            id="reg-fee"
                            style={styles.input}
                            type="number"
                            min="0"
                            step="0.01"
                            name="fee"
                            value={form.fee}
                            onChange={handleChange}
                            placeholder="2500"
                          />
                        </div>
                      </div>
                    </div>

                    <label style={styles.checkboxCard}>
                      <input
                        type="checkbox"
                        name="availableForTelemedicine"
                        checked={form.availableForTelemedicine}
                        onChange={handleChange}
                      />
                      <span>Available for telemedicine consultations</span>
                    </label>

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Hospital or medical locations</label>
                      <div style={styles.hospitalPanel}>
                        {hospitalsLoading && <div style={styles.helperText}>Loading hospitals...</div>}
                        {!hospitalsLoading && hospitals.length === 0 && (
                          <div style={styles.helperText}>No hospitals available yet. Add a hospital first, then create the doctor account.</div>
                        )}
                        {!hospitalsLoading && hospitals.length > 0 && (
                          <div style={styles.hospitalGrid}>
                            {hospitals.map((hospital) => {
                              const hospitalId = hospital.hospitalId || hospital.id;
                              const active = form.hospitalIds.includes(hospitalId);
                              return (
                                <button
                                  key={hospitalId}
                                  type="button"
                                  style={{ ...styles.hospitalCard, ...(active ? styles.hospitalCardActive : {}) }}
                                  onClick={() => handleHospitalToggle(hospitalId)}
                                >
                                  <span style={styles.hospitalName}>{hospital.name}</span>
                                  <span style={styles.hospitalMeta}>
                                    {[hospital.city, hospital.province].filter(Boolean).join(", ") || "Location available"}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="reg-password">Password</label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>Lock</span>
                    <input
                      id="reg-password"
                      style={styles.input}
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 8 chars, A-Z, 0-9, @#$..."
                      required
                    />
                    <button
                      type="button"
                      style={styles.eyeBtn}
                      onClick={() => setShowPassword((current) => !current)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  <div style={styles.strengthWrapper}>
                    <div style={styles.strengthBar}>
                      {[1, 2, 3, 4, 5].map((segment) => (
                        <div
                          key={segment}
                          style={{
                            ...styles.strengthSegment,
                            background: passwordStrength.level >= segment ? passwordStrength.color : "#243047",
                          }}
                        />
                      ))}
                    </div>
                    <span style={{ ...styles.strengthLabel, color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  </div>

                  <p style={styles.hint}>
                    Must include: 8+ chars, uppercase, lowercase, number, and one special character from @ # $ % ^ & + =
                  </p>
                </div>

                {error && <div style={styles.errorBox}>{error}</div>}
                {success && <div style={styles.successBox}>{success}</div>}

                <div style={styles.btnRow}>
                  <button type="button" onClick={handleBack} style={styles.backBtn}>Back</button>
                  <button type="submit" style={styles.submitBtn} disabled={loading}>
                    {loading && <span style={styles.spinner} />}
                    {loading ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </form>
            )}

            <p style={styles.switchText}>
              Already have an account? <Link to="/login" style={styles.switchLink}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, rgb(15, 23, 42) 0%, rgb(30, 41, 59) 50%, rgb(15, 23, 42) 100%)",
    fontFamily: "'Poppins', sans-serif",
    position: "relative",
    overflow: "hidden",
    padding: "20px",
  },
  blob1: {
    position: "absolute",
    width: "340px",
    height: "340px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(14,165,233,0.22), transparent 70%)",
    top: "-90px",
    left: "-70px",
  },
  blob2: {
    position: "absolute",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.22), transparent 70%)",
    bottom: "-120px",
    right: "-80px",
  },
  blob3: {
    position: "absolute",
    width: "220px",
    height: "220px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(16,185,129,0.18), transparent 70%)",
    bottom: "15%",
    left: "12%",
  },
  container: {
    width: "100%",
    maxWidth: "1180px",
    minHeight: "720px",
    display: "grid",
    gridTemplateColumns: "0.95fr 1.15fr",
    borderRadius: "28px",
    overflow: "hidden",
    background: "rgba(15, 23, 42, 0.92)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
    border: "1px solid rgba(148,163,184,0.12)",
  },
  leftPanel: {
    background: "linear-gradient(180deg, rgba(59,130,246,0.95) 0%, rgba(14,165,233,0.92) 52%, rgba(16,185,129,0.88) 100%)",
    padding: "48px 34px",
    display: "flex",
    flexDirection: "column",
    color: "#fff",
  },
  logo: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "60px" },
  logoText: { fontSize: "22px", fontWeight: "700" },
  heroContent: { maxWidth: "340px" },
  heroTitle: { fontSize: "58px", lineHeight: 1.02, margin: "0 0 18px 0", fontWeight: "700" },
  heroSubtitle: { margin: 0, fontSize: "18px", lineHeight: 1.7, color: "rgba(255,255,255,0.92)" },
  stepIndicator: { marginTop: "52px" },
  stepRow: { display: "flex", alignItems: "center", gap: "14px" },
  stepDot: {
    width: "42px",
    height: "42px",
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "14px",
    color: "#6366f1",
  },
  stepLine: { flex: 1, height: "4px", borderRadius: "999px" },
  stepLabels: { display: "flex", marginTop: "12px", fontSize: "14px", color: "rgba(255,255,255,0.92)" },
  stepLabel: { fontWeight: "600" },
  features: { marginTop: "auto", display: "grid", gap: "14px" },
  featureItem: {
    padding: "18px 20px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.14)",
  },
  featureText: { fontSize: "16px", fontWeight: "600" },
  rightPanel: {
    background: "#141d34",
    padding: "48px 46px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  formCard: { width: "100%", maxWidth: "560px" },
  formHeader: { marginBottom: "28px" },
  formTitle: { margin: 0, fontSize: "44px", color: "#fff", fontWeight: "700" },
  formSubtitle: { margin: "10px 0 0 0", color: "#6f86b6", fontSize: "18px" },
  form: { display: "grid", gap: "18px" },
  fieldRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  fieldGroup: { display: "grid", gap: "8px" },
  label: { color: "#cad6f1", fontWeight: "600", fontSize: "14px" },
  optionalBadge: {
    display: "inline-block",
    marginLeft: "6px",
    padding: "2px 8px",
    borderRadius: "999px",
    background: "rgba(148,163,184,0.12)",
    color: "#90a4ce",
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  inputWrapper: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: {
    position: "absolute",
    left: "14px",
    fontSize: "11px",
    color: "#7083ae",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    fontWeight: "700",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    minHeight: "58px",
    borderRadius: "16px",
    border: "1px solid #31405f",
    background: "#22304a",
    color: "#fff",
    padding: "0 48px 0 58px",
    fontSize: "16px",
    outline: "none",
    fontFamily: "'Poppins', sans-serif",
    boxSizing: "border-box",
  },
  select: { appearance: "none" },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    border: "none",
    background: "transparent",
    color: "#c7d2fe",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
  },
  roleGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  roleCard: {
    textAlign: "left",
    padding: "20px",
    borderRadius: "20px",
    border: "1px solid #31405f",
    background: "#1f2945",
    cursor: "pointer",
    color: "#dbe7ff",
  },
  roleCardActive: {
    border: "1px solid #6875f5",
    boxShadow: "0 0 0 2px rgba(99,102,241,0.18)",
    background: "#222c4c",
  },
  roleLabel: { fontSize: "22px", fontWeight: "700", marginBottom: "8px" },
  roleDesc: { color: "#8fa4cf", fontSize: "14px", lineHeight: 1.5 },
  roleCheck: {
    display: "inline-block",
    marginTop: "14px",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(99,102,241,0.18)",
    color: "#c7d2fe",
    fontSize: "12px",
    fontWeight: "700",
  },
  sectionBanner: {
    display: "grid",
    gap: "6px",
    padding: "16px 18px",
    borderRadius: "16px",
    background: "rgba(14,165,233,0.08)",
    border: "1px solid rgba(14,165,233,0.14)",
    color: "#d9ebff",
    fontWeight: "700",
  },
  sectionBannerText: { color: "#9cb2d9", fontSize: "13px", fontWeight: "500" },
  checkboxCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 18px",
    borderRadius: "16px",
    border: "1px solid #31405f",
    background: "#1d2742",
    color: "#e4ecff",
    fontSize: "15px",
    fontWeight: "600",
  },
  hospitalPanel: {
    border: "1px solid #31405f",
    borderRadius: "18px",
    background: "#1b2540",
    padding: "14px",
  },
  hospitalGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  hospitalCard: {
    textAlign: "left",
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid #31405f",
    background: "#22304a",
    color: "#e2ebff",
    cursor: "pointer",
  },
  hospitalCardActive: {
    border: "1px solid #16a34a",
    background: "rgba(22,163,74,0.14)",
  },
  hospitalName: { display: "block", fontWeight: "700", marginBottom: "4px" },
  hospitalMeta: { display: "block", color: "#90a4ce", fontSize: "13px" },
  helperText: { color: "#9db0d8", fontSize: "13px" },
  strengthWrapper: { display: "flex", alignItems: "center", gap: "12px", marginTop: "10px" },
  strengthBar: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px", flex: 1 },
  strengthSegment: { height: "6px", borderRadius: "999px" },
  strengthLabel: { minWidth: "48px", fontSize: "12px", fontWeight: "700" },
  hint: { margin: 0, color: "#7083ae", fontSize: "12px", lineHeight: 1.5 },
  errorBox: {
    padding: "12px 14px",
    borderRadius: "14px",
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.2)",
    color: "#fecaca",
    fontSize: "14px",
  },
  successBox: {
    padding: "12px 14px",
    borderRadius: "14px",
    background: "rgba(16,185,129,0.12)",
    border: "1px solid rgba(16,185,129,0.2)",
    color: "#bbf7d0",
    fontSize: "14px",
  },
  btnRow: {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gap: "14px",
    alignItems: "center",
    marginTop: "8px",
  },
  backBtn: {
    minHeight: "58px",
    padding: "0 28px",
    borderRadius: "16px",
    border: "1px solid #31405f",
    background: "#202b47",
    color: "#d6e1f8",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
  },
  submitBtn: {
    minHeight: "58px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%)",
    color: "#fff",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontFamily: "'Poppins', sans-serif",
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
  switchText: { marginTop: "22px", textAlign: "center", color: "#7386b2", fontSize: "15px" },
  switchLink: { color: "#7c83ff", fontWeight: "700", textDecoration: "none" },
};


