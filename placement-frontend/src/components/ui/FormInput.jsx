export default function FormInput({
  label,
  error,
  className = '',
  inputClassName = '',
  ...props
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label ? <label className="ds-label block font-semibold text-muted ml-1 transition-colors">{label}</label> : null}
      <input
        {...props}
        className={`w-full rounded-xl border border-app bg-surface px-4 py-2.5 text-sm text-app outline-none transition-all duration-300 focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 placeholder:text-muted/50 ${error ? 'border-red-500 focus:ring-red-500/10' : ''} ${inputClassName}`}
      />
      {error ? <p className="ml-1 text-[11px] font-bold uppercase tracking-wider text-red-500">{error}</p> : null}
    </div>
  )
}
