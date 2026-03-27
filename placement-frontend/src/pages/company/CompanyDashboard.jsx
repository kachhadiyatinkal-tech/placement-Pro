import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Briefcase, Users, CheckCircle, Slash, ArrowRight, Activity } from 'lucide-react'
import {
  fetchCompanyApplicants,
  fetchCompanyJobs,
} from '../../features/company/companySlice'
import Pagination from '../../components/common/Pagination'

function StatCard({ label, value, icon, colorClass, to }) {
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'
  
  const content = (
    <div className={`group relative overflow-hidden rounded-[2rem] border p-6 transition-all hover:shadow-2xl ${
      isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-100 bg-white'
    }`}>
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${colorClass}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
      {/* Decorative background element */}
      <div className="absolute -bottom-2 -right-2 opacity-5 transition-transform group-hover:scale-110">
        {icon}
      </div>
    </div>
  )

  if (to) {
    return <Link to={to} className="block w-full h-full transition-transform active:scale-95">{content}</Link>
  }
  return content
}

export default function CompanyDashboard() {
  const dispatch = useDispatch()
  const { stats, latestJobs, recentApplicants } = useSelector((s) => s.company)
  const { user } = useSelector((s) => s.auth)
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    if (user?._id || user?.id) {
      dispatch(fetchCompanyJobs(user._id || user.id))
    }
    const firstJobId = latestJobs?.[0]?._id || latestJobs?.[0]?.id
    if (firstJobId) {
      dispatch(fetchCompanyApplicants(firstJobId))
    }
  }, [dispatch, user])

  const totalPages = Math.max(1, Math.ceil((recentApplicants?.length || 0) / itemsPerPage))
  const paginatedRecentApplicants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return (recentApplicants || []).slice(start, start + itemsPerPage)
  }, [recentApplicants, currentPage, itemsPerPage])

  return (
    <div className="mx-auto max-w-7xl space-y-10">
      {/* Header */}
      <div className="px-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-600/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-600/20 mb-3">
          <Activity /> Live Overview
        </div>
        <h1 className="text-4xl font-black tracking-tight uppercase leading-none">
          Company Dashboard
        </h1>
        <p className="mt-2 text-sm font-bold uppercase tracking-widest text-zinc-500">
          Global recruitment health and active posting metrics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Total jobs posted" 
          value={stats.totalJobs} 
          icon={<Briefcase size={20}/>} 
          colorClass="bg-indigo-500/10 text-indigo-500" 
          to="/company/jobs"
        />
        <StatCard 
          label="Total applicants" 
          value={stats.totalApplicants} 
          icon={<Users size={20}/>} 
          colorClass="bg-emerald-500/10 text-emerald-500" 
          to="/company/applicants"
        />
        <StatCard 
          label="Active jobs" 
          value={stats.activeJobs} 
          icon={<CheckCircle size={20}/>} 
          colorClass="bg-sky-500/10 text-sky-500" 
          to="/company/jobs"
        />
        <StatCard 
          label="Closed jobs" 
          value={stats.closedJobs} 
          icon={<Slash size={20}/>} 
          colorClass="bg-zinc-500/10 text-zinc-500" 
          to="/company/jobs"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Applicants Table */}
        <div className={`rounded-[2.5rem] border p-8 ${
          isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-zinc-100 bg-white shadow-xl shadow-zinc-200/50'
        }`}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight">Recent applicants</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Incoming student talent</p>
            </div>
            <Link to="/company/applicants" className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${isDark ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900'}`}>
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="max-h-72 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className={`sticky top-0 z-10 text-[10px] font-black uppercase tracking-widest ${
                  isDark ? 'bg-zinc-950 text-zinc-500' : 'bg-zinc-50 text-zinc-500'
                }`}>
                  <tr>
                    <th className="px-5 py-4">Student</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {paginatedRecentApplicants.map((a) => (
                    <tr key={a?._id || a?.id} className="transition-colors hover:bg-indigo-500/[0.02]">
                      <td className="px-5 py-4">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-black uppercase tracking-tight">
                            {a?.name || a?.studentName || '—'}
                          </p>
                          <p className="truncate text-[10px] font-bold text-zinc-500">{a?.email || '—'}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-widest border ${
                          isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                        }`}>
                          {a?.status || 'Applied'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!recentApplicants.length && (
                    <tr>
                      <td colSpan={2} className="px-3 py-10 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 opacity-50">
                        No applicants yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {!!recentApplicants.length && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={recentApplicants.length}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(size) => {
                setCurrentPage(1)
                setItemsPerPage(size)
              }}
            />
          )}
        </div>

        {/* Latest Job Posts List */}
        <div className={`rounded-[2.5rem] border p-8 ${
          isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-zinc-100 bg-white shadow-xl shadow-zinc-200/50'
        }`}>
           <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight">Latest job posts</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Your recent vacancies</p>
            </div>
            <Link to="/company/jobs" className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${isDark ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900'}`}>
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="space-y-4">
            {latestJobs.map((j) => (
              <Link
                to="/company/jobs"
                key={j?._id || j?.id}
                className={`group flex items-center justify-between gap-4 rounded-[1.5rem] border p-5 transition-all hover:border-indigo-500/50 ${
                  isDark ? 'border-zinc-800 bg-zinc-950/50 hover:bg-zinc-950' : 'border-zinc-100 bg-zinc-50 hover:bg-white'
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-black uppercase tracking-tight">
                    {j?.title || j?.jobTitle || 'Job Role'}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    {j?.location || j?.jobLocation || 'Remote'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`shrink-0 rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${
                    isDark ? 'bg-zinc-50 text-zinc-950' : 'bg-zinc-950 text-white'
                  }`}>
                    {j?.status || 'Active'}
                  </span>
                  <ArrowRight className="text-zinc-400 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                </div>
              </Link>
            ))}
            {!latestJobs.length && (
              <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-zinc-100 dark:border-zinc-800">
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  No jobs yet. Post your first opening.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}