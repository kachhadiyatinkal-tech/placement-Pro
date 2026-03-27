export default function Table({
  columns,
  rows,
  renderRow,
  emptyText = 'No data found',
  className = '',
}) {
  return (
    <div className={`overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-base">
          <thead className="bg-zinc-100 dark:bg-zinc-800/70">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, idx) => (
                <tr
                  key={row._id || row.id || idx}
                  className="border-t border-zinc-200 transition-colors odd:bg-white even:bg-zinc-50 hover:bg-blue-50 dark:border-zinc-800 dark:odd:bg-zinc-900 dark:even:bg-zinc-900/60 dark:hover:bg-zinc-800"
                >
                  {renderRow(row, idx)}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-base text-zinc-500">
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
