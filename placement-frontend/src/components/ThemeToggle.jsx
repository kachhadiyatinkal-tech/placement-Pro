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
      className={`group relative inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 transition-all duration-300 active:scale-95 ${isDark
          ? 'border-zinc-800 bg-zinc-900/50 text-brand-400 hover:border-brand-500/50'
          : 'border-zinc-200 bg-white text-brand-600 shadow-sm hover:border-brand-600/30'
        }`}
      aria-label="Toggle theme"
    >
      <div className="flex h-5 w-5 items-center justify-center transition-transform duration-500 group-hover:rotate-[20deg]">
        {isDark ? (
          <Moon size={16} />
        ) : (
          <Sun size={16} />
        )}
      </div>

      <div className="hidden flex-col items-start leading-none sm:flex">
        <span className="text-[9px] font-bold uppercase tracking-wider">
          {mode}
        </span>
      </div>

      {/* Subtle hover glow effect */}
      <div className={`absolute inset-0 -z-10 rounded-xl opacity-0 blur-lg transition-opacity group-hover:opacity-20 ${isDark ? 'bg-brand-500' : 'bg-brand-400'
        }`} />
    </button>
  )
}