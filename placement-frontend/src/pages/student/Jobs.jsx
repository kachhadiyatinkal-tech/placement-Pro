import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import JobCard from '../../components/JobCard'
import Loader from '../../components/Loader'
import JobDetailModal from '../../components/JobDetailModal'
import ApplyFormModal from '../../components/ApplyFormModal'
import { fetchJobs } from '../../features/jobs/jobSlice'
import { applyJob as submitApplication, fetchStudentApplications } from '../../features/applications/applicationSlice'
import { Search, Zap, Target } from 'lucide-react'
import { isJobAcceptingApplications, formatDeadlineLabel } from '../../utils/jobDeadline'

export default function Jobs() {
  const dispatch = useDispatch()
  const { jobs, status } = useSelector((s) => s.jobs)
  const { applications } = useSelector((s) => s.applications)
  const user = useSelector((s) => s.auth.user)
  const isDark = useSelector((s) => s.theme?.isDark ?? true)

  const [query, setQuery] = useState('')
  const [detailJob, setDetailJob] = useState(null)
  const [applyJob, setApplyJob] = useState(null)
  const [applyingId, setApplyingId] = useState(null)
  const [applyErrors, setApplyErrors] = useState({})

  useEffect(() => {
    dispatch(fetchJobs())
  }, [dispatch])

  useEffect(() => {
    if (String(user?.role || '').toLowerCase() === 'student') {
      dispatch(fetchStudentApplications())
    }
  }, [dispatch, user])

  const filtered = useMemo(() => {
    const open = (jobs || []).filter((j) => isJobAcceptingApplications(j))
    const q = query.trim().toLowerCase()
    if (!q) return open
    return open.filter((j) => {
      const t = (j?.title || j?.jobTitle || '').toLowerCase()
      const c = (typeof j?.company === 'object' ? j?.company?.companyName : j?.companyName || j?.company || '').toString().toLowerCase()
      return t.includes(q) || c.includes(q)
    })
  }, [jobs, query])

  const isLoading = status === 'loading'
  const appliedJobIds = useMemo(
    () =>
      new Set(
        (applications || [])
          .map((app) => app?.jobId?._id || app?.jobId || app?.job?._id || app?.job || app?.jobRef)
          .filter(Boolean),
      ),
    [applications],
  )

  function onApplyClick(job) {
    setDetailJob(job)
  }

  function closeDetailModal() {
    setDetailJob(null)
  }

  function closeApplyModal() {
    setApplyJob(null)
    setApplyErrors({})
  }

  async function onSubmitApply(application) {
    const job = applyJob
    if (!job) return
    const jobId = job?._id || job?.id || job?.jobId
    if (!jobId) return

    setApplyingId(jobId)
    const res = await dispatch(submitApplication(jobId))
    setApplyingId(null)
    if (res.meta.requestStatus === 'fulfilled') {
      setApplyJob(null)
      setApplyErrors({})
      dispatch(fetchJobs())
      dispatch(fetchStudentApplications())
    } else {
      setApplyErrors(res?.payload?.errors || {})
    }
  }

  return (
    <div className={`space-y-8 p-2 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
      {/* Header & Search Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Opportunity Board</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            Available <span className="text-zinc-500">Positions</span>
          </h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">
            {filtered?.length || 0} active roles ready for your application
          </p>
        </div>

        <div className="relative w-full max-w-md group">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block ml-1">
            Global Search
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`w-full rounded-[1.5rem] border py-4 pl-12 pr-4 text-sm transition-all outline-none ${
                isDark 
                ? 'border-zinc-800 bg-zinc-900/50 focus:border-indigo-500 focus:bg-zinc-900' 
                : 'border-zinc-200 bg-white shadow-soft focus:border-indigo-600'
              }`}
              placeholder="Filter by title, company, or tech..."
            />
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-3 py-4">
          <Loader label="Syncing database..." />
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filtered?.map((job) => {
          const id = job?._id || job?.id || job?.jobId
          return (
            <div key={id} className="transition-transform duration-300 hover:-translate-y-1">
              <JobCard
                job={job}
                deadlineLabel={formatDeadlineLabel(job.applicationDeadline)}
                closed={!isJobAcceptingApplications(job)}
                alreadyApplied={appliedJobIds.has(id)}
                onApply={() => onApplyClick(job)}
                isApplying={applyingId === id}
              />
            </div>
          )
        })}

        {/* Empty State */}
        {!isLoading && filtered?.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 rounded-[3rem] border-2 border-dashed border-zinc-800/50">
            <div className="h-16 w-16 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-500 mb-4">
              <Target size={32} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight">No Matches Found</h3>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mt-1">Try adjusting your search parameters</p>
            <button 
              onClick={() => setQuery('')}
              className="mt-6 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-400"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Footer Insight */}
      {!isLoading && filtered?.length > 0 && (
        <div className="flex items-center gap-3 p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10">
          <Zap className="text-indigo-500 shrink-0" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 leading-relaxed">
            Pro Tip: Companies often prioritize applications submitted within the first 48 hours. **Stay agile.**
          </p>
        </div>
      )}

      {/* Modals */}
      {detailJob && (
        <JobDetailModal
          job={detailJob}
          isClosed={!isJobAcceptingApplications(detailJob)}
          onClose={closeDetailModal}
          onApplyNow={(j) => {
            setDetailJob(null)
            setApplyJob(j)
          }}
        />
      )}

      {applyJob && (
        <ApplyFormModal
          job={applyJob}
          onClose={closeApplyModal}
          onSubmit={onSubmitApply}
          isSubmitting={applyingId === (applyJob?._id || applyJob?.id)}
          apiErrors={applyErrors}
          clearApiErrors={() => setApplyErrors({})}
        />
      )}
    </div>
  )
}