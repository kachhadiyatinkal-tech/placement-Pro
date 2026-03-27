export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  ...props
}) {
  const variantClass = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-500/20 active:scale-95 transition-all duration-300',
    secondary: 'bg-surface-soft text-app border border-app hover:bg-zinc-200 dark:hover:bg-zinc-800 active:scale-95 transition-all duration-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-500/20 active:scale-95 transition-all duration-300',
    ghost: 'bg-transparent text-muted hover:bg-surface-soft hover:text-app active:scale-95 transition-all duration-300',
  }[variant] || 'bg-brand-600 text-white hover:bg-brand-700'

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-60 ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
