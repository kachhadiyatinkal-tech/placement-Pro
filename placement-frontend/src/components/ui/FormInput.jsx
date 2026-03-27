export default function FormInput({
  label,
  error,
  className = '',
  inputClassName = '',
  ...props
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label ? <label className="text-sm text-gray-400">{label}</label> : null}
      <input
        {...props}
        className={`w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base outline-none transition focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 ${error ? 'border-red-500' : ''} ${inputClassName}`}
      />
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  )
}
