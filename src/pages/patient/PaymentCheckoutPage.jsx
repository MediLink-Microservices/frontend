import React, { useMemo, useState } from 'react';

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Checkout</h1>
          <p className="mt-2 text-gray-600">
            Use this page to process a demo payment for a booked appointment.
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Appointment ID</label>
                <input
                  className="block w-full rounded-md border border-gray-300 px-3 py-2"
                  name="appointmentId"
                  onChange={handleChange}
                  placeholder="Appointment document ID"
                  required
                  value={paymentForm.appointmentId}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Patient ID</label>
                <input
                  className="block w-full rounded-md border border-gray-300 px-3 py-2"
                  name="patientId"
                  onChange={handleChange}
                  placeholder="Patient ID"
                  required
                  value={paymentForm.patientId}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Amount</label>
                <input
                  className="block w-full rounded-md border border-gray-300 px-3 py-2"
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
                <label className="mb-1 block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                  className="block w-full rounded-md border border-gray-300 px-3 py-2"
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
                <label className="mb-1 block text-sm font-medium text-gray-700">Recipient Email</label>
                <input
                  className="block w-full rounded-md border border-gray-300 px-3 py-2"
                  name="recipientEmail"
                  onChange={handleChange}
                  placeholder="Optional email for notification"
                  type="email"
                  value={paymentForm.recipientEmail}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Recipient Phone</label>
                <input
                  className="block w-full rounded-md border border-gray-300 px-3 py-2"
                  name="recipientPhone"
                  onChange={handleChange}
                  placeholder="Optional phone for SMS"
                  value={paymentForm.recipientPhone}
                />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-md bg-gray-50 px-4 py-3 text-sm text-gray-700">
              <input
                checked={paymentForm.simulateSuccess}
                name="simulateSuccess"
                onChange={handleChange}
                type="checkbox"
              />
              Simulate successful payment and confirm the appointment automatically
            </label>

            {error && (
              <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {paymentResult && (
              <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
                Payment status: <strong>{paymentResult.status}</strong>
                {paymentResult.transactionReference && (
                  <span> | Transaction: <strong>{paymentResult.transactionReference}</strong></span>
                )}
              </div>
            )}

            <button
              className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Processing Payment...' : 'Process Payment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentCheckoutPage;
