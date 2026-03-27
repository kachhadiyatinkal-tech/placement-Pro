import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../../components/Loader'
import { fetchStudentApplications, respondToOffer } from '../../features/applications/applicationSlice'
import { Clock, CheckCircle, XCircle, Briefcase, ExternalLink, Calendar, Link as LinkIcon, Download, Check, X } from 'lucide-react'
import Pagination from '../../components/common/Pagination'

const TIMELINE_STEPS = [
  { key: 'applied', label: 'Applied' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'interview', label: 'Interview' },
  { key: 'selected', label: 'Selected / Rejected' }, // We switch color if rejected
]

export default function Applications() {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  const { applications, loading } = useSelector((s) => s.applications)
  const isDark = useSelector((s) => s.theme?.isDark ?? true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    const isStudent = String(user?.role || '').toLowerCase() === 'student'
    if (isStudent) dispatch(fetchStudentApplications())
  }, [dispatch, user])

  const isLoading = loading
  const totalPages = Math.max(1, Math.ceil((applications?.length || 0) / itemsPerPage))
  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return (applications || []).slice(start, start + itemsPerPage)
  }, [applications, currentPage, itemsPerPage])

  const handleRespond = (id, isAccepted) => {
    if(window.confirm(`Are you sure you want to ${isAccepted ? 'ACCEPT' : 'REJECT'} this offer?`)) {
      dispatch(respondToOffer({ id, isAccepted }))
    }
  }

  const getStepIndex = (status) => {
    const s = String(status).toLowerCase();
    if (s === 'applied') return 0;
    if (s === 'under_review') return 1;
    if (s === 'shortlisted') return 2;
    if (s === 'interview') return 3;
    if (s === 'selected' || s === 'rejected') return 4;
    return 0;
  }

  const cardStyle = `rounded-2xl border transition-all duration-300 p-6 ${
    isDark ? 'border-stone-800 bg-stone-900/50 backdrop-blur-md' : 'border-stone-100 bg-white shadow-xl shadow-stone-200/50'
  }`

  return (
    <div className={`space-y-8 p-2 ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Student Portal</span>
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tighter">
          My <span className="text-stone-500">Applications</span>
        </h1>
        <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mt-1">
          Track the journey of your professional placements
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-start py-4">
          <Loader label="Syncing applications..." />
        </div>
      )}

      {!applications?.length && !isLoading && (
        <div className={`${cardStyle} flex flex-col items-center justify-center py-20`}>
           <div className="h-16 w-16 rounded-3xl bg-stone-50 dark:bg-stone-800 flex items-center justify-center text-stone-400 mb-4">
             <Clock size={32} />
           </div>
           <p className="text-xs font-black uppercase tracking-widest text-stone-500">
             No active applications found
           </p>
        </div>
      )}

      <div className="space-y-6">
        {paginatedApplications.map((app) => {
          const statusStr = app.status || 'applied';
          const isRejected = statusStr === 'rejected';
          const isSelected = statusStr === 'selected';
          const currentStepIdx = getStepIndex(statusStr);
          const companyName = app?.jobId?.company?.companyName || app?.companyId?.companyName || 'Unknown Company';
          const roleName = app?.jobId?.jobTitle || 'Unspecified Role';
          
          return (
            <div key={app._id} className={cardStyle}>
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${isDark ? 'bg-stone-800' : 'bg-stone-50'} text-indigo-500`}>
                    <Briefcase size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">{roleName}</h3>
                    <p className="text-sm font-bold text-stone-500 uppercase tracking-wide">{companyName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    isRejected ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    isSelected ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    currentStepIdx >= 3 ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                    'bg-stone-500/10 text-stone-500 border-stone-500/20'
                  }`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {statusStr.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative mb-8">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-200 dark:bg-stone-800 -translate-y-1/2 rounded-full overflow-hidden">
                   <div 
                     className={`h-full transition-all duration-1000 ${isRejected ? 'bg-red-500' : 'bg-indigo-500'}`}
                     style={{ width: `${(currentStepIdx / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                   />
                </div>
                <div className="relative flex justify-between">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStepIdx;
                    const isLastStepAndRejected = idx === 4 && isRejected;
                    
                    return (
                    <div key={step.key} className="flex flex-col items-center gap-2">
                       <div className={`w-6 h-6 rounded-full border-4 flex items-center justify-center z-10 transition-colors duration-500
                         ${isDark ? 'bg-stone-900 border-stone-900' : 'bg-white border-white'}
                         ${isCompleted ? (isLastStepAndRejected ? '!bg-red-500 text-white' : '!bg-indigo-500 text-white') : 'bg-stone-200 dark:bg-stone-800'}
                       `}>
                          {isCompleted ? <CheckCircle size={14} className="opacity-0" /> : null}
                       </div>
                       <span className={`text-[9px] font-black uppercase tracking-wider absolute top-8 text-center w-24 -ml-12 ${isCompleted ? (isLastStepAndRejected ? 'text-red-500' : 'text-indigo-500') : 'text-stone-500'}`}>
                         {idx === 4 ? (isRejected ? 'Rejected' : isSelected ? 'Selected' : step.label) : step.label}
                       </span>
                    </div>
                  )})}
                </div>
              </div>

              {/* Bottom Actions & Info */}
              <div className="mt-12 flex flex-wrap gap-4 items-center justify-between border-t border-stone-200 dark:border-stone-800 pt-6">
                <div className="flex gap-6">
                  {/* Interview Info */}
                  {app.interviewDate ? (
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500"><Calendar size={16} /></div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Interview Scheduled</span>
                        <span className="font-bold">{new Date(app.interviewDate).toLocaleDateString()} {app.interviewDetails?.time ? `at ${app.interviewDetails.time}` : ''}</span>
                      </div>
                    </div>
                  ) : null}

                  {app.interviewLink ? (
                      <a href={app.interviewLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 font-bold transition-colors">
                        <div className="p-2 rounded-lg bg-blue-500/10"><LinkIcon size={16} /></div>
                        Join Meeting Link
                      </a>
                  ) : null}
                  
                  {app.interviewDetails?.meetingLink && !app.interviewLink ? (
                      <a href={app.interviewDetails.meetingLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 font-bold transition-colors">
                        <div className="p-2 rounded-lg bg-blue-500/10"><LinkIcon size={16} /></div>
                        Join Meeting Link
                      </a>
                  ) : null}
                </div>

                {/* Offer Letter & Actions */}
                <div className="flex items-center gap-3">
                  {app.offerLetter && (
                    <a href={app.offerLetter} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-stone-50 dark:bg-stone-800 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                      <Download size={14} /> Download Offer letter
                    </a>
                  )}

                  {isSelected && app.offerLetter && app.isAccepted === null && (
                    <div className="flex gap-2">
                       <button onClick={() => handleRespond(app._id, true)} className="flex items-center gap-1 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30">
                         <Check size={14} /> Accept Offer
                       </button>
                       <button onClick={() => handleRespond(app._id, false)} className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30">
                         <X size={14} /> Decline
                       </button>
                    </div>
                  )}

                  {app.isAccepted !== null && (
                    <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 ${app.isAccepted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {app.isAccepted ? <><Check size={14} /> Offer Accepted</> : <><X size={14} /> Offer Declined</>}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {!!applications?.length && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={applications.length}
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