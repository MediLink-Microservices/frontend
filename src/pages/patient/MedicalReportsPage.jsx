import React, { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Download, FileText, LoaderCircle, Plus, Trash2, XCircle } from 'lucide-react'
import PatientPortalTabs from '../../components/patient/PatientPortalTabs'
import { patientAPI } from '../../services/api'
import { getStoredUser } from '../../utils/authStorage'

const formatDate = (value) => {
  if (!value) return 'Unknown date'
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return value
  }
}

// Helper: build full Cloudinary URL from a public ID (if needed)
const buildCloudinaryUrl = (publicId) => {
  if (!publicId) return null
  if (publicId.startsWith('http')) return publicId
  // Assumes cloud_name is dwoez6qkw (from your console)
  return `https://res.cloudinary.com/dwoez6qkw/image/upload/${publicId}`
}

const MedicalReportsPage = () => {
  const storedUser = useMemo(() => getStoredUser(), [])
  const authUserId = storedUser?.userId || storedUser?.id || ''

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      if (!authUserId) {
        setError('You must be signed in to access medical reports.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        const response = await patientAPI.getPatientProfileByAuthUserId(authUserId)
        setProfile(response.data)
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
          requestError?.message ||
          'Failed to load your patient record.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [authUserId])

  const handleFileChange = (event) => {
    setFile(event.target.files?.[0] || null)
    setError('')
    setSuccess('')
  }

  const handleUpload = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!profile?.id) {
      setError('No linked patient profile was found. Please create or link your profile first.')
      return
    }

    if (!title.trim() || !file) {
      setError('Please add a title and select a file to upload.')
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('file', file)

      const response = await patientAPI.uploadMedicalReport(profile.id, formData)
      setProfile(response.data)
      setTitle('')
      setFile(null)
      setSuccess('Medical report uploaded successfully.')
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
        requestError?.message ||
        'Failed to upload the medical report.'
      )
    } finally {
      setUploading(false)
    }
  }

  // Get usable URL from report (fallback to building from public ID if needed)
  const getReportUrl = (report) => {
    if (report.fileUrl && report.fileUrl.startsWith('http')) return report.fileUrl
    // If fileUrl is missing or just a public ID, try to build it
    if (report.publicId) return buildCloudinaryUrl(report.publicId)
    // Last resort: maybe the fileUrl is the public ID path
    if (report.fileUrl && !report.fileUrl.startsWith('http')) return buildCloudinaryUrl(report.fileUrl)
    return null
  }

  const openReport = (report) => {
    const url = getReportUrl(report)
    if (!url) {
      setError('No valid file URL for this report.')
      return
    }
    // For Cloudinary, you can add '?fl_attachment=0' to force inline view
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const downloadReport = async (report) => {
    let url = getReportUrl(report)
    if (!url) {
      setError('No valid file URL for this report.')
      return
    }

    // Force download from Cloudinary using 'fl_attachment'
    if (url.includes('cloudinary.com')) {
      // Add or replace fl_attachment flag
      const separator = url.includes('?') ? '&' : '?'
      url = `${url}${separator}fl_attachment=1`
    }

    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      const extension = blob.type?.split('/')?.[1] || 'pdf'
      const safeName = report.title?.replace(/[^a-z0-9_-]/gi, '_') || 'medical_report'
      link.download = `${safeName}.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
      setSuccess('Download started.')
    } catch (err) {
      console.error('Download failed', err)
      // Fallback: open in new tab (browser may show or download)
      window.open(url, '_blank')
    }
  }

  const deleteReport = async (recordId, title) => {
    if (!profile?.id || !recordId) return
    const confirmed = window.confirm(`Delete "${title}"? This cannot be undone.`)
    if (!confirmed) return

    try {
      await patientAPI.deleteMedicalReport(profile.id, recordId)
      setProfile((prev) => ({
        ...prev,
        medicalReports: prev.medicalReports.filter((r) => r.recordId !== recordId),
      }))
      setSuccess('Report deleted.')
    } catch (err) {
      setError(err?.response?.data?.message || 'Delete failed.')
    }
  }

  const medicalReports = profile?.medicalReports || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <PatientPortalTabs />

          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-medilink-primary to-medilink-secondary p-8 text-white shadow-medical-lg">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
                  <FileText className="h-4 w-4" />
                  Medical Records
                </div>
                <h1 className="mt-4 text-4xl font-bold font-display">Upload and manage your medical reports</h1>
                <p className="mt-3 max-w-2xl text-white/85">
                  See all previously uploaded files, add new reports, and open your latest medical documents directly from your patient dashboard.
                </p>
              </div>
              <div className="rounded-3xl bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Linked profile</p>
                <p className="mt-2 text-lg font-semibold">{profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : 'Patient Record'}</p>
                <p className="mt-1 text-sm text-white/75">{profile?.NIC || 'NIC not set'}</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-3xl border border-white/80 bg-white p-12 shadow-medical">
              <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-medilink-primary" />
              <span className="text-sm text-gray-600">Loading your medical records...</span>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
              {/* Left summary panel */}
              <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-medical">
                <div className="flex items-center gap-3">
                  <div className="rounded-3xl bg-medilink-primary/10 p-3 text-medilink-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-medilink-primary">Report summary</p>
                    <p className="mt-2 text-3xl font-bold text-medilink-dark">{medicalReports.length}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4 rounded-3xl bg-slate-50 p-5 text-sm text-gray-600">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Latest upload</p>
                    <p className="mt-2 text-sm text-gray-700">
                      {medicalReports.length > 0 ? medicalReports[medicalReports.length - 1].title : 'No reports uploaded yet.'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Last updated</p>
                    <p className="mt-2 text-sm text-gray-700">
                      {medicalReports.length > 0 ? formatDate(medicalReports[medicalReports.length - 1].uploadDate) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right side: upload form + list */}
              <div className="space-y-6">
                {/* Upload form */}
                <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-medical">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-medilink-primary">Upload report</p>
                      <h2 className="mt-2 text-2xl font-bold text-medilink-dark">Add a new medical report</h2>
                    </div>
                    <div className="rounded-2xl bg-sky-50 px-3 py-2 text-sm text-sky-700">Accepted: PDF, image</div>
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

                  <form className="mt-6 space-y-5" onSubmit={handleUpload}>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-medilink-dark" htmlFor="reportTitle">Report title</label>
                      <input
                        id="reportTitle"
                        name="reportTitle"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Blood Test, MRI Scan"
                        className="block w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-medilink-primary focus:ring-4 focus:ring-sky-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-medilink-dark" htmlFor="reportFile">Select file</label>
                      <input
                        id="reportFile"
                        name="reportFile"
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-medilink-primary file:px-4 file:py-2 file:text-white file:transition hover:file:bg-medilink-secondary"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-medilink-primary to-medilink-secondary px-6 py-3 text-sm font-semibold text-white shadow-medical transition hover:shadow-medical-lg disabled:opacity-60"
                        disabled={uploading}
                      >
                        {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        {uploading ? 'Uploading...' : 'Upload Report'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Reports list */}
                <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-medical">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-medilink-primary">Uploaded reports</p>
                      <h2 className="mt-2 text-2xl font-bold text-medilink-dark">Your records</h2>
                    </div>
                    <p className="text-sm text-gray-500">{medicalReports.length} total</p>
                  </div>

                  <div className="mt-6 space-y-4">
                    {medicalReports.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-gray-200 bg-slate-50 p-6 text-center text-sm text-gray-500">
                        No medical reports uploaded yet. Use the form above to add your first record.
                      </div>
                    ) : (
                      medicalReports.map((report) => {
                        const url = getReportUrl(report)
                        return (
                          <div key={report.recordId} className="rounded-3xl border border-gray-100 p-5 shadow-sm transition hover:border-medilink-primary/30">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-medilink-dark">{report.title}</p>
                                <p className="mt-1 text-sm text-gray-500">{report.fileType || 'Unknown type'} • {formatDate(report.uploadDate)}</p>
                                {!url && <p className="mt-2 text-xs text-orange-600">⚠ File URL missing – please re-upload this report.</p>}
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                {url && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => openReport(report)}
                                      className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                                    >
                                      View
                                      <ArrowUpRight className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => downloadReport(report)}
                                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                    >
                                      Download
                                      <Download className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                                <button
                                  type="button"
                                  onClick={() => deleteReport(report.recordId, report.title)}
                                  className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                                >
                                  Delete
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MedicalReportsPage