import { useState } from 'react'
import { useSelector } from 'react-redux'
import { X, Send, FileText, Phone, Calendar } from 'lucide-react'
import { validateRequired } from '../utils/validation'

const MIN_COVER = 40
const MAX_COVER = 5000

function validatePhone(phone) {
  const p = String(phone || '').replace(/\s/g, '')
  if (!p) return 'Phone number is required'
  if (!/^[6-9]\d{9}$/.test(p)) return 'Enter a valid 10-digit Indian mobile number'
  return ''
}

function validateYear(y) {
  if (y === '' || y == null) return 'Graduation year is required'
  const n = typeof y === 'number' ? y : parseInt(String(y), 10)
  if (!Number.isFinite(n) || n < 2024 || n > 2035) return 'Select a graduation year between 2024 and 2035'
  return ''
}

/**
 * Application form: cover letter, contact phone, expected graduation year.
 * Matches backend validation in apply-job.controller.js
 */
export default function ApplyFormModal({ job, onClose, onSubmit, isSubmitting, apiErrors = {}, clearApiErrors }) {
  const [coverLetter, setCoverLetter] = useState('')
  const [phone, setPhone] = useState('')
  const [expectedGraduationYear, setExpectedGraduationYear] = useState('')
  const [coverError, setCoverError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [yearError, setYearError] = useState('')
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  if (!job) return null

  const title = job?.jobTitle || job?.title || 'Job'
  const companyName =
    typeof job?.company === 'object' && job?.company?.companyName
      ? job.company.companyName
      : job?.companyName || 'Company'

  const yearOptions = []
  for (let y = 2024; y <= 2035; y++) yearOptions.push(y)

  const handleSubmit = (e) => {
    e.preventDefault()
    const c1 = validateRequired(coverLetter, 'Cover letter')
    let cErr = c1
    if (!cErr && coverLetter.trim().length < MIN_COVER) {
      cErr = `Cover letter must be at least ${MIN_COVER} characters`
    }
    if (!cErr && coverLetter.trim().length > MAX_COVER) {
      cErr = `Cover letter must be at most ${MAX_COVER} characters`
    }
    const pErr = validatePhone(phone)
    const yErr = validateYear(expectedGraduationYear)

    setCoverError(cErr || '')
    setPhoneError(pErr || '')
    setYearError(yErr || '')
    if (cErr || pErr || yErr) return

    onSubmit({
      coverLetter: coverLetter.trim(),
      phone: String(phone).replace(/\s/g, ''),
      expectedGraduationYear:
        typeof expectedGraduationYear === 'number'
          ? expectedGraduationYear
          : parseInt(String(expectedGraduationYear), 10),
    })
  }

  const inputClass = (err) =>
    `w-full rounded-2xl border px-5 py-4 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 ${
      err
        ? 'border-red-500 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20 dark:bg-red-950/20'
        : isDark
          ? 'border-zinc-800 bg-zinc-950 focus:border-indigo-500 text-zinc-100'
          : 'border-zinc-200 bg-zinc-50 focus:border-indigo-600 text-zinc-900'
    }`

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md transition-opacity" aria-hidden />

      <div
        className={`relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2.5rem] border p-2 shadow-2xl transition-all ${
          isDark ? 'border-zinc-800 bg-zinc-900 shadow-zinc-950/50' : 'border-white bg-white shadow-zinc-200/50'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-block rounded-lg border border-indigo-600/20 bg-indigo-600/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Application Portal
              </div>
              <h2 className="text-2xl font-black tracking-tight">
                Apply for <span className="text-indigo-600 dark:text-indigo-400">{title}</span>
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{companyName}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`rounded-2xl p-2 transition-colors ${
                isDark ? 'text-zinc-500 hover:bg-zinc-800' : 'text-zinc-400 hover:bg-zinc-100'
              }`}
            >
              <X size={20} />
            </button>
          </div>

          <div
            className={`mb-6 flex gap-3 rounded-2xl border p-4 ${
              isDark ? 'border-zinc-800 bg-zinc-950/50' : 'border-zinc-100 bg-zinc-50'
            }`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600">
              <FileText size={16} />
            </div>
            <p className="text-[11px] font-medium leading-relaxed text-zinc-500">
              Your profile resume will be shared with the recruiter. Complete all fields below — this submission is
              subject to the job&apos;s deadline.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500">
                Cover letter *
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => {
                  setCoverLetter(e.target.value)
                  if (coverError) setCoverError('')
                  if (apiErrors.coverLetter) clearApiErrors?.()
                }}
                rows={5}
                className={inputClass(coverError)}
                placeholder="Why you fit this role, relevant skills, and availability (min. 40 characters)..."
              />
              <p className="mt-1 text-[10px] text-zinc-400">
                {coverLetter.trim().length}/{MAX_COVER} · minimum {MIN_COVER} characters
              </p>
              {coverError && <p className="mt-1.5 text-xs font-medium text-red-500">{coverError}</p>}
              {!coverError && apiErrors.coverLetter && (
                <p className="mt-1.5 text-xs font-medium text-red-500">{apiErrors.coverLetter}</p>
              )}
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500">
                <Phone size={12} /> Contact mobile *
              </label>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                  if (phoneError) setPhoneError('')
                  if (apiErrors.phone) clearApiErrors?.()
                }}
                className={inputClass(phoneError)}
                placeholder="10-digit number"
              />
              {phoneError && <p className="mt-1.5 text-xs font-medium text-red-500">{phoneError}</p>}
              {!phoneError && apiErrors.phone && <p className="mt-1.5 text-xs font-medium text-red-500">{apiErrors.phone}</p>}
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500">
                <Calendar size={12} /> Expected graduation year *
              </label>
              <select
                value={expectedGraduationYear}
                onChange={(e) => {
                  setExpectedGraduationYear(e.target.value)
                  if (yearError) setYearError('')
                  if (apiErrors.expectedGraduationYear) clearApiErrors?.()
                }}
                className={inputClass(yearError)}
              >
                <option value="">Select year</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              {yearError && <p className="mt-1.5 text-xs font-medium text-red-500">{yearError}</p>}
              {!yearError && apiErrors.expectedGraduationYear && (
                <p className="mt-1.5 text-xs font-medium text-red-500">{apiErrors.expectedGraduationYear}</p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest transition-all ${
                  isDark ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit application
                    <Send size={14} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
