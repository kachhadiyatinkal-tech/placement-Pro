import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { X, Save } from 'lucide-react'
import { validateRequired, validateNumberRequired } from '../utils/validation'

export default function JobFormModal({
  open,
  title,
  initialValues,
  onClose,
  onSubmit,
  isSubmitting,
  companies = [],
  showCompanySelect = true,
  lockCompanyOnEdit = false,
  apiErrors = {},
  clearApiErrors,
}) {
  const [form, setForm] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  useEffect(() => {
    if (open) {
      setForm(initialValues || {})
      setErrors({})
    }
  }, [open, initialValues])

  if (!open) return null

  const field = (key) =>
    `mt-1.5 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all focus:ring-4 ${
      errors[key]
        ? 'border-red-500 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20 dark:bg-red-950/20'
        : isDark
          ? 'border-zinc-800 bg-zinc-950 focus:border-indigo-500 focus:ring-indigo-500/10 text-zinc-100'
          : 'border-zinc-200 bg-white focus:border-indigo-600 focus:ring-indigo-500/10 text-zinc-900'
    }`

  const labelClass = 'ml-1 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500'

  const handleChange = (fieldKey) => (e) => {
    const v = e.target.value
    setForm((prev) => ({ ...prev, [fieldKey]: v }))
    if (errors[fieldKey]) setErrors((prev) => ({ ...prev, [fieldKey]: '' }))
    if (apiErrors[fieldKey]) clearApiErrors?.()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const nextErrors = {
      jobTitle: validateRequired(form.jobTitle, 'Job title'),
      jobDescription: validateRequired(form.jobDescription, 'Job description'),
      eligibility: validateRequired(form.eligibility, 'Eligibility'),
      company: showCompanySelect ? validateRequired(form.company, 'Company') : '',
      salary: validateNumberRequired(form.salary, 'Salary (LPA)', 0, 9999),
      applicationDeadline: validateRequired(form.applicationDeadline, 'Application deadline'),
      howToApply: validateRequired(form.howToApply, 'How to apply'),
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md transition-opacity duration-300" aria-hidden />

      <div
        className={`relative w-full max-w-2xl rounded-[2.5rem] border p-2 shadow-2xl transition-all duration-300 ease-out motion-safe:animate-[modal-pop_0.35s_ease-out] ${
          isDark ? 'border-zinc-800 bg-zinc-900' : 'border-white bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-8 flex items-center justify-between px-2">
            <div>
              <div className="mb-2 inline-block rounded-lg border border-indigo-600/20 bg-indigo-600/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Job management
              </div>
              <h2 className="text-2xl font-black tracking-tight">{title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`rounded-2xl p-2 transition-colors ${isDark ? 'text-zinc-500 hover:bg-zinc-800' : 'text-zinc-400 hover:bg-zinc-100'}`}
            >
              <X size={20} />
            </button>
          </div>

          <div className="custom-scrollbar max-h-[60vh] space-y-5 overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {showCompanySelect ? (
                <div>
                  <label className={labelClass}>Company *</label>
                  <select
                    value={form.company || ''}
                    onChange={handleChange('company')}
                    disabled={lockCompanyOnEdit}
                    className={`${field('company')} ${lockCompanyOnEdit ? 'cursor-not-allowed opacity-70' : ''}`}
                  >
                    <option value="">Select company</option>
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                  {(errors.company || apiErrors.company) && <p className="mt-1.5 ml-1 text-xs font-medium text-red-500">{errors.company || apiErrors.company}</p>}
                </div>
              ) : null}

              <div>
                <label className={labelClass}>Job title *</label>
                <input
                  value={form.jobTitle || ''}
                  onChange={handleChange('jobTitle')}
                  className={field('jobTitle')}
                  placeholder="e.g. Graduate engineer trainee"
                />
                {(errors.jobTitle || apiErrors.jobTitle) && <p className="mt-1.5 ml-1 text-xs font-medium text-red-500">{errors.jobTitle || apiErrors.jobTitle}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Salary (LPA) *</label>
                <input
                  value={form.salary || ''}
                  onChange={handleChange('salary')}
                  type="number"
                  min="0"
                  step="0.5"
                  className={field('salary')}
                  placeholder="e.g. 12.5"
                />
                {(errors.salary || apiErrors.salary) && <p className="mt-1.5 ml-1 text-xs font-medium text-red-500">{errors.salary || apiErrors.salary}</p>}
              </div>

              <div>
                <label className={labelClass}>Deadline *</label>
                <input
                  value={form.applicationDeadline || ''}
                  onChange={handleChange('applicationDeadline')}
                  type="date"
                  className={field('applicationDeadline')}
                  title="Pick the last date students can apply"
                />
                {(errors.applicationDeadline || apiErrors.applicationDeadline) && (
                  <p className="mt-1.5 ml-1 text-xs font-medium text-red-500">{errors.applicationDeadline || apiErrors.applicationDeadline}</p>
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>Job description *</label>
              <textarea
                value={form.jobDescription || ''}
                onChange={handleChange('jobDescription')}
                rows={4}
                className={`${field('jobDescription')} resize-none`}
                placeholder="Role summary, responsibilities, tech stack…"
              />
              {(errors.jobDescription || apiErrors.jobDescription) && (
                <p className="mt-1.5 ml-1 text-xs font-medium text-red-500">{errors.jobDescription || apiErrors.jobDescription}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Eligibility *</label>
              <input
                value={form.eligibility || ''}
                onChange={handleChange('eligibility')}
                className={field('eligibility')}
                placeholder="e.g. B.Tech CSE, CGPA 7+"
              />
              {(errors.eligibility || apiErrors.eligibility) && <p className="mt-1.5 ml-1 text-xs font-medium text-red-500">{errors.eligibility || apiErrors.eligibility}</p>}
            </div>

            <div>
              <label className={labelClass}>How to apply *</label>
              <textarea
                value={form.howToApply || ''}
                onChange={handleChange('howToApply')}
                rows={3}
                className={`${field('howToApply')} resize-none`}
                placeholder="Steps, links, or documents required"
              />
              {(errors.howToApply || apiErrors.howToApply) && <p className="mt-1.5 ml-1 text-xs font-medium text-red-500">{errors.howToApply || apiErrors.howToApply}</p>}
            </div>
          </div>

          <div className="mt-10 flex gap-4 px-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 rounded-2xl py-4 text-xs font-black uppercase tracking-widest transition-all ${
                isDark ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex-1 overflow-hidden rounded-2xl bg-indigo-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2 transition-all duration-300 ease-out group-hover:gap-5">
                {isSubmitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Save className="text-sm transition-transform duration-300 ease-out group-hover:-translate-x-1 group-hover:scale-110" />
                )}
                <span className="transition-transform duration-300 ease-out group-hover:translate-x-1">Save posting</span>
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
