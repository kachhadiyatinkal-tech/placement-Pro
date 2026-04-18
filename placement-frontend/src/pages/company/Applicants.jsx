import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Users, Download, Search, Mail, Cpu, ExternalLink } from 'lucide-react'
import { API_BASE_URL } from '../../services/axios'
import Loader from '../../components/Loader'
import {
  fetchCompanyApplicants,
  fetchCompanyJobs,
  updateCompanyApplicationStatus,
} from '../../features/company/companySlice'

export default function CompanyApplicants() {
  const dispatch = useDispatch()
  const { jobs, applicantsByJobId, status } = useSelector((s) => s.company)
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'
  const { user } = useSelector((s) => s.auth)
  const isLoading = status === 'loading'

  const [jobId, setJobId] = useState('')
  const [applicantsLoading, setApplicantsLoading] = useState(false)
  const [hasFetchedAll, setHasFetchedAll] = useState(false)
  const [updatingId, setUpdatingId] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    if (user?._id || user?.id) {
      dispatch(fetchCompanyJobs(user._id || user.id))
    }
  }, [dispatch, user])

  useEffect(() => {
    if (jobId) {
      if (!applicantsByJobId[jobId]) {
        setApplicantsLoading(true)
        dispatch(fetchCompanyApplicants(jobId)).finally(() => setApplicantsLoading(false))
      }
    } else if (jobs?.length > 0 && !hasFetchedAll) {
      const unfetched = jobs.map((j) => j?._id || j?.id).filter((id) => !applicantsByJobId[id])
      if (unfetched.length > 0) {
        setApplicantsLoading(true)
        Promise.all(unfetched.map((id) => dispatch(fetchCompanyApplicants(id)))).finally(() => {
          setApplicantsLoading(false)
          setHasFetchedAll(true)
        })
      } else {
        setHasFetchedAll(true)
      }
    }
  }, [dispatch, jobId, jobs, applicantsByJobId, hasFetchedAll])

  const displayedApplicants = useMemo(() => {
    if (jobId) return applicantsByJobId[jobId] || []
    // Combine all arrays if none selected
    return Object.values(applicantsByJobId).flat().sort((a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0))
  }, [applicantsByJobId, jobId])

  // Reset page when filter changes
  useEffect(() => setCurrentPage(1), [jobId])

  const totalPages = Math.ceil(displayedApplicants.length / itemsPerPage)
  const paginatedApplicants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return displayedApplicants.slice(start, start + itemsPerPage)
  }, [displayedApplicants, currentPage, itemsPerPage])

  function resumeHref(app) {
    const raw =
      app?.resume ||
      app?.studentId?.studentProfile?.resume?.filepath ||
      app?.studentProfile?.resume?.filepath
    if (!raw) return undefined
    if (raw.startsWith('http') || raw.startsWith('data:')) return raw
    // Ensure the raw path has the leading slash if needed, but not double
    const slash = raw.startsWith('/') ? '' : '/'
    return `${API_BASE_URL}${slash}${raw}`
  }

  const statusClasses = (status) => {
    const s = String(status || 'applied').toLowerCase()
    if (s === 'applied') return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
    if (s === 'shortlisted') return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    if (s === 'interview') return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    if (s === 'selected') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    if (s === 'rejected') return 'bg-red-500/10 text-red-500 border-red-500/20'
    return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
  }

  async function handleStatusChange(app, nextStatus) {
    const applicationId = app?._id || app?.id
    if (!applicationId || !nextStatus) return
    let interviewDetails
    if (nextStatus === 'interview') {
      const date = window.prompt('Interview date (YYYY-MM-DD):', '')
      const time = window.prompt('Interview time:', '')
      const meetingLink = window.prompt('Meeting link:', '')
      interviewDetails = { date, time, meetingLink }
    }
    setUpdatingId(applicationId)
    const result = await dispatch(updateCompanyApplicationStatus({ applicationId, status: nextStatus, interviewDetails }))
    setUpdatingId('')
    if (result.meta.requestStatus === 'fulfilled') {
      if (jobId) dispatch(fetchCompanyApplicants(jobId))
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-1 px-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-600/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-600/20 w-fit mb-2">
          <Users /> Recruitment
        </div>
        <h1 className="text-3xl font-black tracking-tight uppercase">Talent Pool</h1>
        <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">
          Manage and review students who applied for your positions.
        </p>
      </div>

      {/* Filter Section */}
      <div className={`rounded-[2.5rem] border p-8 transition-all ${
        isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-100 bg-white shadow-xl shadow-zinc-200/50'
      }`}>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">
            Filter by Job Opening
          </label>
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-indigo-500" />
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className={`w-full rounded-2xl border pl-12 pr-6 py-4 text-sm font-bold outline-none transition-all focus:ring-4 focus:ring-indigo-500/10 ${
                isDark 
                  ? 'border-zinc-800 bg-zinc-950 text-zinc-200 focus:border-indigo-500' 
                  : 'border-zinc-200 bg-zinc-50 text-zinc-900 focus:border-indigo-600'
              }`}
            >
              <option value="">Select an active job posting...</option>
              {jobs.map((j) => (
                <option key={j?._id || j?.id} value={j?._id || j?.id}>
                  {j?.jobTitle || j?.title || 'Job'} — {typeof j?.company === 'object' ? j?.company?.companyName : j?.companyName || 'Company'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className={`overflow-hidden rounded-[2.5rem] border transition-all ${
        isDark ? 'border-zinc-800 bg-zinc-900/40 shadow-2xl shadow-zinc-950/50' : 'border-white bg-white shadow-2xl shadow-zinc-200/50'
      }`}>
        {applicantsLoading ? (
          <div className="p-20">
            <Loader label="Fetching Applicant Data..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDark ? 'border-zinc-800 bg-zinc-950/30' : 'border-zinc-50 bg-zinc-50/50'}`}>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Student Candidate</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Contact</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Skill Stack</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Portfolio</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {paginatedApplicants.map((a, i) => {
                  const student = a?.studentId || {}
                  const studentName = a?.name || `${student?.first_name || ''} ${student?.last_name || ''}`.trim()
                  const email = a?.email || student?.email || '—'
                  return (
                  <tr key={a?._id || a?.id || i} className="group transition-colors hover:bg-indigo-600/[0.02]">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-black">
                          {studentName?.[0] || '?'}
                        </div>
                        <span className="font-black tracking-tight text-sm uppercase">
                          {studentName || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                        <Mail className="text-indigo-500" />
                        {email}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${
                          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-100 text-zinc-600'
                        }`}>
                          <Cpu className="inline mr-1" />
                          {a?.skills || a?.studentSkills || 'Not Specified'}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {resumeHref(a) ? (
                        <a
                          href={resumeHref(a)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all"
                        >
                          <ExternalLink /> Resume
                        </a>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-20 italic">No Link</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusClasses(a?.status)}`}>
                          {a?.status || 'Applied'}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-end gap-1">
                        {updatingId === (a?._id || a?.id) ? (
                           <span className="text-[10px] font-bold animate-pulse text-indigo-500">Updating...</span>
                        ) : (
                          <>
                            {a?.status !== 'shortlisted' && <button type="button" onClick={() => handleStatusChange(a, 'shortlisted')} className="rounded-md border border-blue-500/30 px-2 py-1 text-[9px] font-black uppercase text-blue-500 hover:bg-blue-500/10 active:scale-95 transition-all">Shortlist</button>}
                            {a?.status !== 'interview' && <button type="button" onClick={() => handleStatusChange(a, 'interview')} className="rounded-md border border-orange-500/30 px-2 py-1 text-[9px] font-black uppercase text-orange-500 hover:bg-orange-500/10 active:scale-95 transition-all">Schedule</button>}
                            {a?.status !== 'selected' && <button type="button" onClick={() => handleStatusChange(a, 'selected')} className="rounded-md border border-emerald-500/30 px-2 py-1 text-[9px] font-black uppercase text-emerald-500 hover:bg-emerald-500/10 active:scale-95 transition-all">Select</button>}
                            {a?.status !== 'rejected' && <button type="button" onClick={() => handleStatusChange(a, 'rejected')} className="rounded-md border border-red-500/30 px-2 py-1 text-[9px] font-black uppercase text-red-500 hover:bg-red-500/10 active:scale-95 transition-all">Reject</button>}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )})}
                {!paginatedApplicants.length && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="text-4xl text-zinc-200 dark:text-zinc-800" />
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                          {jobId ? 'No candidates found for this role.' : 'No candidates found across all jobs.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!applicantsLoading && totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            Showing Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition-all hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition-all hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}