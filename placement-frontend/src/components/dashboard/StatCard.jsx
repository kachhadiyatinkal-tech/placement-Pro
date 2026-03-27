export default function StatCard({ title, value, icon: Icon, isPercentage }) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-app bg-surface p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5">
      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted opacity-60">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-black tracking-tight text-app">
              {value !== undefined && value !== null ? value : '-'}
            </h3>
            {isPercentage && <span className="text-sm font-bold text-brand-500">%</span>}
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 transition-all duration-500 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white shadow-lg shadow-brand-500/0 group-hover:shadow-brand-500/20">
          <Icon size={20} />
        </div>
      </div>
      
      {/* Decorative background glow */}
      <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-brand-500/5 blur-2xl transition-opacity opacity-0 group-hover:opacity-100" />
    </div>
  )
}
