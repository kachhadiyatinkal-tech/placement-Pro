import { LogOut, Menu, User, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import ThemeToggle from './ThemeToggle'
import { useNavigate } from 'react-router-dom'
import { useSidebarNav } from '../context/SidebarNavContext'

export default function Navbar() {
  const dispatch = useDispatch()
  const role = useSelector((s) => s.auth.role)
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'
  const navigate = useNavigate()
  const { toggle, close } = useSidebarNav()

  return (
    <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-app bg-surface text-muted transition-all active:scale-95 lg:hidden shadow-sm`}
          aria-label="Toggle navigation"
        >
          <Menu className="text-lg" />
        </button>

        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500 sm:flex">
            <User size={16} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-black tracking-tight text-app">
              Placement<span className="text-brand-500">Suite</span>
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <p className="truncate text-[9px] font-bold uppercase tracking-widest text-muted opacity-80">
                {role ? role : 'Guest'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <ThemeToggle />
        <div className="hidden h-6 w-px border-l border-app sm:block" />
        <button
          type="button"
          onClick={() => {
            close()
            dispatch(logout())
            navigate('/')
          }}
          className={`group flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-app bg-surface-soft/50 text-muted hover:text-red-500 hover:border-red-500/30`}
        >
          <LogOut className="text-sm" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </div>
  )
}
