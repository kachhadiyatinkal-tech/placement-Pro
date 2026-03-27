import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../../components/Loader'
import { fetchMyApplications } from '../../features/jobs/jobSlice'
import { Clock, CheckCircle, XCircle, Briefcase, ExternalLink } from 'lucide-react'
import Pagination from '../../components/common/Pagination'

export default function Applications() {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  const { myApplications, status } = useSelector((s) => s.jobs)
  const isDark = useSelector((s) => s.theme?.isDark ?? true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    const isStudent = String(user?.role || '').toLowerCase() === 'student'
    if (isStudent) dispatch(fetchMyApplications())
  }, [dispatch, user])

  const isLoading = status === 'loading'
  const totalPages = Math.max(1, Math.ceil((myApplications?.length || 0) / itemsPerPage))
  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return (myApplications || []).slice(start, start + itemsPerPage)
  }, [myApplications, currentPage, itemsPerPage])

  // Helper to color-code the application status
  const getStatusStyles = (statusText) => {
    const s = statusText?.toLowerCase() || 'applied'
    if (s === 'applied') return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
    if (s === 'shortlisted') return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    if (s === 'interview') return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    if (s === 'selected') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    if (s === 'rejected') return 'bg-red-500/10 text-red-500 border-red-500/20'
    return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
  }

  const cardStyle = `rounded-[2.5rem] border transition-all duration-300 ${
    isDark ? 'border-zinc-800 bg-zinc-900/50 backdrop-blur-md' : 'border-zinc-100 bg-white shadow-xl shadow-zinc-200/50'
  }`

  return (
    <div className={`space-y-8 p-2 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Student Portal</span>
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tighter">
          My <span className="text-zinc-500">Applications</span>
        </h1>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">
          Track the journey of your professional placements
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-start py-4">
          <Loader label="Syncing applications..." />
        </div>
      )}

      {/* Main Table Container */}
      <div className={`${cardStyle} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={isDark ? 'bg-zinc-900/80' : 'bg-zinc-50'}>
              <tr className="border-b border-zinc-800/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Opportunity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Corporate Partner</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Current Phase</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Interview</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-zinc-800' : 'divide-zinc-100'}`}>
              {paginatedApplications.map((j, idx) => (
                <tr 
                  key={j?._id || j?.id || `app-${idx}`}
                  className="group hover:bg-indigo-500/[0.02] transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'} text-indigo-500`}>
                        <Briefcase size={18} />
                      </div>
                      <div className="font-black uppercase text-sm tracking-tight">
                        {j?.jobId?.jobTitle || j?.title || j?.jobTitle || 'Unspecified Role'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-zinc-500 uppercase tracking-tight">
                      {j?.jobId?.company?.companyName ||
                        (typeof j?.company === 'object' ? j?.company?.companyName : (j?.companyName || j?.company || 'Unknown Entity'))}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(j?.status)}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {j?.status || 'Applied'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-zinc-500">
                    {j?.interviewDetails?.date ? (
                      <div className="space-y-1">
                        <div>{new Date(j.interviewDetails.date).toLocaleDateString()} {j?.interviewDetails?.time || ''}</div>
                        {j?.interviewDetails?.meetingLink ? (
                          <a href={j.interviewDetails.meetingLink} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">
                            Join Link
                          </a>
                        ) : null}
                      </div>
                    ) : (
                      <span>Not scheduled</span>
                    )}
                  </td>
                </tr>
              ))}
              
              {!myApplications?.length && !isLoading && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <Clock size={24} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        No active applications found
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {!!myApplications?.length && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={myApplications.length}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(size) => {
            setCurrentPage(1)
            setItemsPerPage(size)
          }}
        />
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between px-6 py-4 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10">
        <div className="flex items-center gap-3">
          <CheckCircle className="text-indigo-500" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Keep your profile updated for a higher selection rate.
          </p>
        </div>
        <button className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:underline flex items-center gap-1">
          View Policy <ExternalLink />
        </button>
      </div>
    </div>
  )
}