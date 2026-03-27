import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Edit3, Trash2, Briefcase, MapPin, DollarSign, Users, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import Loader from '../../components/Loader'
import {
  deleteCompanyJob,
  fetchCompanyJobs,
  postCompanyJob,
  updateCompanyJob,
} from '../../features/company/companySlice'
import { fetchCompanies } from '../../features/companies/companiesSlice'
import JobFormModal from '../../components/JobFormModal'
import { isApplicationDeadlinePassed } from '../../utils/jobDeadline'

export default function CompanyJobs() {
  const dispatch = useDispatch()
  const { jobs, status } = useSelector((s) => s.company)
  const { companies } = useSelector((s) => s.companies)
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'
  const { user } = useSelector((s) => s.auth)

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [jobFormErrors, setJobFormErrors] = useState({})
  const isLoading = status === 'loading'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const totalPages = Math.ceil((jobs?.length || 0) / itemsPerPage)

  const currentJobs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return jobs.slice(start, start + itemsPerPage)
  }, [jobs, currentPage])

  // Download functionality
  const handleDownload = () => {
    if (!jobs.length) return
    const headers = ['Title', 'Location', 'Salary', 'Applications', 'Status']
    const csvContent = [
      headers.join(','),
      ...jobs.map((j) => {
        const title = `"${j?.title || j?.jobTitle || 'Untitled'}"`
        const loc = `"${typeof j?.company === 'object' ? j?.company?.companyLocation : j?.location || j?.jobLocation || 'Remote'}"`
        const sal = `"${j?.salary != null ? `${j.salary} LPA` : j?.salaryPackage || 'TBD'}"`
        const apps = j?.applicationsCount ?? j?.applicants?.length ?? '0'
        const closed = j.applicationClosed === true || isApplicationDeadlinePassed(j.applicationDeadline)
        const status = closed ? 'Closed' : j?.status || 'Active'
        return [title, loc, sal, apps, status].join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'company_jobs.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    if (user?._id || user?.id) {
      dispatch(fetchCompanyJobs(user._id || user.id))
      dispatch(fetchCompanies())
    }
  }, [dispatch, user])

  const blankForm = useMemo(
    () => ({
      company: '',
      jobTitle: '',
      jobDescription: '',
      eligibility: '',
      salary: '',
      howToApply: '',
      applicationDeadline: '',
    }),
    [],
  )

  function onDelete(job) {
    const jobId = job?._id || job?.id
    if (!jobId) return
    if (window.confirm('Are you certain you want to remove this job posting? This action cannot be undone.')) {
      dispatch(deleteCompanyJob(jobId))
    }
  }

  async function onCreateJob(form) {
    const payload = {
      ...form,
      salary: form.salary ? Number(form.salary) : undefined,
      applicationDeadline: form.applicationDeadline || undefined,
    }
    const res = await dispatch(postCompanyJob(payload))
    if (res.meta.requestStatus === 'fulfilled') {
      setShowAddModal(false)
      setJobFormErrors({})
      dispatch(fetchCompanyJobs())
    } else {
      setJobFormErrors(res?.payload?.errors || {})
    }
  }

  async function onUpdateJob(form) {
    const id = editingJob?._id || editingJob?.id
    if (!id) return
    const payload = {
      jobId: id,
      ...form,
      salary: form.salary ? Number(form.salary) : undefined,
      applicationDeadline: form.applicationDeadline || undefined,
    }
    const res = await dispatch(updateCompanyJob(payload))
    if (res.meta.requestStatus === 'fulfilled') {
      setEditingJob(null)
      setJobFormErrors({})
      dispatch(fetchCompanyJobs())
    } else {
      setJobFormErrors(res?.payload?.errors || {})
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header & Main Action */}
      <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-600/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-600/20">
            <Briefcase /> Inventory
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase leading-none">My Job Postings</h1>
          <p className="mt-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
            Manage your recruitment pipeline and active openings.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!jobs.length || isLoading}
            className="flex items-center justify-center gap-2 rounded-2xl bg-zinc-100 px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-600 transition-all hover:bg-zinc-200 active:scale-95 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95"
          >
            <Plus size={18} />
            Post New Role
          </button>
        </div>
      </div>

      {isLoading && !jobs.length ? <Loader label="Syncing job database..." /> : null}

      {/* Modern Table Container */}
      <div className={`overflow-hidden rounded-[2.5rem] border transition-all ${
        isDark ? 'border-zinc-800 bg-zinc-900/40 shadow-2xl shadow-zinc-950/50' : 'border-zinc-100 bg-white shadow-2xl shadow-zinc-200/50'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'border-zinc-800 bg-zinc-950/30' : 'border-zinc-50 bg-zinc-50/50'}`}>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Position</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Compensation</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Volume</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {currentJobs.map((j) => {
                const closed =
                  j.applicationClosed === true || isApplicationDeadlinePassed(j.applicationDeadline)
                return (
                <tr key={j?._id || j?.id} className="group transition-colors hover:bg-indigo-600/[0.02]">
                  <td className="px-8 py-6">
                    <div className="min-w-0">
                      <p className="font-black tracking-tight text-sm uppercase truncate">
                        {j?.title || j?.jobTitle || 'Untitled Position'}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        <MapPin className="text-indigo-500" />
                        {typeof j?.company === 'object' ? j?.company?.companyLocation : j?.location || j?.jobLocation || 'Remote'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1.5 text-xs font-black text-zinc-700 dark:text-zinc-300">
                      <DollarSign className="text-emerald-500" />
                      {j?.salary != null ? `${j.salary} LPA` : j?.salaryPackage || 'TBD'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-black border ${
                        isDark ? 'border-zinc-700 bg-zinc-800 text-zinc-400' : 'border-zinc-200 bg-zinc-100 text-zinc-600'
                      }`}>
                        {j?.applicationsCount ?? j?.applicants?.length ?? '0'}
                      </div>
                      <span className="mt-1 text-[8px] font-black uppercase tracking-tighter text-zinc-400">Applicants</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`inline-block rounded-lg border px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
                        closed
                          ? isDark
                            ? 'border-zinc-600 bg-zinc-800 text-zinc-400'
                            : 'border-zinc-200 bg-zinc-100 text-zinc-500'
                          : isDark
                            ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400'
                            : 'border-indigo-100 bg-indigo-50 text-indigo-600'
                      }`}
                    >
                      {closed ? 'Applications closed' : j?.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingJob(j)}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                          isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(j)}
                        disabled={isLoading}
                        className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 transition-all hover:bg-red-600 hover:text-white disabled:opacity-30"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
                )
              })}
              {!jobs.length && !isLoading && (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="rounded-full bg-zinc-50 p-6 dark:bg-zinc-800/50">
                        <Briefcase className="text-4xl text-zinc-300" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        Your vacancy list is currently empty.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            Showing Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition-all hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition-all hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <JobFormModal
        key="company-add-job-modal"
        open={showAddModal}
        title="Post New Opening"
        initialValues={blankForm}
        onClose={() => setShowAddModal(false)}
        onSubmit={onCreateJob}
        isSubmitting={isLoading}
        companies={companies || []}
        apiErrors={jobFormErrors}
        clearApiErrors={() => setJobFormErrors({})}
      />
      <JobFormModal
        key={editingJob?._id || editingJob?.id || 'company-edit-job-modal'}
        open={!!editingJob}
        title="Edit Position Details"
        initialValues={{
          company: typeof editingJob?.company === 'object' ? editingJob?.company?._id : editingJob?.company || '',
          jobTitle: editingJob?.jobTitle || editingJob?.title || '',
          jobDescription: editingJob?.jobDescription || editingJob?.description || '',
          eligibility: editingJob?.eligibility || '',
          salary: editingJob?.salary != null ? String(editingJob.salary) : editingJob?.salaryPackage != null ? String(editingJob.salaryPackage) : '',
          howToApply: editingJob?.howToApply || '',
          applicationDeadline: editingJob?.applicationDeadline ? String(editingJob.applicationDeadline).slice(0, 10) : '',
        }}
        onClose={() => setEditingJob(null)}
        onSubmit={onUpdateJob}
        isSubmitting={isLoading}
        companies={companies || []}
        lockCompanyOnEdit
        apiErrors={jobFormErrors}
        clearApiErrors={() => setJobFormErrors({})}
      />
    </div>
  )
}