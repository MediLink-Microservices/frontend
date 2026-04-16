import React, { useEffect, useMemo, useState } from 'react';
import { LoaderCircle, Mail, MapPin, Phone, Save, ShieldCheck, UserRound, XCircle } from 'lucide-react';
import PatientPortalTabs from '../../components/patient/PatientPortalTabs';
import { patientAPI } from '../../services/api';
import { getStoredUser, updateStoredUser } from '../../utils/authStorage';

const buildDisplayName = (profile, fallbackName = '') => {
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim();
  return fullName || fallbackName || 'Patient';
};

const getInitials = (name = 'Patient') => (
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'PT'
);

const PatientProfilePage = () => {
  const storedUser = useMemo(() => getStoredUser(), []);
  const authUserId = storedUser?.userId || storedUser?.id || '';

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    NIC: '',
    dateOfBirth: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!authUserId) {
        setError('No logged-in patient session found. Please sign in again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await patientAPI.getPatientProfileByAuthUserId(authUserId);
        const patientProfile = response.data;
        setProfile(patientProfile);
        setForm({
          firstName: patientProfile.firstName || '',
          lastName: patientProfile.lastName || '',
          email: patientProfile.email || storedUser?.email || '',
          phone: patientProfile.phone || '',
          address: patientProfile.address || '',
          NIC: patientProfile.NIC || '',
          dateOfBirth: patientProfile.dateOfBirth || '',
        });
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message
          || requestError?.message
          || 'Failed to load the linked patient profile.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [authUserId, storedUser?.email]);

  const displayName = buildDisplayName(profile, storedUser?.name);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setSuccess('');
    setError('');
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!profile?.id) {
      setError('No patient profile is linked to this account yet.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        ...profile,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        NIC: form.NIC.trim(),
        dateOfBirth: form.dateOfBirth,
        authUserId,
      };

      const response = await patientAPI.createOrUpdatePatientProfile(payload);
      const updatedProfile = response.data;
      setProfile(updatedProfile);
      setForm({
        firstName: updatedProfile.firstName || '',
        lastName: updatedProfile.lastName || '',
        email: updatedProfile.email || '',
        phone: updatedProfile.phone || '',
        address: updatedProfile.address || '',
        NIC: updatedProfile.NIC || '',
        dateOfBirth: updatedProfile.dateOfBirth || '',
      });

      const mergedUser = {
        ...storedUser,
        name: buildDisplayName(updatedProfile, storedUser?.name),
        email: updatedProfile.email || storedUser?.email,
      };
      updateStoredUser(mergedUser);
      setSuccess('Profile updated successfully.');
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message
        || requestError?.message
        || 'Failed to update your profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <PatientPortalTabs />

          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-medilink-primary to-medilink-secondary p-8 text-white shadow-medical-lg">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
                  <UserRound className="h-4 w-4" />
                  Patient Profile
                </div>
                <h1 className="mt-4 text-4xl font-bold font-display">Keep your personal details up to date</h1>
                <p className="mt-3 max-w-2xl text-white/85">
                  Review your linked patient profile, update contact details, and keep your booking records accurate.
                </p>
              </div>
              <div className="rounded-3xl bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Linked profile</p>
                <p className="mt-2 text-lg font-semibold">{profile?.id || 'Loading...'}</p>
                <p className="mt-1 text-sm text-white/75">{form.email || storedUser?.email || 'No email linked'}</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-3xl border border-white/80 bg-white p-12 shadow-medical">
              <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-medilink-primary" />
              <span className="text-sm text-gray-600">Loading your profile...</span>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
              <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-medical">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-medilink-primary to-medilink-secondary text-3xl font-bold text-white shadow-medical">
                    {getInitials(displayName)}
                  </div>
                  <h2 className="mt-5 text-2xl font-bold text-medilink-dark">{displayName}</h2>
                  <p className="mt-1 text-sm text-gray-500">{form.email || 'No email available'}</p>
                </div>

                <div className="mt-6 space-y-4 rounded-3xl bg-slate-50 p-5 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-medilink-primary" />
                    <span>{form.email || 'No email linked'}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-medilink-primary" />
                    <span>{form.phone || 'No phone number added'}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-medilink-primary" />
                    <span>{form.address || 'No address added'}</span>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-4 text-sm text-sky-800">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      These details are linked to your patient profile, so appointment records and telemedicine sessions stay aligned with your account.
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-medical lg:p-8">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-medilink-primary">Profile Form</p>
                  <h2 className="mt-2 text-2xl font-bold text-medilink-dark">Edit your personal details</h2>
                </div>

                {error && (
                  <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
                    {success}
                  </div>
                )}

                <form className="mt-6 grid gap-5 md:grid-cols-2" onSubmit={handleSave}>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-medilink-dark" htmlFor="firstName">First name</label>
                    <input className="block w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100" id="firstName" name="firstName" onChange={handleChange} value={form.firstName} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-medilink-dark" htmlFor="lastName">Last name</label>
                    <input className="block w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100" id="lastName" name="lastName" onChange={handleChange} value={form.lastName} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-medilink-dark" htmlFor="email">Email</label>
                    <input className="block w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100" id="email" name="email" onChange={handleChange} type="email" value={form.email} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-medilink-dark" htmlFor="phone">Phone</label>
                    <input className="block w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100" id="phone" name="phone" onChange={handleChange} value={form.phone} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-medilink-dark" htmlFor="address">Address</label>
                    <textarea className="block min-h-28 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100" id="address" name="address" onChange={handleChange} value={form.address} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-medilink-dark" htmlFor="NIC">NIC</label>
                    <input className="block w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-gray-500 outline-none" id="NIC" name="NIC" readOnly value={form.NIC} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-medilink-dark" htmlFor="dateOfBirth">Date of birth</label>
                    <input className="block w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100" id="dateOfBirth" name="dateOfBirth" onChange={handleChange} type="date" value={form.dateOfBirth} />
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-medilink-primary to-medilink-secondary px-6 py-3 text-sm font-semibold text-white shadow-medical transition hover:shadow-medical-lg disabled:opacity-60"
                      disabled={saving}
                      type="submit"
                    >
                      {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientProfilePage;
