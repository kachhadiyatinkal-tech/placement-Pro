export default function FormError({ error, className = '' }) {
  if (!error) return null;
  return <p className={`mt-1.5 ml-1 text-xs font-medium text-red-500 ${className}`}>{error}</p>;
}
