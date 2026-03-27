import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchJobs, postJob, deleteJob, updateJob } from '../../features/jobs/jobSlice'
import { fetchCompanies } from '../../features/companies/companiesSlice'
import JobFormModal from '../../components/JobFormModal'
import Loader from '../../components/Loader'
import { Plus, Search, Download, Eye, Edit3, Trash2, ChevronLeft, ChevronRight, X, Briefcase } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const PAGE_SIZE_OPTIONS = [5, 10, 20]

// ─── View Modal ───────────────────────────────────────────────────────────────
function ViewJobModal({ job, onClose, isDark }) {
  if (!job) return null
  const title = job?.jobTitle || job?.title || '—'
  const company =
    typeof job?.company === 'object'
      ? job.company?.companyName
      : job?.companyName || job?.company || '—'
  const rows = [
    ['Job Title', title],
    ['Company', company],
    ['Salary (LPA)', job?.salary ?? '—'],
    ['Eligibility', job?.eligibility || '—'],
    ['Deadline', job?.applicationDeadline ? String(job.applicationDeadline).slice(0, 10) : '—'],
    ['How to Apply', job?.howToApply || '—'],
    ['Posted At', job?.postedAt ? new Date(job.postedAt).toLocaleDateString() : '—'],
    ['Applicants', job?.applicants?.length ?? 0],
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md" aria-hidden />
      <div
        className={`relative w-full max-w-lg rounded-[2.5rem] border p-8 shadow-2xl ${
          isDark ? 'border-zinc-800 bg-zinc-900' : 'border-white bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <span className="mb-2 inline-block rounded-lg border border-indigo-600/20 bg-indigo-600/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Job Details
            </span>
            <h2 className="text-2xl font-black tracking-tight">{title}</h2>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-500">{company}</p>
          </div>
          <button
            onClick={onClose}
            className={`rounded-2xl p-2 transition-colors ${isDark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Description */}
        {job?.jobDescription && (
          <div className={`mb-4 rounded-2xl p-4 text-sm leading-relaxed ${isDark ? 'bg-zinc-800/60 text-zinc-300' : 'bg-zinc-50 text-zinc-700'}`}>
            {job.jobDescription}
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-3">
          {rows.slice(2).map(([label, val]) => (
            <div key={label} className={`flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-2.5 ${isDark ? 'bg-zinc-800/40' : 'bg-zinc-50'}`}>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
              <span className={`text-sm font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteConfirmModal({ job, onClose, onConfirm, isLoading, isDark }) {
  if (!job) return null
  const title = job?.jobTitle || job?.title || 'this job'
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md" aria-hidden />
      <div
        className={`relative w-full max-w-sm rounded-[2.5rem] border p-8 shadow-2xl ${
          isDark ? 'border-zinc-800 bg-zinc-900' : 'border-white bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
          <Trash2 size={24} />
        </div>
        <h2 className="text-xl font-black tracking-tight">Delete Job Listing?</h2>
        <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          This will permanently remove <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>"{title}"</strong>. This cannot be undone.
        </p>
        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 rounded-2xl py-3.5 text-xs font-black uppercase tracking-widest transition-all ${
              isDark ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-2xl bg-red-600 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PostJob() {
  const dispatch = useDispatch()
  const { jobs, status } = useSelector((s) => s.jobs)
  const { companies } = useSelector((s) => s.companies)
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'
  const isLoading = status === 'loading'

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [viewingJob, setViewingJob] = useState(null)
  const [deletingJob, setDeletingJob] = useState(null)
  const [jobFormErrors, setJobFormErrors] = useState({})

  // Table controls
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    dispatch(fetchJobs())
    dispatch(fetchCompanies())
  }, [dispatch])

  // Reset to page 1 when search changes
  useEffect(() => { setPage(1) }, [search])

  // ─── Derived data ──────────────────────────────────────────────────────────
  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return jobs || []
    return (jobs || []).filter((j) => {
      const title = (j?.jobTitle || j?.title || '').toLowerCase()
      const company =
        typeof j?.company === 'object'
          ? (j.company?.companyName || '').toLowerCase()
          : (j?.company || '').toLowerCase()
      const eligibility = (j?.eligibility || '').toLowerCase()
      return title.includes(q) || company.includes(q) || eligibility.includes(q)
    })
  }, [jobs, search])

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize))
  const pagedJobs = filteredJobs.slice((page - 1) * pageSize, page * pageSize)

  // ─── Helpers ───────────────────────────────────────────────────────────────
  function getCompanyName(job) {
    if (typeof job?.company === 'object') return job.company?.companyName || '—'
    return job?.companyName || job?.company || '—'
  }

  function fmtDate(val) {
    if (!val) return '—'
    const d = new Date(val)
    return isNaN(d) ? String(val).slice(0, 10) : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // ─── CRUD handlers ─────────────────────────────────────────────────────────
  async function handleAdd(form) {
    const payload = {
      ...form,
      salary: form.salary ? Number(form.salary) : undefined,
      applicationDeadline: form.applicationDeadline || undefined,
    }
    const res = await dispatch(postJob(payload))
    if (res.meta.requestStatus === 'fulfilled') {
      setShowAddModal(false)
      setJobFormErrors({})
      dispatch(fetchJobs())
    } else {
      setJobFormErrors(res?.payload?.errors || {})
    }
  }

  async function handleUpdate(form) {
    const id = editingJob?._id || editingJob?.id
    if (!id) return
    const payload = {
      jobId: id,
      ...form,
      salary: form.salary ? Number(form.salary) : undefined,
      applicationDeadline: form.applicationDeadline || undefined,
    }
    const res = await dispatch(updateJob(payload))
    if (res.meta.requestStatus === 'fulfilled') {
      setEditingJob(null)
      setJobFormErrors({})
      dispatch(fetchJobs())
    } else {
      setJobFormErrors(res?.payload?.errors || {})
    }
  }

  async function handleDelete() {
    const id = deletingJob?._id || deletingJob?.id
    if (!id) return
    const res = await dispatch(deleteJob(id))
    if (res.meta.requestStatus === 'fulfilled') setDeletingJob(null)
  }

  // ─── PDF Export ────────────────────────────────────────────────────────────
  function handleDownloadPDF() {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()

    // Header strip
    doc.setFillColor(79, 70, 229) // indigo-600
    doc.rect(0, 0, pageWidth, 50, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('Job Listings Report', 40, 33)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageWidth - 40, 33, { align: 'right' })

    // Sub-header: count
    doc.setTextColor(80, 80, 80)
    doc.setFontSize(9)
    doc.text(`Total records: ${filteredJobs.length}${search ? `  |  Filtered by: "${search}"` : ''}`, 40, 65)

    const rows = filteredJobs.map((j, i) => [
      i + 1,
      j?.jobTitle || j?.title || '—',
      getCompanyName(j),
      j?.salary != null ? `${j.salary} LPA` : '—',
      j?.eligibility || '—',
      fmtDate(j?.applicationDeadline),
      j?.applicants?.length ?? 0,
      fmtDate(j?.postedAt),
    ])

    autoTable(doc, {
      startY: 80,
      head: [['#', 'Job Title', 'Company', 'Salary', 'Eligibility', 'Deadline', 'Applicants', 'Posted On']],
      body: rows,
      styles: { fontSize: 8, cellPadding: 6, lineColor: [230, 230, 230], lineWidth: 0.5 },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: { fillColor: [248, 248, 255] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 25 },
        3: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' },
        7: { halign: 'center' },
      },
      margin: { left: 40, right: 40 },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages()
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 15,
          { align: 'center' },
        )
      },
    })

    doc.save(`job-listings-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  // ─── Styles ────────────────────────────────────────────────────────────────
  const card = `rounded-[2.5rem] border shadow-2xl transition-all ${
    isDark ? 'border-zinc-800 bg-zinc-900/50 backdrop-blur-xl' : 'border-white bg-white/80 backdrop-blur-xl shadow-zinc-200/50'
  }`

  const th = `px-4 py-3.5 text-left text-[9px] font-black uppercase tracking-[0.18em] whitespace-nowrap ${
    isDark ? 'text-zinc-400' : 'text-zinc-500'
  }`

  const td = `px-4 py-3.5 text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`

  const actionBtn = (color) =>
    `flex items-center justify-center rounded-xl p-2 transition-all hover:scale-110 ${
      color === 'indigo'
        ? isDark ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
        : color === 'amber'
        ? isDark ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white' : 'bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white'
        : isDark ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
    }`

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl space-y-8 pb-20">
      {/* ── Page Header ── */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="inline-block rounded-xl bg-indigo-600/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-600/20">
            Recruitment
          </div>
          <h1 className="text-4xl font-black tracking-tight">Post a Job</h1>
          <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Manage all job listings — create, edit, or remove vacancies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={!filteredJobs.length}
            className={`flex items-center gap-2 rounded-2xl border px-5 py-3 text-xs font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-40 ${
              isDark
                ? 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-indigo-500 hover:text-indigo-400'
                : 'border-zinc-200 bg-white text-zinc-600 hover:border-indigo-600 hover:text-indigo-600 shadow-sm'
            }`}
          >
            <Download size={14} />
            Export PDF
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all active:scale-95 ${
              isDark
                ? 'bg-zinc-50 text-zinc-950 hover:bg-white shadow-lg shadow-white/5'
                : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-900/20'
            }`}
          >
            <Plus size={14} />
            Add Job
          </button>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className={card}>
        {/* Toolbar */}
        <div className={`flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between ${
          isDark ? 'border-zinc-800' : 'border-zinc-100'
        }`}>
          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, company, eligibility…"
              className={`w-full rounded-2xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 ${
                isDark
                  ? 'border-zinc-800 bg-zinc-950 text-zinc-100 focus:border-indigo-500'
                  : 'border-zinc-200 bg-zinc-50 text-zinc-900 focus:border-indigo-600'
              }`}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Count + page size */}
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {filteredJobs.length} {filteredJobs.length === 1 ? 'record' : 'records'}
            </span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
              className={`rounded-xl border px-3 py-1.5 text-xs font-bold outline-none transition-all ${
                isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-300' : 'border-zinc-200 bg-white text-zinc-600'
              }`}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>Show {n}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="py-16"><Loader label="Loading job listings…" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className={isDark ? 'border-b border-zinc-800' : 'border-b border-zinc-100'}>
                  <th className={`${th} w-10 text-center`}>#</th>
                  <th className={th}>Job Title</th>
                  <th className={th}>Company</th>
                  <th className={th}>Salary (LPA)</th>
                  <th className={th}>Eligibility</th>
                  <th className={th}>Deadline</th>
                  <th className={`${th} text-center`}>Applicants</th>
                  <th className={`${th} text-center`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedJobs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Briefcase size={40} className={isDark ? 'text-zinc-700' : 'text-zinc-300'} />
                        <p className={`text-sm font-bold uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                          {search ? 'No results match your search.' : 'No jobs posted yet.'}
                        </p>
                        {!search && (
                          <button
                            onClick={() => setShowAddModal(true)}
                            className="mt-1 flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                          >
                            <Plus size={12} /> Add First Job
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  pagedJobs.map((job, idx) => {
                    const globalIdx = (page - 1) * pageSize + idx + 1
                    return (
                      <tr
                        key={job?._id || job?.id || idx}
                        className={`border-b transition-colors ${
                          isDark
                            ? 'border-zinc-800/60 hover:bg-zinc-800/40'
                            : 'border-zinc-50 hover:bg-indigo-50/40'
                        }`}
                      >
                        <td className={`${td} text-center font-bold text-zinc-400`}>{globalIdx}</td>
                        <td className={td}>
                          <span className={`font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>
                            {job?.jobTitle || job?.title || '—'}
                          </span>
                        </td>
                        <td className={td}>{getCompanyName(job)}</td>
                        <td className={td}>
                          {job?.salary != null
                            ? <span className="font-semibold text-emerald-500">{job.salary} LPA</span>
                            : <span className="italic text-zinc-400 text-xs">Undisclosed</span>}
                        </td>
                        <td className={`${td} max-w-[180px] truncate`} title={job?.eligibility}>
                          {job?.eligibility || '—'}
                        </td>
                        <td className={td}>{fmtDate(job?.applicationDeadline)}</td>
                        <td className={`${td} text-center`}>
                          <span className={`inline-flex h-7 min-w-[28px] items-center justify-center rounded-xl px-2 text-xs font-black ${
                            isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'
                          }`}>
                            {job?.applicants?.length ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              title="View"
                              onClick={() => setViewingJob(job)}
                              className={actionBtn('indigo')}
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              title="Edit"
                              onClick={() => setEditingJob(job)}
                              className={actionBtn('amber')}
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              title="Delete"
                              onClick={() => setDeletingJob(job)}
                              className={actionBtn('red')}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {filteredJobs.length > 0 && (
          <div className={`flex flex-wrap items-center justify-between gap-4 border-t px-6 py-4 ${
            isDark ? 'border-zinc-800' : 'border-zinc-100'
          }`}>
            <p className={`text-xs font-bold ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Showing {Math.min((page - 1) * pageSize + 1, filteredJobs.length)}–{Math.min(page * pageSize, filteredJobs.length)} of {filteredJobs.length}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all disabled:opacity-30 ${
                  isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800' : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50'
                }`}
              >
                <ChevronLeft size={15} />
              </button>

              {/* Page number pills */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push('…')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) =>
                  p === '…' ? (
                    <span key={`ellipsis-${i}`} className={`px-1 text-xs ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black transition-all ${
                        page === p
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                          : isDark
                          ? 'border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                          : 'border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50'
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all disabled:opacity-30 ${
                  isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800' : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50'
                }`}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <ViewJobModal job={viewingJob} onClose={() => setViewingJob(null)} isDark={isDark} />

      <DeleteConfirmModal
        job={deletingJob}
        onClose={() => setDeletingJob(null)}
        onConfirm={handleDelete}
        isLoading={isLoading}
        isDark={isDark}
      />

      {/* Add Modal */}
      <JobFormModal
        key="postjob-add-modal"
        open={showAddModal}
        title="Post New Vacancy"
        initialValues={{ company: '', jobTitle: '', jobDescription: '', eligibility: '', salary: '', howToApply: '', applicationDeadline: '' }}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        isSubmitting={isLoading}
        companies={companies || []}
        apiErrors={jobFormErrors}
        clearApiErrors={() => setJobFormErrors({})}
      />

      {/* Edit Modal */}
      <JobFormModal
        key={editingJob?._id || editingJob?.id || 'postjob-edit-modal'}
        open={!!editingJob}
        title="Edit Job Listing"
        initialValues={{
          company: typeof editingJob?.company === 'object' ? editingJob?.company?._id : editingJob?.company || '',
          jobTitle: editingJob?.jobTitle || editingJob?.title || '',
          jobDescription: editingJob?.jobDescription || editingJob?.description || '',
          eligibility: editingJob?.eligibility || '',
          salary: editingJob?.salary != null ? String(editingJob.salary) : '',
          howToApply: editingJob?.howToApply || '',
          applicationDeadline: editingJob?.applicationDeadline ? String(editingJob.applicationDeadline).slice(0, 10) : '',
        }}
        onClose={() => setEditingJob(null)}
        onSubmit={handleUpdate}
        isSubmitting={isLoading}
        companies={companies || []}
        lockCompanyOnEdit
        apiErrors={jobFormErrors}
        clearApiErrors={() => setJobFormErrors({})}
      />
    </div>
  )
}
