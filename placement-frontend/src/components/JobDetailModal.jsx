import { Briefcase, MapPin, Calendar, X, CheckCircle, Info, DollarSign, AlertCircle } from 'lucide-react'
import { useSelector } from 'react-redux'

export default function JobDetailModal({ job, onClose, onApplyNow, isClosed = false }) {
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  if (!job) return null

  const companyName =
    typeof job?.company === 'object' && job?.company?.companyName
      ? job.company.companyName
      : job?.companyName || (typeof job?.company === 'string' ? job.company : 'Company')
      
  const location =
    typeof job?.company === 'object' && job?.company?.companyLocation
      ? job.company.companyLocation
      : job?.location || job?.jobLocation || 'Not Specified'
      
  const title = job?.jobTitle || job?.title || 'Job Opportunity'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      {/* Premium Backdrop */}
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md transition-opacity" aria-hidden />

      <div
        className={`relative w-full max-w-2xl rounded-[2.5rem] border p-2 shadow-2xl transition-all ${
          isDark ? 'border-zinc-800 bg-zinc-900' : 'border-white bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[85vh] overflow-y-auto px-8 py-10 custom-scrollbar">
          {/* Header Section */}
          <div className="mb-8 flex items-start justify-between gap-6">
            <div className="space-y-2">
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${
                  isClosed
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                    : 'border-indigo-600/20 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400'
                }`}
              >
                <Briefcase />
                {isClosed ? 'Applications closed' : 'Active opening'}
              </div>
              <h2 className="text-3xl font-black tracking-tight leading-tight">
                {title}
              </h2>
              <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                {companyName}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`rounded-2xl p-3 transition-colors ${
                isDark ? 'hover:bg-zinc-800 text-zinc-500' : 'hover:bg-zinc-100 text-zinc-400'
              }`}
            >
              <X size={24} />
            </button>
          </div>

          {/* Key Stats Grid */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icon={<MapPin />} label="Location" value={location} isDark={isDark} />
            <StatCard 
               icon={<DollarSign />} 
               label="Package" 
               value={job?.salary ? `${job.salary} LPA` : 'Competitive'} 
               isDark={isDark} 
            />
            <StatCard 
               icon={<Calendar />} 
               label="Deadline" 
               value={job?.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : 'N/A'} 
               isDark={isDark} 
            />
          </div>

          {isClosed && (
            <div
              className={`mb-6 flex gap-3 rounded-2xl border p-4 ${
                isDark ? 'border-amber-500/30 bg-amber-500/5 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-900'
              }`}
            >
              <AlertCircle className="mt-0.5 shrink-0 text-amber-600" />
              <p className="text-sm font-medium leading-relaxed">
                The application deadline for this role has passed. You can no longer submit applications.
              </p>
            </div>
          )}

          {/* Content Sections */}
          <div className="space-y-8">
            <DetailSection 
              title="Overview" 
              icon={<Info />} 
              content={job?.jobDescription || job?.description || 'No description provided.'} 
              isDark={isDark} 
            />

            {job?.eligibility && (
              <DetailSection 
                title="Eligibility Criteria" 
                icon={<CheckCircle />} 
                content={job.eligibility} 
                isDark={isDark} 
              />
            )}

            {job?.howToApply && (
              <div className={`rounded-3xl p-6 border ${
                isDark ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-100' : 'bg-indigo-50 border-indigo-100 text-indigo-900'
              }`}>
                <h4 className="mb-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  Application Instructions
                </h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {job.howToApply}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`flex gap-3 border-t p-6 ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
          <button
            onClick={onClose}
            className={`flex-1 rounded-2xl py-4 text-xs font-black uppercase tracking-widest transition-all ${
              isDark ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isClosed}
            onClick={() => !isClosed && onApplyNow(job)}
            className={`flex-1 rounded-2xl py-4 text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] ${
              isClosed
                ? 'cursor-not-allowed bg-zinc-300 text-zinc-600 shadow-none dark:bg-zinc-800 dark:text-zinc-500'
                : 'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-700'
            }`}
          >
            {isClosed ? 'Deadline passed' : 'Proceed to apply'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* Helper Components */
function StatCard({ icon, label, value, isDark }) {
  return (
    <div className={`flex flex-col gap-2 rounded-2xl border p-4 ${
      isDark ? 'border-zinc-800 bg-zinc-950/50' : 'border-zinc-100 bg-zinc-50'
    }`}>
      <div className="text-indigo-600 dark:text-indigo-400">{icon}</div>
      <div>
        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">{label}</p>
        <p className="truncate text-xs font-bold">{value}</p>
      </div>
    </div>
  )
}

function DetailSection({ title, icon, content, isDark }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-zinc-500">
        <span className="text-indigo-600">{icon}</span>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">{title}</h3>
      </div>
      <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
        {content}
      </p>
    </div>
  )
}