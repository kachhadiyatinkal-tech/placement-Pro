import React from 'react'

export default function StatCard({ title, value, icon: Icon, isPercentage }) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl dark:border-zinc-800 dark:bg-stone-900 dark:hover:border-zinc-700">
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold tracking-tight text-stone-500 uppercase dark:text-stone-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-stone-800 dark:text-stone-100">
              {value !== undefined && value !== null ? value : '-'}
            </h3>
            {isPercentage && <span className="text-lg font-bold text-stone-500">%</span>}
          </div>
        </div>
        <div className="inline-flex rounded-2xl bg-indigo-50 p-4 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 transition-transform group-hover:scale-110">
          <Icon size={24} />
        </div>
      </div>
      <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-indigo-500/5 blur-3xl transition-opacity opacity-0 group-hover:opacity-100" />
    </div>
  )
}
