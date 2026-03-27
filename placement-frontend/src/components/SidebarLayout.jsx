import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { SidebarNavProvider, useSidebarNav } from '../context/SidebarNavContext'

function SidebarLayoutInner() {
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'
  const { open, close } = useSidebarNav()

  useEffect(() => {
    // Prevent background page scrolling when the mobile sidebar is open.
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div
      className={`min-h-dvh transition-colors duration-500 selection:bg-brand-500/30 bg-app text-app`}
    >
      {/* Premium background effects */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className={`absolute -left-[5%] -top-[5%] h-[30%] w-[30%] rounded-full blur-[100px] opacity-20 bg-brand-500/10 dark:bg-brand-900/10`}
        />
        <div
          className={`absolute -bottom-[5%] -right-[5%] h-[30%] w-[30%] rounded-full blur-[100px] opacity-10 bg-indigo-500/10 dark:bg-indigo-900/10`}
        />
      </div>

      <button
        type="button"
        aria-label="Close menu"
        className={`fixed inset-0 z-[55] bg-black/40 transition-all duration-300 ease-out lg:hidden ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
        onClick={close}
      />

      <div className="relative z-10 flex h-dvh max-h-dvh min-h-0 overflow-hidden">
        <Sidebar />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <header className={`shrink-0 border-b border-app bg-surface/70 backdrop-blur-xl transition-[background-color,border-color] duration-500`}>
            <Navbar />
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-6xl">
              <Outlet />
            </div>
          </main>

          <footer
            className={`px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] opacity-30 sm:px-12 lg:px-8 ${isDark ? 'text-zinc-500' : 'text-zinc-400'
              }`}
          >
            © 2026 PlacementPro Elite • Cloud Infrastructure Active
          </footer>
        </div>
      </div>
    </div>
  )
}

export default function SidebarLayout() {
  return (
    <SidebarNavProvider>
      <SidebarLayoutInner />
    </SidebarNavProvider>
  )
}
