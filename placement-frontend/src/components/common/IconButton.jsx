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
    indigo: 'text-indigo-500 hover:bg-indigo-500/10 active:bg-indigo-500/20',
    brand: 'text-brand-500 hover:bg-brand-500/10 active:bg-brand-500/20',
    red: 'text-red-500 hover:bg-red-500/10 active:bg-red-500/20',
    emerald: 'text-emerald-500 hover:bg-emerald-500/10 active:bg-emerald-500/20',
    zinc: 'text-zinc-500 hover:bg-zinc-500/10 active:bg-zinc-500/20',
    amber: 'text-amber-500 hover:bg-amber-500/10 active:bg-amber-500/20',
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

