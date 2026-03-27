import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Briefcase, Users, Layers, Bell, Clipboard, UserPlus, ChevronRight, Shield, MessageCircle, Mail } from 'lucide-react'

function Card({ to, icon: Icon, label, desc, color }) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-none"
    >
      <div className="relative z-10">
        <div className={`mb-4 inline-flex rounded-2xl bg-zinc-950 p-3 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950 shadow-lg transition-transform group-hover:scale-110`}>
          <Icon size={20} />
        </div>
        <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
          {label}
        </h3>
        <p className="mt-1 text-xs font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">
          {desc}
        </p>
      </div>

      <div className="mt-6 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
        Manage <ChevronRight />
      </div>

      {/* Subtle Background Glow on Hover */}
      <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-indigo-500/5 blur-3xl transition-opacity opacity-0 group-hover:opacity-100" />
    </Link>
  )
}

export default function AdminDashboard() {
  const role = useSelector((s) => s.auth.role) || localStorage.getItem('role')
  const mode = useSelector((s) => s.theme?.mode)
  const isDark = mode === 'dark'

  return (
    <div className="mx-auto max-w-7xl space-y-10 py-4">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-600/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 border border-indigo-600/20">
            <Shield size={12} /> {role === 'admin' ? 'System Administrator' : 'Management Unit'}
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none text-zinc-900 dark:text-zinc-50">
            Console
          </h1>
          <p className="max-w-md text-sm font-bold text-zinc-500 uppercase tracking-widest opacity-80">
            Orchestrate student placement workflows and partner ecosystem.
          </p>
        </div>
        
        <div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 lg:flex">
          <Layers size={20} />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        <Card
          to="/admin/companies"
          icon={Briefcase}
          label="Partner Registry"
          desc="Onboard new corporate partners and manage interview difficulty levels."
        />
        <Card
          to="/admin/tpo"
          icon={Users}
          label="Officer Accounts"
          desc="Audit and manage TPO credentials and platform permissions."
        />
        <Card
          to="/admin/students"
          icon={Clipboard}
          label="Talent Pool"
          desc="Access comprehensive student databases and export academic records."
        />
        <Card
          to="/admin/add-user"
          icon={UserPlus}
          label="Identity Access"
          desc="Provision new user accounts across all organizational tiers."
        />
        <Card
          to="/admin/notices"
          icon={Bell}
          label="Bulletin System"
          desc="Broadcast critical placement updates and manage global notifications."
        />
        <Card
          to="/admin/applications"
          icon={Briefcase}
          label="Pipeline Audit"
          desc="Review active job applications and download applicant metrics."
        />
        <Card
          to="/admin/chatbot-settings"
          icon={MessageCircle}
          label="Chatbot UI"
          desc="Customize the floating assistant: visibility, branding, layout, and copy."
        />
        <Card
          to="/admin/contact-page"
          icon={Mail}
          label="Contact page"
          desc="Edit public contact details, hours, and sidebar copy shown on /contact."
        />
      </div>

      {/* Footer Stats / Quick Info */}
      <div className="rounded-[2rem] border border-zinc-100 bg-zinc-50/50 p-8 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">System Health</p>
            <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">All modules operational and synchronized.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Server</span>
          </div>
        </div>
      </div>
    </div>
  )
}