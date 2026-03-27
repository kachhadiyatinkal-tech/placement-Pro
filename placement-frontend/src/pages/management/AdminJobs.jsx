import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Edit2, Plus, Trash2, Briefcase } from 'lucide-react'
import IconButton from '../../components/common/IconButton'
import Pagination from '../../components/common/Pagination'
import { deleteJob, fetchJobs, postJob } from '../../features/jobs/jobSlice'
import { fetchCompanies } from '../../features/companies/companiesSlice'
import JobFormModal from '../../components/JobFormModal'
import { isApplicationDeadlinePassed } from '../../utils/jobDeadline'

const EMPTY_FORM = {
  company: '',
  jobTitle: '',
  jobDescription: '',
  eligibility: '',
  salary: '',
  howToApply: '',
  applicationDeadline: '',
  _id: undefined,
}

function jobToForm(job) {
  const cid = job.company?._id || job.company
  let deadline = ''
  if (job.applicationDeadline) {
    const d = new Date(job.applicationDeadline)
    if (!Number.isNaN(d.getTime())) deadline = d.toISOString().slice(0, 10)
  }
  return {
    company: cid ? String(cid) : '',
    jobTitle: job.jobTitle || '',
    jobDescription: job.jobDescription || '',
    eligibility: job.eligibility || '',
    salary: job.salary != null ? String(job.salary) : '',
    howToApply: job.howToApply || '',
    applicationDeadline: deadline,
    _id: job._id,
  }
}

function formatDate(v) {
  if (!v) return '—'
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString()
}

export default function AdminJobs() {
  const dispatch = useDispatch()
  const mode = useSelector((s) => s.theme.mode)
  const jobs = useSelector((s) => s.jobs.jobs)
  const status = useSelector((s) => s.jobs.status)
  const companies = useSelector((s) => s.companies.companies)
  const isDark = mode === 'dark'

  const [modalOpen, setModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteText, setDeleteText] = useState('')
  const [deleteErr, setDeleteErr] = useState('')
  const [jobFormErrors, setJobFormErrors] = useState({})

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const initialValues = useMemo(() => {
    if (!editingJob) return EMPTY_FORM
    return jobToForm(editingJob)
  }, [editingJob])

  useEffect(() => {
    dispatch(fetchJobs())
    dispatch(fetchCompanies())
  }, [dispatch])

  const openCreate = useCallback(() => {
    setEditingJob(null)
    setModalOpen(true)
  }, [])

  const openEdit = useCallback((job) => {
    setEditingJob(job)
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setEditingJob(null)
  }, [])

  const handleSubmitForm = async (form) => {
    setSubmitting(true)
    try {
      const payload = {
        company: form.company,
        jobTitle: form.jobTitle.trim(),
        jobDescription: form.jobDescription.trim(),
        eligibility: form.eligibility.trim(),
        salary: form.salary !== '' && form.salary != null ? Number(form.salary) : undefined,
        howToApply: form.howToApply?.trim() || undefined,
        applicationDeadline: form.applicationDeadline || undefined,
      }
      if (form._id) payload._id = form._id

      const res = await dispatch(postJob(payload))
      if (res.meta.requestStatus === 'fulfilled') {
        setJobFormErrors({})
        closeModal()
      } else {
        setJobFormErrors(res?.payload?.errors || {})
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    if (deleteText.trim().toUpperCase() !== 'DELETE') {
      setDeleteErr('Type DELETE to confirm')
      return
    }
    const res = await dispatch(deleteJob(deleteTarget._id))
    if (res.meta.requestStatus === 'fulfilled') {
      setDeleteTarget(null)
      setDeleteText('')
      setDeleteErr('')
    }
  }

  const loading = status === 'loading' && !jobs?.length
  const card = isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-white/90 shadow-xl shadow-zinc-200/30'

  // Pagination Logic
  const totalPages = Math.ceil(jobs.length / itemsPerPage)
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return jobs.slice(start, start + itemsPerPage)
  }, [jobs, currentPage])

  // Reset page when jobs length changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages)
  }, [jobs.length, totalPages])

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex rounded-xl border border-indigo-500/25 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Administration
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Jobs</h1>
          <p className={`mt-2 max-w-xl text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Post, edit, or remove listings. Uses the same pipeline as TPO postings.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:gap-3 active:scale-[0.98] ${
            isDark ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          <Plus className="text-lg" />
          Post job
        </button>
      </div>

      <div className={`overflow-hidden rounded-[1.75rem] border ${card}`}>
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : !jobs?.length ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <Briefcase className="text-4xl text-zinc-400" />
            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>No jobs yet.</p>
            <button type="button" onClick={openCreate} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              Create one
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${isDark ? 'border-zinc-800 text-zinc-500' : 'border-zinc-200 text-zinc-500'}`}>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Salary</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedJobs.map((job) => {
                  const closed =
                    job.applicationClosed === true || isApplicationDeadlinePassed(job.applicationDeadline)
                  return (
                  <tr
                    key={job._id}
                    className={`border-b last:border-0 ${isDark ? 'border-zinc-800 hover:bg-zinc-800/40' : 'border-zinc-100 hover:bg-zinc-50'}`}
                  >
                    <td className="px-6 py-4 font-semibold">{job.jobTitle}</td>
                    <td className={`px-6 py-4 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{job.company?.companyName || '—'}</td>
                    <td className="px-6 py-4">{job.salary != null ? job.salary : '—'}</td>
                    <td className={`px-6 py-4 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{formatDate(job.applicationDeadline)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          closed
                            ? isDark
                              ? 'border-zinc-600 bg-zinc-800 text-zinc-400'
                              : 'border-zinc-200 bg-zinc-100 text-zinc-500'
                            : isDark
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {closed ? 'Closed' : 'Open'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <IconButton 
                          icon={Edit2} 
                          onClick={() => openEdit(job)} 
                          title="Edit Job"
                          variant="indigo"
                        />
                        <IconButton 
                          icon={Trash2} 
                          onClick={() => {
                            setDeleteTarget(job)
                            setDeleteText('')
                            setDeleteErr('')
                          }} 
                          title="Delete Job"
                          variant="red"
                        />
                      </div>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={jobs.length}
        itemsPerPage={itemsPerPage}
      />

      <JobFormModal
        open={modalOpen}
        title={editingJob ? 'Update job' : 'Post new job'}
        initialValues={initialValues}
        onClose={closeModal}
        onSubmit={handleSubmitForm}
        isSubmitting={submitting}
        companies={companies || []}
        showCompanySelect
        lockCompanyOnEdit={!!editingJob}
        apiErrors={jobFormErrors}
        clearApiErrors={() => setJobFormErrors({})}
      />

      {deleteTarget &&
        createPortal(
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <button type="button" className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-label="Close" onClick={() => setDeleteTarget(null)} />
            <div className={`relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-2xl ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
              <h3 className="text-lg font-bold">Delete job?</h3>
              <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Remove <span className="font-semibold text-zinc-900 dark:text-zinc-100">{deleteTarget.jobTitle}</span> permanently.
              </p>
              <p className="mt-2 text-xs text-red-500">Type DELETE to confirm.</p>
              <input
                value={deleteText}
                onChange={(e) => {
                  setDeleteText(e.target.value)
                  setDeleteErr('')
                }}
                className={`mt-3 w-full rounded-2xl border px-4 py-3 text-sm outline-none ${
                  deleteErr ? 'border-red-500 bg-red-500/5' : isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-zinc-50'
                }`}
                placeholder="DELETE"
              />
              {deleteErr ? <p className="mt-1.5 text-xs font-medium text-red-500">{deleteErr}</p> : null}
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold opacity-80 hover:opacity-100">
                  Cancel
                </button>
                <button type="button" onClick={confirmDelete} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700">
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
