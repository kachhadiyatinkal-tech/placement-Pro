import { Moon, Sun } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../features/theme/themeSlice'

export default function ThemeToggle() {
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'
  const dispatch = useDispatch()

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      className="group relative inline-flex items-center gap-2 rounded-xl border border-app bg-surface px-3 py-1.5 transition-all duration-500 active:scale-95 hover:border-brand-500/50 shadow-sm"
      aria-label="Toggle theme"
    >
      <div className="flex h-5 w-5 items-center justify-center transition-transform duration-500 group-hover:rotate-[20deg] text-brand-500">
        {isDark ? (
          <Moon size={16} fill="currentColor" fillOpacity={0.2} />
        ) : (
          <Sun size={16} fill="currentColor" fillOpacity={0.2} />
        )}
      </div>

      <div className="hidden flex-col items-start leading-none sm:flex">
        <span className="text-[9px] font-black uppercase tracking-wider text-app">
          {mode}
        </span>
      </div>

      {/* Subtle hover glow effect */}
      <div className="absolute inset-0 -z-10 rounded-xl bg-brand-500 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-20" />
    </button>
  )
}