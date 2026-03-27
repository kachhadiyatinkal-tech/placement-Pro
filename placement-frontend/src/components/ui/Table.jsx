export default function Table({
  columns,
  rows,
  renderRow,
  emptyText = 'No data found',
  className = '',
}) {
  return (
    <div className={`overflow-hidden rounded-xl border border-app bg-surface shadow-sm ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-surface-soft/50 border-b border-app">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-muted">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-app">
            {rows.length ? (
              rows.map((row, idx) => (
                <tr
                  key={row._id || row.id || idx}
                  className="transition-colors odd:bg-surface even:bg-surface-soft/20 hover:bg-brand-500/5"
                >
                  {renderRow(row, idx)}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-sm font-medium text-muted">
                  <div className="flex flex-col items-center gap-2">
                    <span className="opacity-20">No matching records</span>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-40">{emptyText}</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
