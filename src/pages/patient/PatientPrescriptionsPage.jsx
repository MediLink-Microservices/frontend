import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileBadge,
  FileText,
  LoaderCircle,
  NotebookPen,
  Pill,
  Printer,
  RefreshCw,
  Stethoscope,
  Syringe,
  UserRound,
  X,
} from 'lucide-react';
import PatientPortalTabs from '../../components/patient/PatientPortalTabs';
import { patientAPI } from '../../services/api';
import { getStoredUser } from '../../utils/authStorage';

// ─── Helpers ────────────────────────────────────────────────────────────────

const getStoredUserSafe = () => {
  const user = getStoredUser();
  return user && Object.keys(user).length ? user : null;
};

const getPatientDisplayName = (patient, fallback = 'Patient') => {
  if (!patient) return fallback;
  const full = [patient.firstName, patient.lastName].filter(Boolean).join(' ').trim();
  return full || patient.name || fallback;
};

const DOCTOR_SERVICE_BASE = 'http://localhost:8083/api';
const PRESCRIPTION_API_BASE = `${DOCTOR_SERVICE_BASE}/prescriptions`;
const DOCTOR_API_BASE = `${DOCTOR_SERVICE_BASE}/doctors`;

// ─── Status badge helper ─────────────────────────────────────────────────────

const StatusBadge = ({ prescription }) => {
  if (!prescription.prescribedDate) return null;
  const issued = new Date(prescription.prescribedDate);
  const daysAgo = Math.floor((Date.now() - issued.getTime()) / 86_400_000);
  const duration = parseInt(prescription.duration) || 0;
  const active = duration > 0 && daysAgo <= duration;

  return active ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
      Completed
    </span>
  );
};

// ─── Print helpers ───────────────────────────────────────────────────────────

const buildPrintHTML = (prescription, patientName, doctorName, doctorSpecialty, formatDate) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Prescription – ${patientName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; padding: 32px; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0ea5e9; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { font-size: 22px; font-weight: 700; color: #0284c7; letter-spacing: -0.5px; }
    .brand span { color: #38bdf8; }
    .meta { font-size: 11px; color: #64748b; text-align: right; }
    .badge { display: inline-block; background: #e0f2fe; color: #0369a1; border-radius: 999px; padding: 2px 10px; font-size: 11px; font-weight: 600; margin-top: 4px; }
    .section { margin-bottom: 20px; }
    .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 5px; }
    .value { font-size: 14px; color: #1e293b; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; }
    .notes { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px; }
    .footer { margin-top: 32px; border-top: 1px dashed #cbd5e1; padding-top: 14px; font-size: 11px; color: #94a3b8; text-align: center; }
    .sig { margin-top: 36px; display: flex; justify-content: flex-end; }
    .sig-box { border-top: 1px solid #334155; width: 180px; text-align: center; padding-top: 6px; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Medi<span>Link</span></div>
      <div style="font-size:11px;color:#64748b;margin-top:2px;">Smart Healthcare Platform</div>
    </div>
    <div class="meta">
      Prescription ID: <strong>${prescription.prescriptionId?.slice(0, 8).toUpperCase() ?? 'N/A'}</strong><br/>
      Issued: ${formatDate(prescription.prescribedDate)}<br/>
      <span class="badge">Official Prescription</span>
    </div>
  </div>

  <div class="grid">
    <div class="box section">
      <div class="label">Patient</div>
      <div class="value" style="font-weight:600">${patientName}</div>
    </div>
    <div class="box section">
      <div class="label">Prescribing Physician</div>
      <div class="value" style="font-weight:600">${doctorName}</div>
      ${doctorSpecialty ? `<div style="font-size:12px;color:#64748b">${doctorSpecialty}</div>` : ''}
    </div>
  </div>

  <div class="box section">
    <div class="label">Diagnosis</div>
    <div class="value">${prescription.diagnosis || 'Not specified'}</div>
  </div>

  <div class="box section">
    <div class="label">Prescribed Medicines</div>
    <div class="value">${prescription.medicines || 'No medicines listed'}</div>
  </div>

  <div class="grid">
    <div class="box section">
      <div class="label">Dosage Instructions</div>
      <div class="value">${prescription.dosageInstructions || 'Not specified'}</div>
    </div>
    <div class="box section">
      <div class="label">Treatment Duration</div>
      <div class="value">${prescription.duration ? `${prescription.duration} days` : 'Not specified'}</div>
    </div>
  </div>

  ${prescription.notes ? `
  <div class="notes section">
    <div class="label">Additional Notes</div>
    <div class="value">${prescription.notes}</div>
  </div>` : ''}

  <div class="sig">
    <div class="sig-box">
      ${doctorName}<br/>Physician Signature
    </div>
  </div>

  <div class="footer">
    This prescription is issued through MediLink and is valid for the specified duration. Store safely.<br/>
    Generated on ${new Date().toLocaleString('en-LK')} — MediLink Smart Healthcare Platform
  </div>
</body>
</html>`;

// ─── Prescription Detail Modal ───────────────────────────────────────────────

const PrescriptionModal = ({ prescription, patientName, getDoctorName, getDoctorSpecialty, formatDate, formatDateTime, onClose }) => {
  const printRef = useRef(null);

  if (!prescription) return null;

  const doctorName = getDoctorName(prescription.doctorId);
  const doctorSpecialty = getDoctorSpecialty(prescription.doctorId);

  const handlePrint = () => {
    const html = buildPrintHTML(prescription, patientName, doctorName, doctorSpecialty, formatDate);
    const win = window.open('', '_blank', 'width=800,height=900');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  const handleDownload = () => {
    const html = buildPrintHTML(prescription, patientName, doctorName, doctorSpecialty, formatDate);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Prescription_${prescription.prescriptionId?.slice(0, 8) ?? 'MediLink'}_${patientName.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const InfoRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      {Icon && (
        <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
          <Icon className="h-4 w-4 text-medilink-primary" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm text-gray-800 leading-relaxed">{value || 'Not specified'}</p>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-medilink-primary to-medilink-secondary px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <FileBadge className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold leading-tight">Prescription Details</h2>
                <p className="text-xs text-white/70 mt-0.5">
                  ID: {prescription.prescriptionId?.slice(0, 8).toUpperCase() ?? 'N/A'}
                  {' · '}
                  Issued {formatDate(prescription.prescribedDate)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Doctor banner inside header */}
          <div className="mt-4 rounded-2xl bg-white/10 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">{doctorName}</p>
              {doctorSpecialty && <p className="text-xs text-white/70">{doctorSpecialty}</p>}
            </div>
            <div className="ml-auto">
              <StatusBadge prescription={prescription} />
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-2xl bg-sky-50 p-3 text-center">
              <p className="text-xs text-sky-600 font-semibold uppercase tracking-wide">Duration</p>
              <p className="text-lg font-bold text-sky-800 mt-0.5">
                {prescription.duration ? `${prescription.duration}d` : '—'}
              </p>
            </div>
            <div className="rounded-2xl bg-indigo-50 p-3 text-center">
              <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide">Medicines</p>
              <p className="text-lg font-bold text-indigo-800 mt-0.5">
                {prescription.medicines ? prescription.medicines.split(',').length : '—'}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-center">
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Issued</p>
              <p className="text-xs font-bold text-emerald-800 mt-1 leading-tight">
                {prescription.prescribedDate
                  ? new Date(prescription.prescribedDate).toLocaleDateString('en-LK', { day: '2-digit', month: 'short' })
                  : '—'}
              </p>
            </div>
          </div>

          {/* Detail rows */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 px-4 divide-y divide-gray-100">
            <InfoRow label="Diagnosis" value={prescription.diagnosis} icon={NotebookPen} />
            <InfoRow label="Prescribed Medicines" value={prescription.medicines} icon={Pill} />
            <InfoRow label="Dosage Instructions" value={prescription.dosageInstructions} icon={Syringe} />
            <InfoRow label="Treatment Duration" value={prescription.duration ? `${prescription.duration} days` : null} icon={Calendar} />
            {prescription.notes && (
              <InfoRow label="Doctor's Notes" value={prescription.notes} icon={FileText} />
            )}
          </div>

          {/* Timestamp */}
          {prescription.createdAt && (
            <p className="mt-3 text-center text-xs text-gray-400">
              Record created: {formatDateTime(prescription.createdAt)}
            </p>
          )}
        </div>

        {/* Modal Footer – actions */}
        <div className="flex-shrink-0 border-t border-gray-100 bg-white px-6 py-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-medilink-primary to-medilink-secondary px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-200 hover:opacity-90 transition"
          >
            <Download className="h-4 w-4" />
            Download Prescription
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            onClick={onClose}
            className="sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition"
          >
            <X className="h-4 w-4" />
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Prescription Card ───────────────────────────────────────────────────────

const PrescriptionCard = ({ prescription, getDoctorName, getDoctorSpecialty, formatDate, patientName, onView }) => {
  const doctorName = getDoctorName(prescription.doctorId);
  const doctorSpecialty = getDoctorSpecialty(prescription.doctorId);

  const handleQuickDownload = (e) => {
    e.stopPropagation();
    const html = buildPrintHTML(prescription, patientName, doctorName, doctorSpecialty, formatDate);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Prescription_${prescription.prescriptionId?.slice(0, 8) ?? 'MediLink'}_${patientName.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="group flex flex-col rounded-3xl border border-white/80 bg-white/90 shadow-md backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
      {/* Card top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-medilink-primary to-medilink-secondary" />

      <div className="flex flex-col flex-1 p-5">
        {/* Doctor row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 rounded-2xl bg-gradient-to-br from-medilink-primary/10 to-medilink-secondary/10 p-2.5">
              <Stethoscope className="h-5 w-5 text-medilink-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 truncate">{doctorName}</p>
              {doctorSpecialty && (
                <p className="text-xs text-gray-500 truncate">{doctorSpecialty}</p>
              )}
            </div>
          </div>
          <StatusBadge prescription={prescription} />
        </div>

        {/* Date */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(prescription.prescribedDate)}
        </div>

        {/* Diagnosis */}
        <div className="mt-4 rounded-2xl bg-slate-50 px-3.5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Diagnosis</p>
          <p className="text-sm text-gray-800 line-clamp-2 leading-relaxed">{prescription.diagnosis || 'Not specified'}</p>
        </div>

        {/* Medicines */}
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1 mb-1">
            <Pill className="h-3 w-3" /> Medicines
          </p>
          <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{prescription.medicines || 'No medicines listed'}</p>
        </div>

        {/* Chips */}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {prescription.dosageInstructions && (
            <span className="rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-indigo-700 flex items-center gap-1">
              <Syringe className="h-3 w-3" />
              {prescription.dosageInstructions.length > 22
                ? prescription.dosageInstructions.slice(0, 22) + '…'
                : prescription.dosageInstructions}
            </span>
          )}
          {prescription.duration && (
            <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-emerald-700 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {prescription.duration} days
            </span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 gap-2">
          <button
            onClick={onView}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-medilink-primary/10 to-medilink-secondary/10 px-3 py-1.5 text-sm font-semibold text-medilink-primary hover:from-medilink-primary/20 hover:to-medilink-secondary/20 transition"
          >
            <FileText className="h-4 w-4" />
            View Details
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleQuickDownload}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

const PatientPrescriptionsPage = () => {
  const storedUser = getStoredUserSafe();
  const authUserId = storedUser?.userId || storedUser?.id;

  const [patientProfile, setPatientProfile] = useState(null);
  const [patientLoading, setPatientLoading] = useState(!!authUserId);
  const [patientError, setPatientError] = useState('');

  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);
  const [prescriptionsError, setPrescriptionsError] = useState('');

  const [doctorsMap, setDoctorsMap] = useState({});
  const [doctorsLoading, setDoctorsLoading] = useState(false);

  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Fetch patient profile
  useEffect(() => {
    if (!authUserId) { setPatientLoading(false); return; }
    const fetchPatient = async () => {
      setPatientLoading(true);
      setPatientError('');
      try {
        const response = await patientAPI.getPatientProfileByAuthUserId(authUserId);
        setPatientProfile(response.data);
      } catch (err) {
        console.error('Patient profile error:', err);
        setPatientError('Unable to load patient profile. Please ensure your account is linked to a patient record.');
      } finally {
        setPatientLoading(false);
      }
    };
    fetchPatient();
  }, [authUserId]);

  // 2. Fetch all doctors
  const fetchDoctors = useCallback(async () => {
    if (doctorsLoading || Object.keys(doctorsMap).length > 0) return;
    setDoctorsLoading(true);
    try {
      const res = await fetch(DOCTOR_API_BASE);
      if (!res.ok) throw new Error('Failed to fetch doctors');
      const data = await res.json();
      const map = {};
      data.forEach(doc => { map[doc.doctorId] = { name: doc.name, specialty: doc.specialty, ...doc }; });
      setDoctorsMap(map);
    } catch (err) {
      console.error('Doctors fetch error:', err);
    } finally {
      setDoctorsLoading(false);
    }
  }, [doctorsLoading, doctorsMap]);

  // 3. Fetch prescriptions
  const fetchPrescriptions = useCallback(async (patientId) => {
    if (!patientId) return;
    setPrescriptionsLoading(true);
    setPrescriptionsError('');
    try {
      const res = await fetch(`${PRESCRIPTION_API_BASE}/patient/${patientId}`);
      if (res.status === 404) { setPrescriptions([]); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const sorted = Array.isArray(data)
        ? data.sort((a, b) => new Date(b.prescribedDate) - new Date(a.prescribedDate))
        : [];
      setPrescriptions(sorted);
    } catch (err) {
      console.error('Prescriptions error:', err);
      setPrescriptionsError('Unable to load prescriptions. Please try again.');
    } finally {
      setPrescriptionsLoading(false);
    }
  }, []);

  // 4. Trigger fetches when patient ready
  useEffect(() => {
    if (patientProfile?.id) {
      fetchPrescriptions(patientProfile.id);
      fetchDoctors();
    }
  }, [patientProfile, fetchPrescriptions, fetchDoctors]);

  // Helpers
  const getDoctorName = (doctorId) => {
    if (!doctorId) return 'Unknown Doctor';
    const doc = doctorsMap[doctorId];
    return doc?.name || `Doctor ID: ${doctorId.slice(0, 8)}...`;
  };
  const getDoctorSpecialty = (doctorId) => doctorsMap[doctorId]?.specialty || '';

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not specified';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return dateStr; }
  };
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Not specified';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('en-LK', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return dateStr; }
  };

  const handleRefresh = async () => {
    if (!patientProfile?.id) return;
    setRefreshing(true);
    await fetchPrescriptions(patientProfile.id);
    setRefreshing(false);
  };

  const patientName = patientProfile
    ? getPatientDisplayName(patientProfile, storedUser?.name)
    : storedUser?.name || 'Patient';
  const hasPatient = !!patientProfile?.id;

  const activePrescriptions = prescriptions.filter(p => {
    if (!p.prescribedDate || !p.duration) return false;
    const daysAgo = Math.floor((Date.now() - new Date(p.prescribedDate).getTime()) / 86_400_000);
    return daysAgo <= parseInt(p.duration);
  });

  // ── Loading state ──
  if (patientLoading || (hasPatient && (prescriptionsLoading || doctorsLoading))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <PatientPortalTabs />
          <div className="flex flex-col justify-center items-center h-64 gap-3">
            <LoaderCircle className="h-9 w-9 animate-spin text-medilink-primary" />
            <span className="text-gray-500 text-sm">Loading your prescriptions…</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PatientPortalTabs />

        {/* ── Hero ── */}
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-medilink-primary to-medilink-secondary p-8 text-white shadow-lg">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
                <FileBadge className="h-4 w-4" />
                MediLink Prescriptions
              </div>
              <h1 className="mt-4 text-3xl font-bold md:text-4xl">
                {patientLoading ? 'Loading…' : `Your Prescriptions, ${patientName}`}
              </h1>
              <p className="mt-3 text-white/85 max-w-xl">
                View, download, and print all prescriptions issued by your doctors — including diagnosis, medicines, dosage, and duration.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 lg:w-72">
              <div className="rounded-2xl bg-white/10 p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-white/70">Total</p>
                <p className="text-2xl font-bold">{prescriptions.length}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-white/70">Active</p>
                <p className="text-2xl font-bold text-emerald-300">{activePrescriptions.length}</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="col-span-2 rounded-2xl bg-white/15 p-3 text-sm font-medium hover:bg-white/25 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Patient error ── */}
        {patientError && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-amber-800">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Patient profile not linked</p>
              <p className="text-sm mt-0.5">{patientError}</p>
            </div>
          </div>
        )}

        {/* ── Prescriptions error ── */}
        {prescriptionsError && !prescriptionsLoading && (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
            <p className="mt-2 text-red-700 font-medium">{prescriptionsError}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-100 px-4 py-2 text-sm text-red-700 hover:bg-red-200 transition"
            >
              <RefreshCw className="h-4 w-4" /> Try Again
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {!prescriptionsError && hasPatient && prescriptions.length === 0 && (
          <div className="rounded-3xl bg-white/90 p-14 text-center shadow-md">
            <div className="mx-auto w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center mb-5">
              <Pill className="h-10 w-10 text-medilink-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">No prescriptions yet</h3>
            <p className="mt-2 text-gray-500 max-w-sm mx-auto">
              Your prescriptions will appear here once a doctor prescribes medication for you.
            </p>
          </div>
        )}

        {/* ── Prescriptions grid ── */}
        {!prescriptionsError && hasPatient && prescriptions.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {prescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.prescriptionId}
                prescription={prescription}
                getDoctorName={getDoctorName}
                getDoctorSpecialty={getDoctorSpecialty}
                formatDate={formatDate}
                patientName={patientName}
                onView={() => setSelectedPrescription(prescription)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selectedPrescription && (
        <PrescriptionModal
          prescription={selectedPrescription}
          patientName={patientName}
          getDoctorName={getDoctorName}
          getDoctorSpecialty={getDoctorSpecialty}
          formatDate={formatDate}
          formatDateTime={formatDateTime}
          onClose={() => setSelectedPrescription(null)}
        />
      )}
    </div>
  );
};

export default PatientPrescriptionsPage;