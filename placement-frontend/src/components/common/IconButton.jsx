import React from 'react'
import { useSelector } from 'react-redux'

/**
 * Standardized icon-only button for admin actions.
 * matches the aesthetic shown in dashboard images.
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
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  // Variant mapped to specific colors
  const variants = {
    indigo: isDark 
      ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20' 
      : 'text-indigo-600 bg-indigo-50 border-indigo-100 hover:bg-indigo-100',
    red: isDark 
      ? 'text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20' 
      : 'text-red-600 bg-red-50 border-red-100 hover:bg-red-100',
    emerald: isDark 
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20' 
      : 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100',
    zinc: isDark 
      ? 'text-zinc-400 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-white' 
      : 'text-zinc-500 bg-zinc-100 border-zinc-200 hover:bg-zinc-200 hover:text-zinc-900',
    blue: isDark
      ? 'text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20'
      : 'text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        flex h-10 w-10 items-center justify-center rounded-xl border transition-all 
        active:scale-90 disabled:opacity-30 disabled:pointer-events-none
        ${variants[variant] || variants.zinc}
        ${className}
      `}
    >
      <Icon size={size} />
    </button>
  )
}
