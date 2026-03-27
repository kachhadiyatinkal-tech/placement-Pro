import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { PenLine, Plus, Trash, Briefcase, Clock, DollarSign, Activity, FileText } from 'lucide-react'
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
      {/* Header Section */}
      <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-600/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-600/20">
            <Activity size={12} /> Pipeline Control
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase leading-none">Job <span className="text-brand-500">Archives</span></h1>
          <p className="mt-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
            Lifecycle management for campus recruitment opportunities.
          </p>
        </div>
        
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95"
        >
          <Plus size={18} />
          Post New Role
        </button>
      </div>

      {/* Main Table Card */}
      <div className={`overflow-hidden rounded-[2.5rem] border transition-all ${
        isDark ? 'border-zinc-800 bg-zinc-900/40 shadow-2xl shadow-zinc-950/50' : 'border-zinc-100 bg-white shadow-2xl shadow-zinc-200/50'
      }`}>
        <div className="border-b border-zinc-100 px-8 py-5 dark:border-zinc-800/50">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Database Status: <span className="text-emerald-500">{jobs.length} Active Records</span></p>
        </div>
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
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDark ? 'border-zinc-800 bg-zinc-950/30' : 'border-zinc-50 bg-zinc-50/50'}`}>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Role Identity</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Principal Entity</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Valuation</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Deadline</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {paginatedJobs.map((job) => {
                  const closed = job.applicationClosed === true || isApplicationDeadlinePassed(job.applicationDeadline)
                  return (
                    <tr key={job._id} className="group transition-colors hover:bg-indigo-600/[0.02]">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className={`text-sm font-black uppercase tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{job.jobTitle}</span>
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Ref ID: {job._id.slice(-8)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-zinc-500">{job.company?.companyName || '—'}</p>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-zinc-400">
                          <DollarSign size={12} className="opacity-40" />
                          <span className="text-[10px] font-black tracking-tight">{job.salary != null ? job.salary.toLocaleString() : 'Negotiable'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-zinc-400">
                          <Clock size={12} className="opacity-40" />
                          <span className="text-[10px] font-bold tracking-tight">{formatDate(job.applicationDeadline)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`inline-block px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                          closed
                            ? (isDark ? 'border-zinc-700 text-zinc-400 bg-zinc-800' : 'border-zinc-200 text-zinc-500 bg-zinc-50')
                            : (isDark ? 'border-emerald-400/20 text-emerald-400 bg-emerald-400/10' : 'border-emerald-100 text-emerald-700 bg-emerald-50')
                        }`}>
                          {closed ? 'Expired' : 'Live'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-1 px-2">
                          <IconButton icon={PenLine} onClick={() => openEdit(job)} variant="indigo" size={16} />
                          <IconButton icon={Trash} onClick={() => { setDeleteTarget(job); setDeleteText(''); setDeleteErr(''); }} variant="red" size={16} />
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
