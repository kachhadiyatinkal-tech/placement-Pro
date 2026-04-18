import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { Briefcase, Users, Layers, Bell, Clipboard, UserPlus, ChevronRight, Shield, MessageCircle, Mail, GraduationCap, Building, BarChart2, PieChart as PieChartIcon } from 'lucide-react'

import StatCard from '../../components/dashboard/StatCard'
import Charts from '../../components/dashboard/Charts'
import { fetchOverview, fetchTrends, fetchCompanyStats, fetchBranchStats } from '../../features/analytics/analyticsSlice'

function Card({ to, icon: Icon, label, desc, color }) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-app bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10"
    >
      <div className="relative z-10">
        <div className={`mb-4 inline-flex rounded-2xl bg-brand-500 p-3 text-white shadow-lg transition-transform group-hover:scale-110`}>
          <Icon size={20} />
        </div>
        <h3 className="text-sm font-black uppercase tracking-tight text-app">
          {label}
        </h3>
        <p className="mt-1 text-xs font-semibold leading-relaxed text-muted opacity-80">
          {desc}
        </p>
      </div>

      <div className="mt-6 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
        Manage <ChevronRight size={12} />
      </div>

      <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-brand-500/5 blur-3xl transition-opacity opacity-0 group-hover:opacity-100" />
    </Link>
  )
}

export default function AdminDashboard() {
  const dispatch = useDispatch()
  const role = useSelector((s) => s.auth.role) || localStorage.getItem('role')
  const { overview, trends, companyStats, branchStats, loading } = useSelector((s) => s.analytics)

  useEffect(() => {
    dispatch(fetchOverview())
    dispatch(fetchTrends())
    dispatch(fetchCompanyStats())
    dispatch(fetchBranchStats())
  }, [dispatch])

  return (
    <div className="mx-auto max-w-7xl space-y-10 py-4 animation-fade-in">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between px-2">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-600/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-brand-600 border border-brand-600/20">
            <Shield size={12} /> {role === 'admin' ? 'System Administrator' : 'Management Unit'}
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none text-app">
            Placement <span className="text-brand-500">Analytics</span> Console
          </h1>
          <p className="max-w-md text-sm font-bold text-muted uppercase tracking-widest opacity-80">
            Orchestrate student placement workflows and partner ecosystem.
          </p>
        </div>
        
        <div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-app bg-surface text-muted lg:flex">
          <Layers size={20} />
        </div>
      </div>

      {/* Analytics Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:col-span-12">
          <StatCard title="Total Students" value={overview.totalStudents} icon={Users} />
          <StatCard title="Placed Students" value={overview.totalPlacedStudents} icon={GraduationCap} />
          <StatCard title="Total Companies" value={overview.totalCompanies} icon={Building} />
          <StatCard title="Placement %" value={overview.placementPercentage} icon={PieChartIcon} isPercentage />
        </div>
      )}

      {/* Analytics Charts */}
      {!loading && (
        <Charts trends={trends} companyStats={companyStats} branchStats={branchStats} />
      )}

      <hr className="border-t-2 border-dashed border-app opacity-50" />

      {/* Main Nav Grid */}
      <div className="px-2">
        <h2 className="text-xs font-black tracking-[0.3em] uppercase text-muted mb-6">System Core & Navigation</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          <Card to="/admin/companies" icon={Briefcase} label="Partner Registry" desc="Onboard new corporate partners and manage interview difficulty levels." />
          <Card to="/admin/tpo" icon={Users} label="Officer Accounts" desc="Audit and manage TPO credentials and platform permissions." />
          <Card to="/admin/students" icon={Clipboard} label="Talent Pool" desc="Access comprehensive student databases and export academic records." />
          <Card to="/admin/add-user" icon={UserPlus} label="Identity Access" desc="Provision new user accounts across all organizational tiers." />
          <Card to="/admin/notices" icon={Bell} label="Bulletin System" desc="Broadcast critical placement updates and manage global notifications." />
          <Card to="/admin/applications" icon={Briefcase} label="Pipeline Audit" desc="Review active job applications and download applicant metrics." />
          <Card to="/admin/chatbot-settings" icon={MessageCircle} label="Chatbot UI" desc="Customize the floating assistant: visibility, branding, layout, and copy." />
          <Card to="/admin/contact-page" icon={Mail} label="Contact page" desc="Edit public contact details, hours, and sidebar copy shown on /contact." />
          <Card to="/admin/smtp-settings" icon={Shield} label="Email Infrastructure" desc="Configure SMTP credentials, enable/disable system emails, and manage outgoing mail." />
        </div>
      </div>

      {/* Footer Stats / Quick Info */}
      <div className="rounded-[2.5rem] border border-app bg-surface-soft/30 p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-1">System Health</p>
            <p className="text-sm font-bold text-app opacity-80">All modules operational and synchronized with Elite Infrastructure.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Secure Node</span>
          </div>
        </div>
      </div>
    </div>
  )
}