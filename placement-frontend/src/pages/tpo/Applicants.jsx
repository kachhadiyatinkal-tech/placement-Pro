import { useEffect, useMemo, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../../components/Loader'
import { fetchJobs } from '../../features/jobs/jobSlice'
import { fetchApplicantsByJob, updateStatus, scheduleInterview, uploadOfferLetter } from '../../features/applications/applicationSlice'
import { Users, Briefcase, Mail, Activity, Calendar, UploadCloud, CheckCircle } from 'lucide-react'
import Pagination from '../../components/common/Pagination'

export default function Applicants() {
  const dispatch = useDispatch()
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'
  
  const { jobs } = useSelector((s) => s.jobs)
  const { applicantsByJob, loading: applicationsLoading } = useSelector((s) => s.applications)
  
  const [jobId, setJobId] = useState('')
  const [updatingId, setUpdatingId] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  const fileInputRef = useRef(null)
  const [activeUploadId, setActiveUploadId] = useState(null)

  useEffect(() => {
    dispatch(fetchJobs())
  }, [dispatch])

  useEffect(() => {
    if (jobId) {
      dispatch(fetchApplicantsByJob(jobId))
    }
  }, [dispatch, jobId])

  const applicants = useMemo(
    () => (jobId ? applicantsByJob[jobId] || [] : []),
    [applicantsByJob, jobId],
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
    if (s === 'applied') return 'bg-stone-500/10 text-stone-500 border-stone-500/20'
    if (s === 'under_review') return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    if (s === 'shortlisted') return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    if (s === 'interview') return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    if (s === 'selected') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    if (s === 'rejected') return 'bg-red-500/10 text-red-500 border-red-500/20'
    return 'bg-stone-500/10 text-stone-500 border-stone-500/20'
  }

  async function handleStatusChange(app, nextStatus) {
    const id = app?._id || app?.id
    if (!id || !nextStatus || nextStatus === app.status) return
    
    setUpdatingId(id)

    if (nextStatus === 'interview') {
      const interviewDate = window.prompt('Interview Date (YYYY-MM-DD):', new Date().toISOString().split('T')[0])
      if(!interviewDate) { setUpdatingId(''); return; }
      const interviewLink = window.prompt('Meeting Link (Optional):', '')
      await dispatch(scheduleInterview({ id, interviewDate, interviewLink }))
    } else {
      await dispatch(updateStatus({ id, status: nextStatus, interviewDetails: {} }))
    }

    setUpdatingId('')
  }
  
  const handleUploadClick = (id) => {
    setActiveUploadId(id)
    if(fileInputRef.current) fileInputRef.current.click()
  }
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if(!file || !activeUploadId) return
    
    setUpdatingId(activeUploadId)
    await dispatch(uploadOfferLetter({ id: activeUploadId, file }))
    setUpdatingId('')
    setActiveUploadId(null)
    
    if(fileInputRef.current) fileInputRef.current.value = ''
  }

  const companyName = (j) =>
    typeof j?.company === 'object' ? j?.company?.companyName : j?.companyName || j?.company || 'Company'

  const cardStyle = `rounded-2xl border p-6 shadow-2xl transition-all ${
    isDark 
      ? 'border-stone-800 bg-stone-900/50 backdrop-blur-xl' 
      : 'border-white bg-white/80 backdrop-blur-xl shadow-stone-200/50'
  }`

  return (
    <div className="max-w-6xl space-y-8 pb-10">
      {/* Hidden File Input for Offer Letter */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf,.doc,.docx"
      />
      
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="inline-block w-fit rounded-xl bg-indigo-600/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-600/20">
          Recruitment
        </div>
        <h1 className="text-4xl font-black tracking-tight">Applicants</h1>
        <p className={`text-sm ${isDark ? "text-stone-400" : "text-stone-500"}`}>
          Review and manage candidates for your active job listings.
        </p>
      </div>

      {/* Filter Card */}
      <div className={cardStyle}>
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-stone-500 mb-2 block">
              Select Active Job
            </label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" />
              <select
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className={`w-full rounded-2xl border pl-11 pr-4 py-3.5 text-sm outline-none transition-all appearance-none focus:ring-4 focus:ring-indigo-500/10 ${
                  isDark 
                    ? 'border-stone-800 bg-stone-950 focus:border-indigo-500 text-stone-100' 
                    : 'border-stone-200 bg-stone-50 focus:border-indigo-600 text-stone-900'
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
          
          <div className="hidden md:flex gap-4">
            <div className="px-6 py-3 rounded-2xl bg-indigo-600/5 border border-indigo-600/10 text-center">
              <p className="text-[10px] font-bold uppercase tracking-tight text-stone-500">Total Applicants</p>
              <p className="text-xl font-black text-indigo-600">{applicants.length}</p>
            </div>
          </div>
        </div>
      </div>

      {applicationsLoading && (
        <div className="flex justify-center p-10">
          <Loader label="Syncing candidate data..." />
        </div>
      )}

      {/* Table Container */}
      <div className={`${cardStyle} !p-0 overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className={`${isDark ? 'bg-stone-950/50' : 'bg-stone-50/50'} border-b border-stone-500/10`}>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  <div className="flex items-center gap-2"><Users size={16} className="text-indigo-600" /> Student</div>
                </th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  <div className="flex items-center gap-2"><Mail size={16} className="text-indigo-600" /> Email</div>
                </th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-500">Docs</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-500 text-right">
                  <div className="flex items-center gap-2 justify-end"><Activity size={16} className="text-indigo-600" /> Current Status</div>
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-stone-800' : 'divide-stone-200'}`}>
              {paginatedApplicants.map((a, idx) => {
                const student = a?.studentId || {}
                const studentName = a?.name || `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || '—'
                const email = a?.email || student?.email || '—'
                const resumeLink = a?.resume || student?.studentProfile?.resume?.filepath
                const profileLink = student?.profile
                const appId = a?._id || a?.id
                const isSelected = a?.status === 'selected'
                
                return (
                <tr
                  key={appId || `applicant-${idx}`}
                  className={`group hover:bg-indigo-600/[0.02] transition-colors ${updatingId === appId ? 'opacity-50 pointer-events-none' : ''}`}
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
                    <span className={`font-medium ${isDark ? "text-stone-400" : "text-stone-500"}`}>
                      {email}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-xs text-indigo-500 flex flex-col gap-1">
                    {resumeLink && <a href={resumeLink} target="_blank" rel="noreferrer" className="hover:underline font-bold">Resume</a>}
                    {profileLink && <a href={profileLink} target="_blank" rel="noreferrer" className="hover:underline font-bold">Profile</a>}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusClasses(a?.status)}`}>
                        {a?.status?.replace('_', ' ') || 'Applied'}
                      </span>
                      <select
                        value={a?.status || 'applied'}
                        disabled={updatingId === appId}
                        onChange={(e) => handleStatusChange(a, e.target.value)}
                        className={`rounded-lg border px-2 py-1 text-[10px] font-black uppercase ${
                          isDark ? 'border-stone-700 bg-stone-800 text-stone-100' : 'border-stone-300 bg-white text-stone-900'
                        }`}
                      >
                        <option value="applied" disabled>Applied</option>
                        <option value="under_review">Review</option>
                        <option value="shortlisted">Shortlist</option>
                        <option value="interview">Interview</option>
                        <option value="selected">Select</option>
                        <option value="rejected">Reject</option>
                      </select>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                       <button type="button" onClick={() => handleStatusChange(a, 'under_review')} className="rounded-md border border-purple-500/30 px-2 py-1 text-[9px] font-black uppercase text-purple-500 hover:bg-purple-500 hover:text-white transition-colors">Review</button>
                       <button type="button" onClick={() => handleStatusChange(a, 'shortlisted')} className="rounded-md border border-blue-500/30 px-2 py-1 text-[9px] font-black uppercase text-blue-500 hover:bg-blue-500 hover:text-white transition-colors">Shortlist</button>
                       <button type="button" onClick={() => handleStatusChange(a, 'interview')} className="rounded-md border border-orange-500/30 px-2 py-1 text-[9px] font-black uppercase text-orange-500 hover:bg-orange-500 hover:text-white transition-colors flex items-center gap-1"><Calendar size={10} /> Schedule</button>
                       <button type="button" onClick={() => handleStatusChange(a, 'selected')} className="rounded-md border border-emerald-500/30 px-2 py-1 text-[9px] font-black uppercase text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors">Select</button>
                       <button type="button" onClick={() => handleStatusChange(a, 'rejected')} className="rounded-md border border-red-500/30 px-2 py-1 text-[9px] font-black uppercase text-red-500 hover:bg-red-500 hover:text-white transition-colors">Reject</button>
                    </div>
                    
                    {isSelected && (
                      <div className="mt-3 flex justify-end">
                        {a?.offerLetter ? (
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-md">
                            <CheckCircle size={10} /> Offer Uploaded
                          </span>
                        ) : (
                          <button 
                            type="button" 
                            onClick={() => handleUploadClick(appId)} 
                            className="rounded-md bg-indigo-500/10 border border-indigo-500/30 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-indigo-500 hover:bg-indigo-500 hover:text-white transition-colors flex items-center gap-1"
                          >
                            <UploadCloud size={10} /> Upload Offer Letter
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )})}
              
              {!applicants.length && !applicationsLoading && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <Users size={48} className="text-stone-500" />
                      <p className="text-sm font-bold uppercase tracking-widest text-stone-500">
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