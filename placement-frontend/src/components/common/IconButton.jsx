import React from 'react'

/**
 * Premium minimalist IconButton for admin actions.
 * Prioritizes a clean, clutter-free aesthetic.
 */
export default function IconButton({ 
  icon: Icon, 
  onClick, 
  title, 
  variant = 'zinc', 
  className = '', 
  disabled = false,
  size = 18
}) {
  const variants = {
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 active:bg-indigo-700',
    brand: 'bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-500 active:bg-brand-700',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-500 active:bg-red-700',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 active:bg-emerald-700',
    zinc: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-600 hover:text-white dark:hover:bg-zinc-500 active:bg-zinc-700',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-500 active:bg-amber-700',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        relative flex h-9 w-9 items-center justify-center rounded-xl transition-all 
        duration-300 active:scale-95 disabled:opacity-20 disabled:pointer-events-none
        ${variants[variant] || variants.zinc}
        ${className}
      `}
    >
      <Icon size={size} strokeWidth={2.5} />
    </button>
  )
}

