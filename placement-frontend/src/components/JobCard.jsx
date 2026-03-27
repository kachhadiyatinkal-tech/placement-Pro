import { Briefcase, MapPin, TrendingUp, Trash2, ArrowRight, Calendar } from 'lucide-react'
import { useSelector } from 'react-redux'

export default function JobCard({
  job,
  onApply,
  isApplying = false,
  alreadyApplied = false,
  showDelete,
  onDelete,
  deadlineLabel,
  closed = false,
}) {
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  const title = job?.title || job?.jobTitle || 'Job Role'
  const companyName =
    typeof job?.company === 'object' && job?.company?.companyName
      ? job.company.companyName
      : job?.companyName || (typeof job?.company === 'string' ? job.company : 'Company')
      
  const location =
    typeof job?.company === 'object' && job?.company?.companyLocation
      ? job.company.companyLocation
      : job?.location || job?.jobLocation || 'Remote / On-site'
      
  const salary = job?.salary != null ? `${job.salary} LPA` : null

  return (
    <div className={`group relative rounded-[2.5rem] border p-6 transition-all duration-300 hover:shadow-2xl ${
      isDark 
        ? 'border-zinc-800 bg-zinc-900/40 hover:border-indigo-500/50 hover:bg-zinc-900 shadow-zinc-950/50' 
        : 'border-zinc-100 bg-white hover:border-indigo-600/20 shadow-zinc-200/50'
    }`}>
      
      {/* Top Row: Title & Badges */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className={`truncate text-lg font-black tracking-tight transition-colors ${
            isDark ? 'group-hover:text-indigo-400' : 'group-hover:text-indigo-600'
          }`}>
            {title}
          </h3>
          <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">
            {companyName}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {closed && (
            <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Closed
            </span>
          )}
          {showDelete && onDelete && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(job); }}
              className={`rounded-xl p-2.5 transition-all hover:scale-110 ${
                isDark 
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white' 
                  : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white shadow-sm'
              }`}
              title="Delete Listing"
            >
              <Trash2 size={14} />
            </button>
          )}
          <div className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${
            isDark 
              ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400' 
              : 'border-indigo-100 bg-indigo-50 text-indigo-600'
          }`}>
            <Briefcase />
            Full-Time
          </div>
        </div>
      </div>

      {/* Middle Row: Meta Info */}
      <div className={`mt-6 grid grid-cols-2 items-center gap-4 border-t pt-6 ${
        isDark ? 'border-zinc-800' : 'border-zinc-50'
      }`}>
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-500/10">
            <MapPin size={12} />
          </div>
          <span className="truncate">{location}</span>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          {salary ? (
            <div className="flex items-center justify-end gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-500">
              <TrendingUp size={14} />
              <span>{salary}</span>
            </div>
          ) : (
            <div className="text-right text-[10px] font-medium text-zinc-400 italic">
              Salary Undisclosed
            </div>
          )}
          {deadlineLabel && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              <Calendar size={11} />
              <span>Apply by {deadlineLabel}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Row */}
      {onApply && (
        <button
          type="button"
          onClick={onApply}
          disabled={isApplying || closed || alreadyApplied}
          className={`group/btn mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
            closed || alreadyApplied
              ? isDark
                ? 'bg-zinc-800 text-zinc-500'
                : 'bg-zinc-200 text-zinc-500'
              : isDark
                ? 'bg-zinc-50 text-zinc-950 hover:bg-white shadow-lg shadow-white/5'
                : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl shadow-zinc-900/20'
          }`}
        >
          {isApplying ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : closed ? (
            'Applications closed'
          ) : alreadyApplied ? (
            'Applied'
          ) : (
            <>
              Apply now
              <ArrowRight className="transition-transform group-hover/btn:translate-x-1" />
            </>
          )}
        </button>
      )}
    </div>
  )
}