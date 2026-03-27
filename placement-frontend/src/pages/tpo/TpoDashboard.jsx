import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchJobs, deleteJob, postJob, updateJob } from '../../features/jobs/jobSlice'
import JobCard from '../../components/JobCard'
import Loader from '../../components/Loader'
import { fetchCompanies } from '../../features/companies/companiesSlice'
import JobFormModal from '../../components/JobFormModal'
import { Plus, Edit3, TrendingUp, Users, Briefcase } from 'lucide-react'

function Card({ label, value, icon: Icon }) {
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  return (
    <div className={`rounded-[2rem] border p-6 shadow-2xl transition-all duration-300 hover:scale-[1.02] ${
      isDark 
        ? 'border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-zinc-950/50' 
        : 'border-white bg-white/80 backdrop-blur-xl shadow-zinc-200/50'
    }`}>
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600">
          <Icon size={24} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">
            {label}
          </p>
          <p className="text-3xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function TpoDashboard() {
  const dispatch = useDispatch()
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  const { jobs, status } = useSelector((s) => s.jobs)
  const { companies } = useSelector((s) => s.companies)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingJob, setEditingJob] = useState(null)

  useEffect(() => {
    dispatch(fetchJobs())
    dispatch(fetchCompanies())
  }, [dispatch])

  const totalApplicants = jobs?.reduce((acc, j) => acc + (j?.applicants?.length || 0), 0) ?? 0
  const isLoading = status === 'loading'

  async function handleDelete(job) {
    const id = job?._id || job?.id
    if (!id) return
    await dispatch(deleteJob(id))
  }

  async function handleAdd(form) {
    const payload = {
      ...form,
      salary: form.salary ? Number(form.salary) : undefined,
      applicationDeadline: form.applicationDeadline || undefined,
    }
    const res = await dispatch(postJob(payload))
    if (res.meta.requestStatus === 'fulfilled') {
      setShowAddModal(false)
      dispatch(fetchJobs())
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
      dispatch(fetchJobs())
    }
  }

  return (
    <div className="max-w-6xl space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="inline-block rounded-xl bg-indigo-600/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-600/20">
            Administration
          </div>
          <h1 className="text-4xl font-black tracking-tight">TPO Dashboard</h1>
          <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            Orchestrate placement opportunities and manage career listings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className={`group flex items-center gap-2 rounded-2xl px-6 py-3.5 text-xs font-bold uppercase tracking-widest transition-all active:scale-95 ${
            isDark 
              ? 'bg-zinc-50 text-zinc-950 hover:bg-white shadow-lg shadow-white/5' 
              : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-900/20'
          }`}
        >
          <Plus className="text-lg" />
          Create New Job
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card label="Live Vacancies" value={jobs?.length ?? 0} icon={Briefcase} />
        <Card label="Total Applicants" value={totalApplicants} icon={Users} />
        <Card label="Growth Index" value="+12%" icon={TrendingUp} />
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">
            Active Job Listings
          </h2>
          <div className="h-[1px] flex-1 bg-zinc-500/10"></div>
        </div>

        {isLoading && <Loader label="Refreshing placement data..." />}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {(jobs || []).map((job) => (
            <div key={job?._id || job?.id} className="group relative flex flex-col gap-3">
              <JobCard job={job} showDelete onDelete={handleDelete} />
              <button
                type="button"
                onClick={() => setEditingJob(job)}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all hover:border-indigo-600 hover:text-indigo-600 ${
                  isDark 
                    ? 'border-zinc-800 bg-zinc-900/30 text-zinc-400' 
                    : 'border-zinc-200 bg-white text-zinc-500 shadow-sm'
                }`}
              >
                <Edit3 /> Edit Job Details
              </button>
            </div>
          ))}
          
          {!jobs?.length && !isLoading && (
            <div className={`col-span-full flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed p-20 ${
              isDark ? 'border-zinc-800 text-zinc-600' : 'border-zinc-200 text-zinc-400'
            }`}>
              <Briefcase size={48} className="mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-sm">No jobs posted yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <JobFormModal
        key="tpo-add-job-modal"
        open={showAddModal}
        title="Post New Vacancy"
        initialValues={{
          company: '',
          jobTitle: '',
          jobDescription: '',
          eligibility: '',
          salary: '',
          howToApply: '',
          applicationDeadline: '',
        }}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAdd}
        isSubmitting={isLoading}
        companies={companies || []}
      />
      <JobFormModal
        key={editingJob?._id || editingJob?.id || 'tpo-edit-job-modal'}
        open={!!editingJob}
        title="Modify Listing"
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
        onSubmit={handleUpdate}
        isSubmitting={isLoading}
        companies={companies || []}
        lockCompanyOnEdit
      />
    </div>
  )
}