import { Briefcase, Clipboard, Home, Layers, List, PlusCircle, Users, UserPlus, Bell, MessageCircle, Settings, Mail } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Logo from './Logo'
import { useSidebarNav } from '../context/SidebarNavContext'

const baseLink =
  'flex items-center gap-3 rounded-xl px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] transition-all duration-300 ease-out'
const activeLink = 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
const idleLink =
  'text-zinc-500 hover:text-brand-500 hover:bg-brand-500/5 dark:text-zinc-400 dark:hover:text-brand-400'

function profilePathForRole(role) {
  if (role === 'tpo') return '/tpo/profile'
  if (role === 'company') return '/company/profile'
  if (role === 'management' || role === 'admin' || role === 'superuser') return '/admin/profile'
  return '/student/profile'
}

function LinkItem({ to, icon: Icon, label, onNavigate }) {
  return (
    <NavLink to={to} onClick={onNavigate} className={({ isActive }) => `${baseLink} ${isActive ? activeLink : idleLink}`} end>
      <Icon className="shrink-0 text-lg" />
      <span className="truncate">{label}</span>
    </NavLink>
  )
}

export default function Sidebar() {
  const role = useSelector((s) => s.auth.role) || localStorage.getItem('role')
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'
  const { open, close } = useSidebarNav()
  const profilePath = profilePathForRole(role)

  const links =
    role === 'tpo'
      ? [
        { to: '/tpo/dashboard', icon: Home, label: 'Dashboard' },
        { to: '/tpo/post-job', icon: PlusCircle, label: 'Post Job' },
        { to: '/tpo/applicants', icon: Users, label: 'Applicants' },
        { to: '/tpo/notices', icon: Bell, label: 'Notices' },
        { to: '/tpo/contact-page', icon: Mail, label: 'Contact page' },
      ]
      : role === 'management' || role === 'admin' || role === 'superuser'
        ? [
          { to: '/admin/dashboard', icon: Home, label: 'Dashboard' },
          { to: '/admin/companies', icon: Layers, label: 'Companies' },
          { to: '/admin/jobs', icon: List, label: 'Jobs' },
          { to: '/admin/tpo', icon: Users, label: 'TPO Users' },
          { to: '/admin/students', icon: Clipboard, label: 'Students' },
          { to: '/admin/applications', icon: Briefcase, label: 'Applications' },
          { to: '/admin/add-user', icon: UserPlus, label: 'Add User' },
          { to: '/admin/notices', icon: Bell, label: 'Notices' },
          { to: '/admin/chatbot-settings', icon: MessageCircle, label: 'Chatbot' },
          { to: '/admin/contact-page', icon: Mail, label: 'Contact page' },
        ]
        : role === 'company'
          ? [
            { to: '/company/dashboard', icon: Home, label: 'Dashboard' },
            { to: '/company/jobs', icon: Layers, label: 'My Jobs' },
            { to: '/company/applicants', icon: Users, label: 'Applicants' },
          ]
          : [
            { to: '/student/dashboard', icon: Home, label: 'Dashboard' },
            { to: '/student/jobs', icon: Briefcase, label: 'Jobs' },
            { to: '/student/applications', icon: Clipboard, label: 'Applications' },
            { to: '/student/notices', icon: Bell, label: 'Notices' },
          ]

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-[60] flex h-dvh max-h-dvh w-[min(18rem,88vw)] shrink-0 flex-col overflow-hidden border-r shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:static lg:z-auto lg:h-full lg:w-64 lg:max-h-none lg:translate-x-0 lg:shadow-none ${open ? 'translate-x-0' : '-translate-x-full'
        } ${isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-white'}`}
    >
      <div className="mb-2 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/20">
            <Logo className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-bold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-900'}`}>PlacementPro</p>
            <p className="truncate text-[10px] font-medium uppercase tracking-widest text-brand-500">Elite Suite</p>
          </div>
        </div>
      </div>

      <nav className="custom-scrollbar mt-4 min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-4 pb-4">
        <div className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400/80">Main Menu</div>
        {links.map((l) => (
          <LinkItem key={l.to} {...l} onNavigate={close} />
        ))}
      </nav>

      <div className={`shrink-0 border-t p-4 ${isDark ? 'border-zinc-800 bg-zinc-900/10' : 'border-zinc-100 bg-zinc-50/10'}`}>
        <NavLink
          to={profilePath}
          onClick={close}
          className={({ isActive }) =>
            `group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 ${isActive
              ? 'bg-brand-500/10 text-brand-500 ring-1 ring-brand-500/20'
              : 'text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
            }`
          }
        >
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ${isDark ? 'border-zinc-700 bg-zinc-800' : 'border-zinc-200 bg-white shadow-sm'
            }`}>
            <Settings className="text-base transition-transform duration-300 group-hover:rotate-45" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider">My Profile</span>
        </NavLink>
      </div>
    </aside>
  )
}
