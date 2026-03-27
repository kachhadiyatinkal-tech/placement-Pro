import React from 'react'
import { useSelector } from 'react-redux'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Standardized Pagination component for admin tables.
 */
export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage,
  onItemsPerPageChange,
  pageSizeOptions = [10, 20, 50],
}) {
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  // Keep pagination visible even for a single page so users can
  // always change page size and understand table state.
  if (!totalItems && totalItems !== 0) return null

  // Generate page numbers to show
  const getPageNumbers = () => {
    if (totalPages <= 1) return [1]
    const pages = []
    const showMax = 5
    let start = Math.max(1, currentPage - Math.floor(showMax / 2))
    let end = Math.min(totalPages, start + showMax - 1)

    if (end - start + 1 < showMax) {
      start = Math.max(1, end - showMax + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  const btnBase = "flex h-10 w-10 items-center justify-center rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all active:scale-90 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
  const idle = "bg-surface-soft text-muted hover:bg-surface hover:text-app border border-app"
  const active = "bg-brand-600 text-white shadow-lg shadow-brand-500/20 border-brand-600"
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = totalItems === 0 ? 0 : Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="mt-8 flex flex-col items-center justify-between gap-4 px-6 pb-6 sm:flex-row">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
        Showing <span className="text-app">{startItem}</span> to <span className="text-app">{endItem}</span> of <span className="text-app">{totalItems}</span> results
      </div>

      <div className="flex items-center gap-2">
        {onItemsPerPageChange ? (
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className={`h-10 rounded-xl border border-app bg-surface px-2 text-[10px] font-bold uppercase tracking-widest text-muted outline-none focus:border-brand-500/50 transition-all`}
            title="Items per page"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>{size}/page</option>
            ))}
          </select>
        ) : null}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${btnBase} ${idle}`}
          title="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1.5">
          {getPageNumbers().map(num => (
            <button
              key={num}
              onClick={() => onPageChange(num)}
              className={`${btnBase} ${num === currentPage ? active : idle}`}
            >
              {num}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${btnBase} ${idle}`}
          title="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
