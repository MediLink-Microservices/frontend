import React, { useMemo, useState } from 'react';
import {
  BadgeCheck,
  CalendarDays,
  CreditCard,
  ReceiptText,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Wallet,
  XCircle,
} from 'lucide-react';

const readLatestAppointment = () => {
  try {
    const rawAppointment = sessionStorage.getItem('latestAppointment');
    return rawAppointment ? JSON.parse(rawAppointment) : null;
  } catch {
    return null;
  }
};

const PaymentCheckoutPage = () => {
  const latestAppointment = useMemo(() => readLatestAppointment(), []);
  const [paymentForm, setPaymentForm] = useState({
    appointmentId: latestAppointment?.id || '',
    patientId: latestAppointment?.patientId || '',
    amount: latestAppointment?.consultationFee || '',
    paymentMethod: 'CREDIT_CARD',
    recipientEmail: '',
    recipientPhone: '',
    simulateSuccess: true,
  });
  const [paymentResult, setPaymentResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setPaymentForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setPaymentResult(null);

    try {
      const response = await fetch('http://localhost:8085/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...paymentForm,
          amount: Number(paymentForm.amount),
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message || 'Payment processing failed.');
      }

      setPaymentResult(payload);
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-medilink-primary to-medilink-secondary p-8 text-white shadow-medical-lg">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
                <Wallet className="h-4 w-4" />
                Medilink Checkout
              </div>
              <h1 className="mt-4 text-4xl font-bold font-display">Complete your appointment payment</h1>
              <p className="mt-3 max-w-2xl text-white/85">
                This page processes a demo payment and helps you confirm the appointment immediately after booking.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">Appointment</p>
              <p className="mt-2 text-lg font-semibold">{paymentForm.appointmentId || 'Waiting for appointment ID'}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-medical lg:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-medilink-primary">Payment Form</p>
                <h2 className="mt-2 text-2xl font-bold text-medilink-dark">Secure demo checkout</h2>
              </div>
              <div className="rounded-2xl bg-indigo-50 p-3">
                <CreditCard className="h-6 w-6 text-medilink-secondary" />
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Appointment ID</label>
                  <input
                    className="block w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100"
                    name="appointmentId"
                    onChange={handleChange}
                    placeholder="Appointment document ID"
                    required
                    value={paymentForm.appointmentId}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Patient ID</label>
                  <input
                    className="block w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100"
                    name="patientId"
                    onChange={handleChange}
                    placeholder="Patient ID"
                    required
                    value={paymentForm.patientId}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Amount</label>
                  <input
                    className="block w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100"
                    min="100"
                    name="amount"
                    onChange={handleChange}
                    placeholder="Consultation fee"
                    required
                    step="0.01"
                    type="number"
                    value={paymentForm.amount}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Payment Method</label>
                  <select
                    className="block w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100"
                    name="paymentMethod"
                    onChange={handleChange}
                    value={paymentForm.paymentMethod}
                  >
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="NET_BANKING">Net Banking</option>
                    <option value="WALLET">Wallet</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Recipient Email</label>
                  <input
                    className="block w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100"
                    name="recipientEmail"
                    onChange={handleChange}
                    placeholder="Optional email for notification"
                    type="email"
                    value={paymentForm.recipientEmail}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Recipient Phone</label>
                  <input
                    className="block w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100"
                    name="recipientPhone"
                    onChange={handleChange}
                    placeholder="Optional phone for SMS"
                    value={paymentForm.recipientPhone}
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 text-sm text-gray-700">
                <input
                  checked={paymentForm.simulateSuccess}
                  name="simulateSuccess"
                  onChange={handleChange}
                  type="checkbox"
                  className="mt-1"
                />
                Simulate successful payment and confirm the appointment automatically
              </label>

              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {paymentResult && (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p>Payment status: <strong>{paymentResult.status}</strong></p>
                    {paymentResult.transactionReference && (
                      <p className="mt-1">Transaction: <strong>{paymentResult.transactionReference}</strong></p>
                    )}
                  </div>
                </div>
              )}

              <button
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-medilink-primary to-medilink-secondary px-6 py-3 text-white shadow-medical transition hover:shadow-medical-lg disabled:opacity-50"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? 'Processing Payment...' : 'Process Payment'}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-medical">
              <h3 className="text-lg font-semibold text-medilink-dark">Checkout summary</h3>
              <div className="mt-5 space-y-4 text-sm text-gray-600">
                <p className="flex items-start gap-3">
                  <ReceiptText className="mt-0.5 h-4 w-4 shrink-0 text-medilink-primary" />
                  <span><span className="font-semibold text-gray-800">Appointment ID:</span> {paymentForm.appointmentId || 'Not loaded yet'}</span>
                </p>
                <p className="flex items-start gap-3">
                  <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-medilink-primary" />
                  <span><span className="font-semibold text-gray-800">Patient ID:</span> {paymentForm.patientId || 'Not loaded yet'}</span>
                </p>
                <p className="flex items-start gap-3">
                  <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-medilink-primary" />
                  <span><span className="font-semibold text-gray-800">Amount:</span> Rs. {paymentForm.amount || '0.00'}</span>
                </p>
                <p className="flex items-start gap-3">
                  <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-medilink-primary" />
                  <span><span className="font-semibold text-gray-800">Method:</span> {paymentForm.paymentMethod}</span>
                </p>
                {latestAppointment?.doctorName && (
                  <p className="flex items-start gap-3">
                    <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-medilink-primary" />
                    <span><span className="font-semibold text-gray-800">Doctor:</span> Dr. {latestAppointment.doctorName}</span>
                  </p>
                )}
                {latestAppointment?.appointmentDateTime && (
                  <p className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-medilink-primary" />
                    <span><span className="font-semibold text-gray-800">Visit time:</span> {new Date(latestAppointment.appointmentDateTime).toLocaleString('en-LK')}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 p-6 text-white shadow-medical-lg">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/15 p-3">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">Why this matters</p>
                  <h3 className="mt-1 text-xl font-bold">Payment confirms the booking</h3>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm text-white/90">
                <p>Successful payment creates a transaction record in payment-service.</p>
                <p>The appointment-service is updated automatically after success.</p>
                <p>This gives you a real distributed workflow to show in the demo.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCheckoutPage;
