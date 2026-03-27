import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../../components/Loader'
import { fetchApplicants, fetchJobs, updateApplicationStatus } from '../../features/jobs/jobSlice'
import { Users, Briefcase, Mail, Activity } from 'lucide-react'
import Pagination from '../../components/common/Pagination'

export default function Applicants() {
  const dispatch = useDispatch()
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'
  
  const { jobs, applicantsByJobId, status } = useSelector((s) => s.jobs)
  const [jobId, setJobId] = useState('')
  const [applicantsLoading, setApplicantsLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    dispatch(fetchJobs())
  }, [dispatch])

  useEffect(() => {
    if (jobId) {
      setApplicantsLoading(true)
      dispatch(fetchApplicants(jobId)).finally(() => setApplicantsLoading(false))
    }
  }, [dispatch, jobId])

  const applicants = useMemo(
    () => (jobId ? applicantsByJobId[jobId] || [] : []),
    [applicantsByJobId, jobId],
  )
  const totalPages = Math.max(1, Math.ceil(applicants.length / itemsPerPage))
  const paginatedApplicants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return applicants.slice(start, start + itemsPerPage)
  }, [applicants, currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [jobId])

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
    const result = await dispatch(updateApplicationStatus({ applicationId, status: nextStatus, interviewDetails }))
    setUpdatingId('')
    if (result.meta.requestStatus === 'fulfilled' && jobId) {
      dispatch(fetchApplicants(jobId))
    }
  }

  const companyName = (j) =>
    typeof j?.company === 'object' ? j?.company?.companyName : j?.companyName || j?.company || 'Company'

  const cardStyle = `rounded-[2.5rem] border p-6 shadow-2xl transition-all ${
    isDark 
      ? 'border-zinc-800 bg-zinc-900/50 backdrop-blur-xl' 
      : 'border-white bg-white/80 backdrop-blur-xl shadow-zinc-200/50'
  }`

  return (
    <div className="max-w-6xl space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="inline-block w-fit rounded-xl bg-indigo-600/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-600/20">
          Recruitment
        </div>
        <h1 className="text-4xl font-black tracking-tight">Applicants</h1>
        <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
          Review and manage candidates for your active job listings.
        </p>
      </div>

      {/* Filter Card */}
      <div className={cardStyle}>
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-zinc-500 mb-2 block">
              Select Active Job
            </label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" />
              <select
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className={`w-full rounded-2xl border pl-11 pr-4 py-3.5 text-sm outline-none transition-all appearance-none focus:ring-4 focus:ring-indigo-500/10 ${
                  isDark 
                    ? 'border-zinc-800 bg-zinc-950 focus:border-indigo-500 text-zinc-100' 
                    : 'border-zinc-200 bg-zinc-50 focus:border-indigo-600 text-zinc-900'
                }`}
              >
                <option value="">Choose a job to view candidates...</option>
                {(jobs || []).map((j) => (
                  <option key={j?._id || j?.id} value={j?._id || j?.id}>
                    {j?.jobTitle || j?.title || 'Job'} — {companyName(j)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Quick Stats Placeholder */}
          <div className="hidden md:flex gap-4">
            <div className="px-6 py-3 rounded-2xl bg-indigo-600/5 border border-indigo-600/10 text-center">
              <p className="text-[10px] font-bold uppercase tracking-tight text-zinc-500">Total Applicants</p>
              <p className="text-xl font-black text-indigo-600">{applicants.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loader */}
      {applicantsLoading && (
        <div className="flex justify-center p-10">
          <Loader label="Syncing candidate data..." />
        </div>
      )}

      {/* Table Container */}
      <div className={`${cardStyle} !p-0 overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className={`${isDark ? 'bg-zinc-950/50' : 'bg-zinc-50/50'} border-b border-zinc-500/10`}>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  <div className="flex items-center gap-2"><Users className="text-indigo-600" /> Student</div>
                </th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  <div className="flex items-center gap-2"><Mail className="text-indigo-600" /> Contact Email</div>
                </th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Resume</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Profile</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-right">
                  <div className="flex items-center gap-2 justify-end"><Activity className="text-indigo-600" /> Current Status</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-500/10">
              {paginatedApplicants.map((a, idx) => {
                const student = a?.studentId || {}
                const studentName = a?.name || `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || '—'
                const email = a?.email || student?.email || '—'
                const resumeLink = a?.resume || student?.studentProfile?.resume?.filepath
                const profileLink = student?.profile
                return (
                <tr
                  key={a?.id || a?._id || `applicant-${idx}`}
                  className="group hover:bg-indigo-600/[0.02] transition-colors"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {(studentName || 'S').charAt(0)}
                      </div>
                      <span className="font-bold tracking-tight text-base">
                        {studentName}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`font-medium ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                      {email}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-xs">
                    {resumeLink ? <a href={resumeLink} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">Open Resume</a> : '—'}
                  </td>
                  <td className="px-8 py-5 text-xs">
                    {profileLink ? <a href={profileLink} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">Open Profile</a> : '—'}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusClasses(a?.status)}`}>
                        {a?.status || 'Applied'}
                      </span>
                      <select
                        value={a?.status || 'applied'}
                        disabled={updatingId === (a?._id || a?.id)}
                        onChange={(e) => handleStatusChange(a, e.target.value)}
                        className="rounded-lg border border-zinc-300 bg-transparent px-2 py-1 text-[10px] font-bold uppercase"
                      >
                        <option value="applied" disabled>Applied</option>
                        <option value="shortlisted">Shortlist</option>
                        <option value="interview">Interview</option>
                        <option value="selected">Select</option>
                        <option value="rejected">Reject</option>
                      </select>
                    </div>
                    <div className="mt-2 flex items-center justify-end gap-1">
                      <button type="button" onClick={() => handleStatusChange(a, 'shortlisted')} className="rounded-md border border-blue-500/30 px-2 py-1 text-[9px] font-black uppercase text-blue-500">Shortlist</button>
                      <button type="button" onClick={() => handleStatusChange(a, 'interview')} className="rounded-md border border-orange-500/30 px-2 py-1 text-[9px] font-black uppercase text-orange-500">Schedule</button>
                      <button type="button" onClick={() => handleStatusChange(a, 'selected')} className="rounded-md border border-emerald-500/30 px-2 py-1 text-[9px] font-black uppercase text-emerald-500">Select</button>
                      <button type="button" onClick={() => handleStatusChange(a, 'rejected')} className="rounded-md border border-red-500/30 px-2 py-1 text-[9px] font-black uppercase text-red-500">Reject</button>
                    </div>
                  </td>
                </tr>
              )})}
              
              {!applicants.length && !applicantsLoading && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <Users size={48} className="text-zinc-500" />
                      <p className="text-sm font-bold uppercase tracking-widest">
                        {jobId ? 'No candidates found for this listing' : 'Please select a job to see applicants'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {!!applicants.length && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={applicants.length}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(size) => {
            setCurrentPage(1)
            setItemsPerPage(size)
          }}
        />
      )}
    </div>
  )
}