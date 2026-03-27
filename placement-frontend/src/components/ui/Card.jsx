export default function Card({ children, className = '' }) {
  return (
    <div className={`rounded-3xl border border-app bg-surface p-6 shadow-sm transition-shadow duration-300 hover:shadow-md ${className}`}>
      {children}
    </div>
  )
}
